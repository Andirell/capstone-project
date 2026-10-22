from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class MyUserAdmin(UserAdmin):
    ordering = ["-date_joined"]
    list_display = ["email", "full_name", "role", "is_staff", "date_joined"]
    list_filter = ["role", "is_staff"]
    search_fields = ["email", "full_name"]

    # The default UserAdmin uses "username", so we list our own fields
    fieldsets = [
        (None, {"fields": ["email", "password"]}),
        ("Profile", {"fields": ["full_name", "role", "phone", "headline", "location"]}),
        ("Permissions", {"fields": ["is_active", "is_staff", "is_superuser", "groups", "user_permissions"]}),
        ("Dates", {"fields": ["last_login", "date_joined"]}),
    ]
    add_fieldsets = [
        (None, {"fields": ["email", "full_name", "role", "password1", "password2"]}),
    ]
