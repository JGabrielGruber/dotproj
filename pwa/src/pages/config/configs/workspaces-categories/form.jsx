import { useCallback, useEffect, useState } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material'

import useConfigStore from 'src/stores/config.store'

function WorkspaceCategoryForm({
  open,
  onClose,
  onReset,
  onSubmit,
  onDelete,
  editId,
}) {
  const [emoji, setEmoji] = useState('💪')
  const [label, setLabel] = useState('')
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)

  const { t: _ } = useLingui()

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

  const handleReset = useCallback(
    (event) => {
      event.preventDefault()
      setEmoji('💪')
      setLabel('')
      setKey('')
      onReset()
    },
    [onReset]
  )

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()
      setLoading(true)
      onSubmit({
        id: editId,
        emoji,
        label,
        key,
      }).finally(() => setLoading(false))
    },
    [editId, emoji, label, key, onSubmit]
  )

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
      <DialogTitle>
        <Trans>{editId ? 'Edit' : 'Add'} Category</Trans>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={_`ID`}
              name="id"
              disabled
              fullWidth
              value={editId || ''}
            />
          </Grid>
          <Grid size={{ xs: 4, sm: 2 }}>
            <TextField
              label={_`Emoji`}
              name="emoji"
              fullWidth
              value={emoji}
              onChange={handleChangeEmoji}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 10 }}>
            <TextField
              label={_`Name`}
              name="label"
              fullWidth
              value={label}
              onChange={handleChangeLabel}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={_`Key`}
              name="key"
              disabled
              fullWidth
              value={key}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={onDelete} variant="contained">
          <Trans>Delete</Trans>
        </Button>
        <Box flexGrow={1} />
        <Button
          color="secondary"
          onClick={handleReset}
          type="reset"
          variant="text"
        >
          <Trans>Cancel</Trans>
        </Button>
        <Button
          disabled={loading}
          onClick={handleSubmit}
          type="submit"
          variant="contained"
        >
          <Trans>Save</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default WorkspaceCategoryForm
