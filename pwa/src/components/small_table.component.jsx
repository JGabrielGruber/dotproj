import { useCallback, useMemo } from "react"
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, useTheme } from "@mui/material"
import { useBreakpointValue } from "src/hooks/currentbreakpoint"
import { Add, AddCircle, Visibility } from "@mui/icons-material"

function SmallTableComponent({ columns, rows, onSelection, onCreate }) {

  const theme = useTheme()

  const breakpointValue = useBreakpointValue()

  const headers = useMemo(
    () => columns.filter((column) => column.breakpoint <= breakpointValue),
    [columns, breakpointValue]
  )

  const lines = useMemo(
    () => rows.map((row) => {
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
        <TableHead>
          <TableRow>
            {headers.map((column) => (
              <TableCell key={column.field}>{column.headerName}</TableCell>
            ))}
            {onCreate && (
              <TableCell key="add" align="center">
                <Tooltip title="Adicionar">
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
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((row, index) => (
            <TableRow key={row.id || index}>
              {headers.map((column) => (
                <TableCell
                  key={column.field}
                  align={row.align || "left"}
                  sx={{ flexGrow: column.grow }}
                >
                  {row[column.field]}
                </TableCell>
              ))}
              {onSelection && (
                <TableCell key="show" align="center">
                  <Tooltip title="Visualizar">
                    <IconButton
                      color="inherit"
                      aria-label="show"
                      onClick={() => handleOnClick(index)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default SmallTableComponent
