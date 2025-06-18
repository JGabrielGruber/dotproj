import { useEffect, useRef, useState } from "react"
import { Box, Button, Divider, IconButton, Paper, Stack, TextField, Typography } from "@mui/material"
import { AddPhotoAlternate } from "@mui/icons-material"
import { useCallback } from "react"

function CommentComponent({ onFocus, onSubmit }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const ref = useRef(null)

  const handleFocus = (event) => {
    event.preventDefault()
    if (!open) {
      setOpen(true)
      onFocus(true)
    }
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus()
      }
    }, 1)
  }

  const handleCancel = (event) => {
    event.preventDefault()
    handleReset()
  }

  const handleReset = () => {
    setValue('')
    setOpen(false)
    onFocus(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(value)
    handleReset()
  }

  const handleChangeValue = (event) => {
    setValue(event.target.value)
  }

  const handleEmojiCallback = useCallback((emoji) => () => {
    setValue(emoji)
  }, [setValue])

  return (
    <Stack direction={open ? 'column' : 'row'} spacing={2} width="100%">
      <Paper
        square
        sx={{
          width: '100%', display: open ? 'flex' : 'none',
          flexDirection: 'row', overflowX: 'scroll',
          flexFlow: { xs: 'row', md: 'wrap' }
        }}
      >
        {['👍', '👀', '✅', '❌', '⏳', '🤔', '💪', '🚀', '💬', '🔥', '🙌', '😃', '😎', '❤️'].map((emoji) => (
          <IconButton key={emoji} onClick={handleEmojiCallback(emoji)}>{emoji}</IconButton>
        ))}
      </Paper>
      <TextField
        inputRef={ref}
        onFocus={handleFocus}
        fullWidth
        placeholder="Adicionar comentário"
        multiline={open}
        rows={4}
        sx={{ flexGrow: 1, height: '100%' }}
        variant="standard"
        value={value}
        onChange={handleChangeValue}
      />
      <Box sx={{ width: open ? '100%' : 'auto', display: 'flex', flexDirection: 'row' }}>
        <Box flexGrow={1} display={open ? 'flex' : 'none'}>
          <IconButton color="primary">
            <AddPhotoAlternate />
          </IconButton>
        </Box>
        <Button
          color="secondary"
          variant="text"
          onClick={handleCancel}
          sx={{ display: open ? 'inherit' : 'none' }}
        >Cancelar</Button>
        <Button onClick={handleSubmit} disabled={value === ''} variant="contained">Comentar</Button>
      </Box>
    </Stack>
  )
}

export default CommentComponent
