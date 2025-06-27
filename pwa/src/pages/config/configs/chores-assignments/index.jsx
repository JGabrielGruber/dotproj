import { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import {
  Box, DialogContent, DialogContentText,
  DialogTitle, Grid, Typography
} from '@mui/material'

import DataTable from 'src/components/data_table.component'
import DetailModal from 'src/pages/home/detail'
import useassignmentstore from 'src/stores/assigned.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import { useStatus } from 'src/providers/status.provider'
import AssignedForm from './form'

function AssignmentsConfig() {
  const [rows, setRows] = useState([])

  const { assigned, assignments, fetchAssignments, setAssigned } = useassignmentstore()
  const { workspace } = useWorkspaceStore()

  const { showStatus } = useStatus()

  useEffect(() => {
    if (workspace) {
      fetchAssignments(workspace)
        .then(() => {
          showStatus({ slug: "fetch-assigned", title: "Sucesso ao carregar afazeres" });
        })
        .catch((error) => {
          console.error(error);
          showStatus({
            slug: "fetch-assigned-error",
            title: "Error ao buscar afazeres",
            description: error,
            type: 'error',
            timeout: 15,
          });
        });
    }
  }, [workspace, fetchAssignments, showStatus]);

  useEffect(() => {
    if (Array.isArray(assignments)) {
      setRows(assignments)
    }
  }, [assignments])

  const handleSelectionChange = (id) => {
    setAssigned(id)
  }

  const handleCloseModal = () => {
    setAssigned(null)
  }

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Atribuições de afazeres a membros responsáveis</Typography>
      </DialogTitle>
      <AssignedForm open={assigned} onClose={handleCloseModal} />
      <DataTable
        columns={[
          { field: 'chore', headerName: 'Afazer', width: 150, editable: false, valueGetter: (value) => value.title },
          { field: 'user', headerName: 'Membro', width: 150, editable: true, },
          { field: 'status', headerName: 'Status', width: 300, editable: true, },
          { field: 'assigned_at', headerName: 'Atribuído', width: 200, editable: false, type: 'dateTime', valueGetter: (value) => new Date(value) },
          { field: 'updated_at', headerName: 'Atualizado', width: 200, editable: false, type: 'dateTime', valueGetter: (value) => new Date(value) },
        ]}
        rows={rows}
        onSelection={handleSelectionChange}
      />
    </Box>
  )
}

export default AssignmentsConfig
