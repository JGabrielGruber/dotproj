from django.contrib import admin

from portal.form.models import (
    Form, FormSubmission,
    Process, ProcessInstance,
)


class FormAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'workspace', 'category_key']
    list_filter = ['workspace', 'category_key']
    search_fields = ['title', 'workspace__label', 'category__name']
    inlines = [
        type('SubmissionInline', (admin.TabularInline,), {
            'model': FormSubmission,
            'extra': 1,
        }),
    ]


class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ['id', 'form', 'submitter', 'created_at']
    list_filter = ['form', 'submitter', 'created_at']
    search_fields = ['form__title', 'submitter__username']


class ProcessAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'workspace', 'category_key']
    list_filter = ['workspace', 'category_key']
    search_fields = ['title', 'workspace__label', 'category__name']
    inlines = [
        type('SubmissionInline', (admin.TabularInline,), {
            'model': ProcessInstance,
            'extra': 1,
        }),
    ]


class ProcessInstanceAdmin(admin.ModelAdmin):
    list_display = ['id', 'process', 'initiator', 'created_at']
    list_filter = ['process', 'initiator', 'created_at']
    search_fields = ['process__title', 'initiator__username']


# Register models
admin.site.register(Form, FormAdmin)
admin.site.register(FormSubmission, FormSubmissionAdmin)
admin.site.register(Process, ProcessAdmin)
admin.site.register(ProcessInstance, ProcessInstanceAdmin)

