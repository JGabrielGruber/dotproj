import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid'
import { Box, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from "@mui/material"

import DataTable from 'src/components/data_table.component';
import useConfigStore from 'src/stores/config.store';
import { useStatus } from 'src/providers/status.provider';
import useWorkspaceStore from 'src/stores/workspace.store';

function TasksCategoriesConfig() {
  const [rows, setRows] = useState([])

  const { categories, setCategories } = useConfigStore()
  const { workspace } = useWorkspaceStore()
  const { showStatus, showError } = useStatus()

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
        showStatus({ slug: 'tasks-categories', title: 'Categoria criada!', type: 'success' })
      })
      .catch((error) => {
        showError({ slug: 'tasks-categories-error', title: 'Falha ao criar Categoria', description: error })
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
      />
    </Box>
  )
}

export default TasksCategoriesConfig
