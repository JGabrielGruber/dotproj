import { useCallback, useEffect, useRef, useState, memo } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Input,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { AddPhotoAlternate, AttachFile, CameraAlt } from '@mui/icons-material'

import CameraComponent from 'src/components/camera.component'
import { compressImage } from 'src/utils'

function CommentComponent({
  focused = false,
  onFocus = () => {},
  onSubmit = async () => {},
}) {
  const [open, setOpen] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [value, setValue] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const ref = useRef(null)

  const { t } = useLingui()

  useEffect(() => {
    if (focused !== null) {
      setOpen(focused)
    }
  }, [focused])

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
    }, 2)
  }

  const handleCancel = (event) => {
    event.preventDefault()
    handleReset()
  }

  const handleReset = () => {
    setValue('')
    setFile(null)
    setOpen(false)
    onFocus(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData()
    if (value) {
      formData.append('content', value)
    }
    if (file) {
      formData.append('file', file)
    }
    onSubmit(formData)
      .then(handleReset)
      .finally(() => setLoading(false))
  }

  const handleChangeValue = (event) => {
    setValue(event.target.value)
  }

  const handleChangeFile = async (event) => {
    const selectedFile = event.target.files[0]
    if (!selectedFile) return

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (selectedFile.size > maxSize) {
      window.alert('Arquivo muito grande!')
      return
    }

    // Compress if image from camera or large image
    if (selectedFile.type.startsWith('image/')) {
      try {
        const compressedFile = await compressImage(selectedFile)
        if (compressedFile.size > maxSize) {
          console.log('Imagem ainda muito grande!')
          return
        }
        setFile(compressedFile)
      } catch (e) {
        console.error(e)
        return
      }
    } else {
      setFile(selectedFile)
    }
    setFile(event.target.files[0])
  }

  const handleEmojiCallback = useCallback(
    (emoji) => () => {
      setValue(emoji)
    },
    [setValue]
  )

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Stack direction={open ? 'column' : 'row'} spacing={2} width="100%">
        <Paper
          square
          sx={{
            width: '100%',
            display: open ? 'flex' : 'none',
            flexDirection: 'row',
            overflowX: 'scroll',
            flexFlow: { xs: 'row', md: 'wrap' },
          }}
        >
          {[
            '👍',
            '👀',
            '✅',
            '❌',
            '⏳',
            '🤔',
            '💪',
            '🚀',
            '💬',
            '🔥',
            '🙌',
            '😃',
            '😎',
            '❤️',
          ].map((emoji) => (
            <IconButton key={emoji} onClick={handleEmojiCallback(emoji)}>
              {emoji}
            </IconButton>
          ))}
        </Paper>
        <TextField
          inputRef={ref}
          onFocus={handleFocus}
          fullWidth
          placeholder={t`Add comment`}
          multiline={open}
          required
          rows={4}
          sx={{ flexGrow: 1, height: '100%' }}
          variant="standard"
          value={value}
          onChange={handleChangeValue}
        />
        <Box
          sx={{
            width: open ? '100%' : 'auto',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <Box flexGrow={1} display={open ? 'flex' : 'none'}>
            <IconButton color="primary" onClick={() => setShowCamera(true)}>
              <CameraAlt />
            </IconButton>
            <IconButton color="primary" component="label">
              <AttachFile />
              <Input
                type="file"
                sx={{ display: 'none' }}
                onChange={handleChangeFile}
              />
            </IconButton>
            {file && (
              <Typography variant="caption">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Typography>
            )}
            {showCamera && (
              <CameraComponent
                onCapture={handleChangeFile}
                onClose={() => setShowCamera(false)}
              />
            )}
          </Box>
          <Button
            color="secondary"
            variant="text"
            onClick={handleCancel}
            sx={{ display: open ? 'inherit' : 'none' }}
          >
            <Trans>Cancel</Trans>
          </Button>
          {!loading ? (
            <Button
              disabled={loading}
              variant="contained"
              size="medium"
              type="submit"
            >
              <Trans>Comment</Trans>
            </Button>
          ) : (
            <Stack alignItems="center" alignContent="center">
              <CircularProgress disableShrink size={30} />
            </Stack>
          )}
        </Box>
      </Stack>
    </form>
  )
}

export default memo(CommentComponent)
