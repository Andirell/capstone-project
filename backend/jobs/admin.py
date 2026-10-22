from django.contrib import admin

from .models import Application, Category, Company, Job, SavedJob


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "order"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["name", "location", "owner", "created_at"]
    search_fields = ["name", "location"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "category", "location", "work_mode", "is_active", "is_featured", "created_at"]
    list_filter = ["is_active", "is_featured", "work_mode", "job_type", "category"]
    list_editable = ["is_active", "is_featured"]
    search_fields = ["title", "company__name", "location"]
    readonly_fields = ["slug", "views_count"]


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["full_name", "email", "job", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["full_name", "email", "job__title"]


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ["user", "job", "created_at"]
