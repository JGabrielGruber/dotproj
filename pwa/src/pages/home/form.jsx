import { useEffect, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import {
  Autocomplete,
  Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, TextField,
} from "@mui/material"

import useConfigStore from "src/stores/config.store"
import useTaskStore from "src/stores/task.store"
import useWorkspaceStore from "src/stores/workspace.store"

function TaskForm({ editId, open, onClose, onReset, onSubmit }) {

  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(null)
  const [stage, setStage] = useState(null)

  const { categories, stages } = useConfigStore()
  const task = useTaskStore(useShallow((state) => state.getTask(editId)))
  const { addTask, updateTask, deleteTask } = useTaskStore()
  const { workspace } = useWorkspaceStore()

  useEffect(() => {
    if (editId && task) {
      setId(editId)
      setTitle(task.title)
      setDescription(task.description)
      setStage(stages.find((stage) => stage.key == task.stage_key))
      setCategory(categories.find((category) => category.key == task.category_key))
    } else {
      handleReset()
    }
  }, [editId, task, categories, stages])

  const handleReset = () => {
    setId('')
    setTitle('')
    setDescription('')
    setStage(null)
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
      category_key: category && categories.find((item) => item.id === category.id)?.key,
      stage_key: stage && stages.find((item) => item.id === stage.id)?.key,
      workspace: workspace.id,
    }
    if (editId) {
      updateTask(editId, data)
        .then(() => {
          onSubmit()
        })
        .catch(console.error)
    } else {
      addTask(data)
        .then(() => {
          handleReset()
          onSubmit()
        })
        .catch(console.error)
    }
  }

  const handleDelete = (e) => {
    e.preventDefault()
    if (e.type != 'click') {
      return
    }
    if (!editId) {
      return
    }
    deleteTask(editId)
      .then(() => {
        handleReset()
        onReset()
      })
      .catch(console.error)
  }

  const handleChangeTitle = (e) => {
    const { value } = e.target
    if (value.length < 50) {
      setTitle(e.target.value)
    }
  }

  const handleChangeDescription = (e) => {
    setDescription(e.target.value)
  }

  const handleChangeCategory = (e, value) => {
    e.preventDefault()
    setCategory(value)
  }

  const handleChangeStage = (e, value) => {
    e.preventDefault()
    setStage(value)
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
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="ID"
                name="id"
                value={id}
                disabled
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 10 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                defaultValue={stages[0]}
                options={stages}
                value={stage}
                onChange={handleChangeStage}
                renderInput={(params) => <TextField {...params} required label="Etapa" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
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
