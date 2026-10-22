from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.text import slugify
from rest_framework import serializers

from jobs.models import Company

from .models import User


class CompanyInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "slug", "logo_url", "website", "location", "description"]


class UserSerializer(serializers.ModelSerializer):
    # Employers also get their company info
    company = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "phone", "headline", "location", "company", "date_joined"]
        # Users are not allowed to change these
        read_only_fields = ["id", "email", "role", "date_joined"]

    def get_company(self, user):
        company = Company.objects.filter(owner=user).first()
        if company is None:
            return None
        return CompanyInfoSerializer(company).data


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default="seeker")
    company_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, data):
        # Employers must give a company name
        if data.get("role") == "employer" and not data.get("company_name", "").strip():
            raise serializers.ValidationError({"company_name": "Employers need to tell us their company name."})

        # Use Django's password rules (not too short, not too common, etc.)
        try:
            validate_password(data["password"], User(email=data["email"], full_name=data["full_name"]))
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": error.messages})

        return data

    def create(self, data):
        company_name = data.pop("company_name", "").strip()
        user = User.objects.create_user(**data)

        if user.role == "employer":
            # Make a unique slug, e.g. "technova", "technova-2", "technova-3"...
            base_slug = slugify(company_name) or "company"
            slug = base_slug
            number = 2
            while Company.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{number}"
                number += 1
            Company.objects.create(name=company_name, slug=slug, owner=user)

        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
