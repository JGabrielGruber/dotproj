import { useCallback, useEffect, useState } from "react"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material"

import { useStatus } from "src/providers/status.provider"
import useConfigStore from "src/stores/config.store"

function WorkspaceCategoryForm({ open, onClose, onReset, onSubmit, onDelete, editId }) {
  const [emoji, setEmoji] = useState('💪')
  const [label, setLabel] = useState('')
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)

  const { showStatus, showError } = useStatus()

  const categories = useConfigStore((state) => state.categories)

  useEffect(() => {
    if (editId && categories) {
      const item = categories.find((item) => item.id === editId)
      if (item) {
        setEmoji(item.emoji)
        setLabel(item.label)
        setKey(item.key)
      }
    } else {
      setEmoji('💪')
      setLabel('')
      setKey('')
    }
  }, [editId, categories])

  const handleChangeEmoji = (event) => {
    if (event.target.value.length <= 2) {
      setEmoji(event.target.value)
    }
  }

  const handleChangeLabel = (event) => {
    setLabel(event.target.value)
  }

  const handleReset = useCallback((event) => {
    event.preventDefault()
    setEmoji('💪')
    setLabel('')
    setKey('')
    onReset()
  }, [onReset])

  const handleSubmit = useCallback((event) => {
    event.preventDefault()
    onSubmit({
      id: editId,
      emoji,
      label,
      key,
    })
  }, [editId, emoji, label, key, onSubmit])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      component="form"
      autoComplete="off"
      noValidate
      onReset={handleReset}
      onSubmit={handleSubmit}
    >
      <DialogTitle>{editId ? 'Editar' : 'Adicionar'} Categoria</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid size={{ xs: 12 }}>
            <TextField label="ID" name="id" disabled fullWidth value={editId || undefined} />
          </Grid>
          <Grid size={{ xs: 4, sm: 2 }}>
            <TextField
              label="Emoji"
              name="emoji"
              fullWidth
              value={emoji}
              onChange={handleChangeEmoji}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 10 }}>
            <TextField
              label="Nome"
              name="label"
              fullWidth
              value={label}
              onChange={handleChangeLabel}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Chave" name="key" disabled fullWidth value={key} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={onDelete} variant="contained">Excluir</Button>
        <Box flexGrow={1} />
        <Button color="secondary" onClick={handleReset} type="reset" variant="text">Cancelar</Button>
        <Button disabled={loading} onClick={handleSubmit} type="submit" variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}

export default WorkspaceCategoryForm
