import { useMemo } from 'react'
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  InputLabel,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { AttachFile } from '@mui/icons-material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

import useFormStore from 'src/stores/form.store'
import ResponsiveSelect from './select.component'

function FormComponent() {
  const { form } = useFormStore()

  const fields = useMemo(() => {
    return Object.values(form?.fields || {}).map((field) => {
      switch (field.type) {

        case 'string':
          return (
            <Grid key={field.id} size={{ xs: 12, md: 8 }}>
              <TextField
                name={field.id}
                label={field.label}
                required={field.required}
                fullWidth
              />
            </Grid>
          )

        case 'number':
          return (
            <Grid key={field.id} size={{ xs: 12, md: 4 }}>
              <TextField
                name={field.id}
                label={field.label}
                required={field.required}
                type="number"
                fullWidth
              />
            </Grid>
          )

        case 'file':
          return (
            <Grid key={field.id} size={{ xs: 12, md: 6 }}>
              <Button
                color="inherit"
                component="label"
                startIcon={<AttachFile />}
                variant="outlined"
                fullWidth
                sx={{ height: '100%' }}
              >
                <Input name={field.id} type="file" sx={{ display: 'none' }} />
                Selecionar {field.label}
              </Button>
            </Grid>
          )
        case 'date':
          return (
            <Grid key={field.id} size={{ xs: 12, md: 4 }}>
              <DatePicker
                defaultValue={dayjs()}
                name={field.id}
                label={field.label}
                sx={{ width: '100%' }}
              />
            </Grid>
          )

        case 'simpleSelect':
          return (
            <Grid key={field.id} size={{ xs: 12, md: 4 }}>
              <ResponsiveSelect
                name={field.id}
                options={field.options}
                label={field.label}
                getOptionLabel={(option) => option}
                getOptionValue={(option) => option}
                fullWidth
                required={field.required}
              />
            </Grid>
          )

        case 'boolean':
          return (
            <Grid key={field.id} size={{ sx: 12, md: 4 }}>
              <FormControlLabel
                name={field.id}
                required={field.required}
                label={field.label}
                control={<Checkbox />}
              />
            </Grid>
          )

        default:
          break
      }
    })
  }, [form])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Grid container spacing={2} alignItems="center">
        <Grid size={12}>
          <Typography>{form.description}</Typography>
        </Grid>
        {fields}
      </Grid>
    </LocalizationProvider>
  )
}

export default FormComponent
