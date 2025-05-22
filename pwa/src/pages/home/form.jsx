import { useEffect, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import {
  Autocomplete,
  Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, TextField,
} from "@mui/material"

import useConfigStore from "src/stores/config.store"
import useTaskStore from "src/stores/task.store"

function TaskForm({ editId, open, onClose, onReset }) {

  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(null)
  const [step, setStep] = useState(null)

  const { categories, steps } = useConfigStore()
  const task = useTaskStore(useShallow((state) => state.getTask(editId)))
  const { addTask, updateTask } = useTaskStore()

  useEffect(() => {
    if (editId && task) {
      setId(editId)
      setTitle(task.title)
      setDescription(task.description)
      setStep(steps.find((step) => step.id == task.step))
      setCategory(categories.find((category) => category.id == task.category))
    } else {
      handleReset()
    }
  }, [editId, task, categories, steps])

  const handleReset = () => {
    setId('')
    setTitle('')
    setDescription('')
    setStep(null)
    setCategory(null)
  }

  const handleClose = (e) => {
    e.preventDefault()
    onClose()
  }

  const handleCancel = (e) => {
    e.preventDefault()
    handleReset()
    onReset()
  }

  const handleSubmit = (e) => {
    if (e.type != 'click') {
      return
    }
    const data = {
      title,
      description,
      category: category?.id,
      step: step.id,
    }
    if (editId) {
      updateTask(editId, data)
    } else {
      addTask(data)
    }
    handleReset()
    onReset()
  }

  const handleDelete = (e) => {
    e.preventDefault()
    if (e.type != 'click') {
      return
    }
    if (!id) {
      return
    }
  }

  const handleChangeTitle = (e) => {
    setTitle(e.target.value)
  }

  const handleChangeDescription = (e) => {
    setDescription(e.target.value)
  }

  const handleChangeCategory = (e, value) => {
    e.preventDefault()
    setCategory(value)
  }

  const handleChangeStep = (e, value) => {
    e.preventDefault()
    setStep(value)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <Box
        component="form"
        autoComplete="off"
        noValidate
        onSubmit={handleSubmit}
      >
        <DialogTitle>{id ? "Editar" : "Adicionar"} Tarefa</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid size={2}>
              <TextField
                label="ID"
                name="id"
                value={id}
                disabled
                fullWidth
              />
            </Grid>
            <Grid size={10}>
              <TextField
                autoComplete="off"
                label="Título"
                name="title"
                value={title}
                onChange={handleChangeTitle}
                required
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                autoComplete="off"
                label="Descrição"
                name="description"
                value={description}
                onChange={handleChangeDescription}
                required
                fullWidth
                multiline
                minRows={4}
              />
            </Grid>
            <Grid size={4}>
              <Autocomplete
                defaultValue={steps[0]}
                options={steps}
                value={step}
                onChange={handleChangeStep}
                renderInput={(params) => <TextField {...params} required label="Etapa" />}
              />
            </Grid>
            <Grid size={4}>
              <Autocomplete
                options={categories}
                value={category}
                onChange={handleChangeCategory}
                renderInput={(params) => <TextField {...params} label="Categoria" />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="error" sx={!id && { display: 'none' }} variant="contained">Excluir</Button>
          <Box flexGrow={1} />
          <Button onClick={handleCancel} color="secondary" variant="text">Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Salvar</Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default TaskForm
