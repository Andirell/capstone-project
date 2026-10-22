from django.conf import settings
from django.core.mail import send_mail

# fail_silently=True means a broken mail server won't stop the
# application from being saved. The email just won't go out.


def send_application_received_emails(application):
    job = application.job

    # 1. Email to the person who applied
    send_mail(
        subject=f"We received your application for {job.title}",
        message=(
            f"Hi {application.full_name},\n\n"
            f"Thanks for applying to {job.title} at {job.company.name}.\n"
            "The employer will review your application and you'll hear back if you're shortlisted.\n\n"
            f"Job link: {settings.FRONTEND_URL}/jobs/{job.slug}\n\n"
            "- The JobZ team"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[application.email],
        fail_silently=True,
    )

    # 2. Email to the employer (or the site admin if the company has no account yet)
    if job.company.owner:
        employer_email = job.company.owner.email
    else:
        employer_email = settings.SITE_ADMIN_EMAIL

    if employer_email:
        send_mail(
            subject=f"New applicant for {job.title}: {application.full_name}",
            message=(
                f"{application.full_name} ({application.email}) just applied to {job.title}.\n\n"
                f"See all applicants: {settings.FRONTEND_URL}/dashboard\n"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[employer_email],
            fail_silently=True,
        )


def send_status_changed_email(application):
    job = application.job
    send_mail(
        subject=f"Update on your application for {job.title}",
        message=(
            f"Hi {application.full_name},\n\n"
            f"Your application for {job.title} at {job.company.name} "
            f"is now: {application.get_status_display()}.\n\n"
            f"See details: {settings.FRONTEND_URL}/dashboard\n\n"
            "- The JobZ team"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[application.email],
        fail_silently=True,
    )
