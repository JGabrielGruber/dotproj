import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import useChoreStore from 'src/stores/chore.store'
import useWorkspaceStore from 'src/stores/workspace.store'

function StepRecurrence({ onSubmit, onError }) {
  const [recurrence, setRecurrence] = useState('')
  const [schedule, setSchedule] = useState('')

  const { chore, updateChore, setChore } = useChoreStore()
  const { workspace } = useWorkspaceStore()

  useEffect(() => {
    setRecurrence(chore?.recurrence || '')
    setSchedule(chore?.schedule || '')
  }, [chore])

  const handleSubmit = (event) => {
    event.preventDefault()

    const data = {
      recurrence,
      schedule,
    }

    if (chore) {
      updateChore(workspace, chore.id, data)
        .then(() => {
          setChore(chore.id)
          onSubmit()
        })
        .catch(onError)
    }
  }

  const handleChangeRecurrence = (event) => {
    setRecurrence(event.target.value)
  }

  const handleChangeSchedule = (event) => {
    setSchedule(event.target.value)
  }

  return (
    <Box component="form" id="step-form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="recurrence-label">Recorrência</InputLabel>
            <Select
              labelId="recurrence-label"
              name="recurrence"
              value={recurrence}
              onChange={handleChangeRecurrence}
              fullWidth
            >
              <MenuItem value="daily">Diariamente</MenuItem>
              <MenuItem value="weekly">Semanalmente</MenuItem>
              <MenuItem value="monthly">Mensalmente</MenuItem>
              <MenuItem value="yearly">Anualmente</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="schedule"
            label="Cronograma"
            placeholder="0 0 * * 1"
            value={schedule}
            onChange={handleChangeSchedule}
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default StepRecurrence
