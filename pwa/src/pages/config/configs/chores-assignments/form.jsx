import { useCallback, useEffect, useState } from "react"
import {
  Autocomplete,
  Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, TextField,
} from "@mui/material"

import { useStatus } from "src/providers/status.provider"
import useConfigStore from "src/stores/config.store"
import useAssignedStore from "src/stores/assigned.store"
import useWorkspaceStore from "src/stores/workspace.store"

function AssignedForm({ open, onClose, onReset, onSubmit, onDelete }) {

  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(null)
  const [stage, setStage] = useState(null)
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(false)

  const { showStatus } = useStatus()

  const { categories, stages, members } = useConfigStore()
  const { assigned, addAssigned, updateAssigned, deleteAssigned } = useAssignedStore()
  const { workspace } = useWorkspaceStore()

  const handleReset = useCallback(() => {
    setId(assigned?.id || '')
    setTitle(assigned?.title || '')
    setDescription(assigned?.description || '')
    setStage(stages.find((stage) => stage.key == assigned?.stage_key) || null)
    setCategory(categories.find((category) => category.key == assigned?.category_key) || null)
    setOwner(members.find((owner) => owner.user === assigned?.owner?.id) || null)
  }, [assigned, categories, stages, members])

  useEffect(() => {
    handleReset()
  }, [assigned, categories, stages, handleReset])

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
      updateAssigned(workspace, id, data)
        .then(() => {
          showStatus({ slug: 'assigned-put', title: 'Atribuição atualizada!' })
          onSubmit()
        })
        .catch((error) => {
          showStatus({ slug: 'assigned-put-error', title: 'Falha ao atualizar Atribuição', description: error, type: 'error' })
          console.error(error)
        })
        .finally(() => setLoading(false))
    } else {
      addAssigned(data)
        .then(() => {
          showStatus({ slug: 'assigned-add', title: 'Atribuição criada!', type: 'success' })
          handleReset()
          onSubmit()
        })
        .catch((error) => {
          showStatus({ slug: 'assigned-add-error', title: 'Falha ao criar Atribuição', description: error, type: 'error' })
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
    deleteAssigned(workspace, id)
      .then(() => {
        showStatus({ slug: 'assigned-delete', title: 'Atribuição excluída!' })
        handleReset()
        onDelete()
      })
      .catch((error) => {
        showStatus({ slug: 'assigned-delete-error', title: 'Falha ao excluír Atribuição', description: error, type: 'error' })
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
        <DialogTitle>{id ? "Editar" : "Adicionar"} Atribuição</DialogTitle>
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

export default AssignedForm
