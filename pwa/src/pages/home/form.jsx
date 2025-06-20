import { useCallback, useEffect, useState } from "react"
import {
  Autocomplete,
  Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, TextField,
} from "@mui/material"

import { useStatus } from "src/providers/status.provider"
import useConfigStore from "src/stores/config.store"
import useTaskStore from "src/stores/task.store"
import useWorkspaceStore from "src/stores/workspace.store"

function TaskForm({ open, onClose, onReset, onSubmit, onDelete }) {

  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(null)
  const [stage, setStage] = useState(null)
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(false)

  const { showStatus } = useStatus()

  const { categories, stages, members } = useConfigStore()
  const { task, addTask, updateTask, deleteTask } = useTaskStore()
  const { workspace } = useWorkspaceStore()

  const handleReset = useCallback(() => {
    setId(task?.id || '')
    setTitle(task?.title || '')
    setDescription(task?.description || '')
    setStage(stages.find((stage) => stage.key == task?.stage_key) || null)
    setCategory(categories.find((category) => category.key == task?.category_key) || null)
    setOwner(members.find((owner) => owner.user === task?.owner?.id) || null)
  }, [task, categories, stages, members])

  useEffect(() => {
    handleReset()
  }, [task, categories, stages, handleReset])

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
    if (e.type != 'click' || loading) {
      return
    }

    setLoading(true)

    const data = {
      title,
      description,
      category_key: category && categories.find((item) => item.id === category.id)?.key,
      stage_key: stage && stages.find((item) => item.id === stage.id)?.key,
      workspace: workspace.id,
      owner: owner && {
        id: owner.user,
        name: owner.name
      },
    }
    if (id) {
      updateTask(workspace, id, data)
        .then(() => {
          showStatus({ slug: 'task-put', title: 'Tarefa atualizada!' })
          onSubmit()
        })
        .catch((error) => {
          showStatus({ slug: 'task-put-error', title: 'Falha ao atualizar Tarefa', description: error, type: 'error' })
          console.error(error)
        })
        .finally(() => setLoading(false))
    } else {
      addTask(data)
        .then(() => {
          showStatus({ slug: 'task-add', title: 'Tarefa criada!', type: 'success' })
          handleReset()
          onSubmit()
        })
        .catch((error) => {
          showStatus({ slug: 'task-add-error', title: 'Falha ao criar Tarefa', description: error, type: 'error' })
          console.error(error)
        })
        .finally(() => setLoading(false))
    }
  }

  const handleDelete = (e) => {
    e.preventDefault()
    if (e.type != 'click' || loading) {
      return
    }
    if (!id) {
      return
    }
    setLoading(true)
    deleteTask(workspace, id)
      .then(() => {
        showStatus({ slug: 'task-delete', title: 'Tarefa excluída!' })
        handleReset()
        onDelete()
      })
      .catch((error) => {
        showStatus({ slug: 'task-delete-error', title: 'Falha ao excluír Tarefa', description: error, type: 'error' })
        console.error(error)
      })
      .finally(() => setLoading(false))
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

  const handleChangeOwner = (e, value) => {
    e.preventDefault()
    setOwner(value)
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                options={members}
                value={owner}
                onChange={handleChangeOwner}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Responsável" />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={handleDelete} color="error" sx={!id && { display: 'none' }} variant="contained">Excluir</Button>
          <Box flexGrow={1} />
          <Button disabled={loading} onClick={handleCancel} color="secondary" variant="text">Cancelar</Button>
          <Button disabled={loading} onClick={handleSubmit} variant="contained">Salvar</Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default TaskForm
