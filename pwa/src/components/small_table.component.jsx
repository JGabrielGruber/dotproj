import React, { useCallback, useMemo } from 'react'
import { useLingui } from '@lingui/react/macro'
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
} from '@mui/material'
import { Add, AddCircle, Visibility } from '@mui/icons-material'

import { useBreakpointValue } from 'src/hooks/currentbreakpoint'

const Header = React.memo(({ columns, onCreate, onSelection }) => {
  const { t } = useLingui()
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell key={column.field}>{column.headerName}</TableCell>
        ))}
        {onCreate && (
          <TableCell key="add" align="center">
            <Tooltip title={t`Add`}>
              <IconButton
                color="primary"
                aria-label="add"
                onClick={() => onCreate()}
              >
                <AddCircle />
              </IconButton>
            </Tooltip>
          </TableCell>
        )}
        {!onCreate && onSelection && <TableCell key="show" align="center" />}
      </TableRow>
    </TableHead>
  )
})

const Body = React.memo(({ columns, rows, onSelection }) => {
  const { t: _ } = useLingui()
  return (
    <TableBody>
      {rows.map((row, index) => (
        <TableRow key={row.id || index}>
          {columns.map((column) => (
            <TableCell
              key={column.field}
              align={column.align || 'left'}
              sx={{ flexGrow: column.grow, wordBreak: 'break-all' }}
            >
              {column.render ? column.render(row) : row[column.field]}
            </TableCell>
          ))}
          {onSelection && (
            <TableCell key="show" align="center">
              <Tooltip title={_('Visualize')}>
                <IconButton
                  color="inherit"
                  aria-label="show"
                  onClick={() => onSelection(index)}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  )
})

function SmallTableComponent({ columns, rows, onSelection, onCreate }) {
  const theme = useTheme()

  const breakpointValue = useBreakpointValue()

  const headers = useMemo(
    () => columns.filter((column) => column.breakpoint <= breakpointValue),
    [columns, breakpointValue]
  )

  const lines = useMemo(
    () =>
      rows.map((row) => {
        const line = {}
        headers.forEach((column) => {
          line[column.field] = row[column.field]
        })
        return line
      }),
    [rows, headers]
  )

  const handleOnClick = useCallback(
    (index) => {
      if (onSelection) {
        onSelection(rows[index].id)
      }
    },
    [onSelection, rows]
  )

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ backgroundColor: theme.palette.background.default }}
      variant="outlined"
    >
      <Table>
        <Header
          columns={headers}
          onCreate={onCreate}
          onSelection={onSelection}
        />
        <Body columns={headers} rows={lines} onSelection={handleOnClick} />
      </Table>
    </TableContainer>
  )
}

export default SmallTableComponent
