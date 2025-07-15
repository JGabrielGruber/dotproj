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
import useTaskStore from 'src/stores/task.store'
import useConfigStore from 'src/stores/config.store'
import { useBreakpointValue, useCurrentBreakpoint } from 'src/hooks/currentbreakpoint'
import SmallTableComponent from 'src/components/small_table.component'
import { useCallback } from 'react'


const columnsVisibility = {
  xs: {
    title: true,
    description: false,
    stage_key: false,
    category_key: false,
    owner: false,
    created_at: false,
    updated_at: false,
    actions: true,
  },
  sm: {
    title: true,
    description: false,
    stage_key: true,
    category_key: true,
    owner: false,
    created_at: false,
    updated_at: false,
  },
  md: {
    title: true,
    description: false,
    stage_key: true,
    category_key: true,
    owner: false,
    created_at: false,
    updated_at: true,
  },
  lg: {
    title: true,
    description: true,
    stage_key: true,
    category_key: true,
    owner: false,
    created_at: false,
    updated_at: true,
  },
  xl: {
    title: true,
    description: true,
    stage_key: true,
    category_key: true,
    owner: true,
    created_at: true,
    updated_at: true,
  },
}

function TasksConfig() {
  const [rows, setRows] = useState([])

  const { stages, categories } = useConfigStore()
  const { task, tasks, setTask } = useTaskStore()

  const breakpointValue = useBreakpointValue()
  const currentBreakpoint = useCurrentBreakpoint()
  const columnVisibilityModel = useMemo(
    () => columnsVisibility[currentBreakpoint],
    [currentBreakpoint]
  )

  const columns = useMemo(() => [
    { field: 'title', headerName: 'Título', width: 150, editable: true, breakpoint: 0, grow: 1 },
    {
      field: 'description',
      headerName: 'Descrição',
      width: 200,
      editable: true,
    },
    {
      field: 'stage_key',
      headerName: 'Etapa',
      width: 100,
      type: 'singleSelect',
      valueOptions: stages,
      getOptionLabel: (value) => {
        return value.label
      },
      getOptionValue: (value) => {
        return value.key
      },
    },
    {
      field: 'category_key',
      headerName: 'Categoria',
      width: 100,
      type: 'singleSelect',
      valueOptions: categories,
      getOptionLabel: (value) => {
        return value.label
      },
      getOptionValue: (value) => {
        return value.key
      },
    },
    {
      field: 'owner',
      headerName: 'Responsável',
      width: 150,
      editable: false,
      valueGetter: (value) => value?.name || '',
    },
    {
      field: 'created_at',
      headerName: 'Criado',
      width: 150,
      editable: false,
      type: 'dateTime',
      valueGetter: (value) => new Date(value),
    },
    {
      field: 'updated_at',
      headerName: 'Atualizado',
      width: 150,
      editable: false,
      type: 'dateTime',
      valueGetter: (value) => new Date(value),
    },
  ], [stages, categories])

  useEffect(() => {
    if (Array.isArray(tasks)) {
      setRows(tasks)
    }
  }, [tasks])

  const handleSelectionChange = useCallback((id) => {
    setTask(id)
  }, [setTask])

  const handleCloseModal = useCallback(() => {
    setTask(null)
  }, [setTask])

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Tarefas a serem feitas</Typography>
      </DialogTitle>
      <DetailModal open={task} onClose={handleCloseModal} />
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

export default TasksConfig
