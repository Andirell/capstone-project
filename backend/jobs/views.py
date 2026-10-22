import os
from datetime import timedelta

from django.db.models import Count, F, Q
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .emails import send_application_received_emails, send_status_changed_email
from .models import Application, Category, Company, Job, SavedJob, get_open_jobs
from .serializers import (
    ApplicantSerializer,
    ApplySerializer,
    CategorySerializer,
    CompanySerializer,
    EmployerJobSerializer,
    JobDetailSerializer,
    JobFormSerializer,
    JobListSerializer,
    MyApplicationSerializer,
    SavedJobSerializer,
)


class Pagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"  # e.g. ?page_size=24
    max_page_size = 50

    def get_paginated_response(self, data):
        # Same as the default, plus "page" and "total_pages" for the frontend
        return Response(
            {
                "count": self.page.paginator.count,
                "total_pages": self.page.paginator.num_pages,
                "page": self.page.number,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )


def paginate(request, queryset, serializer_class):
    paginator = Pagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(page, many=True, context={"request": request})
    return paginator.get_paginated_response(serializer.data)


def not_employer_response():
    return Response({"detail": "Only employer accounts can do this."}, status=403)


def count_open_jobs():
    # Used with .annotate() to count each category's / company's open jobs
    today = timezone.localdate()
    is_open = Q(jobs__is_active=True) & (Q(jobs__deadline__isnull=True) | Q(jobs__deadline__gte=today))
    return Count("jobs", filter=is_open)


# ---------------------------------------------------------------------------
# Public job pages
# ---------------------------------------------------------------------------


def filter_jobs(request, jobs):
    """Applies the search and filters from the URL, e.g. /api/jobs/?q=react&work_mode=remote"""
    params = request.query_params

    # Keyword search. Every word must appear somewhere in the job.
    q = params.get("q", "").strip()
    for word in q.split():
        jobs = jobs.filter(
            Q(title__icontains=word)
            | Q(company__name__icontains=word)
            | Q(description__icontains=word)
            | Q(requirements__icontains=word)
            | Q(location__icontains=word)
            | Q(category__name__icontains=word)
        )

    if params.get("category"):
        jobs = jobs.filter(category__slug=params["category"])

    if params.get("company"):
        jobs = jobs.filter(company__slug=params["company"])

    if params.get("location"):
        jobs = jobs.filter(location__icontains=params["location"])

    # These can have more than one value, e.g. work_mode=remote,hybrid
    if params.get("work_mode"):
        jobs = jobs.filter(work_mode__in=params["work_mode"].split(","))

    if params.get("job_type"):
        jobs = jobs.filter(job_type__in=params["job_type"].split(","))

    if params.get("experience_level"):
        jobs = jobs.filter(experience_level__in=params["experience_level"].split(","))

    # Jobs that can pay at least this much
    if params.get("salary_min", "").isdigit():
        amount = int(params["salary_min"])
        jobs = jobs.filter(Q(salary_max__gte=amount) | Q(salary_max__isnull=True, salary_min__gte=amount))

    if params.get("featured") == "true":
        jobs = jobs.filter(is_featured=True)

    if params.get("posted_within", "").isdigit():
        days = int(params["posted_within"])
        jobs = jobs.filter(created_at__gte=timezone.now() - timedelta(days=days))

    # Sorting
    allowed_sorting = ["created_at", "-created_at", "salary_max", "-salary_max", "salary_min", "-salary_min", "title", "-title"]
    if params.get("ordering") in allowed_sorting:
        jobs = jobs.order_by(params["ordering"])

    return jobs


@api_view(["GET", "POST"])
def job_list(request):
    if request.method == "POST":
        return create_job(request)

    jobs = get_open_jobs().select_related("company", "category")
    jobs = filter_jobs(request, jobs)
    return paginate(request, jobs, JobListSerializer)


def create_job(request):
    if not request.user.is_authenticated:
        return Response({"detail": "Sign in to post a job."}, status=401)
    if not request.user.is_employer:
        return not_employer_response()

    company = Company.objects.filter(owner=request.user).first()
    if company is None:
        return Response({"detail": "Set up your company profile before posting jobs."}, status=403)

    serializer = JobFormSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    job = serializer.save(company=company, posted_by=request.user)
    return Response(JobDetailSerializer(job).data, status=201)


def find_job(request, slug):
    """Gets a job by slug. Closed jobs are only visible to the company that owns them."""
    job = get_object_or_404(Job.objects.select_related("company", "category"), slug=slug)
    is_owner = request.user.is_authenticated and job.company.owner_id == request.user.id
    if not job.is_active and not is_owner and not request.user.is_staff:
        return None, is_owner
    return job, is_owner


@api_view(["GET", "PATCH", "DELETE"])
def job_detail(request, slug):
    job, is_owner = find_job(request, slug)
    if job is None:
        return Response({"detail": "Job not found."}, status=404)

    if request.method == "GET":
        # Count a view, but not when the employer looks at their own job
        if not is_owner:
            Job.objects.filter(id=job.id).update(views_count=F("views_count") + 1)
        return Response(JobDetailSerializer(job).data)

    # PATCH and DELETE: only the company's owner can do this
    if not request.user.is_authenticated:
        return Response({"detail": "Sign in first."}, status=401)
    if not is_owner and not request.user.is_staff:
        return Response({"detail": "You can only change your own jobs."}, status=403)

    if request.method == "DELETE":
        job.delete()
        return Response(status=204)

    serializer = JobFormSerializer(job, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    job = serializer.save()
    return Response(JobDetailSerializer(job).data)


@api_view(["GET"])
def related_jobs(request, slug):
    job = get_object_or_404(Job, slug=slug)
    jobs = (
        get_open_jobs()
        .select_related("company", "category")
        .filter(Q(category=job.category) | Q(company=job.company))
        .exclude(id=job.id)
        .order_by("-is_featured", "-created_at")
    )
    return Response(JobListSerializer(jobs[:4], many=True).data)


@api_view(["GET"])
def job_locations(request):
    rows = get_open_jobs().values("location").annotate(count=Count("id")).order_by("-count", "location")
    locations = []
    for row in rows:
        locations.append({"name": row["location"], "count": row["count"]})
    return Response(locations)


@api_view(["GET"])
def category_list(request):
    categories = Category.objects.annotate(job_count=count_open_jobs())
    return Response(CategorySerializer(categories, many=True).data)


@api_view(["GET"])
def company_list(request):
    companies = Company.objects.annotate(open_jobs=count_open_jobs()).order_by("-open_jobs", "name")
    return paginate(request, companies, CompanySerializer)


@api_view(["GET"])
def company_detail(request, slug):
    company = get_object_or_404(Company.objects.annotate(open_jobs=count_open_jobs()), slug=slug)
    return Response(CompanySerializer(company).data)


@api_view(["GET"])
def site_stats(request):
    open_jobs = get_open_jobs()
    return Response(
        {
            "open_jobs": open_jobs.count(),
            "companies": open_jobs.values("company").distinct().count(),
            "remote_jobs": open_jobs.filter(work_mode="remote").count(),
            "applications": Application.objects.count(),
            "categories": Category.objects.count(),
        }
    )


# ---------------------------------------------------------------------------
# Applying and saving jobs
# ---------------------------------------------------------------------------


class ApplyThrottle(AnonRateThrottle):
    # Stop one person from sending hundreds of applications
    scope = "apply"
    rate = "20/hour"


@api_view(["POST"])
@throttle_classes([ApplyThrottle])
def apply_for_job(request, slug):
    job, is_owner = find_job(request, slug)
    if job is None:
        return Response({"detail": "Job not found."}, status=404)

    user = request.user if request.user.is_authenticated else None
    if user and user.is_employer:
        return Response({"detail": "Employer accounts can't apply to jobs. Sign in as a job seeker."}, status=403)

    if not job.is_open():
        return Response({"detail": "This job is no longer accepting applications."}, status=400)

    # Copy the form data. (.dict() keeps uploaded files as they are.)
    data = request.data.dict() if hasattr(request.data, "dict") else dict(request.data)

    # Signed-in job seekers don't need to type their name and email again
    if user:
        if not data.get("full_name"):
            data["full_name"] = user.full_name
        if not data.get("email"):
            data["email"] = user.email
        if not data.get("phone"):
            data["phone"] = user.phone

    serializer = ApplySerializer(data=data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]
    if Application.objects.filter(job=job, email=email).exists():
        return Response({"email": ["An application with this email was already sent for this job."]}, status=400)

    application = serializer.save(job=job, applicant=user)
    send_application_received_emails(application)
    return Response(serializer.data, status=201)


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def save_job(request, slug):
    job = get_object_or_404(Job, slug=slug)

    if request.method == "DELETE":
        SavedJob.objects.filter(user=request.user, job=job).delete()
        return Response({"saved": False})

    SavedJob.objects.get_or_create(user=request.user, job=job)
    return Response({"saved": True}, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_applications(request):
    applications = Application.objects.filter(applicant=request.user).select_related("job__company", "job__category")
    return paginate(request, applications, MyApplicationSerializer)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_saved_jobs(request):
    saved = SavedJob.objects.filter(user=request.user).select_related("job__company", "job__category")
    return paginate(request, saved, SavedJobSerializer)


# ---------------------------------------------------------------------------
# Employer dashboard
# ---------------------------------------------------------------------------


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employer_jobs(request):
    if not request.user.is_employer:
        return not_employer_response()

    jobs = (
        Job.objects.filter(company__owner=request.user)
        .select_related("company", "category")
        .annotate(
            application_count=Count("applications"),
            new_application_count=Count("applications", filter=Q(applications__status="submitted")),
        )
        .order_by("-created_at")
    )
    return Response(EmployerJobSerializer(jobs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employer_applications(request):
    if not request.user.is_employer:
        return not_employer_response()

    # Only applications for this employer's own jobs
    applications = Application.objects.filter(job__company__owner=request.user).select_related("job")

    if request.query_params.get("job"):
        applications = applications.filter(job__slug=request.query_params["job"])
    if request.query_params.get("status"):
        applications = applications.filter(status=request.query_params["status"])

    return paginate(request, applications, ApplicantSerializer)


def get_my_application(request, application_id):
    # 404 if the application isn't for one of this employer's jobs
    return get_object_or_404(Application, id=application_id, job__company__owner=request.user)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def employer_application_detail(request, application_id):
    if not request.user.is_employer:
        return not_employer_response()

    application = get_my_application(request, application_id)

    if request.method == "GET":
        return Response(ApplicantSerializer(application, context={"request": request}).data)

    old_status = application.status
    serializer = ApplicantSerializer(application, data=request.data, partial=True, context={"request": request})
    serializer.is_valid(raise_exception=True)
    application = serializer.save()

    # Let the candidate know when their status changes
    if application.status != old_status:
        send_status_changed_email(application)

    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_cv(request, application_id):
    if not request.user.is_employer:
        return not_employer_response()

    application = get_my_application(request, application_id)
    if not application.resume:
        return Response({"detail": "This applicant sent a link instead of a file."}, status=404)

    filename = os.path.basename(application.resume.name)
    return FileResponse(application.resume.open("rb"), as_attachment=True, filename=filename)
