import { useState, useEffect, useMemo } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import {
  Box,
  Chip,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material'

import DataTable from 'src/components/data_table.component'
import DetailModal from 'src/pages/home/detail'
import useassignmentstore from 'src/stores/assigned.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import { useStatus } from 'src/providers/status.provider'
import AssignedForm from './form'
import { useCurrentBreakpoint } from 'src/hooks/currentbreakpoint'

const columnsVisibility = {
  xs: {
    chore: true,
    user: false,
    status: false,
    assigned_at: false,
    updated_at: false,
    actions: true,
  },
  sm: {
    chore: true,
    user: false,
    status: false,
    assigned_at: false,
    updated_at: false,
    actions: true,
  },
  md: {
    chore: true,
    user: true,
    status: true,
    assigned_at: false,
    updated_at: false,
    actions: true,
  },
  lg: {
    chore: true,
    user: true,
    status: true,
    assigned_at: true,
    updated_at: false,
    actions: true,
  },
  xl: {
    chore: true,
    user: true,
    status: true,
    assigned_at: true,
    updated_at: true,
    actions: true,
  },
}

function AssignmentsConfig() {
  const [rows, setRows] = useState([])

  const { assigned, assignments, fetchAssignments, setAssigned } =
    useassignmentstore()
  const { workspace } = useWorkspaceStore()

  const { showStatus, showError } = useStatus()

  const currentBreakpoint = useCurrentBreakpoint()
  const columnVisibilityModel = useMemo(
    () => columnsVisibility[currentBreakpoint],
    [currentBreakpoint]
  )

  useEffect(() => {
    if (workspace) {
      fetchAssignments(workspace)
        .then(() => {
          showStatus({
            slug: 'fetch-assigned',
            title: 'Sucesso ao carregar atribuições',
          })
        })
        .catch((error) => {
          console.error(error)
          showError({
            slug: 'fetch-assigned-error',
            title: 'Error ao buscar atribuições',
            description: error,
          })
        })
    }
  }, [workspace, fetchAssignments, showStatus, showError])

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
        <Chip color="error" label="WIP" />
        <Typography variant="body1">
          Atribuições de afazeres a membros responsáveis
        </Typography>
      </DialogTitle>
      <AssignedForm open={assigned} onClose={handleCloseModal} />
      <DataTable
        columns={[
          {
            field: 'chore',
            headerName: 'Afazer',
            width: 150,
            editable: false,
            valueGetter: (value) => value.title,
          },
          { field: 'user', headerName: 'Membro', width: 150, editable: true },
          { field: 'status', headerName: 'Status', width: 300, editable: true },
          {
            field: 'assigned_at',
            headerName: 'Atribuído',
            width: 200,
            editable: false,
            type: 'dateTime',
            valueGetter: (value) => new Date(value),
          },
          {
            field: 'updated_at',
            headerName: 'Atualizado',
            width: 200,
            editable: false,
            type: 'dateTime',
            valueGetter: (value) => new Date(value),
          },
        ]}
        rows={rows}
        onSelection={handleSelectionChange}
        columnVisibilityModel={columnVisibilityModel}
      />
    </Box>
  )
}

export default AssignmentsConfig
