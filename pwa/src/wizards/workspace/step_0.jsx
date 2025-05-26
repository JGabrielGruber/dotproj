import { Box, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import useWorkspaceStore from "src/stores/workspace.store"

function StepWorkspace({ onSubmit, onError }) {
  const [label, setLabel] = useState('')

  const { addWorkspace, workspace } = useWorkspaceStore()

  useEffect(() => {
    if (workspace) {
      setLabel(workspace.label)
    }
  }, [workspace])

  const handleSubmit = (event) => {
    event.preventDefault()
    addWorkspace({ label })
      .then(onSubmit)
      .catch(onError)
  }

  const handleChangeLabel = (event) => {
    setLabel(event.target.value)
  }

  return (
    <Box component="form" id="step-form" onSubmit={handleSubmit}>
      <TextField
        disabled={workspace}
        name="label"
        label="Nome do Projeto"
        value={label}
        onChange={handleChangeLabel}
      />
    </Box>
  )
}

export default StepWorkspace
