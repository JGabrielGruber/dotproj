import { Box, TextField, Typography } from '@mui/material'

function StepFinish({ onSubmit, onError }) {
  return (
    <Box component="form" id="step-form" onSubmit={onSubmit}>
      <Typography>Você concluiu a configuração!</Typography>
    </Box>
  )
}

export default StepFinish
