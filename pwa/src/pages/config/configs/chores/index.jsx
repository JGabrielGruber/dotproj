import { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import {
  Box, DialogContent, DialogContentText,
  DialogTitle, Grid, Typography
} from '@mui/material'

import DataTable from 'src/components/data_table.component'
import DetailModal from 'src/pages/home/detail'
import useChoreStore from 'src/stores/chore.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import { useStatus } from 'src/providers/status.provider'
import ChoreForm from './form'

function ChoresConfig() {
  const [rows, setRows] = useState([])

  const { chore, chores, fetchChores, setChore } = useChoreStore()
  const { workspace } = useWorkspaceStore()

  const { showStatus } = useStatus()

  useEffect(() => {
    if (workspace) {
      fetchChores(workspace)
        .then(() => {
          showStatus({ slug: "fetch-chore", title: "Sucesso ao carregar afazeres" });
        })
        .catch((error) => {
          console.error(error);
          showStatus({
            slug: "fetch-chore-error",
            title: "Error ao buscar afazeres",
            description: error,
            type: 'error',
            timeout: 15,
          });
        });
    }
  }, [workspace, fetchChores, showStatus]);

  useEffect(() => {
    if (Array.isArray(chores)) {
      setRows(chores)
    }
  }, [chores])

  const handleSelectionChange = (id) => {
    setChore(id)
  }

  const handleCloseModal = () => {
    setChore(null)
  }

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Afazeres repetitivos</Typography>
      </DialogTitle>
      <ChoreForm open={chore} onClose={handleCloseModal} />
      <DataTable
        columns={[
          { field: 'title', headerName: 'Título', width: 150, editable: true, },
          { field: 'description', headerName: 'Descrição', width: 300, editable: true },
          { field: 'recurrence', headerName: 'Recorrência', width: 100, editable: true },
          { field: 'category_key', headerName: 'Categoria', width: 100, editable: true },
          { field: 'created_at', headerName: 'Criado', width: 200, editable: false, type: 'dateTime', valueGetter: (value) => new Date(value) },
          { field: 'updated_at', headerName: 'Atualizado', width: 200, editable: false, type: 'dateTime', valueGetter: (value) => new Date(value) },
        ]}
        rows={rows}
        onSelection={handleSelectionChange}
      />
    </Box>
  )
}

export default ChoresConfig
