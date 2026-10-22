from django.urls import path

from . import views

urlpatterns = [
    # Jobs
    path("jobs/", views.job_list),
    path("jobs/locations/", views.job_locations),  # must come before jobs/<slug>/
    path("jobs/<slug:slug>/", views.job_detail),
    path("jobs/<slug:slug>/related/", views.related_jobs),
    path("jobs/<slug:slug>/apply/", views.apply_for_job),
    path("jobs/<slug:slug>/save/", views.save_job),
    # Lookups
    path("categories/", views.category_list),
    path("companies/", views.company_list),
    path("companies/<slug:slug>/", views.company_detail),
    path("stats/", views.site_stats),
    # Job seeker dashboard
    path("me/applications/", views.my_applications),
    path("me/saved-jobs/", views.my_saved_jobs),
    # Employer dashboard
    path("employer/jobs/", views.employer_jobs),
    path("employer/applications/", views.employer_applications),
    path("employer/applications/<int:application_id>/", views.employer_application_detail),
    path("employer/applications/<int:application_id>/resume/", views.download_cv),
]
