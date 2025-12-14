import { Trans } from '@lingui/react/macro'
import { Box, TextField, Typography } from '@mui/material'

function StepFinish({ onSubmit, onError }) {
  return (
    <Box component="form" id="step-form" onSubmit={onSubmit}>
      <Typography><Trans>You have finished the configuration!</Trans></Typography>
    </Box>
  )
}

export default StepFinish
