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
import useFileStore from 'src/stores/file.store'
import { API_URL } from 'src/utils/django'
import { useBreakpointValue, useCurrentBreakpoint } from 'src/hooks/currentbreakpoint'
import SmallTableComponent from 'src/components/small_table.component'

const columnsVisibility = {
  xs: {
    file_name: true,
    content_type: false,
    task_title: false,
    task_category_key: false,
    comment_content: false,
    owner: false,
    workspace: false,
    created_at: false,
    actions: true,
  },
  sm: {
    file_name: true,
    content_type: true,
    task_title: false,
    task_category_key: false,
    comment_content: false,
    owner: false,
    workspace: false,
    created_at: false,
    actions: true,
  },
  md: {
    file_name: true,
    content_type: true,
    task_title: false,
    task_category_key: true,
    comment_content: false,
    owner: false,
    workspace: false,
    created_at: false,
    actions: true,
  },
  lg: {
    file_name: true,
    content_type: true,
    task_title: true,
    task_category_key: true,
    comment_content: true,
    owner: true,
    workspace: false,
    created_at: false,
    actions: true,
  },
  xl: {
    file_name: true,
    content_type: true,
    task_title: true,
    task_category_key: true,
    comment_content: true,
    owner: true,
    workspace: false,
    created_at: true,
    actions: true,
  },
}

function TasksFilesConfig() {
  const [rows, setRows] = useState([])

  const { categories } = useConfigStore()
  const { taskFiles, fetchTaskFiles } = useFileStore()
  const { workspace } = useWorkspaceStore()
  const { showStatus, showError } = useStatus()

  const breakpointValue = useBreakpointValue()
  const currentBreakpoint = useCurrentBreakpoint()
  const columnVisibilityModel = useMemo(
    () => columnsVisibility[currentBreakpoint],
    [currentBreakpoint]
  )

  useEffect(() => {
    if (workspace) {
      fetchTaskFiles(workspace)
        .then(() => {
          showStatus({
            slug: 'fetch-taskfile',
            title: 'Sucesso ao carregar arquivos',
          })
        })
        .catch((error) => {
          console.error(error)
          showError({
            slug: 'fetch-taskfile-error',
            title: 'Error ao buscar arquivos',
            description: error,
          })
        })
    }
  }, [workspace, fetchTaskFiles, showStatus, showError])

  useEffect(() => {
    if (Array.isArray(taskFiles)) {
      setRows(taskFiles)
    }
  }, [taskFiles])

  const columns = useMemo(() => [
    {
      field: 'file_name',
      headerName: 'Nome do Arquivo',
      width: 200,
      editable: false,
      breakpoint: 0,
      grow: 1,
    },
    {
      field: 'content_type',
      headerName: 'Tipo de Arquivo',
      width: 150,
      editable: false,
    },
    {
      field: 'task_title',
      headerName: 'Título da Tarefa',
      width: 150,
      editable: false,
    },
    {
      field: 'task_category_key',
      headerName: 'Categoria',
      width: 100,
      type: 'singleSelect',
      valueOptions: categories,
      getOptionLabel: (value) => value.label || '',
      getOptionValue: (value) => value.key || '',
      editable: false,
    },
    {
      field: 'comment_content',
      headerName: 'Comentário',
      width: 200,
      editable: false,
    },
    { field: 'owner', headerName: 'Responsável', width: 150, editable: false },
    {
      field: 'workspace',
      headerName: 'Workspace',
      width: 150,
      editable: false,
    },
    {
      field: 'created_at',
      headerName: 'Criado',
      width: 150,
      type: 'dateTime',
      valueGetter: (value) => new Date(value),
      editable: false,
    },
  ], [categories])

  const handleSelectionChange = (id) => {
    const file = rows.find((file) => file.id === id)
    const fileUrl = `${API_URL}/api/tasks/${file.task}/files/${file.id}/${file.file_name}`
    window.open(fileUrl, '_blank')
  }

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Etapas exibidas nas tarefas</Typography>
      </DialogTitle>
      {breakpointValue < 3 ? (
        <SmallTableComponent
          columns={columns}
          rows={rows}
          onSelection={handleSelectionChange}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          onSelection={handleSelectionChange}
          columnVisibilityModel={columnVisibilityModel}
        />
      )}
    </Box>
  )
}

export default TasksFilesConfig
