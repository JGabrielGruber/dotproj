import { useState, useEffect, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Trans, useLingui } from '@lingui/react/macro'
import { msg } from '@lingui/core/macro'
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

function WorkspacesCategoriesConfig({ breakpoint = 3 }) {
  const [rows, setRows] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const { t: _ } = useLingui()

  const { categories, setCategories } = useConfigStore()
  const { workspace } = useWorkspaceStore()
  const { showStatus, showError } = useStatus()

  const breakpointValue = useBreakpointValue()

  const columns = useMemo(() => [
    {
      field: 'emoji',
      headerName: _`Emoji`,
      width: 100,
      editable: true,
      breakpoint: 0,
    },
    {
      field: 'label',
      headerName: _`Name`,
      width: 300,
      editable: true,
      breakpoint: 2,
      grow: 1,
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
  ], [_])

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
            title: _`Category created!`,
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-categories-error',
            title: _`Error creating category`,
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
            title: _`Category updated!`,
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-categories-error',
            title: _`Error updating category`,
            description: error,
          })
          console.error(error)
        })
    },
    [workspace, rows, setCategories, showStatus, showError, _]
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
            title: _`Category deleted!`,
            type: 'success',
          })
        })
        .catch((error) => {
          showError({
            slug: 'tasks-categories-error',
            title: _`Error deleting category`,
            description: error,
          })
          console.error(error)
        })
    },
    [workspace, rows, setCategories, showStatus, showError, _]
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
        <Typography variant="body1"><Trans>Categories used in tasks</Trans></Typography>
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
