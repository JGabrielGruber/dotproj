from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0001_initial'),
    ]

    operations = [
        # Enable RLS on all tables
        migrations.RunSQL(
            sql="""
            ALTER TABLE workspace_organization ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_workspace ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_workspacemember ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_category ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_stage ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_task ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_taskcomment ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_chore ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_choreresponsible ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_choreassigned ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_choreassignmentsubmission ENABLE ROW LEVEL SECURITY;
            """,
            reverse_sql="""
            ALTER TABLE workspace_organization DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_workspace DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_workspacemember DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_category DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_stage DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_task DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_taskcomment DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_chore DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_choreresponsible DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_choreassigned DISABLE ROW LEVEL SECURITY;
            ALTER TABLE workspace_choreassignmentsubmission DISABLE ROW LEVEL SECURITY;
            """
        ),
        # Create helper function to check workspace role
        migrations.RunSQL(
            sql="""
            CREATE OR REPLACE FUNCTION workspace_check_workspace_role(w_id UUID, u_id INTEGER)
            RETURNS TEXT AS $$
            DECLARE
                user_role TEXT;
            BEGIN
                SELECT role INTO user_role
                FROM workspace_workspacemember
                WHERE workspace_id = w_id AND user_id = u_id;
                RETURN COALESCE(user_role, '');
            END;
            $$ LANGUAGE plpgsql STABLE;
            """,
            reverse_sql="DROP FUNCTION IF EXISTS workspace_check_workspace_role;"
        ),
        # Create helper function to check if user is assigned to a task or chore
        migrations.RunSQL(
            sql="""
            CREATE OR REPLACE FUNCTION workspace_is_assigned(w_id UUID, u_id INTEGER, t_id UUID, c_id UUID)
            RETURNS BOOLEAN AS $$
            BEGIN
                RETURN EXISTS (
                    SELECT 1
                    FROM workspace_task
                    WHERE id = t_id AND workspace_id = w_id AND owner_id = u_id
                ) OR EXISTS (
                    SELECT 1
                    FROM workspace_choreassigned
                    WHERE chore_id = c_id AND user_id = u_id
                );
            END;
            $$ LANGUAGE plpgsql STABLE;
            """,
            reverse_sql="DROP FUNCTION IF EXISTS workspace_is_assigned;"
        ),
        # Organization policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY organization_insert ON workspace_organization
            FOR INSERT
            WITH CHECK (current_setting('workspace.current_user_id', true) IS NOT NULL);

            CREATE POLICY organization_select ON workspace_organization
            FOR SELECT
            USING (
                id IN (
                    SELECT organization_id
                    FROM workspace_organizationmember
                    WHERE user_id = current_setting('workspace.current_user_id')::integer
                )
            );

            CREATE POLICY organization_update ON workspace_organization
            FOR UPDATE
            USING (
                id IN (
                    SELECT organization_id
                    FROM workspace_organizationmember
                    WHERE user_id = current_setting('workspace.current_user_id')::integer AND role = 'owner'
                )
            );

            CREATE POLICY organization_delete ON workspace_organization
            FOR DELETE
            USING (
                id IN (
                    SELECT organization_id
                    FROM workspace_organizationmember
                    WHERE user_id = current_setting('workspace.current_user_id')::integer AND role = 'owner'
                )
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS organization_insert ON workspace_organization;
            DROP POLICY IF EXISTS organization_select ON workspace_organization;
            DROP POLICY IF EXISTS organization_update ON workspace_organization;
            DROP POLICY IF EXISTS organization_delete ON workspace_organization;
            """
        ),
        # Workspace policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY workspace_insert ON workspace_workspace
            FOR INSERT
            WITH CHECK (
                organization_id IN (
                    SELECT organization_id
                    FROM workspace_organizationmember
                    WHERE user_id = current_setting('workspace.current_user_id')::integer
                )
            );

            CREATE POLICY workspace_select ON workspace_workspace
            FOR SELECT
            USING (
                workspace_check_workspace_role(id, current_setting('workspace.current_user_id')::integer) != ''
            );

            CREATE POLICY workspace_update ON workspace_workspace
            FOR UPDATE
            USING (
                workspace_check_workspace_role(id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY workspace_delete ON workspace_workspace
            FOR DELETE
            USING (
                workspace_check_workspace_role(id, current_setting('workspace.current_user_id')::integer) = 'owner'
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS workspace_insert ON workspace_workspace;
            DROP POLICY IF EXISTS workspace_select ON workspace_workspace;
            DROP POLICY IF EXISTS workspace_update ON workspace_workspace;
            DROP POLICY IF EXISTS workspace_delete ON workspace_workspace;
            """
        ),
        # WorkspaceMember policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY workspacemember_insert ON workspace_workspacemember
            FOR INSERT
            WITH CHECK (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY workspacemember_select ON workspace_workspacemember
            FOR SELECT
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
            );

            CREATE POLICY workspacemember_update ON workspace_workspacemember
            FOR UPDATE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY workspacemember_delete ON workspace_workspacemember
            FOR DELETE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY workspacemember_self_select ON workspace_workspacemember
            FOR SELECT
            USING (
                user_id = current_setting('workspace.current_user_id')::integer
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS workspacemember_insert ON workspace_workspacemember;
            DROP POLICY IF EXISTS workspacemember_select ON workspace_workspacemember;
            DROP POLICY IF EXISTS workspacemember_update ON workspace_workspacemember;
            DROP POLICY IF EXISTS workspacemember_delete ON workspace_workspacemember;
            DROP POLICY IF EXISTS workspacemember_self_select ON workspace_workspacemember;
            """
        ),
        # Category and Stage policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY category_select ON workspace_category
            FOR SELECT
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
            );

            CREATE POLICY category_insert ON workspace_category
            FOR INSERT
            WITH CHECK (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY category_update ON workspace_category
            FOR UPDATE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY category_delete ON workspace_category
            FOR DELETE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY stage_select ON workspace_stage
            FOR SELECT
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
            );

            CREATE POLICY stage_insert ON workspace_stage
            FOR INSERT
            WITH CHECK (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY stage_update ON workspace_stage
            FOR UPDATE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY stage_delete ON workspace_stage
            FOR DELETE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS category_select ON workspace_category;
            DROP POLICY IF EXISTS category_insert ON workspace_category;
            DROP POLICY IF EXISTS category_update ON workspace_category;
            DROP POLICY IF EXISTS category_delete ON workspace_category;
            DROP POLICY IF EXISTS stage_select ON workspace_stage;
            DROP POLICY IF EXISTS stage_insert ON workspace_stage;
            DROP POLICY IF EXISTS stage_update ON workspace_stage;
            DROP POLICY IF EXISTS stage_delete ON workspace_stage;
            """
        ),
        # Task policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY task_select ON workspace_task
            FOR SELECT
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) in ('owner', 'manager')
                OR (workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) in ('user', 'viewer')
                    AND owner_id = current_setting('workspace.current_user_id')::integer)
            );

            CREATE POLICY task_insert ON workspace_task
            FOR INSERT
            WITH CHECK (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager', 'user')
            );

            CREATE POLICY task_update ON workspace_task
            FOR UPDATE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                OR (workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) in ('user', 'viewer')
                    AND owner_id = current_setting('workspace.current_user_id')::integer)
            );

            CREATE POLICY task_delete ON workspace_task
            FOR DELETE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                OR (workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) in ('user', 'viewer')
                    AND owner_id = current_setting('workspace.current_user_id')::integer)

            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS task_select ON workspace_task;
            DROP POLICY IF EXISTS task_insert ON workspace_task;
            DROP POLICY IF EXISTS task_update ON workspace_task;
            DROP POLICY IF EXISTS task_delete ON workspace_task;
            """
        ),
        # TaskComment policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY taskcomment_select ON workspace_taskcomment
            FOR SELECT
            USING (
                task_id IN (
                    SELECT id
                    FROM workspace_task
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
                )
            );

            CREATE POLICY taskcomment_insert ON workspace_taskcomment
            FOR INSERT
            WITH CHECK (
                task_id IN (
                    SELECT id
                    FROM workspace_task
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                    OR workspace_is_assigned(workspace_id, current_setting('workspace.current_user_id')::integer, id, NULL)
                )
            );

            CREATE POLICY taskcomment_update ON workspace_taskcomment
            FOR UPDATE
            USING (
                author_id = current_setting('workspace.current_user_id')::integer
            );

            CREATE POLICY taskcomment_delete ON workspace_taskcomment
            FOR DELETE
            USING (
                author_id = current_setting('workspace.current_user_id')::integer
                OR workspace_check_workspace_role(
                    (SELECT workspace_id FROM workspace_task WHERE id = task_id),
                    current_setting('workspace.current_user_id')::integer
                ) IN ('owner', 'manager')
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS taskcomment_select ON workspace_taskcomment;
            DROP POLICY IF EXISTS taskcomment_insert ON workspace_taskcomment;
            DROP POLICY IF EXISTS taskcomment_update ON workspace_taskcomment;
            DROP POLICY IF EXISTS taskcomment_delete ON workspace_taskcomment;
            """
        ),
        # Chore policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY chore_select ON workspace_chore
            FOR SELECT
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
            );

            CREATE POLICY chore_insert ON workspace_chore
            FOR INSERT
            WITH CHECK (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY chore_update ON workspace_chore
            FOR UPDATE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY chore_delete ON workspace_chore
            FOR DELETE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS chore_select ON workspace_chore;
            DROP POLICY IF EXISTS chore_insert ON workspace_chore;
            DROP POLICY IF EXISTS chore_update ON workspace_chore;
            DROP POLICY IF EXISTS chore_delete ON workspace_chore;
            """
        ),
        # ChoreResponsible policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY choreresponsible_select ON workspace_choreresponsible
            FOR SELECT
            USING (
                chore_id IN (
                    SELECT id
                    FROM workspace_chore
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
                )
            );

            CREATE POLICY choreresponsible_insert ON workspace_choreresponsible
            FOR INSERT
            WITH CHECK (
                chore_id IN (
                    SELECT id
                    FROM workspace_chore
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                )
            );

            CREATE POLICY choreresponsible_update ON workspace_choreresponsible
            FOR UPDATE
            USING (
                chore_id IN (
                    SELECT id
                    FROM workspace_chore
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                )
            );

            CREATE POLICY choreresponsible_delete ON workspace_choreresponsible
            FOR DELETE
            USING (
                chore_id IN (
                    SELECT id
                    FROM workspace_chore
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                )
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS choreresponsible_select ON workspace_choreresponsible;
            DROP POLICY IF EXISTS choreresponsible_insert ON workspace_choreresponsible;
            DROP POLICY IF EXISTS choreresponsible_update ON workspace_choreresponsible;
            DROP POLICY IF EXISTS choreresponsible_delete ON workspace_choreresponsible;
            """
        ),
        # ChoreAssigned policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY choreassigned_select ON workspace_choreassigned
            FOR SELECT
            USING (
                chore_id IN (
                    SELECT id
                    FROM workspace_chore
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
                )
            );

            CREATE POLICY choreassigned_insert ON workspace_choreassigned
            FOR INSERT
            WITH CHECK (
                chore_id IN (
                    SELECT id
                    FROM workspace_chore
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                )
                OR user_id = current_setting('workspace.current_user_id')::integer
            );

            CREATE POLICY choreassigned_update ON workspace_choreassigned
            FOR UPDATE
            USING (
                chore_id IN (
                    SELECT id
                    FROM workspace_chore
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                )
                OR user_id = current_setting('workspace.current_user_id')::integer
            );

            CREATE POLICY choreassigned_delete ON workspace_choreassigned
            FOR DELETE
            USING (
                chore_id IN (
                    SELECT id
                    FROM workspace_chore
                    WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                )
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS choreassigned_select ON workspace_choreassigned;
            DROP POLICY IF EXISTS choreassigned_insert ON workspace_choreassigned;
            DROP POLICY IF EXISTS choreassigned_update ON workspace_choreassigned;
            DROP POLICY IF EXISTS choreassigned_delete ON workspace_choreassigned;
            """
        ),
        # ChoreAssignmentSubmission policies
        migrations.RunSQL(
            sql="""
            CREATE POLICY choreassignmentsubmission_select ON workspace_choreassignmentsubmission
            FOR SELECT
            USING (
                chore_assigned_id IN (
                    SELECT id
                    FROM workspace_choreassigned
                    WHERE chore_id IN (
                        SELECT id
                        FROM workspace_chore
                        WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
                    )
                )
            );

            CREATE POLICY choreassignmentsubmission_insert ON workspace_choreassignmentsubmission
            FOR INSERT
            WITH CHECK (
                chore_assigned_id IN (
                    SELECT id
                    FROM workspace_choreassigned
                    WHERE chore_id IN (
                        SELECT id
                        FROM workspace_chore
                        WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                    )
                    OR user_id = current_setting('workspace.current_user_id')::integer
                )
            );

            CREATE POLICY choreassignmentsubmission_update ON workspace_choreassignmentsubmission
            FOR UPDATE
            USING (
                user_id = current_setting('workspace.current_user_id')::integer
            );

            CREATE POLICY choreassignmentsubmission_delete ON workspace_choreassignmentsubmission
            FOR DELETE
            USING (
                user_id = current_setting('workspace.current_user_id')::integer
                OR workspace_check_workspace_role(
                    (SELECT workspace_id
                     FROM workspace_chore
                     WHERE id = (SELECT chore_id FROM workspace_choreassigned WHERE id = chore_assigned_id)),
                    current_setting('workspace.current_user_id')::integer
                ) IN ('owner', 'manager')
            );
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS choreassignmentsubmission_select ON workspace_choreassignmentsubmission;
            DROP POLICY IF EXISTS choreassignmentsubmission_insert ON workspace_choreassignmentsubmission;
            DROP POLICY IF EXISTS choreassignmentsubmission_update ON workspace_choreassignmentsubmission;
            DROP POLICY IF EXISTS choreassignmentsubmission_delete ON workspace_choreassignmentsubmission;
            """
        ),
    ]
