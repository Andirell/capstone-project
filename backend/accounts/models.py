from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    # Django's default manager expects a username.
    # We log in with email instead, so we need our own manager.

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        extra_fields.setdefault("role", "employer")
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = [
        ("seeker", "Job seeker"),
        ("employer", "Employer"),
    ]

    # Remove the username field and use email to log in
    username = None
    email = models.EmailField(unique=True)

    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="seeker")
    phone = models.CharField(max_length=30, blank=True)
    headline = models.CharField(max_length=160, blank=True)
    location = models.CharField(max_length=120, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def is_employer(self):
        return self.role == "employer"
