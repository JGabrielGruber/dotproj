import { Box, Grid, TextField, Typography } from '@mui/material'
import { useMemo } from 'react'
import FormComponent from 'src/components/form.component'
import useFormStore from 'src/stores/form.store'

function StepTest({ onSubmit, onError }) {
  return (
    <Box component="form" id="step-form" onSubmit={onSubmit}>
      <FormComponent />
    </Box>
  )
}

export default StepTest
