import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useLingui } from '@lingui/react/macro'
import { Box, Tooltip, Stack } from '@mui/material'
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridColumnHeaderTitle,
} from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import AddCircleIcon from '@mui/icons-material/AddCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import VisibilityIcon from '@mui/icons-material/Visibility'

/**
 * @typedef {object} DataRow
 * @property {string | number} id - A unique identifier for the row.
 * @property {boolean} [isNew] - Optional flag indicating if the row is newly created and not yet persisted.
 * @property {any} [otherProps] - Any other properties specific to your data.
 */

/**
 * @typedef {import('@mui/x-data-grid').GridColDef} GridColDef
 */

/**
 * A reusable and highly configurable DataTable component built with MUI DataGrid.
 * It provides basic CRUD (Create, Read, Update, Delete) functionalities,
 * with actions dynamically enabled based on provided handlers.
 *
 * @param {object} props - The component props.
 * @param {DataRow[]} props.rows - An array of objects representing the table data. Each object must have a unique 'id' property.
 * @param {GridColDef[]} props.columns - An array of column definitions for MUI DataGrid. The 'actions' column will be appended automatically.
 * @param {(newRow: DataRow) => Promise<DataRow | void>} [props.onAdd] - Optional asynchronous function called when a new row is added and saved.
 * It receives the new row object (including its generated ID and data) as an argument.
 * Expected to handle persistence (e.g., API call, Zustand store update).
 * If provided, an "Add New Row" button appears in the actions column header.
 * @param {(updatedRow: DataRow) => Promise<DataRow | void>} [props.onUpdate] - Optional asynchronous function called when an existing row is edited and saved.
 * It receives the updated row object as an argument.
 * Expected to handle persistence.
 * If provided, an "Edit" button appears for each row.
 * @param {(rowId: string | number) => Promise<void>} [props.onDelete] - Optional asynchronous function called when a row's delete button is clicked.
 * It receives the 'id' of the row to be deleted as an argument.
 * Expected to handle persistence.
 * If provided, a "Delete" button appears for each row.
 * @param {(rowId: string | number) => void} [props.onSelection] - Optional function called when a row is clicked.
 * It receives the 'id' of the clicked row as an argument.
 * @param {() => void} [props.onCreate] - Optional function called when a row need to be externally created.
 * @returns {JSX.Element} The DataTableComponent.
 */
function DataTableComponent({
  rows: initialRows,
  columns: propColumns,
  onAdd,
  onUpdate,
  onDelete,
  onSelection,
  onCreate,
  columnVisibilityModel,
}) {
  const [rows, setRows] = useState(initialRows)
  const [rowModesModel, setRowModesModel] = useState({})

  const { t: _ } = useLingui()

  useEffect(() => {
    setRows(initialRows)
  }, [initialRows])

  const handleRowEditStop = useCallback((params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }, [])

  const handleEditClick = useCallback(
    (id) => () => {
      setRowModesModel((prevModel) => ({
        ...prevModel,
        [id]: { mode: GridRowModes.Edit },
      }))
    },
    []
  )

  const handleSaveClick = useCallback(
    (id) => async () => {
      setRowModesModel((prevModel) => ({
        ...prevModel,
        [id]: { mode: GridRowModes.View },
      }))
    },
    []
  )

  const handleDeleteClick = useCallback(
    (id) => async () => {
      if (onDelete) {
        await onDelete(id)
      }
      setRows((oldRows) => oldRows.filter((row) => row.id !== id))
    },
    [onDelete]
  )

  const handleRowClick = useCallback(
    (id) => () => {
      if (onSelection) {
        onSelection(id)
      }
    },
    [onSelection]
  )

  const handleCancelClick = useCallback(
    (id) => () => {
      setRowModesModel((prevModel) => ({
        ...prevModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      }))

      const editedRow = rows.find((row) => row.id === id)
      if (editedRow?.isNew) {
        setRows(rows.filter((row) => row.id !== id))
      }
    },
    [rows]
  )

  const processRowUpdate = useCallback(
    async (newRow) => {
      if (newRow?.isNew) {
        delete newRow.isNew
        if (onAdd) {
          await onAdd(newRow)
        }
      } else {
        if (onUpdate) {
          await onUpdate(newRow)
        }
      }
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === newRow.id ? newRow : row))
      )
      return newRow
    },
    [onAdd, onUpdate]
  )

  const handleRowModesModelChange = useCallback((newRowModesModel) => {
    setRowModesModel(newRowModesModel)
  }, [])

  const handleAddClick = useCallback(() => {
    const id = uuidv4()
    setRows((oldRows) => [{ id, isNew: true }, ...oldRows])
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: propColumns[0]?.field },
    }))
  }, [propColumns])

  const handleCreateClick = useCallback(onCreate, [onCreate])

  const actionsColumn = useMemo(() => {
    return {
      field: 'actions',
      type: 'actions',
      headerName: _('Actions'),
      renderHeader: () => (
        <Stack direction="row" alignItems="center">
          <GridColumnHeaderTitle label={_('Actions')} />
          {onAdd && (
            <GridActionsCellItem
              icon={
                <Tooltip title={_('Add entry')}>
                  <AddIcon />
                </Tooltip>
              }
              label={_('Add')}
              className="textPrimary"
              onClick={handleAddClick}
              color="primary"
            />
          )}
          {onCreate && (
            <GridActionsCellItem
              icon={
                <Tooltip title={_('Create entry')}>
                  <AddCircleIcon />
                </Tooltip>
              }
              label={_('Create')}
              className="textPrimary"
              onClick={handleCreateClick}
              color="primary"
            />
          )}
        </Stack>
      ),
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={
                <Tooltip title={_('Save')}>
                  <SaveIcon />
                </Tooltip>
              }
              label={_('Save')}
              className="textPrimary"
              onClick={handleSaveClick(id)}
              color="primary"
            />,
            <GridActionsCellItem
              icon={
                <Tooltip title={_('Cancel')}>
                  <CancelIcon />
                </Tooltip>
              }
              label={_('Cancel')}
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="secondary"
            />,
          ]
        }

        return [
          onUpdate && (
            <GridActionsCellItem
              key="edit"
              icon={
                <Tooltip title={_('Edit')}>
                  <EditIcon />
                </Tooltip>
              }
              label={_('Edit')}
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="secondary"
            />
          ),
          onDelete && (
            <GridActionsCellItem
              key="delete"
              icon={
                <Tooltip title={_('Remove')}>
                  <DeleteIcon />
                </Tooltip>
              }
              label={_('Remove')}
              onClick={handleDeleteClick(id)}
              color="error"
            />
          ),
          onSelection && (
            <GridActionsCellItem
              key="show"
              icon={
                <Tooltip title={_('Visualize')}>
                  <VisibilityIcon />
                </Tooltip>
              }
              label={_('Visualize')}
              onClick={handleRowClick(id)}
            />
          ),
        ].filter(Boolean)
      },
    }
  }, [
    onAdd,
    onCreate,
    onUpdate,
    onDelete,
    onSelection,
    handleAddClick,
    handleCreateClick,
    handleSaveClick,
    handleCancelClick,
    handleEditClick,
    handleDeleteClick,
    handleRowClick,
    rowModesModel, // rowModesModel is a dependency as it determines the actions shown
    _,
  ])

  const columns = useMemo(() => {
    return [...propColumns, actionsColumn]
  }, [propColumns, actionsColumn])

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      editMode={onUpdate ? 'row' : false}
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      initialState={{
        columns: {
          columnVisibilityModel,
        },
      }}
    />
  )
}

export default React.memo(DataTableComponent)
