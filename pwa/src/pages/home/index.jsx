import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { useShallow } from "zustand/react/shallow"
import {
  Box, Grid, Card, CardContent, Typography,
  Divider, Stack, Fab, CardActionArea,
} from "@mui/material"
import { Add } from "@mui/icons-material"

import useTaskStore from "src/stores/task.store"
import useConfigStore from "src/stores/config.store"
import TaskForm from "./form"
import useWorkspaceStore from "src/stores/workspace.store"
import DetailModal from "./detail"

function HomePage() {
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editId, setEditId] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const currentCategory = searchParams.get('category')

  const tasks = useTaskStore(useShallow((state) => state.getTasks(currentCategory)))
  const { setTask, fetchTasks } = useTaskStore()
  const { stages, categories, acceptInvite } = useConfigStore()
  const { workspace, setWorkspaceById, fetchWorkspaces } = useWorkspaceStore()

  const emojiMap = categories.reduce((map, cat) => {
    map[cat.key] = cat.emoji
    return map
  }, {})

  useEffect(() => {
    const task = searchParams.get('task')
    if (task && !showDetail) {
      setEditId(task)
      setTask(task)
      setShowDetail(true)
    } else if (!task && showDetail) {
      setShowDetail(false)
    }
    const token = searchParams.get('token')
    if (token) {
      acceptInvite(token)
        .then((id) => {
          if (id) {
            fetchWorkspaces().then(() => {
              setWorkspaceById(id)
              searchParams.delete('token')
            })
          }
        })
        .catch(console.error)
    }
  }, [searchParams, acceptInvite, setWorkspaceById, fetchWorkspaces, showDetail, setTask])

  useEffect(() => {
    if (workspace) {
      fetchTasks(workspace).catch(console.error)
    }
  }, [workspace, fetchTasks])

  const handleAdd = (event) => {
    event.preventDefault()
    setEditId(null)
    setTask(null)
    setShowForm(true)
  }

  const handleDetail = (id) => (event) => {
    event.preventDefault()
    setEditId(id)
    setTask(id)
    setShowForm(false)
    setShowDetail(true)
    searchParams.set('task', id)
    setSearchParams(searchParams)
  }

  const handleEdit = (id = null) => (event) => {
    event.preventDefault()
    if (id) {
      setEditId(id)
    } else {
      setEditId(editId)
    }
    setTask(id || editId)
    setShowDetail(false)
    setShowForm(true)
    searchParams.set('task', id || editId)
    setSearchParams(searchParams)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    if (!showDetail) {
      searchParams.delete('task')
      setSearchParams(searchParams)
    }
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    searchParams.delete('task')
    setSearchParams(searchParams)
  }

  const handleSubmitForm = () => {
    setShowForm(false)
    if (!showDetail) {
      searchParams.delete('task')
      setSearchParams(searchParams)
      setTask(null)
    } else {
      setTask(editId)
    }
  }

  const handleDeleteForm = () => {
    setShowForm(false)
    setShowDetail(false)
    searchParams.delete('task')
    setSearchParams(searchParams)
    setTask(null)
  }

  const handleReset = () => {
    setShowForm(false)
    if (!showDetail) {
      setEditId(null)
      setTask(null)
      searchParams.delete('task')
      setSearchParams(searchParams)
    } else {
      setTask(editId)
    }
  }

  return (
    <Stack>
      <Typography variant="h4" gutterBottom>
        Tarefas {currentCategory ? `(${currentCategory})` : ''}
      </Typography>
      <Grid container spacing={2}>
        {stages.map((stage) => (
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }} key={stage.key}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5">{stage.label}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {tasks
                  .filter((task) => task.stage_key === stage.key)
                  .map((task) => (
                    <Card key={task.id}>
                      <CardActionArea onClick={handleDetail(task.id)}>
                        <CardContent>
                          <Typography variant="body1">
                            {emojiMap[task.category_key] || ''} {task.title}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Fab onClick={handleAdd} sx={{ position: 'fixed', right: 20, bottom: 20 }}>
        <Add />
      </Fab>
      <TaskForm
        editId={editId}
        open={showForm}
        onClose={handleCloseForm}
        onReset={handleReset}
        onSubmit={handleSubmitForm}
        onDelete={handleDeleteForm}
      />
      <DetailModal
        editId={editId}
        open={showDetail}
        onClose={handleCloseDetail}
        onReset={handleReset}
        onEdit={handleEdit}
      />
    </Stack>
  );
}

export default HomePage;
