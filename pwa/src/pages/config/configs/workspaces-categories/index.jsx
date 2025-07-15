import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
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
import useConfigStore from 'src/stores/config.store'
import { useStatus } from 'src/providers/status.provider'
import useWorkspaceStore from 'src/stores/workspace.store'
import { useBreakpointValue } from 'src/hooks/currentbreakpoint'
import SmallTableComponent from 'src/components/small_table.component'
import WorkspaceCategoryForm from './form'

const columns = [
  {
    field: 'emoji',
    headerName: 'Emoji',
    width: 100,
    editable: true,
    breakpoint: 0,
  },
  {
    field: 'label',
    headerName: 'Nome',
    width: 300,
    editable: true,
    breakpoint: 2,
    grow: 1,
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

function WorkspacesCategoriesConfig({ breakpoint = 3 }) {

  const [rows, setRows] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const { categories, setCategories } = useConfigStore()
  const { workspace } = useWorkspaceStore()
  const { showStatus, showError } = useStatus()

  const breakpointValue = useBreakpointValue()

  useEffect(() => {
    if (Array.isArray(categories)) {
      setRows(categories)
    }
  }, [categories])

  const handleAdd = useCallback(
    ({ id = uuidv4(), emoji, label }) => {
      setCategories(workspace, [...rows, { id, emoji, label }])
        .then(() => {
          showStatus({
            slug: 'tasks-categories',
            title: 'Categoria criada!',
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-categories-error',
            title: 'Falha ao criar Categoria',
            description: error,
          })
          console.error(error)
        })
    },
    [workspace, rows, setCategories, showStatus, showError]
  )

  const handleUpdate = useCallback(
    ({ id, emoji, label }) => {
      setCategories(workspace, [
        ...rows.filter((row) => row.id !== id),
        { id, emoji, label },
      ])
        .then(() => {
          showStatus({
            slug: 'tasks-categories',
            title: 'Categoria atualizada!',
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-categories-error',
            title: 'Falha ao atualizar Categoria',
            description: error,
          })
          console.error(error)
        })
    },
    [workspace, rows, setCategories, showStatus, showError]
  )

  const handleDelete = useCallback(
    (id) => {
      setCategories(
        workspace,
        rows.filter((row) => row.id !== id)
      )
        .then(() => {
          showStatus({
            slug: 'tasks-categories',
            title: 'Categoria excluída!',
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-categories-error',
            title: 'Falha ao excluir Categoria',
            description: error,
          })
          console.error(error)
        })
    },
    [workspace, rows, setCategories, showStatus, showError]
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
    async ({ emoji, label }) => {
      if (editId) {
        await handleUpdate({ id: editId, emoji, label })
      } else {
        await handleAdd({ emoji, label })
      }
      setEditId(null)
      setShowForm(false)
    },
    [editId, handleAdd, handleUpdate, setEditId, setShowForm]
  )

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Categorias exibidas nas tarefas</Typography>
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
      <WorkspaceCategoryForm
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

export default WorkspacesCategoriesConfig
