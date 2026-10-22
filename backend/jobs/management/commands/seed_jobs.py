"""
Loads the starter categories and jobs from jobs/data/seed_jobs.json.

Usage:
    python manage.py seed_jobs          # just the jobs
    python manage.py seed_jobs --demo   # jobs + demo accounts for testing

It's safe to run more than once. Jobs that already exist are updated, not duplicated.
"""

import json
from datetime import timedelta
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from accounts.models import User
from jobs.models import Application, Category, Company, Job

DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "seed_jobs.json"

DEMO_PASSWORD = "JobZdemo2026!"


class Command(BaseCommand):
    help = "Load starter categories and jobs"

    def add_arguments(self, parser):
        parser.add_argument("--demo", action="store_true", help="Also create demo accounts")

    def handle(self, *args, **options):
        with open(DATA_FILE, encoding="utf-8") as f:
            data = json.load(f)

        # 1. Categories
        categories = {}
        for index, item in enumerate(data["categories"]):
            category, created = Category.objects.update_or_create(
                slug=slugify(item["name"].replace("&", "and")),  # "Business & Finance" -> "business-and-finance"
                defaults={"name": item["name"], "icon": item["icon"], "description": item["description"], "order": index},
            )
            categories[item["name"]] = category

        # 2. Companies and jobs
        new_jobs = 0
        for item in data["jobs"]:
            company, created = Company.objects.get_or_create(
                slug=slugify(item["company"]),
                defaults={"name": item["company"], "location": item["location"]},
            )

            job, created = Job.objects.update_or_create(
                title=item["title"],
                company=company,
                defaults={
                    "category": categories[item["category"]],
                    "location": item["location"],
                    "work_mode": item["work_mode"],
                    "job_type": item["job_type"],
                    "experience_level": item["experience_level"],
                    "salary_min": item["salary_min"],
                    "salary_max": item["salary_max"],
                    "description": item["description"],
                    "requirements": item["requirements"],
                    "is_featured": item["is_featured"],
                    "is_active": True,
                },
            )

            if created:
                # Spread the posting dates over the last month so the site looks real
                job.created_at = timezone.now() - timedelta(days=item["days_ago"])
                job.save()
                new_jobs += 1

        if options["verbosity"] > 0:
            print(f"Loaded {len(categories)} categories and {Job.objects.count()} jobs ({new_jobs} new).")

        if options["demo"]:
            self.create_demo_accounts(options["verbosity"])

    def create_demo_accounts(self, verbosity):
        # An employer who owns TechNova
        employer = User.objects.filter(email="employer@jobz.demo").first()
        if employer is None:
            employer = User.objects.create_user(
                email="employer@jobz.demo", password=DEMO_PASSWORD, full_name="Tolu Adeyemi", role="employer"
            )

        technova = Company.objects.get(slug="technova")
        technova.owner = employer
        technova.website = "https://example.com"
        technova.description = "TechNova builds web and mobile products for fast-growing African businesses."
        technova.save()

        # A job seeker
        seeker = User.objects.filter(email="seeker@jobz.demo").first()
        if seeker is None:
            seeker = User.objects.create_user(
                email="seeker@jobz.demo",
                password=DEMO_PASSWORD,
                full_name="Ada Okafor",
                role="seeker",
                headline="Frontend developer, React and Next.js",
                location="Lagos",
            )

        # Some sample applications so the dashboards aren't empty
        frontend_job = Job.objects.get(title="Frontend Engineer", company__slug="codebase")
        technova_job = Job.objects.get(title="Software Developer", company__slug="technova")

        Application.objects.get_or_create(
            job=frontend_job,
            email=seeker.email,
            defaults={
                "applicant": seeker,
                "full_name": seeker.full_name,
                "resume_link": "https://example.com/ada-okafor-cv.pdf",
                "cover_letter": "I've built three React apps that are live and would love to join your team.",
                "status": "shortlisted",
            },
        )
        Application.objects.get_or_create(
            job=technova_job,
            email=seeker.email,
            defaults={
                "applicant": seeker,
                "full_name": seeker.full_name,
                "resume_link": "https://example.com/ada-okafor-cv.pdf",
                "cover_letter": "I've built three React apps that are live and would love to join your team.",
            },
        )
        Application.objects.get_or_create(
            job=technova_job,
            email="chidi.n@example.com",
            defaults={
                "full_name": "Chidi Nwosu",
                "resume_link": "https://example.com/chidi-cv.pdf",
                "cover_letter": "Backend developer with 4 years of Django and Node.js.",
            },
        )

        if verbosity > 0:
            print("Demo accounts are ready. Password for both: " + DEMO_PASSWORD)
            print("  Employer:   employer@jobz.demo")
            print("  Job seeker: seeker@jobz.demo")
            print("Don't use --demo on a real public website!")
