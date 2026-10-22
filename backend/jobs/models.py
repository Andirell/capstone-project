import os
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True)
    # Name of an icon from lucide-react, e.g. "Laptop"
    icon = models.CharField(max_length=40, blank=True)
    description = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Company(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160, unique=True)
    # The employer account that manages this company
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="companies"
    )
    logo_url = models.URLField(blank=True)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "companies"

    def __str__(self):
        return self.name


class Job(models.Model):
    WORK_MODE_CHOICES = [
        ("onsite", "On-site"),
        ("remote", "Remote"),
        ("hybrid", "Hybrid"),
    ]
    JOB_TYPE_CHOICES = [
        ("full_time", "Full-time"),
        ("part_time", "Part-time"),
        ("contract", "Contract"),
        ("internship", "Internship"),
    ]
    EXPERIENCE_CHOICES = [
        ("entry", "Entry level"),
        ("mid", "Mid level"),
        ("senior", "Senior"),
        ("lead", "Lead / Manager"),
    ]

    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="jobs")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="jobs", null=True, blank=True)
    location = models.CharField(max_length=120)
    work_mode = models.CharField(max_length=10, choices=WORK_MODE_CHOICES, default="onsite")
    job_type = models.CharField(max_length=12, choices=JOB_TYPE_CHOICES, default="full_time")
    experience_level = models.CharField(max_length=10, choices=EXPERIENCE_CHOICES, blank=True)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default="USD")
    description = models.TextField()
    # One requirement / benefit per line
    requirements = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="posted_jobs"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]

    def __str__(self):
        return f"{self.title} at {self.company}"

    def clean(self):
        if self.salary_min and self.salary_max and self.salary_min > self.salary_max:
            raise ValidationError({"salary_max": "Maximum salary must be at least the minimum."})

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # The slug needs the id, so we can only make it after the first save.
        # Example: "frontend-engineer-codebase-4"
        if not self.slug:
            self.slug = slugify(f"{self.title} {self.company.name}")[:200] + f"-{self.id}"
            super().save(update_fields=["slug"])

    def is_open(self):
        if not self.is_active:
            return False
        if self.deadline and self.deadline < timezone.localdate():
            return False
        return True

    def requirement_list(self):
        return split_lines(self.requirements)

    def benefit_list(self):
        return split_lines(self.benefits)


def split_lines(text):
    # Turns "- one\n- two\n" into ["one", "two"]
    result = []
    for line in text.splitlines():
        line = line.strip().lstrip("-•* ").strip()
        if line:
            result.append(line)
    return result


def get_open_jobs():
    # Jobs that are active and whose deadline has not passed
    today = timezone.localdate()
    jobs = Job.objects.filter(is_active=True)
    jobs = jobs.filter(models.Q(deadline__isnull=True) | models.Q(deadline__gte=today))
    return jobs


def cv_upload_path(application, filename):
    # Give every CV a random name so nobody can guess the URL
    extension = os.path.splitext(filename)[1].lower()
    name = slugify(application.full_name)[:40]
    return f"resumes/{name}-{uuid.uuid4().hex[:16]}{extension}"


def check_cv_file(file):
    extension = os.path.splitext(file.name)[1].lower()
    if extension not in [".pdf", ".doc", ".docx"]:
        raise ValidationError("Upload a PDF or Word document.")
    if file.size > settings.MAX_CV_SIZE_MB * 1024 * 1024:
        raise ValidationError(f"CV must be smaller than {settings.MAX_CV_SIZE_MB} MB.")


class Application(models.Model):
    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("reviewing", "In review"),
        ("shortlisted", "Shortlisted"),
        ("interview", "Interview"),
        ("offered", "Offer made"),
        ("hired", "Hired"),
        ("rejected", "Not selected"),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    # Empty when someone applied without an account
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="applications"
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    resume = models.FileField(upload_to=cv_upload_path, blank=True, validators=[check_cv_file])
    resume_link = models.URLField(blank=True)
    portfolio_link = models.URLField(blank=True)
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="submitted")
    # Private notes only the employer can see
    employer_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        # One application per email for each job
        unique_together = ["job", "email"]

    def __str__(self):
        return f"{self.full_name} - {self.job.title}"


class SavedJob(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_jobs")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["user", "job"]
