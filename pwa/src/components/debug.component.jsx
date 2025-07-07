import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'

import useDebugStore from 'src/stores/debug.store'

function DebugModal({ open, onClose }) {
  const { logs, clearLogs } = useDebugStore()

  const getLogStyle = (type) => {
    switch (type) {
      case 'console':
        return { backgroundColor: '#88c0d0' } // Blue for console logs
      case 'console-error':
        return { backgroundColor: '#bf616a' } // Red for console logs
      case 'api_request':
        return { backgroundColor: '#b48ead' } // Purple for API requests
      case 'api_response':
        return { backgroundColor: '#a3be8c' } // Green for API responses
      case 'api_error':
        return { backgroundColor: '#d08770' } // Orange for API errors
      default:
        return { backgroundColor: '#ebcb8b' }
    }
  }

  const getLogText = (log) => {
    switch (log.type) {
      case 'console':
        return `[CONSOLE] ${log.message}`
      case 'console-error':
        return `[ERROR] ${log.message}`
      case 'api_request':
        return `[API ${log.method}] ${log.url} ${log.status ? `(${log.status})` : ''} ${log.message || ''}`
      case 'api_response':
        return `[API ${log.method}] ${log.url} ${log.status ? `(${log.status})` : ''} ${log.message || ''}`
      case 'api_error':
        return `[API ${log.method}] ${log.url} ${log.status ? `(${log.status})` : ''} ${log.message || ''}`
      default:
        return `[${log.type}] ${log.message}`
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Debug</DialogTitle>
      <DialogContent>
        <List>
          {logs.map((log) => (
            <ListItem key={log.id} sx={getLogStyle(log.type)}>
              <ListItemText
                primary={getLogText(log)}
                secondary={log.timestamp}
                slotProps={{
                  primary: {
                    color: '#2e3440',
                    style: {
                      overflowWrap: 'anywhere',
                    },
                  },
                  secondary: {
                    color: '#4c566a',
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={clearLogs} variant="contained">
          Limpar
        </Button>
        <Box flexGrow={1} />
        <Button color="primary" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DebugModal
