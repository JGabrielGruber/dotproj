from django.contrib import admin

from portal.storage.models import WorkspaceFile

class WorkspaceFileAdmin(admin.ModelAdmin):
    list_display = ['id', 'workspace', 'file_name', 'created_by', 'created_at']
    list_filter = ['workspace']
    search_fields = ['file_name']

admin.site.register(WorkspaceFile, WorkspaceFileAdmin)
