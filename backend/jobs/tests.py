"""
Tests for the JobZ API.

Run them with:  python manage.py test
"""

import shutil
import tempfile
from datetime import timedelta

from django.core import mail
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import User
from contact.models import ContactMessage
from jobs.models import Application, Category, Job, SavedJob

# Save uploaded test CVs in a temporary folder, not in the real media folder
TEST_MEDIA_FOLDER = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEST_MEDIA_FOLDER)
class JobZTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Load the 62 starter jobs and the two demo accounts
        call_command("seed_jobs", "--demo", verbosity=0)
        cls.employer = User.objects.get(email="employer@jobz.demo")
        cls.seeker = User.objects.get(email="seeker@jobz.demo")
        cls.technova_job = Job.objects.get(title="Software Developer")  # owned by the demo employer
        cls.other_job = Job.objects.get(title="Data Analyst")  # owned by nobody

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEST_MEDIA_FOLDER, ignore_errors=True)

    def setUp(self):
        # Reset the rate limits before each test
        cache.clear()

    def make_pdf(self, size=1000):
        return SimpleUploadedFile("cv.pdf", b"%PDF-1.4 " + b"x" * size, content_type="application/pdf")


class JobListTests(JobZTestCase):
    def test_list_jobs(self):
        response = self.client.get("/api/jobs/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 62)
        self.assertEqual(len(response.data["results"]), 12)
        self.assertEqual(response.data["total_pages"], 6)
        # Featured jobs come first
        self.assertTrue(response.data["results"][0]["is_featured"])

    def test_filter_by_category(self):
        response = self.client.get("/api/jobs/?category=business-and-finance&page_size=50")
        titles = [job["title"] for job in response.data["results"]]
        self.assertEqual(response.data["count"], 14)
        # These were missing in the old site because of a typo in their category
        self.assertIn("Accountant", titles)
        self.assertIn("Digital Marketing Specialist", titles)

    def test_keyword_search(self):
        self.assertEqual(self.client.get("/api/jobs/?q=TechNova").data["count"], 1)
        titles = [job["title"] for job in self.client.get("/api/jobs/?q=python").data["results"]]
        self.assertIn("AI Engineer", titles)
        self.assertEqual(self.client.get("/api/jobs/?q=zzzznothing").data["count"], 0)

    def test_work_mode_salary_and_sorting(self):
        response = self.client.get("/api/jobs/?work_mode=remote,hybrid&page_size=50")
        self.assertEqual(response.data["count"], 18)
        for job in response.data["results"]:
            self.assertIn(job["work_mode"], ["remote", "hybrid"])

        response = self.client.get("/api/jobs/?salary_min=15000&page_size=50")
        for job in response.data["results"]:
            self.assertGreaterEqual(job["salary_max"], 15000)

        response = self.client.get("/api/jobs/?location=lagos&ordering=-salary_max")
        salaries = [job["salary_max"] for job in response.data["results"]]
        self.assertEqual(salaries, sorted(salaries, reverse=True))

    def test_categories_have_job_counts(self):
        response = self.client.get("/api/categories/")
        counts = {category["slug"]: category["job_count"] for category in response.data}
        self.assertEqual(counts["engineering"], 4)
        self.assertEqual(sum(counts.values()), 62)

    def test_related_locations_and_stats(self):
        related = self.client.get(f"/api/jobs/{self.other_job.slug}/related/").data
        self.assertTrue(1 <= len(related) <= 4)

        locations = self.client.get("/api/jobs/locations/").data
        self.assertEqual(locations[0]["name"], "Lagos")

        stats = self.client.get("/api/stats/").data
        self.assertEqual(stats["open_jobs"], 62)
        self.assertEqual(stats["companies"], 62)


class JobDetailTests(JobZTestCase):
    def test_job_detail_counts_views(self):
        response = self.client.get(f"/api/jobs/{self.other_job.slug}/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_open"])
        self.assertGreater(len(response.data["requirement_list"]), 1)

        self.other_job.refresh_from_db()
        self.assertEqual(self.other_job.views_count, 1)

    def test_employer_viewing_own_job_is_not_counted(self):
        self.client.force_authenticate(self.employer)
        self.client.get(f"/api/jobs/{self.technova_job.slug}/")
        self.technova_job.refresh_from_db()
        self.assertEqual(self.technova_job.views_count, 0)

    def test_closed_job_is_hidden(self):
        self.other_job.is_active = False
        self.other_job.save()
        self.assertEqual(self.client.get(f"/api/jobs/{self.other_job.slug}/").status_code, 404)
        self.assertEqual(self.client.get("/api/jobs/").data["count"], 61)

    def test_job_past_deadline_cannot_be_applied_for(self):
        self.technova_job.deadline = timezone.localdate() - timedelta(days=1)
        self.technova_job.save()

        response = self.client.get(f"/api/jobs/{self.technova_job.slug}/")
        self.assertFalse(response.data["is_open"])

        response = self.client.post(
            f"/api/jobs/{self.technova_job.slug}/apply/",
            {"full_name": "A B", "email": "ab@example.com", "resume_link": "https://example.com/cv"},
        )
        self.assertEqual(response.status_code, 400)


class ApplyTests(JobZTestCase):
    def test_guest_can_apply_with_a_cv(self):
        response = self.client.post(
            f"/api/jobs/{self.technova_job.slug}/apply/",
            {"full_name": "Bola Ade", "email": "Bola@Example.com", "resume": self.make_pdf()},
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)

        application = Application.objects.get(email="bola@example.com")
        self.assertTrue(application.resume.name.startswith("resumes/"))

        # One email to the applicant, one to the employer
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[1].to, ["employer@jobz.demo"])

    def test_cannot_apply_twice(self):
        url = f"/api/jobs/{self.other_job.slug}/apply/"
        data = {"full_name": "X Y", "email": "xy@example.com", "resume_link": "https://example.com/cv"}
        self.assertEqual(self.client.post(url, data).status_code, 201)

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_cv_is_required(self):
        response = self.client.post(
            f"/api/jobs/{self.other_job.slug}/apply/", {"full_name": "No CV", "email": "nocv@example.com"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("resume", response.data)

    def test_wrong_file_type_and_big_file_are_rejected(self):
        url = f"/api/jobs/{self.other_job.slug}/apply/"

        exe_file = SimpleUploadedFile("cv.exe", b"MZ")
        response = self.client.post(url, {"full_name": "A", "email": "a@x.com", "resume": exe_file}, format="multipart")
        self.assertEqual(response.status_code, 400)

        big_file = self.make_pdf(size=6 * 1024 * 1024)
        response = self.client.post(url, {"full_name": "A", "email": "b@x.com", "resume": big_file}, format="multipart")
        self.assertEqual(response.status_code, 400)

    def test_signed_in_seeker_does_not_retype_details(self):
        self.client.force_authenticate(self.seeker)
        response = self.client.post(f"/api/jobs/{self.other_job.slug}/apply/", {"resume_link": "https://x.com/cv"})
        self.assertEqual(response.status_code, 201)

        application = Application.objects.get(job=self.other_job)
        self.assertEqual(application.email, "seeker@jobz.demo")
        self.assertEqual(application.applicant, self.seeker)

        # It shows on the seeker's dashboard (2 demo applications + this one)
        self.assertEqual(self.client.get("/api/me/applications/").data["count"], 3)

    def test_employers_cannot_apply(self):
        self.client.force_authenticate(self.employer)
        response = self.client.post(f"/api/jobs/{self.other_job.slug}/apply/", {"resume_link": "https://x.com/cv"})
        self.assertEqual(response.status_code, 403)


class AccountTests(JobZTestCase):
    def test_register_and_login(self):
        response = self.client.post(
            "/api/auth/register/",
            {"full_name": "New Person", "email": "New@Example.com", "password": "a-Strong-pass-77"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["role"], "seeker")

        response = self.client.post("/api/auth/login/", {"email": "new@example.com", "password": "a-Strong-pass-77"})
        self.assertEqual(response.status_code, 200)

        # Use the token to load my profile
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + response.data["access"])
        self.assertEqual(self.client.get("/api/auth/me/").data["full_name"], "New Person")

    def test_register_employer_creates_company(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Boss",
                "email": "boss@acme.ng",
                "password": "a-Strong-pass-77",
                "role": "employer",
                "company_name": "TechNova",
            },
        )
        self.assertEqual(response.status_code, 201)
        # "technova" is taken, so the new company gets "technova-2"
        self.assertEqual(response.data["user"]["company"]["slug"], "technova-2")

    def test_register_errors(self):
        response = self.client.post(
            "/api/auth/register/", {"full_name": "X", "email": "seeker@jobz.demo", "password": "12345678"}
        )
        self.assertIn("email", response.data)

        response = self.client.post(
            "/api/auth/register/",
            {"full_name": "X", "email": "new@x.com", "password": "a-Strong-pass-77", "role": "employer"},
        )
        self.assertIn("company_name", response.data)

    def test_wrong_password(self):
        response = self.client.post("/api/auth/login/", {"email": "seeker@jobz.demo", "password": "wrong"})
        self.assertEqual(response.status_code, 401)

    def test_update_profile_but_not_role(self):
        self.client.force_authenticate(self.seeker)
        response = self.client.patch("/api/auth/me/", {"headline": "Senior React dev", "role": "employer"})
        self.assertEqual(response.data["headline"], "Senior React dev")
        self.assertEqual(response.data["role"], "seeker")

    def test_change_password(self):
        self.client.force_authenticate(self.seeker)
        response = self.client.post("/api/auth/change-password/", {"current_password": "nope", "new_password": "whatever-123"})
        self.assertEqual(response.status_code, 400)

        response = self.client.post(
            "/api/auth/change-password/", {"current_password": "JobZdemo2026!", "new_password": "a-New-strong-pass-9"}
        )
        self.assertEqual(response.status_code, 200)
        self.seeker.refresh_from_db()
        self.assertTrue(self.seeker.check_password("a-New-strong-pass-9"))


class EmployerTests(JobZTestCase):
    def new_job_data(self, **changes):
        data = {
            "title": "Senior Django Developer",
            "category": "technology-and-it",
            "location": "Lagos",
            "work_mode": "hybrid",
            "job_type": "full_time",
            "salary_min": 4000,
            "salary_max": 7000,
            "description": "Build and maintain the APIs that power our hiring platform in Nigeria.",
            "requirements": "3+ years of Django\nREST API design\nPostgreSQL",
        }
        data.update(changes)
        return data

    def test_employer_can_post_a_job(self):
        self.client.force_authenticate(self.employer)
        response = self.client.post("/api/jobs/", self.new_job_data(), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["company"]["slug"], "technova")
        self.assertEqual(response.data["requirement_list"], ["3+ years of Django", "REST API design", "PostgreSQL"])

        # It shows up in search
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/jobs/?q=django").data["count"], 1)

    def test_job_form_errors(self):
        self.client.force_authenticate(self.employer)
        response = self.client.post("/api/jobs/", self.new_job_data(salary_min=9000), format="json")
        self.assertIn("salary_max", response.data)

        response = self.client.post("/api/jobs/", self.new_job_data(description="too short"), format="json")
        self.assertIn("description", response.data)

    def test_only_employers_can_post(self):
        self.assertEqual(self.client.post("/api/jobs/", self.new_job_data(), format="json").status_code, 401)
        self.client.force_authenticate(self.seeker)
        self.assertEqual(self.client.post("/api/jobs/", self.new_job_data(), format="json").status_code, 403)

    def test_employer_can_only_edit_own_jobs(self):
        self.client.force_authenticate(self.employer)
        response = self.client.patch(f"/api/jobs/{self.technova_job.slug}/", {"is_active": False}, format="json")
        self.assertEqual(response.status_code, 200)

        response = self.client.patch(f"/api/jobs/{self.other_job.slug}/", {"title": "Hacked"}, format="json")
        self.assertEqual(response.status_code, 403)

        # Closed jobs still show on the employer's dashboard
        jobs = self.client.get("/api/employer/jobs/").data
        self.assertFalse(jobs[0]["is_active"])
        self.assertEqual(jobs[0]["application_count"], 2)

    def test_change_applicant_status_emails_them(self):
        self.client.force_authenticate(self.employer)
        applicants = self.client.get(f"/api/employer/applications/?job={self.technova_job.slug}").data["results"]
        self.assertEqual(len(applicants), 2)

        mail.outbox.clear()
        application_id = applicants[0]["id"]
        response = self.client.patch(
            f"/api/employer/applications/{application_id}/",
            {"status": "interview", "employer_notes": "Good portfolio", "full_name": "Changed"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status_display"], "Interview")
        self.assertEqual(len(mail.outbox), 1)
        # Employers can't change the applicant's name
        self.assertNotEqual(Application.objects.get(id=application_id).full_name, "Changed")

    def test_employer_cannot_see_other_companies_applicants(self):
        other_application = Application.objects.exclude(job__company__slug="technova").first()

        self.client.force_authenticate(self.employer)
        response = self.client.get(f"/api/employer/applications/{other_application.id}/")
        self.assertEqual(response.status_code, 404)

        self.client.force_authenticate(self.seeker)
        self.assertEqual(self.client.get("/api/employer/applications/").status_code, 403)

    def test_cv_download_is_private(self):
        self.client.post(
            f"/api/jobs/{self.technova_job.slug}/apply/",
            {"full_name": "File Person", "email": "file@x.com", "resume": self.make_pdf()},
            format="multipart",
        )
        application = Application.objects.get(email="file@x.com")
        url = f"/api/employer/applications/{application.id}/resume/"

        self.assertEqual(self.client.get(url).status_code, 401)  # not signed in

        self.client.force_authenticate(self.seeker)
        self.assertEqual(self.client.get(url).status_code, 403)  # not an employer

        self.client.force_authenticate(self.employer)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(b"".join(response.streaming_content).startswith(b"%PDF"))


class SavedJobTests(JobZTestCase):
    def test_save_and_unsave(self):
        url = f"/api/jobs/{self.other_job.slug}/save/"
        self.assertEqual(self.client.post(url).status_code, 401)

        self.client.force_authenticate(self.seeker)
        self.assertEqual(self.client.post(url).status_code, 201)
        self.assertEqual(self.client.post(url).status_code, 201)  # saving twice is fine
        self.assertEqual(SavedJob.objects.count(), 1)

        saved = self.client.get("/api/me/saved-jobs/").data["results"]
        self.assertEqual(saved[0]["job"]["slug"], self.other_job.slug)

        self.client.delete(url)
        self.assertEqual(SavedJob.objects.count(), 0)


class ContactTests(JobZTestCase):
    @override_settings(SITE_ADMIN_EMAIL="admin@jobz.test")
    def test_send_message(self):
        response = self.client.post(
            "/api/contact/", {"name": "Ngozi", "email": "ngozi@x.com", "message": "How do I post a job on JobZ?"}
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.assertEqual(mail.outbox[0].to, ["admin@jobz.test"])

    def test_logging_in_does_not_use_up_the_contact_limit(self):
        # Each rate limit has its own counter
        for i in range(6):
            self.client.post("/api/auth/login/", {"email": "seeker@jobz.demo", "password": "wrong"})
        response = self.client.post(
            "/api/contact/", {"name": "Ngozi", "email": "ngozi@x.com", "message": "How do I post a job on JobZ?"}
        )
        self.assertEqual(response.status_code, 201)

    def test_spam_and_short_messages_are_rejected(self):
        response = self.client.post(
            "/api/contact/", {"name": "Bot", "email": "b@x.com", "message": "Buy cheap stuff now!!", "website": "spam.com"}
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.post("/api/contact/", {"name": "A", "email": "a@x.com", "message": "hi"})
        self.assertIn("message", response.data)
        self.assertEqual(ContactMessage.objects.count(), 0)


class SeedCommandTests(JobZTestCase):
    def test_running_twice_does_not_duplicate(self):
        call_command("seed_jobs", "--demo", verbosity=0)
        self.assertEqual(Job.objects.count(), 62)
        self.assertEqual(Category.objects.count(), 6)
