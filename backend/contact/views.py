from django.conf import settings
from django.core.mail import send_mail
from rest_framework import serializers
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Please write a little more so we can help.")
        return value.strip()


class ContactThrottle(AnonRateThrottle):
    scope = "contact"
    rate = "5/hour"


@api_view(["POST"])
@throttle_classes([ContactThrottle])
def send_message(request):
    # "website" is a hidden field on the form. People can't see it, so they
    # leave it empty. Spam bots fill in every field, so we reject those.
    if request.data.get("website"):
        return Response({"detail": "Spam detected."}, status=400)

    serializer = ContactMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    message = serializer.save()

    # Forward the message to the site admin
    if settings.SITE_ADMIN_EMAIL:
        send_mail(
            subject=f"[JobZ contact] {message.subject or 'New message'} from {message.name}",
            message=f"From: {message.name} <{message.email}>\n\n{message.message}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.SITE_ADMIN_EMAIL],
            fail_silently=True,
        )

    return Response(serializer.data, status=201)
