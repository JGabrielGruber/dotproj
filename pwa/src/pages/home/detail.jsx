import React, { useState } from "react"
import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import {
  AppBar,
  Autocomplete,
  Avatar,
  Box, Button, Card, CardActionArea, CardActions, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Grid,
  IconButton,
  List, ListItem, ListItemAvatar, ListItemText, ListSubheader, Paper, Stack, TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material"

import useConfigStore from "src/stores/config.store"
import useTaskStore from "src/stores/task.store"
import useWorkspaceStore from "src/stores/workspace.store"
import { BeachAccess, Close, Edit, Image, Person, Work } from "@mui/icons-material"
import CommentComponent from "src/components/comment.component"
import { theme } from "src/theme"

function DetailModal({ editId, open, onClose, onEdit }) {
  const [data, setData] = useState({})
  const [items, setItems] = useState([])
  const [category, setCategory] = useState({})
  const [commentFocused, setCommentFocused] = useState(false)

  const { categories, stages } = useConfigStore()
  const task = useTaskStore(useShallow((state) => state.getTask(editId)))
  const { workspace } = useWorkspaceStore()
  const { comments, fetchComments, addComment } = useTaskStore()

  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  useEffect(() => {
    if (task) {
      setData(task)
      if (task.category_key) {
        setCategory(categories.find((cat) => cat.key === task.category_key))
      }
      if (task.id) {
        setItems([])
        fetchComments(task.id)
      } else {
        setItems([])
      }
    }
  }, [task, categories, fetchComments])

  useEffect(() => {
    setItems(comments)
  }, [comments])

  const handleClose = (e) => {
    e.preventDefault()
    onClose()
    setCommentFocused(false)
  }

  const handleCommentSubmit = (value) => {
    if (task.id && value) {
      const data = { content: value }
      addComment(task.id, data)
        .catch(console.error)
    }
  }

  const handleFocusComment = async (value) => {
    setCommentFocused(value)
  }

  const handleClickEdit = (event) => {
    event.preventDefault()
    onEdit()(event)
  }

  const Title = () => `${category.emoji} ${data.title}`

  const Status = () => (
    <Stack paddingX={{ lg: 4 }} marginY={{ lg: 2 }} direction="row" spacing={2}>
      <Chip color="primary" label={category.label} />
      <Chip color="secondary" label={data.stage_key} />
    </Stack>
  )

  const Content = () => (
    <DialogContentText style={{ textAlign: 'justify', whiteSpace: 'pre-wrap', minHeight: 60 }}>
      {data.description}
    </DialogContentText>
  )

  const Medias = () => (
    <Box display="flex" flexDirection="row" maxWidth={{ xs: "100%", lg: "65vmax", xl: "55vmax" }} overflow="auto">
      {[...Array(20).keys()].map((k) => (
        <Card key={k} sx={{ minWidth: 200, margin: 2 }}>
          <Paper sx={{ alignContent: 'center', height: '100%' }} variant="outlined">
            <CardActionArea sx={{ height: '100%' }}>
              <Typography variant="h2" align="center">
                <Image sx={{ fontSize: 40 }} />
              </Typography>
            </CardActionArea>
          </Paper>
        </Card>
      ))}
    </Box>
  )

  const Author = () => (
    <ListItem>
      <ListItemAvatar>
        <Avatar>
          <Person />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary="Josivaldo da Testelandia" secondary="3 de junho de 2024 12:43" />
    </ListItem>
  )

  const Comments = () => (
    <List sx={{ height: '100%' }}>
      {comments.map((comment) => (
        <ListItem keys={comment.id}>
          <Stack>
            <Typography variant="body1" fontWeight="bold">{comment.author}</Typography>
            <Typography variant="body2">{comment.content}</Typography>
            <Typography variant="overline">{comment.created_at}</Typography>
          </Stack>
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
              <Button color="secondary" startIcon={<Edit />} size="large" onClick={handleClickEdit}>Editar</Button>
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
