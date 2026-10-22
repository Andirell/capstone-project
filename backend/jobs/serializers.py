from rest_framework import serializers

from .models import Application, Category, Company, Job, SavedJob


class CategorySerializer(serializers.ModelSerializer):
    # job_count is added in the view with .annotate()
    job_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "description", "job_count"]


class CompanySerializer(serializers.ModelSerializer):
    # open_jobs is added in the view with .annotate()
    open_jobs = serializers.IntegerField(read_only=True)

    class Meta:
        model = Company
        fields = ["id", "name", "slug", "logo_url", "website", "location", "description", "open_jobs"]


class SmallCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "slug", "logo_url", "location", "website", "description"]


class SmallCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class JobListSerializer(serializers.ModelSerializer):
    """Short version of a job, used in lists."""

    company = SmallCompanySerializer(read_only=True)
    category = SmallCategorySerializer(read_only=True)
    work_mode_display = serializers.CharField(source="get_work_mode_display", read_only=True)
    job_type_display = serializers.CharField(source="get_job_type_display", read_only=True)

    class Meta:
        model = Job
        fields = [
            "id",
            "slug",
            "title",
            "company",
            "category",
            "location",
            "work_mode",
            "work_mode_display",
            "job_type",
            "job_type_display",
            "experience_level",
            "salary_min",
            "salary_max",
            "salary_currency",
            "is_featured",
            "deadline",
            "created_at",
        ]


class JobDetailSerializer(JobListSerializer):
    """Full version of a job, used on the job page."""

    experience_level_display = serializers.CharField(source="get_experience_level_display", read_only=True)
    requirement_list = serializers.SerializerMethodField()
    benefit_list = serializers.SerializerMethodField()
    is_open = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = JobListSerializer.Meta.fields + [
            "description",
            "requirements",
            "requirement_list",
            "benefits",
            "benefit_list",
            "experience_level_display",
            "is_open",
            "is_active",
            "views_count",
            "updated_at",
        ]

    def get_requirement_list(self, job):
        return job.requirement_list()

    def get_benefit_list(self, job):
        return job.benefit_list()

    def get_is_open(self, job):
        return job.is_open()


class JobFormSerializer(serializers.ModelSerializer):
    """Used when an employer creates or edits a job."""

    # The frontend sends the category slug, e.g. "technology-and-it"
    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.all(),
        error_messages={"null": "Choose a category.", "does_not_exist": "Choose one of the listed categories."},
    )

    class Meta:
        model = Job
        fields = [
            "title",
            "category",
            "location",
            "work_mode",
            "job_type",
            "experience_level",
            "salary_min",
            "salary_max",
            "salary_currency",
            "description",
            "requirements",
            "benefits",
            "deadline",
            "is_active",
        ]
        extra_kwargs = {
            "title": {"error_messages": {"blank": "Give the job a title."}},
            "location": {"error_messages": {"blank": "Add a city, or write “Remote”."}},
            "description": {"error_messages": {"blank": "Describe the job so candidates know what it involves."}},
        }

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Give the job a proper title.")
        return value.strip()

    def validate_description(self, value):
        if len(value.strip()) < 30:
            raise serializers.ValidationError("Write at least a couple of sentences about the job.")
        return value.strip()

    def validate(self, data):
        # When editing, a field might not be sent, so fall back to the saved value
        salary_min = data.get("salary_min")
        salary_max = data.get("salary_max")
        if self.instance:
            if "salary_min" not in data:
                salary_min = self.instance.salary_min
            if "salary_max" not in data:
                salary_max = self.instance.salary_max

        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError({"salary_max": "Maximum salary must be at least the minimum."})
        return data


class EmployerJobSerializer(JobListSerializer):
    """A job in the employer dashboard, with applicant counts."""

    application_count = serializers.IntegerField(read_only=True)
    new_application_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Job
        fields = JobListSerializer.Meta.fields + [
            "is_active",
            "views_count",
            "application_count",
            "new_application_count",
        ]


class ApplySerializer(serializers.ModelSerializer):
    """Used when someone applies for a job."""

    class Meta:
        model = Application
        fields = ["id", "full_name", "email", "phone", "resume", "resume_link", "portfolio_link", "cover_letter", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]
        extra_kwargs = {"resume": {"write_only": True}}

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, data):
        if not data.get("resume") and not data.get("resume_link"):
            raise serializers.ValidationError({"resume": "Upload your CV or paste a link to it."})
        return data


class MyApplicationSerializer(serializers.ModelSerializer):
    """An application, as the job seeker sees it."""

    job = JobListSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Application
        fields = ["id", "job", "status", "status_display", "created_at", "updated_at"]


class ApplicantSerializer(serializers.ModelSerializer):
    """An application, as the employer sees it. Only status and notes can be changed."""

    job = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "full_name",
            "email",
            "phone",
            "resume_url",
            "resume_link",
            "portfolio_link",
            "cover_letter",
            "status",
            "status_display",
            "employer_notes",
            "created_at",
        ]
        read_only_fields = ["full_name", "email", "phone", "resume_link", "portfolio_link", "cover_letter", "created_at"]

    def get_job(self, application):
        return {"id": application.job.id, "title": application.job.title, "slug": application.job.slug}

    def get_resume_url(self, application):
        if not application.resume:
            return None
        # CVs are private, so we give a link to our own download view instead of the file
        url = f"/api/employer/applications/{application.id}/resume/"
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(url)
        return url


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ["id", "job", "created_at"]
