import { useState, useEffect } from 'react'
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

function TasksConfig() {
  const [rows, setRows] = useState([])

  const { stages, categories } = useConfigStore()
  const { task, tasks, setTask } = useTaskStore()

  useEffect(() => {
    if (Array.isArray(tasks)) {
      setRows(tasks)
    }
  }, [tasks])

  const handleSelectionChange = (id) => {
    setTask(id)
  }

  const handleCloseModal = () => {
    setTask(null)
  }

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Tarefas a serem feitas</Typography>
      </DialogTitle>
      <DetailModal open={task} onClose={handleCloseModal} />
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
      />
    </Box>
  )
}

export default TasksConfig
