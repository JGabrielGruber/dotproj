import { useState } from "react"
import {
  Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider,
  Stack, Step, StepLabel, Stepper,
} from "@mui/material"

import useChoreStore from "src/stores/chore.store"
import useWorkspaceStore from "src/stores/workspace.store"

import StepChore from "./step_0"
import StepRecurrence from "./step_1"
import StepResponsibles from "./step_2"
import StepFinish from "./step_3"

function ChoreWizard({ open, onClose }) {

  const [activeStep, setActiveStep] = useState(0)

  const { chore, deleteChore } = useChoreStore()
  const { workspace } = useWorkspaceStore()

  const steps = [
    {
      label: chore ? 'Editar Afazer' : 'Criar Afazer',
      required: chore == null,
      action: chore ? 'Salvar' : 'Criar',
    },
    {
      label: 'Ajustar Repetição',
      required: false,
      action: 'Salvar',
    },
    {
      label: 'Definir Responsáveis',
      required: false,
      action: 'Concluir',
    },
  ]

  const handlePreviousStep = () => {
    const previousStep = activeStep - 1
    if (previousStep > -1) {
      setActiveStep(previousStep)
    }
  }

  const handleNextStep = () => {
    const nextStep = activeStep + 1
    if (nextStep < steps.length) {
      setActiveStep(nextStep)
    }
  }

  const handleStepSubmit = (event) => {
    event.preventDefault()
    const form = document.getElementById('step-form')
    if (form) {
      form.requestSubmit()
    }
  }

  const handleDelete = (e) => {
    e.preventDefault()
    if (e.type != 'click') {
      return
    }
    if (!chore) {
      return
    }
    deleteChore(workspace, chore.id)
      .then(() => {
        handleClose()
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleClose = (event) => {
    event.preventDefault()
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{steps[activeStep].label}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 2 }}>
          <Box minHeight="30vh" maxHeight="50vh">
            {activeStep == 0 && <StepChore onSubmit={handleNextStep} />}
            {activeStep == 1 && <StepRecurrence onSubmit={handleNextStep} />}
            {activeStep == 2 && <StepResponsibles onSubmit={handleClose} />}
            {activeStep == 3 && <StepFinish onSubmit={handleClose} />}
          </Box>
          <Divider />
          <Stepper activeStep={activeStep} sx={{ display: 'flex', flexDirection: 'row', overflowX: 'auto' }}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>
      </DialogContent>
      <DialogActions>
        {
          activeStep === 0 ? (
            <Button disabled={chore == null} variant="contained" color="error" onClick={handleDelete}>Excluir</Button>
          ) : (
            <Button onClick={handlePreviousStep}>Anterior</Button>
          )
        }
        <Box flexGrow={1} />
        <Button disabled={steps[activeStep].required || activeStep === steps.length - 1} onClick={handleNextStep}>Pular</Button>
        <Button variant="contained" onClick={handleStepSubmit}>{steps[activeStep].action}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChoreWizard
