import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { TransitionGroup } from 'react-transition-group'
import { useShallow } from 'zustand/react/shallow'
import {
  Badge,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Fab,
  CardActionArea,
  Skeleton,
  Collapse,
} from '@mui/material'
import { Add } from '@mui/icons-material'

import { useStatus } from 'src/providers/status.provider'
import useTaskStore from 'src/stores/task.store'
import useConfigStore from 'src/stores/config.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import { formatToRelative } from 'src/utils/date'

import TaskForm from './form'
import DetailModal from './detail'

function HomePage() {
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editId, setEditId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [localTasks, setLocalTasks] = useState([])

  const [searchParams, setSearchParams] = useSearchParams()
  const currentCategory = searchParams.get('category')

  const { showStatus, showError } = useStatus()
  const { setTask, fetchTasks, notifications } = useTaskStore(
    useShallow((state) => ({
      setTask: state.setTask,
      fetchTasks: state.fetchTasks,
      notifications: state.notifications,
    }))
  )
  const { tasks: zustandTasks } = useTaskStore(
    useShallow((state) => ({ tasks: state.tasks }))
  )
  const { stages, categories, acceptInvite } = useConfigStore()
  const { workspace, setWorkspaceById, fetchWorkspaces } = useWorkspaceStore()

  const filteredTasks = useMemo(() => {
    return currentCategory
      ? localTasks.filter((task) => task.category_key === currentCategory)
      : localTasks
  }, [localTasks, currentCategory])

  const emojiMap = useMemo(() => {
    return categories.reduce((map, cat) => {
      map[cat.key] = cat.emoji
      return map
    }, {})
  }, [categories])

  useEffect(() => {
    setLocalTasks(zustandTasks)
    setIsLoading(false)
  }, [zustandTasks])

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
              showStatus({ slug: 'invite', title: 'Convite aceito!' })
            })
          }
        })
        .catch((error) => {
          console.error(error)
          showError({
            slug: 'invite-error',
            title: 'Erro ao aceitar convite',
            description: error,
          })
        })
    }
  }, [
    searchParams,
    acceptInvite,
    setWorkspaceById,
    fetchWorkspaces,
    showDetail,
    setTask,
    showStatus,
    showError,
  ])

  useEffect(() => {
    if (workspace) {
      setIsLoading(true)
      fetchTasks(workspace)
        .then(() => {
          showStatus({
            slug: 'fetch-task',
            title: 'Sucesso ao carregar tarefas',
          })
        })
        .catch((error) => {
          console.error(error)
          showError({
            slug: 'fetch-task-error',
            title: 'Error ao buscar tarefas',
            description: error,
          })
          setIsLoading(false)
        })
    }
  }, [workspace, fetchTasks, showStatus, showError])

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

  const handleEdit =
    (id = null) =>
      (event) => {
        event.preventDefault()
        const targetId = id || editId
        setEditId(targetId)
        setTask(targetId)
        setShowDetail(false)
        setShowForm(true)
        searchParams.set('task', targetId)
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
    setTask(null)
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
      {isLoading && !localTasks.length ? (
        <Grid container spacing={2}>
          {stages.map((stage) => (
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }} key={stage.key}>
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width={100} height={40} />
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} variant="rectangular" height={60} />
                  ))}
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

      ) : (
        <Grid container spacing={2} columns={{ xs: 1, sm: 1, md: 3, lg: 4, xl: 5, xxl: 6 }}>
          {stages.map((stage) => (
            <Grid size={1} key={stage.key}>
              <Box sx={{ mb: 2, maxWidth: '100%' }}>
                <Typography variant="h5">{stage.label}</Typography>
                <Divider sx={{ mb: 2 }} />
                <TransitionGroup component={Stack} spacing={2}>
                  {filteredTasks
                    .filter((task) => task.stage_key === stage.key)
                    .map((task) => (
                      <Collapse key={task.id}>
                        <Card key={task.id} sx={{ maxWidth: '100%' }}>
                          <CardActionArea onClick={handleDetail(task.id)}>
                            <CardContent sx={{ overflow: 'hidden', width: { xs: '90vw', sm: '55vw', md: '100%' } }}>
                              <Badge
                                anchorOrigin={{
                                  vertical: 'top',
                                  horizontal: 'left',
                                }}
                                color="info"
                                invisible={!notifications[task.id]}
                                variant="dot"
                                sx={{ width: '100%' }}
                              >
                                <Stack direction="column" spacing={1} width="100%">
                                  <Typography
                                    variant="body1"
                                    fontWeight={notifications[task.id] ? 600 : 400}
                                    sx={{
                                      flexGrow: 1,
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap',
                                      textOverflow: 'ellipsis',
                                      wordBreak: 'break-all',
                                    }}
                                  >
                                    {emojiMap[task.category_key] || ''}{' '}
                                    {task.title}
                                  </Typography>
                                  {task.comments && task.comments[0] && (
                                    <Stack direction="row" spacing={1}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          overflow: 'hidden',
                                          whiteSpace: 'nowrap',
                                          textOverflow: 'ellipsis',
                                          wordBreak: 'break-all',
                                        }}
                                      >
                                        {task.comments[0].author.slice(0, 15) || ''}
                                        {': '}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          flexGrow: 1,
                                          overflow: 'hidden',
                                          whiteSpace: 'nowrap',
                                          textOverflow: 'ellipsis',
                                          wordBreak: 'break-all',
                                        }}
                                      >
                                        {task.comments[0].content.slice(0, 50) || ''}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        fontWeight={notifications[task.id] ? 600 : 400}
                                      >
                                        {formatToRelative(task.comments[0].created_at) || ''}
                                      </Typography>
                                    </Stack>
                                  )}
                                </Stack>
                              </Badge>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Collapse>
                    ))}
                </TransitionGroup>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        onClick={handleAdd}
        sx={{ position: 'fixed', right: 20, bottom: 20 }}
      >
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
  )
}

export default HomePage
