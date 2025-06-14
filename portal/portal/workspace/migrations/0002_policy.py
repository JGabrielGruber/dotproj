from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0001_initial'),  # Adjust if your initial migration has a different name
    ]

    operations = [
        # Enable RLS on all tables
        migrations.RunSQL(
            """
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
            ALTER TABLE workspace_choreassignedsubmission ENABLE ROW LEVEL SECURITY;
            """
        ),
        # Create helper function to check workspace role
        migrations.RunSQL(
            """
            CREATE OR REPLACE FUNCTION workspace_check_workspace_role(workspace_id UUID, user_id INTEGER)
            RETURNS TEXT AS $$
            DECLARE
                user_role TEXT;
            BEGIN
                SELECT role INTO user_role
                FROM workspace_workspacemember
                WHERE workspace_id = workspace_id AND user_id = user_id;
                RETURN COALESCE(user_role, '');
            END;
            $$ LANGUAGE plpgsql STABLE;
            """
        ),
        # Create helper function to check if user is assigned to a task or chore
        migrations.RunSQL(
            """
            CREATE OR REPLACE FUNCTION workspace_is_assigned(workspace_id UUID, user_id INTEGER, task_id UUID, chore_id UUID)
            RETURNS BOOLEAN AS $$
            BEGIN
                RETURN EXISTS (
                    SELECT 1
                    FROM workspace_task
                    WHERE id = task_id AND workspace_id = workspace_id AND owner_id = user_id
                ) OR EXISTS (
                    SELECT 1
                    FROM workspace_choreassigned
                    WHERE chore_id = chore_id AND user_id = user_id
                );
            END;
            $$ LANGUAGE plpgsql STABLE;
            """
        ),
        # Organization policies
        migrations.RunSQL(
            """
            -- Allow authenticated users to create organizations
            CREATE POLICY organization_insert ON workspace_organization
            FOR INSERT
            WITH CHECK (current_setting('workspace.current_user_id', true) IS NOT NULL);

            -- Allow members to read their organizations
            CREATE POLICY organization_select ON workspace_organization
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1
                    FROM workspace_organizationmember
                    WHERE organization_id = id AND user_id = current_setting('workspace.current_user_id')::integer
                )
            );

            -- Allow owners to update/delete
            CREATE POLICY organization_update ON workspace_organization
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1
                    FROM workspace_organizationmember
                    WHERE organization_id = id AND user_id = current_setting('workspace.current_user_id')::integer AND role = 'owner'
                )
            );

            CREATE POLICY organization_delete ON workspace_organization
            FOR DELETE
            USING (
                EXISTS (
                    SELECT 1
                    FROM workspace_organizationmember
                    WHERE organization_id = id AND user_id = current_setting('workspace.current_user_id')::integer AND role = 'owner'
                )
            );
            """
        ),
        # Workspace policies
        migrations.RunSQL(
            """
            -- Allow organization members to create workspaces
            CREATE POLICY workspace_insert ON workspace_workspace
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1
                    FROM workspace_organizationmember
                    WHERE organization_id = organization_id AND user_id = current_setting('workspace.current_user_id')::integer
                )
            );

            -- Allow workspace members to read
            CREATE POLICY workspace_select ON workspace_workspace
            FOR SELECT
            USING (
                workspace_check_workspace_role(id, current_setting('workspace.current_user_id')::integer) != ''
            );

            -- Allow owners/managers to update
            CREATE POLICY workspace_update ON workspace_workspace
            FOR UPDATE
            USING (
                workspace_check_workspace_role(id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            -- Allow only owners to delete
            CREATE POLICY workspace_delete ON workspace_workspace
            FOR DELETE
            USING (
                workspace_check_workspace_role(id, current_setting('workspace.current_user_id')::integer) = 'owner'
            );
            """
        ),
        # WorkspaceMember policies
        migrations.RunSQL(
            """
            -- Allow owners/managers to manage members
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

            -- Allow users to read their own membership
            CREATE POLICY workspacemember_self_select ON workspace_workspacemember
            FOR SELECT
            USING (
                user_id = current_setting('workspace.current_user_id')::integer
            );
            """
        ),
        # Category and Stage policies
        migrations.RunSQL(
            """
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
            """
        ),
        # Task policies
        migrations.RunSQL(
            """
            CREATE POLICY task_select ON workspace_task
            FOR SELECT
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
            );

            CREATE POLICY task_insert ON workspace_task
            FOR INSERT
            WITH CHECK (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                OR (workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) = 'user'
                    AND owner_id = current_setting('workspace.current_user_id')::integer)
            );

            CREATE POLICY task_update ON workspace_task
            FOR UPDATE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                OR workspace_is_assigned(workspace_id, current_setting('workspace.current_user_id')::integer, id, NULL)
            );

            CREATE POLICY task_delete ON workspace_task
            FOR DELETE
            USING (
                workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );
            """
        ),
        # TaskComment policies
        migrations.RunSQL(
            """
            CREATE POLICY taskcomment_select ON workspace_taskcomment
            FOR SELECT
            USING (
                task_id IN (
                    SELECT id FROM workspace_task WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
                )
            );

            CREATE POLICY taskcomment_insert ON workspace_taskcomment
            FOR INSERT
            WITH CHECK (
                task_id IN (
                    SELECT id FROM workspace_task
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
                workspace_check_workspace_role((
                    SELECT workspace_id FROM workspace_task WHERE id = task_id
                ), current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                OR author_id = current_setting('workspace.current_user_id')::integer
            );
            """
        ),
        # Chore policies
        migrations.RunSQL(
            """
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
            """
        ),
        # ChoreResponsible policies
        migrations.RunSQL(
            """
            CREATE POLICY choreresponsible_select ON workspace_choreresponsible
            FOR SELECT
            USING (
                chore_id IN (
                    SELECT id FROM workspace_chore WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
                )
            );

            CREATE POLICY choreresponsible_insert ON workspace_choreresponsible
            FOR INSERT
            WITH CHECK (
                workspace_check_workspace_role((
                    SELECT workspace_id FROM workspace_chore WHERE id = chore_id
                ), current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY choreresponsible_update ON workspace_choreresponsible
            FOR UPDATE
            USING (
                workspace_check_workspace_role((
                    SELECT workspace_id FROM workspace_chore WHERE id = chore_id
                ), current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );

            CREATE POLICY choreresponsible_delete ON workspace_choreresponsible
            FOR DELETE
            USING (
                workspace_check_workspace_role((
                    SELECT workspace_id FROM workspace_chore WHERE id = chore_id
                ), current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );
            """
        ),
        # ChoreAssigned policies
        migrations.RunSQL(
            """
            CREATE POLICY choreassigned_select ON workspace_choreassigned
            FOR SELECT
            USING (
                chore_id IN (
                    SELECT id FROM workspace_chore WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
                )
            );

            CREATE POLICY choreassigned_insert ON workspace_choreassigned
            FOR INSERT
            WITH CHECK (
                workspace_check_workspace_role((
                    SELECT workspace_id FROM workspace_chore WHERE id = chore_id
                ), current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                OR user_id = current_setting('workspace.current_user_id')::integer
            );

            CREATE POLICY choreassigned_update ON workspace_choreassigned
            FOR UPDATE
            USING (
                workspace_check_workspace_role((
                    SELECT workspace_id FROM workspace_chore WHERE id = chore_id
                ), current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                OR user_id = current_setting('workspace.current_user_id')::integer
            );

            CREATE POLICY choreassigned_delete ON workspace_choreassigned
            FOR DELETE
            USING (
                workspace_check_workspace_role((
                    SELECT workspace_id FROM workspace_chore WHERE id = chore_id
                ), current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
            );
            """
        ),
        # ChoreAssignedSubmission policies
        migrations.RunSQL(
            """
            CREATE POLICY choreassignedsubmission_select ON workspace_choreassignedsubmission
            FOR SELECT
            USING (
                chore_assigned_id IN (
                    SELECT id FROM workspace_choreassigned
                    WHERE chore_id IN (
                        SELECT id FROM workspace_chore WHERE workspace_check_workspace_role(workspace_id, current_setting('workspace.current_user_id')::integer) != ''
                    )
                )
            );

            CREATE POLICY choreassignedsubmission_insert ON workspace_choreassignedsubmission
            FOR INSERT
            WITH CHECK (
                chore_assigned_id IN (
                    SELECT id FROM workspace_choreassigned
                    WHERE workspace_check_workspace_role((
                        SELECT workspace_id FROM workspace_chore WHERE id = chore_id
                    ), current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                    OR user_id = current_setting('workspace.current_user_id')::integer
                )
            );

            CREATE POLICY choreassignedsubmission_update ON workspace_choreassignedsubmission
            FOR UPDATE
            USING (
                user_id = current_setting('workspace.current_user_id')::integer
            );

            CREATE POLICY choreassignedsubmission_delete ON workspace_choreassignedsubmission
            FOR DELETE
            USING (
                workspace_check_workspace_role((
                    SELECT workspace_id FROM workspace_chore
                    WHERE id = (SELECT chore_id FROM workspace_choreassigned WHERE id = chore_assigned_id)
                ), current_setting('workspace.current_user_id')::integer) IN ('owner', 'manager')
                OR user_id = current_setting('workspace.current_user_id')::integer
            );
            """
        ),
    ]

