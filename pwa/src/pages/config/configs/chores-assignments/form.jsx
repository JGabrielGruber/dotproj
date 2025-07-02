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

  const [loading, setLoading] = useState(false)

  const { showStatus, showError } = useStatus()

  const { assigned, addAssigned, updateAssigned, deleteAssigned } = useAssignedStore()
  const { workspace } = useWorkspaceStore()

  const handleReset = useCallback(() => {
    setId(assigned?.id || '')
  }, [assigned,])

  useEffect(() => {
    handleReset()
  }, [assigned, handleReset])

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
    }
    if (id) {
      updateAssigned(workspace, id, data)
        .then(() => {
          showStatus({ slug: 'assigned-put', title: 'Atribuição atualizada!' })
          onSubmit()
        })
        .catch((error) => {
          showError({ slug: 'assigned-put-error', title: 'Falha ao atualizar Atribuição', description: error })
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
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={handleDelete} color="error" sx={!id && { display: 'none' }} variant="contained">Excluir</Button>
        <Box flexGrow={1} />
        <Button disabled={loading} onClick={handleCancel} color="secondary" variant="text">Cancelar</Button>
        <Button disabled={loading} onClick={handleSubmit} variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AssignedForm
