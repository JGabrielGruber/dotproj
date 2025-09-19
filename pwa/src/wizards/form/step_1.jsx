import { useEffect, useMemo, useState } from 'react'
import { Autocomplete, Box, FormControl, Grid, TextField } from '@mui/material'

import DataTableComponent from 'src/components/data_table.component'
import useFormStore from 'src/stores/form.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import { DataGrid } from '@mui/x-data-grid'

const types = [
  { value: 'string', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'datetime', label: 'Data Hora' },
  { value: 'boolean', label: 'Booleano' },
  { value: 'simpleSelect', label: 'Seleção Simples' },
  { value: 'file', label: 'Arquivo' },
]

const columns = [
  {
    field: 'id',
    type: 'string',
    headerName: 'Identificador',
    width: 150,
    editable: false,
  },
  {
    field: 'label',
    type: 'string',
    headerName: 'Nome do campo',
    width: 150,
    editable: true,
  },
  {
    field: 'type',
    type: 'singleSelect',
    headerName: 'Tipo do valor',
    width: 150,
    editable: true,
    valueOptions: types,
    valueGetter: (value) => value || 'string',
  },
  {
    field: 'extra',
    type: 'string',
    headerName: 'Opções',
    width: 300,
    editable: true,
    renderCell: (params) => {
      const { row } = params
      switch (row.type) {
        case 'simpleSelect':
          return row.options?.join(', ') || ''
        default:
          return null
      }
    },
    renderEditCell: ({ row, api }) => {
      switch (row.type) {
        case 'simpleSelect':
          return (
            <Autocomplete
              multiple
              freeSolo
              options={row.options || []}
              value={row.options || []}
              onChange={(event, newValue) => {
                event.preventDefault()
                api.updateRows([{ ...row, options: newValue }])
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  placeholder="Opções"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      const newOption = e.target.value
                      api.updateRows([
                        {
                          ...row,
                          options: [...(row.options || []), newOption],
                        },
                      ])
                      e.target.value = ''
                    }
                  }}
                />
              )}
              fullWidth
            />
          )
        default:
          return null
      }
    },
  },
  {
    field: 'required',
    type: 'boolean',
    headerName: 'É obrigatório?',
    width: 150,
    editable: true,
    valueGetter: (value) => value || false,
  },
]

function StepFields({ onSubmit, onError }) {
  const [fields, setFields] = useState({})

  const { form, updateForm, setForm } = useFormStore()
  const { workspace } = useWorkspaceStore()

  const rows = useMemo(() => Object.values(fields), [fields])

  useEffect(() => {
    if (form && form.fields) {
      setFields(form.fields)
    }
  }, [form])

  const handleSubmit = (event) => {
    event.preventDefault()

    const data = {
      fields,
    }

    if (form) {
      updateForm(workspace, form.id, data)
        .then(() => {
          setForm(form.id)
          onSubmit()
        })
        .catch(onError)
    }
  }

  const handleAdd = (data) => {
    const { id } = data
    setFields((state) => ({ ...state, [id]: data }))
  }

  const handleUpdate = (data) => {
    const { id } = data
    setFields((state) => ({ ...state, [id]: data }))
  }

  const handleDelete = (id) => {
    setFields((state) => {
      const values = { ...state }
      delete values[id]
      return values
    })
  }

  return (
    <Box component="form" id="step-form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <DataTableComponent
          columns={columns}
          rows={rows}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </Grid>
    </Box>
  )
}

export default StepFields
