import React, { useState } from 'react'
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  IconButton,
} from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'

import { renderDescription } from 'src/utils/renderDescription'

/**
 * @typedef {'success' | 'info' | 'warning' | 'error'} StatusType
 */

/**
 * @typedef {Object} Status
 * @property {string} slug - Unique identifier for the status
 * @property {string} title - Status title
 * @property {string|Error|object|null} [description] - Optional status description (string, Error, or object)
 * @property {StatusType} [type='info'] - Status type
 * @property {React.ReactNode|null} [actions] - Optional action buttons
 * @property {boolean} [persistent=false] - Persist until dismissed
 * @property {number} [timeout=1] - Timeout in seconds
 * @property {boolean} [asDialog=false] - Display as dialog
 */

/**
 * Status component for rendering a single status as snackbar or dialog
 * @param {Status & { onClose: (key: string) => void, index: number, total: number }} props
 * @returns {JSX.Element}
 */
function StatusComponent({
  slug,
  title,
  description,
  type = 'info',
  actions = null,
  persistent = false,
  timeout = 1,
  asDialog = false,
  onClose,
  index,
  total,
}) {
  const [expanded, setExpanded] = useState(false)

  const handleToggleDescription = () => setExpanded((prev) => !prev)

  return asDialog ? (
    <Dialog
      open={true}
      onClose={() => !persistent && onClose(slug)}
      fullWidth
      maxWidth="sm"
      sx={{ zIndex: 1400 }}
    >
      <DialogTitle>{title}</DialogTitle>
      {description && (
        <DialogContent>
          <Collapse in={expanded}>{renderDescription(description)}</Collapse>
          <IconButton onClick={handleToggleDescription}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </DialogContent>
      )}
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  ) : (
    <Snackbar
      open={true}
      autoHideDuration={persistent ? null : timeout * 1000}
      onClose={() => !persistent && onClose(slug)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: (total - index - 1) * 6, maxWidth: '90vw' }}
    >
      <Alert
        severity={type}
        onClose={() => onClose(slug)}
        action={
          <>
            {description && (
              <IconButton onClick={handleToggleDescription}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
            {actions}
          </>
        }
        sx={{ width: '100%' }}
      >
        {title}
        {description && (
          <Collapse in={expanded}>
            <div>{renderDescription(description)}</div>
          </Collapse>
        )}
      </Alert>
    </Snackbar>
  )
}

export default StatusComponent
