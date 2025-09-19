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
import useFormStore from 'src/stores/form.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import { useStatus } from 'src/providers/status.provider'
import { useCurrentBreakpoint } from 'src/hooks/currentbreakpoint'
import FormWizard from 'src/wizards/form'

const columnsVisibility = {
  xs: {
    title: true,
    description: false,
    category_key: false,
    created_at: false,
    updated_at: false,
    actions: true,
  },
  sm: {
    title: true,
    description: false,
    category_key: true,
    created_at: false,
    updated_at: false,
    actions: true,
  },
  md: {
    title: true,
    description: false,
    category_key: true,
    created_at: false,
    updated_at: true,
    actions: true,
  },
  lg: {
    title: true,
    description: true,
    category_key: true,
    created_at: false,
    updated_at: true,
    actions: true,
  },
  xl: {
    title: true,
    description: true,
    category_key: true,
    created_at: true,
    updated_at: true,
    actions: true,
  },
}

function FormsConfig() {
  const [rows, setRows] = useState([])
  const [showWizard, setShowWizard] = useState(false)

  const { forms, fetchForms, setForm } = useFormStore()
  const { workspace } = useWorkspaceStore()

  const { showStatus, showError } = useStatus()

  const currentBreakpoint = useCurrentBreakpoint()
  const columnVisibilityModel = useMemo(
    () => columnsVisibility[currentBreakpoint],
    [currentBreakpoint]
  )

  useEffect(() => {
    if (workspace) {
      fetchForms(workspace)
        .then(() => {
          showStatus({
            slug: 'fetch-form',
            title: 'Sucesso ao carregar formulários',
          })
        })
        .catch((error) => {
          console.error(error)
          showError({
            slug: 'fetch-form-error',
            title: 'Error ao buscar formulários',
            description: error,
          })
        })
    }
  }, [workspace, fetchForms, showStatus, showError])

  useEffect(() => {
    if (Array.isArray(forms)) {
      setRows(forms)
    }
  }, [forms])

  const handleSelectionChange = (id) => {
    setForm(id)
    setShowWizard(true)
  }

  const handleCreate = () => {
    setForm(null)
    setShowWizard(true)
  }

  const handleCloseWizard = () => {
    setShowWizard(false)
  }

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Formulários</Typography>
      </DialogTitle>
      <FormWizard open={showWizard} onClose={handleCloseWizard} />
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

export default FormsConfig
