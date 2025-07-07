import { FileDownload } from '@mui/icons-material'
import { Box, Card, CardActionArea, CardMedia, Typography } from '@mui/material'
import { API_URL } from 'src/utils/django'

function FileComponent({ task, file, height = 'auto', width = 'auto' }) {
  if (task && file) {
    const isImage = file.content_type.toUpperCase().includes('IMAGE')
    const isVideo = file.content_type.toUpperCase().includes('VIDEO')
    const isPdf = file.content_type.toUpperCase().includes('PDF')
    const fileUrl = `${API_URL}/api/tasks/${task.id}/files/${file.id}/${file.file_name}`

    return (
      <Card
        key={file.id}
        sx={{
          margin: 2,
          minWidth: 'fit-content',
          width,
          padding: 1,
          height: '100%',
        }}
      >
        {isImage ? (
          <CardMedia
            component="img"
            image={fileUrl}
            alt={file.file_name}
            sx={{
              maxWidth: 220,
              maxHeight: 220,
              display: 'block',
              width,
              height,
            }}
          />
        ) : isVideo ? (
          <CardMedia
            component="video"
            src={fileUrl}
            controls
            sx={{
              maxWidth: 220,
              maxHeight: 220,
              display: 'block',
              width,
              height,
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: 220,
              maxHeight: 220,
              height,
              padding: 2,
            }}
          >
            <FileDownload color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="caption" textAlign="center">
              {file.file_name || 'File'}
            </Typography>
          </Box>
        )}
      </Card>
    )
  }
}

export default FileComponent
