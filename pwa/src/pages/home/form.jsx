import { useCallback, useEffect, useState } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Popper,
  TextField,
} from '@mui/material'

import ResponsiveSelect from 'src/components/select.component'
import { useStatus } from 'src/providers/status.provider'
import useConfigStore from 'src/stores/config.store'
import useTaskStore from 'src/stores/task.store'
import useWorkspaceStore from 'src/stores/workspace.store'

function TaskForm({
  open,
  onClose,
  onReset,
  onSubmit,
  onDelete,
  defaultCategory,
  defaultStage,
}) {
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(null)
  const [stage, setStage] = useState(null)
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(false)

  const { t: _ } = useLingui()

  const { showStatus, showError } = useStatus()

  const { categories, stages, members } = useConfigStore()
  const { task, addTask, updateTask, deleteTask } = useTaskStore()
  const { workspace } = useWorkspaceStore()

  const handleReset = useCallback(() => {
    setId(task?.id || '')
    setTitle(task?.title || '')
    setDescription(task?.description || '')
    if (task) {
      setStage(stages.find((stage) => stage.key == task?.stage_key) || null)
      setCategory(
        categories.find((category) => category.key == task?.category_key) ||
          null
      )
    } else {
      setStage(stages.find((stage) => stage.key == defaultStage) || null)
      setCategory(
        categories.find((category) => category.key == defaultCategory) || null
      )
    }
    setOwner(members.find((owner) => owner.user === task?.owner?.id) || null)
  }, [task, categories, stages, members, defaultCategory, defaultStage])

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
      stage_key: stage && stages.find((item) => item.id === stage.id)?.key,
      workspace: workspace.id,
      owner: owner && {
        id: owner.user,
        name: owner.name,
      },
    }
    if (id) {
      updateTask(workspace, id, data)
        .then(() => {
          showStatus({ slug: 'task-put', title: _`Task updated!` })
          onSubmit()
        })
        .catch((error) => {
          showError({
            slug: 'task-put-error',
            title: _`Error in updating task`,
            description: error,
          })
          console.error(error)
        })
        .finally(() => setLoading(false))
    } else {
      addTask(data)
        .then(() => {
          showStatus({
            slug: 'task-add',
            title: _`Task created!`,
            type: 'success',
          })
          handleReset()
          onSubmit()
        })
        .catch((error) => {
          showError({
            slug: 'task-add-error',
            title: _`Error in creating task`,
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
    deleteTask(workspace, id)
      .then(() => {
        showStatus({ slug: 'task-delete', title: _`Task deleted!` })
        handleReset()
        onDelete()
      })
      .catch((error) => {
        showError({
          slug: 'task-delete-error',
          title: _`Error deleting task`,
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
      component="form"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <DialogTitle>
        <Trans>{id ? 'Edit' : 'Add'} Task</Trans>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField label="ID" name="id" value={id} disabled fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 10 }}>
            <TextField
              autoComplete="off"
              label={_('Title')}
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
              label={_('Description')}
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
            <ResponsiveSelect
              defaultValue={stages[0]}
              options={stages}
              value={stage}
              onChange={handleChangeStage}
              label={_('Stage')}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ResponsiveSelect
              options={categories}
              value={category}
              onChange={handleChangeCategory}
              label={_('Category')}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ResponsiveSelect
              options={members}
              value={owner}
              onChange={handleChangeOwner}
              getOptionLabel={(option) => option.name}
              label={_('Owner')}
              fullWidth
            />
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
          <Trans>Delete</Trans>
        </Button>
        <Box flexGrow={1} />
        <Button
          disabled={loading}
          onClick={handleCancel}
          color="secondary"
          variant="text"
        >
          <Trans>Cancel</Trans>
        </Button>
        <Button disabled={loading} type="submit" variant="contained">
          <Trans>Save</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TaskForm
