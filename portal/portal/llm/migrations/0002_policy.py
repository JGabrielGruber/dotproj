from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('llm', '0001_initial'),
        ('workspace', '0002_policy'),
    ]

    operations = [
        # Enable RLS on Tables
        migrations.RunSQL(
            sql="""
            ALTER TABLE llm_tasksummary ENABLE ROW LEVEL SECURITY;
            """,
            reverse_sql="""
            ALTER TABLE llm_tasksummary DISABLE ROW LEVEL SECURITY;
            """
        ),
        # TaskSummary policies
        migrations.RunSQL(
            sql="""DROP POLICY IF EXISTS tasksummary_select ON llm_tasksummary;
            CREATE POLICY tasksummary_select ON llm_tasksummary
            FOR SELECT
            USING (
                task_id IN (
                    SELECT id
                    FROM workspace_task
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
                )
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS tasksummary_select ON llm_tasksummary;
            """
        ),
    ]

