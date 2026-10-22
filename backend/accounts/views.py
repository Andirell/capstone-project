from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from jobs.models import Company

from .serializers import ChangePasswordSerializer, CompanyInfoSerializer, RegisterSerializer, UserSerializer


class LoginThrottle(AnonRateThrottle):
    # Stop people from guessing passwords too fast.
    # Each throttle needs its own "scope", otherwise they share one counter.
    scope = "login"
    rate = "20/hour"


def make_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


@api_view(["POST"])
@throttle_classes([LoginThrottle])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    data = make_tokens(user)
    data["user"] = UserSerializer(user).data
    return Response(data, status=201)


@api_view(["POST"])
@throttle_classes([LoginThrottle])
def login(request):
    email = request.data.get("email", "").lower().strip()
    password = request.data.get("password", "")

    user = authenticate(request, email=email, password=password)
    if user is None:
        return Response({"detail": "Wrong email or password."}, status=401)

    data = make_tokens(user)
    data["user"] = UserSerializer(user).data
    return Response(data)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)

    # PATCH: update my profile
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def my_company(request):
    company = Company.objects.filter(owner=request.user).first()
    if company is None:
        return Response({"detail": "You don't have a company profile."}, status=404)

    if request.method == "GET":
        return Response(CompanyInfoSerializer(company).data)

    serializer = CompanyInfoSerializer(company, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user
    if not user.check_password(serializer.validated_data["current_password"]):
        return Response({"current_password": ["Your current password is not correct."]}, status=400)

    new_password = serializer.validated_data["new_password"]
    try:
        validate_password(new_password, user)
    except DjangoValidationError as error:
        return Response({"new_password": error.messages}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({"detail": "Password updated."})
