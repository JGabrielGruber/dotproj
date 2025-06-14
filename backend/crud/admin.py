from django.contrib import admin
from crud.models import (
    Category,
    Chore, ChoreAssigned, ChoreAssignedSubmission, ChoreResponsible,
    Organization, OrganizationMember,
    Stage,
    Task, TaskComment,
    Workspace, WorkspaceMember,
)

class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    list_filter = ['name']
    search_fields = ['name']

class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'organization', 'user', 'role']
    list_filter = ['role', 'organization']
    search_fields = ['user__username', 'organization__name']

class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    list_filter = ['name']
    search_fields = ['name']
    inlines = [
        type('WorkspaceMemberInline', (admin.TabularInline,), {
            'model': WorkspaceMember,
            'extra': 1,
        }),
        type('StageInline', (admin.TabularInline,), {
            'model': Stage,
            'extra': 1,
        }),
        type('CategoryInline', (admin.TabularInline,), {
            'model': Category,
            'extra': 1,
        }),
    ]

class WorkspaceMemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'workspace', 'user', 'role']
    list_filter = ['role', 'workspace']
    search_fields = ['user__username', 'workspace__name']

class StageAdmin(admin.ModelAdmin):
    list_display = ['id', 'label', 'key', 'workspace']
    list_filter = ['workspace']
    search_fields = ['label', 'key', 'workspace__name']

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'label', 'workspace']
    list_filter = ['workspace']
    search_fields = ['label', 'workspace__name']

class TaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'workspace', 'stage', 'category', 'owner']
    list_filter = ['workspace', 'stage', 'category', 'owner']
    search_fields = ['title', 'workspace__name', 'stage__label', 'category__name', 'owner__username']
    inlines = [
        type('CommentInline', (admin.TabularInline,), {
            'model': TaskComment,
            'extra': 1,
        }),
    ]

class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'task', 'author', 'created_at']
    list_filter = ['task', 'author', 'created_at']
    search_fields = ['task__title', 'author__username', 'content']

class ChoreAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'workspace', 'category', 'recurrence']
    list_filter = ['workspace', 'category', 'recurrence']
    search_fields = ['title', 'workspace__name', 'category__name']
    inlines = [
        type('ChoreResponsibleInline', (admin.TabularInline,), {
            'model': ChoreResponsible,
            'extra': 1,
        }),
        type('ChoreAssignedInline', (admin.TabularInline,), {
            'model': ChoreAssigned,
            'extra': 1,
        }),
    ]

class ChoreResponsibleAdmin(admin.ModelAdmin):
    list_display = ['id', 'chore', 'user']
    list_filter = ['chore', 'user']
    search_fields = ['chore__title', 'user__username']

class ChoreAssignedAdmin(admin.ModelAdmin):
    list_display = ['id', 'chore', 'user', 'status', 'closed', 'assigned_at']
    list_filter = ['chore', 'user', 'status', 'closed', 'assigned_at']
    search_fields = ['chore__title', 'user__username']
    inlines = [
        type('ChoreAssignedSubmissionInline', (admin.TabularInline,), {
            'model': ChoreAssignedSubmission,
            'extra': 1,
        }),
    ]

class ChoreAssignedSubmissionAdmin(admin.ModelAdmin):
    list_display = ['id', 'chore_assigned', 'user', 'status', 'submitted_at']
    list_filter = ['chore_assigned', 'user', 'status', 'submitted_at']
    search_fields = ['chore_assigned__chore__title', 'user__username', 'notes']

# Register models
admin.site.register(Workspace, WorkspaceAdmin)
admin.site.register(WorkspaceMember, WorkspaceMemberAdmin)
admin.site.register(Stage, StageAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(TaskComment, TaskCommentAdmin)
admin.site.register(Chore, ChoreAdmin)
admin.site.register(ChoreResponsible, ChoreResponsibleAdmin)
admin.site.register(ChoreAssigned, ChoreAssignedAdmin)
admin.site.register(ChoreAssignedSubmission, ChoreAssignedSubmissionAdmin)
admin.site.register(Organization, OrganizationAdmin)
admin.site.register(OrganizationMember, OrganizationMemberAdmin)
