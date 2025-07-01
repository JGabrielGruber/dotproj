import React, { useState } from "react"
import { useEffect } from "react"
import {
  AppBar,
  Autocomplete,
  Avatar,
  Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Chip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Grid,
  IconButton,
  List, ListItem, ListItemAvatar, ListItemText, ListSubheader, Paper, Stack, TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { BeachAccess, Close, Edit, FileDownload, Image, Person, Work } from "@mui/icons-material"

import CommentComponent from "src/components/comment.component"
import FileComponent from "src/components/file.component"
import { useStatus } from "src/providers/status.provider"
import useConfigStore from "src/stores/config.store"
import useTaskStore from "src/stores/task.store"
import useWorkspaceStore from "src/stores/workspace.store"
import { API_URL } from "src/utils/django"
import { theme } from "src/theme"

function DetailModal({ open, onClose, onEdit = null }) {
  const [data, setData] = useState({})
  const [items, setItems] = useState([])
  const [category, setCategory] = useState({})
  const [commentFocused, setCommentFocused] = useState(false)

  const { showStatus, showError } = useStatus()

  const { categories } = useConfigStore()
  const { task, addComment } = useTaskStore()
  const { workspace } = useWorkspaceStore()

  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  useEffect(() => {
    if (task?.id !== data?.id) {
      setItems([])
    }
  }, [task, data])

  useEffect(() => {
    if (task) {
      setData(task)
      if (task.category_key) {
        setCategory(categories.find((cat) => cat.key === task.category_key))
      } else {
        setCategory(null)
      }
      if (task.id) {
        setItems(task.comments || [])
      } else {
        setItems([])
      }
    }
  }, [task, categories])

  const handleClose = (e) => {
    e.preventDefault()
    setCommentFocused(false)
    onClose()
  }

  const handleCommentSubmit = async (formData) => {
    if (task.id) {
      return addComment(workspace, task.id, formData)
        .then(() => showStatus({ slug: 'comment-add', title: 'Comentário adicionado!', type: 'success' }))
        .catch((error) => {
          console.error(error)
          showError({ slug: 'comment-add-error', title: 'Falha ao criar comentário', description: error })
        })
    }
  }

  const handleFocusComment = async (value) => {
    setCommentFocused(value)
  }

  const handleClickEdit = (event) => {
    event.preventDefault()
    onEdit()(event)
  }

  const Title = () => `${category?.emoji || ''} ${data.title}`

  const Status = () => (
    <Stack paddingX={{ lg: 4 }} marginY={{ lg: 2 }} direction="row" spacing={2}>
      <Chip color="primary" label={category?.label} sx={{ display: category ? 'inherit' : 'none' }} />
      <Chip color="secondary" label={data.stage_key} />
    </Stack>
  )

  const Content = () => (
    <DialogContentText style={{ textAlign: 'justify', whiteSpace: 'pre-wrap', minHeight: 60 }}>
      {data.description}
    </DialogContentText>
  )

  const Medias = () => (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="row"
      height="fit-content"
      minWidth={{ xs: "100%", lg: "65vmax", xl: "55vmax" }}
      maxWidth={{ xs: "100%", lg: "65vmax", xl: "55vmax" }}
      overflow="auto"
    >
      {task?.comment_files?.map((file) => <FileComponent key={file.id} file={file} task={task} />)}
    </Box>
  )

  const Author = () => (
    <ListItem>
      <ListItemAvatar>
        <Avatar>
          <Person />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={task?.owner?.name} secondary={task?.updated_at} />
    </ListItem>
  )

  const Comments = () => (
    <List sx={{ height: '100%', width: '100%' }}>
      {items.map((comment) => (
        <ListItem key={comment.id}>
          <Stack flexGrow={1}>
            <Typography variant="body1" fontWeight="bold">{comment.author}</Typography>
            <Typography variant="body2">{comment.content}</Typography>
            <Typography variant="overline">{comment.created_at}</Typography>
          </Stack>
          {comment?.files?.length > 0 && (
            <FileComponent file={comment.files[0]} task={task} height={80} width="min-content" />
          )}
        </ListItem>
      ))}
    </List>
  )

  if (isMobile) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen
        scroll="paper"
      >
        <Stack direction="row">
          <AppBar color="default" sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton onClick={handleClose}>
                <Close />
              </IconButton>
              <Typography variant="h6" sx={{ overflowWrap: 'break-word', whiteSpace: 'normal', flex: 1 }}>
                <Title />
              </Typography>
              <IconButton color="secondary" onClick={handleClickEdit}>
                <Edit />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Stack>
        <DialogContent dividers sx={{ paddingTop: 0 }}>
          <Stack spacing={2}>
            <Status />
            <Content />
            <Paper variant="outlined">
              <Medias />
            </Paper>
            <Author />
            <Paper variant="outlined">
              <ListSubheader>Comentários</ListSubheader>
              <Comments />
            </Paper>
          </Stack>
        </DialogContent>
        <Paper elevation={20} sx={{ bottom: 0, width: '100vw' }}>
          <DialogActions>
            <CommentComponent focused={commentFocused} />
          </DialogActions>
        </Paper>
        <Paper elevation={20} sx={{ zIndex: 1, position: 'absolute', bottom: 0, width: '100vw' }}>
          <DialogActions>
            <CommentComponent onFocus={handleFocusComment} onSubmit={handleCommentSubmit} />
          </DialogActions>
        </Paper>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xl"
      scroll="paper"
    >
      <Stack direction={{ xs: 'column', lg: 'row-reverse' }} sx={{ minHeight: '60vh', maxHeight: '80vh' }}>
        <Box flexGrow={1}>
          <Paper elevation={10} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack direction={{ xs: 'column', lg: 'row' }}>
              <DialogTitle sx={{ flexGrow: 1, overflowWrap: 'break-word' }}>
                <Title />
              </DialogTitle>
              <Status />
            </Stack>
            <DialogContent
              sx={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', flexFlow: 'wrap' }}
            >
              <Content />
              <Medias />
            </DialogContent>
            <DialogActions>
              <Author />
              <Button color="secondary" disabled={!onEdit} startIcon={<Edit />} size="large" onClick={handleClickEdit}>Editar</Button>
            </DialogActions>
          </Paper>
        </Box>

        <Divider />
        <Box width='100%'>
          <Paper elevation={3} sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <DialogTitle>Comentários</DialogTitle>
            <Divider />
            <Paper
              elevation={0}
              sx={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', flexFlow: 'wrap' }}
            >
              <Comments />
            </Paper>
            <Divider />
            <DialogActions>
              <CommentComponent onSubmit={handleCommentSubmit} />
            </DialogActions>
          </Paper>
        </Box>
      </Stack>
    </Dialog>
  )
}

export default DetailModal
