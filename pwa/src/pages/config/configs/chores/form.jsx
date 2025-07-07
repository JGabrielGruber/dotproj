import { useCallback, useEffect, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material'

import { useStatus } from 'src/providers/status.provider'
import useConfigStore from 'src/stores/config.store'
import useChoreStore from 'src/stores/chore.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import ChoresResponsiblesConfig from './chores-responsibles'

const periods = [
  { label: 'Diário', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensal', value: 'monthly' },
  { label: 'Manual', value: 'manual' },
]

function ChoreForm({ open, onClose, onReset, onDelete }) {
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(null)
  const [recurrence, setRecurrence] = useState(periods[1])
  const [cron, setCron] = useState('0 0 * * 1')
  const [loading, setLoading] = useState(false)

  const { showStatus, showError } = useStatus()

  const { categories } = useConfigStore()
  const { chore, addChore, updateChore, deleteChore } = useChoreStore()
  const { workspace } = useWorkspaceStore()

  const handleReset = useCallback(() => {
    setId(chore?.id || '')
    setTitle(chore?.title || '')
    setDescription(chore?.description || '')
    setCategory(
      categories.find((category) => category.key == chore?.category_key) || null
    )
    setRecurrence(
      periods.find((period) => period.value == chore?.recurrence) || null
    )
    setCron(chore?.schedule || '0 0 * * 1')
  }, [chore, categories])

  useEffect(() => {
    handleReset()
  }, [chore, categories, handleReset])

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
    e.preventDefault()
    if (loading) {
      return
    }

    setLoading(true)

    const data = {
      title,
      description,
      category_key:
        category && categories.find((item) => item.id === category.id)?.key,
      workspace: workspace.id,
      schedule: cron,
    }
    if (id) {
      updateChore(workspace, id, data)
        .then(() => {
          showStatus({ slug: 'chore-put', title: 'Afazer atualizada!' })
        })
        .catch((error) => {
          showError({
            slug: 'chore-put-error',
            title: 'Falha ao atualizar Afazer',
            description: error,
          })
          console.error(error)
        })
        .finally(() => setLoading(false))
    } else {
      addChore(data)
        .then(() => {
          showStatus({
            slug: 'chore-add',
            title: 'Afazer criado!',
            type: 'success',
          })
          handleReset()
        })
        .catch((error) => {
          showError({
            slug: 'chore-add-error',
            title: 'Falha ao criar Afazer',
            description: error,
          })
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
    deleteChore(workspace, id)
      .then(() => {
        showStatus({ slug: 'chore-delete', title: 'Afazer excluída!' })
        handleReset()
        onDelete()
      })
      .catch((error) => {
        showError({
          slug: 'chore-delete-error',
          title: 'Falha ao excluír Afazer',
          description: error,
        })
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

  const handleChangeCron = (e) => {
    setCron(e.target.value)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      component="form"
      autoComplete="off"
      noValidate
      onSubmit={handleSubmit}
    >
      <DialogTitle>{id ? 'Editar' : 'Adicionar'} Afazer</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField label="ID" name="id" value={id} disabled fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 10 }}>
            <TextField
              autoComplete="off"
              label="Título"
              name="title"
              placeholder="Testar o dotproj"
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
              placeholder="O dotproj é uma ferramenta para gerir tarefas, temos que testar ele para ver se é útil para nós."
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
              options={categories}
              value={category}
              onChange={handleChangeCategory}
              renderInput={(params) => (
                <TextField {...params} label="Categoria" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 0, sm: 6 }} />
          <Grid size={{ xs: 12, sm: 3 }}>
            <Autocomplete
              options={periods}
              value={recurrence}
              renderInput={(params) => (
                <TextField {...params} label="Recorrência" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              helperText="https://crontab.cronhub.io/"
              label="Cron Expression"
              onChange={handleChangeCron}
              value={cron}
            />
          </Grid>
          <Grid size={12}>
            <ChoresResponsiblesConfig />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          disabled={loading}
          onClick={handleDelete}
          color="error"
          sx={!id && { display: 'none' }}
          variant="contained"
        >
          Excluir
        </Button>
        <Box flexGrow={1} />
        <Button
          disabled={loading}
          onClick={handleCancel}
          color="secondary"
          variant="text"
        >
          Cancelar
        </Button>
        <Button disabled={loading} onClick={handleSubmit} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChoreForm
