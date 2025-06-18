import React, { useState } from "react"
import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import {
  AppBar,
  Autocomplete,
  Avatar,
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
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

function DetailModal({ editId, open, onClose, onReset }) {
  const [data, setData] = useState({})
  const [category, setCategory] = useState({})

  const { categories, stages } = useConfigStore()
  const task = useTaskStore(useShallow((state) => state.getTask(editId)))
  const { workspace } = useWorkspaceStore()

  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  useEffect(() => {
    if (task) {
      setData(task)
      if (task.category_key) {
        setCategory(categories.find((cat) => cat.key === task.category_key))
      }
    }
  }, [task, categories])

  const handleClose = (e) => {
    e.preventDefault()
    onClose()
  }

  const Title = () => `${category.emoji} ${data.title}`

  const Status = () => (
    <Stack paddingX={{ lg: 4 }} marginY={{ lg: 2 }} direction="row" spacing={2}>
      <Chip color="primary" label={category.label} />
      <Chip color="secondary" label={data.stage_key} />
    </Stack>
  )

  const Content = () => (
    <DialogContentText style={{ textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
      {data.description}
    </DialogContentText>
  )

  const Medias = () => (
    <Box display="flex" flexDirection="row" maxWidth={{ xs: "100%", lg: "65vmax", xl: "55vmax" }} overflow="auto">
      {[...Array(20).keys()].map((k) => (
        <Card key={k} sx={{ minWidth: 200, margin: 2 }}>
          <CardContent>
            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
            <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
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
      {[...Array(20).keys()].map((k) => (
        <ListItem keys={k}>
          <Stack>
            <Typography variant="body1">Testenaldo Pescoço</Typography>
            <Typography variant="body2">Itaque ad asperiores quia nam culpa dolor impedit libero. Doloremque est hic eligendi et illum molestias minus. Minus facere quo molestiae explicabo fuga. Ipsa dolore qui ipsam sapiente cupiditate quae assumenda ex.</Typography>
            <Typography variant="overline">12 de janeiro 2021 03:54</Typography>
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
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton>
                <Close />
              </IconButton>
              <Typography variant="h6" sx={{ overflowWrap: 'break-word', whiteSpace: 'normal', flex: 1 }}>
                <Title />
              </Typography>
              <IconButton color="secondary">
                <Edit />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Stack>
        <DialogContent dividers sx={{ paddingTop: 0 }}>
          <Status />
          <Content />
          <Medias />
          <Author />
          <Paper variant="outlined">
            <ListSubheader>Comentários</ListSubheader>
            <Comments />
          </Paper>
        </DialogContent>
        <Paper elevation={24}>
          <DialogActions>
            <CommentComponent />
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
              <CommentComponent
              />
            </DialogActions>
          </Paper>
        </Box>
      </Stack>
    </Dialog>
  )
}

export default DetailModal
