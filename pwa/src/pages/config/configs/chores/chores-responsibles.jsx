import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid'
import { Box, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from "@mui/material"

import DataTable from 'src/components/data_table.component';
import { useStatus } from 'src/providers/status.provider';
import useChoreStore from 'src/stores/chore.store';
import useConfigStore from 'src/stores/config.store';
import useWorkspaceStore from 'src/stores/workspace.store';

function ChoresResponsiblesConfig() {
  const [rows, setRows] = useState([])

  const { chore, addResponsible } = useChoreStore()
  const { members } = useConfigStore()
  const { workspace } = useWorkspaceStore()

  const { showStatus, showError } = useStatus()

  useEffect(() => {
    if (chore && Array.isArray(chore.responsibles)) {
      setRows(chore.responsibles)
    }
  }, [chore])

  const handleAdd = ({ user }) => {
    addResponsible(workspace, chore.id, { user })
      .then(() => {
        showStatus({ slug: 'chores-responsibles', title: 'Responsável adicionado!', type: 'success' })
      })
      .catch((error) => {
        showError({ slug: 'chores-responsibles-error', title: 'Falha ao adicionar Responsável', description: error })
        console.error(error)
      })
  }

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Responsáveis atribuídos</Typography>
      </DialogTitle>
      <DataTable
        columns={[
          {
            field: 'user',
            headerName: 'Membro',
            width: 300,
            editable: true,
            type: 'singleSelect',
            valueOptions: members,
            valueGetter: (value) => {
              return value?.id
            },
            getOptionLabel: (value) => {
              return value.name
            },
            getOptionValue: (value) => {
              return value.user
            },
          },
        ]}
        rows={rows}
        onAdd={handleAdd}
        onUpdate={console.log}
        onDelete={console.log}
      />
    </Box>
  )
}

export default ChoresResponsiblesConfig
