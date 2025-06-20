import { useEffect, useRef, useState } from "react"
import { Box, Button, Divider, IconButton, Input, Paper, Stack, TextField, Typography } from "@mui/material"
import { AddPhotoAlternate } from "@mui/icons-material"
import { useCallback } from "react"

const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };
    img.onerror = reject;
  })

function CommentComponent({ focused = false, onFocus = () => { }, onSubmit = () => { } }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [file, setFile] = useState(null)

  const ref = useRef(null)

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
    const formData = new FormData()
    if (value) {
      formData.append('content', value)
    }
    if (file) {
      formData.append('file', file)
    }
    onSubmit(formData)
    handleReset()
  }

  const handleChangeValue = (event) => {
    setValue(event.target.value)
  }

  const handleChangeFile = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      window.alert('Arquivo muito grande!');
      return;
    }

    // Compress if image from camera or large image
    if (selectedFile.type.startsWith('image/')) {
      try {
        const compressedFile = await compressImage(selectedFile);
        if (compressedFile.size > maxSize) {
          console.log('Imagem ainda muito grande!')
          return;
        }
        setFile(compressedFile);
      } catch (e) {
        console.error(e)
        return;
      }
    } else {
      setFile(selectedFile);
    }
    setFile(event.target.files[0])
  }

  const handleEmojiCallback = useCallback((emoji) => () => {
    setValue(emoji)
  }, [setValue])

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
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
            <IconButton color="primary" component="label">
              <AddPhotoAlternate />
              <Input
                type="file"
                sx={{ display: 'none' }}
                onChange={handleChangeFile}
              />
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
    </form>
  )
}

export default CommentComponent
