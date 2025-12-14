import { useEffect, useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { Box, TextField } from '@mui/material'

import useWorkspaceStore from 'src/stores/workspace.store'

function StepWorkspace({ onSubmit, onError }) {
  const [label, setLabel] = useState('')

  const { t: _ } = useLingui()

  const { addWorkspace, workspace, updateWorkspace } = useWorkspaceStore()

  useEffect(() => {
    if (workspace) {
      setLabel(workspace.label)
    }
  }, [workspace])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (workspace) {
      updateWorkspace(workspace, { label }).then(onSubmit).catch(onError)
    } else {
      addWorkspace({ label }).then(onSubmit).catch(onError)
    }
  }

  const handleChangeLabel = (event) => {
    setLabel(event.target.value)
  }

  console.log('wizard 0', new Date())
  return (
    <Box component="form" id="step-form" onSubmit={handleSubmit} mt={2}>
      <TextField
        name="label"
        label={_`Project Name`}
        value={label}
        onChange={handleChangeLabel}
      />
    </Box>
  )
}

export default StepWorkspace
