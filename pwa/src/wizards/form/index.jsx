import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material'

import useFormStore from 'src/stores/form.store'
import useWorkspaceStore from 'src/stores/workspace.store'

import StepForm from './step_0'
import StepFields from './step_1'
import StepFinish from './step_2'

function FormWizard({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0)

  const { form } = useFormStore()
  const { workspace } = useWorkspaceStore()

  const steps = [
    {
      label: form ? 'Editar Formulário' : 'Criar Formulário',
      required: form == null,
      action: form ? 'Salvar' : 'Criar',
    },
    {
      label: 'Definir Campos',
      required: Object.keys(form?.fields || {}).length == 0,
      action: 'Salvar',
    },
    {
      label: 'Testar Formulário',
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
    if (!form) {
      return
    }
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
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>{steps[activeStep].label}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 2 }}>
          <Box minHeight="30vh" maxHeight="50vh">
            {activeStep == 0 && <StepForm onSubmit={handleNextStep} />}
            {activeStep == 1 && <StepFields onSubmit={handleNextStep} />}
            {activeStep == 2 && <StepFinish onSubmit={handleClose} />}
          </Box>
          <Divider />
          <Stepper
            activeStep={activeStep}
            sx={{ display: 'flex', flexDirection: 'row', overflowX: 'auto' }}
          >
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>
      </DialogContent>
      <DialogActions>
        {activeStep === 0 ? (
          <Button
            disabled={form == null}
            variant="contained"
            color="error"
            onClick={handleDelete}
          >
            Excluir
          </Button>
        ) : (
          <Button onClick={handlePreviousStep}>Anterior</Button>
        )}
        <Box flexGrow={1} />
        <Button
          disabled={
            steps[activeStep].required || activeStep === steps.length - 1
          }
          onClick={handleNextStep}
        >
          Pular
        </Button>
        <Button variant="contained" onClick={handleStepSubmit}>
          {steps[activeStep].action}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FormWizard
