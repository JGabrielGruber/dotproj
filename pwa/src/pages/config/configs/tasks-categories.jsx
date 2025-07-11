import { useState, useEffect, useMemo } from 'react'
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
import { useCurrentBreakpoint } from 'src/hooks/currentbreakpoint'

const columnsVisibility = {
  xs: {
    emoji: true,
    label: false,
    key: false,
    actions: true,
  },
  sm: {
    emoji: true,
    label: false,
    key: false,
    actions: true,
  },
  md: {
    emoji: true,
    label: true,
    key: true,
    actions: true,
  },
  lg: {
    emoji: true,
    label: true,
    key: true,
    actions: true,
  },
  xl: {
    emoji: true,
    label: true,
    key: true,
    actions: true,
  },
}

function TasksCategoriesConfig() {
  const [rows, setRows] = useState([])

  const { categories, setCategories } = useConfigStore()
  const { workspace } = useWorkspaceStore()
  const { showStatus, showError } = useStatus()

  const currentBreakpoint = useCurrentBreakpoint()
  const columnVisibilityModel = useMemo(
    () => columnsVisibility[currentBreakpoint],
    [currentBreakpoint]
  )

  useEffect(() => {
    if (Array.isArray(categories)) {
      setRows(categories)
    }
  }, [categories])

  const columns = [
    { field: 'emoji', headerName: 'Emoji', width: 100, editable: true },
    { field: 'label', headerName: 'Nome', width: 300, editable: true },
    {
      field: 'key',
      headerName: 'Chave',
      width: 180,
      align: 'left',
      headerAlign: 'left',
      editable: false,
    },
  ]

  const handleAdd = ({ id, emoji, label }) => {
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
  }

  const handleUpdate = ({ id, emoji, label }) => {
    setRows((rows) => [...rows, { id, emoji, label }])
  }

  const handleDelete = ({ id, emoji, label }) => {
    setRows((rows) => [...rows, { id, emoji, label }])
  }

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Categorias exibidas nas tarefas</Typography>
      </DialogTitle>
      <DataTable
        columns={columns}
        rows={rows}
        onAdd={handleAdd}
        onUpdate={(value) => console.log('UPDATE', value)}
        onDelete={(value) => console.log('DELETE', value)}
        columnVisibilityModel={columnVisibilityModel}
      />
    </Box>
  )
}

export default TasksCategoriesConfig
