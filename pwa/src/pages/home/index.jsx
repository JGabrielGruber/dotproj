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

function HomePage() {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const currentCategory = searchParams.get('category')

  const tasks = useTaskStore(useShallow((state) => state.getTasks(currentCategory)))
  const { fetchTasks } = useTaskStore()
  const { stages, categories, acceptInvite } = useConfigStore()
  const { workspace, setWorkspaceById, fetchWorkspaces } = useWorkspaceStore()

  // Map category keys to emojis
  const emojiMap = categories.reduce((map, cat) => {
    map[cat.key] = cat.emoji;
    return map;
  }, {});

  useEffect(() => {
    const task = searchParams.get('task')
    if (task) {
      setEditId(task)
      setShowForm(true)
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
  }, [searchParams, acceptInvite, setWorkspaceById, fetchWorkspaces])

  useEffect(() => {
    if (workspace) {
      fetchTasks(workspace).catch(console.error)
    }
  }, [workspace, fetchTasks])

  const handleAdd = (event) => {
    event.preventDefault()
    setEditId(null)
    setShowForm(true)
  }

  const handleEdit = (id) => (event) => {
    event.preventDefault()
    setEditId(id)
    setShowForm(true)
    searchParams.set('task', id)
    setSearchParams(searchParams)
  }

  const handleClose = () => {
    setShowForm(false)
    searchParams.delete('task')
    setSearchParams(searchParams)
  }

  const handleReset = () => {
    setEditId(null)
    setShowForm(false)
    searchParams.delete('task')
    setSearchParams(searchParams)
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
                      <CardActionArea onClick={handleEdit(task.id)}>
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
        onClose={handleClose}
        onReset={handleReset}
      />
    </Stack>
  );
}

export default HomePage;
