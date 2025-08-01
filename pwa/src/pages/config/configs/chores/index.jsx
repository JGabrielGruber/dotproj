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
import DetailModal from 'src/pages/home/detail'
import useChoreStore from 'src/stores/chore.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import { useStatus } from 'src/providers/status.provider'
import ChoreWizard from 'src/wizards/chore'
import ChoreForm from './form'
import { useCurrentBreakpoint } from 'src/hooks/currentbreakpoint'

const columnsVisibility = {
  xs: {
    title: true,
    description: false,
    recurrence: false,
    category_key: false,
    created_at: false,
    updated_at: false,
    actions: true,
  },
  sm: {
    title: true,
    description: false,
    recurrence: false,
    category_key: true,
    created_at: false,
    updated_at: false,
    actions: true,
  },
  md: {
    title: true,
    description: false,
    recurrence: true,
    category_key: true,
    created_at: false,
    updated_at: true,
    actions: true,
  },
  lg: {
    title: true,
    description: true,
    recurrence: true,
    category_key: true,
    created_at: false,
    updated_at: true,
    actions: true,
  },
  xl: {
    title: true,
    description: true,
    recurrence: true,
    category_key: true,
    created_at: true,
    updated_at: true,
    actions: true,
  },
}

function ChoresConfig() {
  const [rows, setRows] = useState([])
  const [showWizard, setShowWizard] = useState(false)

  const { chore, chores, fetchChores, setChore } = useChoreStore()
  const { workspace } = useWorkspaceStore()

  const { showStatus, showError } = useStatus()

  const currentBreakpoint = useCurrentBreakpoint()
  const columnVisibilityModel = useMemo(
    () => columnsVisibility[currentBreakpoint],
    [currentBreakpoint]
  )

  useEffect(() => {
    if (workspace) {
      fetchChores(workspace)
        .then(() => {
          showStatus({
            slug: 'fetch-chore',
            title: 'Sucesso ao carregar afazeres',
          })
        })
        .catch((error) => {
          console.error(error)
          showError({
            slug: 'fetch-chore-error',
            title: 'Error ao buscar afazeres',
            description: error,
          })
        })
    }
  }, [workspace, fetchChores, showStatus, showError])

  useEffect(() => {
    if (Array.isArray(chores)) {
      setRows(chores)
    }
  }, [chores])

  const handleSelectionChange = (id) => {
    setChore(id)
    setShowWizard(true)
  }

  const handleCreate = () => {
    setChore(null)
    setShowWizard(true)
  }

  const handleCloseModal = () => {
    setChore(null)
  }

  const handleCloseWizard = () => {
    setShowWizard(false)
  }

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Afazeres recorrentes</Typography>
      </DialogTitle>
      <ChoreForm onClose={handleCloseModal} onReset={handleCloseModal} />
      <ChoreWizard open={showWizard} onClose={handleCloseWizard} />
      <DataTable
        columns={[
          { field: 'title', headerName: 'Título', width: 150, editable: true },
          {
            field: 'description',
            headerName: 'Descrição',
            width: 300,
            editable: true,
          },
          {
            field: 'recurrence',
            headerName: 'Recorrência',
            width: 100,
            editable: true,
          },
          {
            field: 'category_key',
            headerName: 'Categoria',
            width: 100,
            editable: true,
          },
          {
            field: 'created_at',
            headerName: 'Criado',
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
        onCreate={handleCreate}
        onSelection={handleSelectionChange}
        columnVisibilityModel={columnVisibilityModel}
      />
    </Box>
  )
}

export default ChoresConfig
