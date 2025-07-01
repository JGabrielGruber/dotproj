import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid'
import { Box, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from "@mui/material"

import DataTable from 'src/components/data_table.component';
import useConfigStore from 'src/stores/config.store';
import { useStatus } from 'src/providers/status.provider';
import useWorkspaceStore from 'src/stores/workspace.store';

function TasksStagesConfig() {
  const [rows, setRows] = useState([])

  const { stages, setStages } = useConfigStore()
  const { workspace } = useWorkspaceStore()
  const { showStatus, showError } = useStatus()

  useEffect(() => {
    if (Array.isArray(stages)) {
      setRows(stages)
    }
  }, [stages])

  const columns = [
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

  const handleAdd = ({ id, label }) => {
    setStages(workspace, [...rows, { id, label }])
      .then(() => {
        showStatus({ slug: 'tasks-stages', title: 'Etapa criada!', type: 'success' })
      })
      .catch((error) => {
        showError({ slug: 'tasks-stages-error', title: 'Falha ao criar Etapa', description: error })
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
        <Typography variant="body1">Etapas exibidas nas tarefas</Typography>
      </DialogTitle>
      <DataTable
        columns={columns}
        rows={rows}
        onAdd={handleAdd}
        onUpdate={console.log}
        onDelete={console.log}
      />
    </Box>
  )
}

export default TasksStagesConfig
