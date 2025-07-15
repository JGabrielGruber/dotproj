import { useState, useEffect, useCallback } from 'react'
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

const columns = [
  {
    field: 'label',
    headerName: 'Nome',
    width: 300,
    editable: true,
    breakpoint: 1,
  },
  {
    field: 'key',
    headerName: 'Chave',
    width: 180,
    align: 'left',
    headerAlign: 'left',
    editable: false,
    breakpoint: 0,
  },
]

function WorkspacesStagesConfig() {
  const [rows, setRows] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const { stages, setStages } = useConfigStore()
  const { workspace } = useWorkspaceStore()
  const { showStatus, showError } = useStatus()

  const breakpointValue = useBreakpointValue()

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
            title: 'Etapa criada!',
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-stages-error',
            title: 'Falha ao criar Etapa',
            description: error,
          })
          console.error(error)
        })
    },
    [rows, setStages, workspace, showStatus, showError]
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
            title: 'Etapa atualizada!',
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-stages-error',
            title: 'Falha ao atualizar Etapa',
            description: error,
          })
          console.error(error)
        })
    },
    [rows, setStages, workspace, showStatus, showError]
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
            title: 'Etapa excluída!',
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-stages-error',
            title: 'Falha ao excluir Etapa',
            description: error,
          })
          console.error(error)
        })
    },
    [rows, setStages, workspace, showStatus, showError]
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
        <Typography variant="body1">Etapas exibidas nas tarefas</Typography>
      </DialogTitle>
      {breakpointValue < 3 ? (
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
