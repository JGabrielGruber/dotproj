import { useState, useEffect, useCallback, useMemo } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
import { DataGrid } from '@mui/x-data-grid'
import {
  Box,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material'

import DataTable from 'src/components/data_table.component'
import { useBreakpointValue } from 'src/hooks/currentbreakpoint'
import useConfigStore from 'src/stores/config.store'
import { useStatus } from 'src/providers/status.provider'
import useWorkspaceStore from 'src/stores/workspace.store'
import SmallTableComponent from 'src/components/small_table.component'
import WorkspaceStageForm from './form'

function WorkspacesStagesConfig({ breakpoint = 3 }) {
  const [rows, setRows] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const { t: _ } = useLingui()

  const { stages, setStages } = useConfigStore()
  const { workspace } = useWorkspaceStore()
  const { showStatus, showError } = useStatus()

  const breakpointValue = useBreakpointValue()

  const columns = useMemo(
    () => [
      {
        field: 'label',
        headerName: _`Name`,
        width: 300,
        editable: true,
        breakpoint: 1,
      },
      {
        field: 'key',
        headerName: _`Key`,
        width: 180,
        align: 'left',
        headerAlign: 'left',
        editable: false,
        breakpoint: 0,
      },
    ],
    [_]
  )

  useEffect(() => {
    if (Array.isArray(stages)) {
      setRows(stages)
    }
  }, [stages])

  const handleAdd = useCallback(
    ({ id, label }) => {
      setStages(workspace, [...rows, { id, label }])
        .then(() => {
          showStatus({
            slug: 'tasks-stages',
            title: _`Stage created!`,
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-stages-error',
            title: _`Error creating stage`,
            description: error,
          })
          console.error(error)
        })
    },
    [rows, setStages, workspace, showStatus, showError, _]
  )

  const handleUpdate = useCallback(
    ({ id, label }) => {
      setStages(workspace, [
        ...rows.filter((row) => row.id !== id),
        { id, label },
      ])
        .then(() => {
          showStatus({
            slug: 'tasks-stages',
            title: _`Stage updated!`,
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-stages-error',
            title: _`Error updating stage`,
            description: error,
          })
          console.error(error)
        })
    },
    [rows, setStages, workspace, showStatus, showError, _]
  )

  const handleDelete = useCallback(
    (id) => {
      setStages(
        workspace,
        rows.filter((row) => row.id !== id)
      )
        .then(() => {
          showStatus({
            slug: 'tasks-stages',
            title: _`Stage deleted!`,
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-stages-error',
            title: _`Error deleting stage`,
            description: error,
          })
          console.error(error)
        })
    },
    [rows, setStages, workspace, showStatus, showError, _]
  )

  const handleSelect = useCallback(
    (id) => {
      setEditId(id)
      setShowForm(true)
    },
    [setEditId, setShowForm]
  )

  const handleCreate = useCallback(() => {
    setEditId(null)
    setShowForm(true)
  }, [setEditId, setShowForm])

  const handleReset = useCallback(() => {
    setEditId(null)
    setShowForm(false)
  }, [setEditId, setShowForm])

  const handleSubmit = useCallback(
    async ({ label }) => {
      if (editId) {
        await handleUpdate({ id: editId, label })
      } else {
        await handleAdd({ label })
      }
      setEditId(null)
      setShowForm(false)
    },
    [editId, handleAdd, handleUpdate]
  )

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">
          <Trans>Stages used in tasks</Trans>
        </Typography>
      </DialogTitle>
      {breakpointValue < breakpoint ? (
        <SmallTableComponent
          columns={columns}
          rows={rows}
          onCreate={handleCreate}
          onSelection={handleSelect}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
      <WorkspaceStageForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onReset={handleReset}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        editId={editId}
      />
    </Box>
  )
}

export default WorkspacesStagesConfig
