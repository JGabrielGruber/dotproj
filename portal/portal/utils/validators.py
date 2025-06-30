from django.core.exceptions import ValidationError
from croniter import croniter

def validate_cron_expression(value):
    try:
        # Check if the cron expression is valid
        croniter(value)
    except ValueError:
        raise ValidationError(f"'{value}' is not a valid cron expression.")
