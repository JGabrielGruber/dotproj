import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid'
import { Box, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from "@mui/material"

import DataTable from 'src/components/data_table.component';
import { useStatus } from 'src/providers/status.provider';
import useWorkspaceStore from 'src/stores/workspace.store';
import useChoreStore from 'src/stores/chore.store';

function ChoresResponsiblesConfig() {
  const [rows, setRows] = useState([])

  const { chore } = useChoreStore()

  useEffect(() => {
    if (chore && Array.isArray(chore.responsibles)) {
      setRows(chore.responsibles)
    }
  }, [chore])

  const columns = [
    { field: 'user', headerName: 'Membro', width: 300, editable: true },
  ]

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Responsáveis atribuídos</Typography>
      </DialogTitle>
      <DataTable
        columns={columns}
        rows={rows}
      />
    </Box>
  )
}

export default ChoresResponsiblesConfig
