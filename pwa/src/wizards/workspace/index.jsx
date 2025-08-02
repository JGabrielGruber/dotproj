import { useState, useCallback, useMemo } from 'react'
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

import useWorkspaceStore from 'src/stores/workspace.store'
import useConfigStore from 'src/stores/config.store'

import StepWorkspace from './step_0'
import StepCategory from './step_1'
import StepStage from './step_2'
import StepMember from './step_3'
import StepFinish from './step_4'

function WorkspaceWizard({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0)

  const { workspace } = useWorkspaceStore()
  const { categories, stages } = useConfigStore()

  const steps = useMemo(
    () => [
      {
        label: workspace ? 'Ajustar Projeto' : 'Criar um Projeto',
        required: workspace == null,
        action: workspace ? 'Salvar' : 'Criar',
      },
      {
        label: 'Definir Categorias',
        required: categories.length == 0,
        action: 'Salvar',
      },
      {
        label: 'Definir Etapas',
        required: stages.length == 0,
        action: 'Salvar',
      },
      {
        label: 'Definir Usuários',
        required: false,
        action: 'Próximo',
      },
      {
        label: 'Concluir',
        required: true,
        action: 'Concluir',
      },
    ],
    [workspace, categories, stages]
  )

  const handlePreviousStep = useCallback(() => {
    const previousStep = activeStep - 1
    if (previousStep > -1) {
      setActiveStep(previousStep)
    }
  }, [activeStep, setActiveStep])

  const handleNextStep = useCallback(() => {
    const nextStep = activeStep + 1
    if (nextStep < steps.length) {
      setActiveStep(nextStep)
    }
  }, [activeStep, setActiveStep, steps])

  const handleStepSubmit = useCallback((event) => {
    event.preventDefault()
    const form = document.getElementById('step-form')
    if (form) {
      form.requestSubmit()
    }
  }, [])

  const handleReset = useCallback(() => {
    setActiveStep(0)
  }, [setActiveStep])

  const handleClose = useCallback(
    (event) => {
      event.preventDefault()
      handleReset()
      onClose()
    },
    [handleReset, onClose]
  )

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{steps[activeStep].label}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box minHeight="30vh" maxHeight="50vh" sx={{ overflowY: 'auto' }}>
            {activeStep == 0 && <StepWorkspace onSubmit={handleNextStep} />}
            {activeStep == 1 && <StepCategory onSubmit={handleNextStep} />}
            {activeStep == 2 && <StepStage onSubmit={handleNextStep} />}
            {activeStep == 3 && <StepMember onSubmit={handleNextStep} />}
            {activeStep == 4 && <StepFinish onSubmit={handleClose} />}
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
        <Button disabled={activeStep === 0} onClick={handlePreviousStep}>
          Anterior
        </Button>
        <Box flexGrow={1} />
        <Button disabled={steps[activeStep].required} onClick={handleNextStep}>
          Pular
        </Button>
        <Button onClick={handleStepSubmit}>{steps[activeStep].action}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default WorkspaceWizard
