"""
Settings for the JobZ API.

For local development you don't need to change anything.
For production, set the environment variables listed in .env.example.
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Read variables from backend/.env if the file exists
load_dotenv(BASE_DIR / ".env")


# ---------------------------------------------------------------------------
# Basic settings
# ---------------------------------------------------------------------------

DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "dev-secret-key-do-not-use-in-production"
    else:
        raise Exception("You must set DJANGO_SECRET_KEY when DJANGO_DEBUG is False")

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# The address of the Next.js website (used for CORS and for links in emails)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # packages
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    # my apps
    "accounts",
    "jobs",
    "contact",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------------------------------
# Database
# Uses SQLite on my laptop. In production set DATABASE_URL to a Postgres URL.
# ---------------------------------------------------------------------------

DATABASES = {
    "default": dj_database_url.config(
        default="sqlite:///" + str(BASE_DIR / "db.sqlite3"),
        conn_max_age=600,
    )
}


# ---------------------------------------------------------------------------
# Users and passwords
# ---------------------------------------------------------------------------

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Lagos"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------------------------
# Static files (for the admin site) and uploaded files (CVs)
# ---------------------------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

if not DEBUG:
    STORAGES = {
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
    }

MEDIA_URL = "media/"
MEDIA_ROOT = os.environ.get("DJANGO_MEDIA_ROOT", BASE_DIR / "media")

# Biggest CV we accept, in megabytes
MAX_CV_SIZE_MB = 5
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024


# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=14),
    "ROTATE_REFRESH_TOKENS": True,
}


# ---------------------------------------------------------------------------
# CORS: allow the website to call this API from the browser
# ---------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", FRONTEND_URL).split(",")
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# So the browser can read the file name when an employer downloads a CV
CORS_EXPOSE_HEADERS = ["Content-Disposition"]


# ---------------------------------------------------------------------------
# Email
# If EMAIL_HOST is not set, emails are just printed in the terminal.
# ---------------------------------------------------------------------------

EMAIL_HOST = os.environ.get("EMAIL_HOST", "")

if EMAIL_HOST:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True") == "True"
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "JobZ <no-reply@jobz.local>")

# Contact form messages are sent to this address
SITE_ADMIN_EMAIL = os.environ.get("SITE_ADMIN_EMAIL", "")


# ---------------------------------------------------------------------------
# Extra security when running in production
# ---------------------------------------------------------------------------

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
