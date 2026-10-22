from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

from contact.views import send_message

admin.site.site_header = "JobZ admin"
admin.site.site_title = "JobZ admin"


def health_check(request):
    # Hosting services call this to check the API is running
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check),
    path("api/auth/", include("accounts.urls")),
    path("api/contact/", send_message),
    path("api/", include("jobs.urls")),
]

# Note: uploaded CVs are NOT served from /media/.
# Employers download them from /api/employer/applications/<id>/resume/
# which checks that they own the job.
