import { useState, useEffect, useCallback, memo } from 'react';
import { Box, Tooltip, Stack } from '@mui/material';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridColumnHeaderTitle,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';

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
 * @returns {JSX.Element} The DataTableComponent.
 */
function DataTableComponent({
  rows: initialRows,
  columns: propColumns,
  onAdd,
  onUpdate,
  onDelete,
  onSelection, // New prop for row selection
}) {
  const [rows, setRows] = useState(initialRows);
  const [rowModesModel, setRowModesModel] = useState({});

  // Effect to update internal rows state when initialRows prop changes
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  /**
   * Handles the event when row editing stops. Prevents default Mui behavior
   * if the reason for stopping is `rowFocusOut`.
   * @param {import('@mui/x-data-grid').GridRowParams} params - The row parameters.
   * @param {React.SyntheticEvent} event - The event object.
   */
  const handleRowEditStop = useCallback((params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  }, []);

  /**
   * Sets the specified row into edit mode.
   * @param {string | number} id - The ID of the row to edit.
   * @returns {() => void} A callback function for the click event.
   */
  const handleEditClick = useCallback(
    (id) => () => {
      setRowModesModel((prevModel) => ({ ...prevModel, [id]: { mode: GridRowModes.Edit } }));
    },
    [],
  );

  /**
   * Sets the specified row back to view mode. This function is primarily used
   * for the "Save" button click within the actions cell.
   * The actual row update is handled by `processRowUpdate`.
   * @param {string | number} id - The ID of the row to save (set to view mode).
   * @returns {() => Promise<void>} A callback function for the click event.
   */
  const handleSaveClick = useCallback(
    (id) => async () => {
      setRowModesModel((prevModel) => ({ ...prevModel, [id]: { mode: GridRowModes.View } }));
    },
    [],
  );

  /**
   * Handles the deletion of a row. If an `onDelete` prop is provided,
   * it calls that function before removing the row from the local state.
   * @param {string | number} id - The ID of the row to delete.
   * @returns {() => Promise<void>} A callback function for the click event.
   */
  const handleDeleteClick = useCallback(
    (id) => async () => {
      if (onDelete) {
        await onDelete(id); // Call the provided onDelete handler for external persistence
      }
      setRows((oldRows) => oldRows.filter((row) => row.id !== id));
    },
    [onDelete],
  );

  /**
   * Handles the cancellation of row editing. If the row was newly added (`isNew`),
   * it removes it from the local state. Otherwise, it reverts the row to its
   * original state (before edits).
   * @param {string | number} id - The ID of the row to cancel editing for.
   * @returns {() => void} A callback function for the click event.
   */
  const handleCancelClick = useCallback(
    (id) => () => {
      setRowModesModel((prevModel) => ({
        ...prevModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      }));

      const editedRow = rows.find((row) => row.id === id);
      if (editedRow?.isNew) {
        setRows(rows.filter((row) => row.id !== id));
      }
    },
    [rows],
  );

  /**
   * Processes the row update (either a new row addition or an existing row modification).
   * It calls the appropriate `onAdd` or `onUpdate` handler if provided,
   * then updates the local state.
   * @param {DataRow} newRow - The new/updated row object.
   * @returns {Promise<DataRow>} The updated row object after processing.
   */
  const processRowUpdate = useCallback(
    async (newRow) => {
      if (newRow?.isNew) {
        if (onAdd) {
          await onAdd(newRow); // Call onAdd for new rows
        }
      } else {
        if (onUpdate) {
          await onUpdate(newRow); // Call onUpdate for existing rows
        }
      }
      setRows((prevRows) => prevRows.map((row) => (row.id === newRow.id ? newRow : row)));
      return newRow;
    },
    [onAdd, onUpdate],
  );

  /**
   * Updates the row modes model state.
   * @param {import('@mui/x-data-grid').GridRowModesModel} newRowModesModel - The new row modes model.
   */
  const handleRowModesModelChange = useCallback((newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  }, []);

  /**
   * Handles the click event for adding a new row.
   * Generates a unique ID, adds a new empty row to the state, and puts it into edit mode.
   */
  const handleAddClick = useCallback(() => {
    const id = uuidv4(); // Generate a unique ID for the new row
    setRows((oldRows) => [{ id, isNew: true }, ...oldRows]); // Add to the beginning for visibility
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: propColumns[0]?.field }, // Focus on the first editable field
    }));
  }, [propColumns]);

  /**
   * Handles the row click event to trigger the onSelection prop.
   * @param {import('@mui/x-data-grid').GridRowParams} params - The row parameters.
   */
  const handleRowClick = useCallback(
    (params) => {
      if (onSelection) {
        onSelection(params.id);
      }
    },
    [onSelection],
  );

  /**
   * Defines the actions column configuration. This column is appended to the `propColumns`.
   * It dynamically renders action buttons (Add, Edit, Delete, Save, Cancel) based on
   * whether the corresponding `onAdd`, `onUpdate`, or `onDelete` handlers are provided.
   * @type {GridColDef}
   */
  const actionsColumn = {
    field: 'actions',
    type: 'actions',
    headerName: 'Ações', // Default header name for accessibility
    renderHeader: () => (
      <Stack direction="row" alignItems="center">
        <GridColumnHeaderTitle label="Ações" />
        {onAdd && ( // Only show add button if onAdd handler is provided
          <GridActionsCellItem
            icon={
              <Tooltip title="Add New Row">
                <AddIcon />
              </Tooltip>
            }
            label="Add"
            className="textPrimary"
            onClick={handleAddClick}
            color="primary"
          />
        )}
      </Stack>
    ),
    width: 100,
    cellClassName: 'actions',
    getActions: ({ id }) => {
      const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

      if (isInEditMode) {
        return [
          <GridActionsCellItem
            icon={
              <Tooltip title="Save">
                <SaveIcon />
              </Tooltip>
            }
            label="Save"
            className="textPrimary"
            onClick={handleSaveClick(id)}
            color="primary"
          />,
          <GridActionsCellItem
            icon={
              <Tooltip title="Cancel">
                <CancelIcon />
              </Tooltip>
            }
            label="Cancel"
            className="textPrimary"
            onClick={handleCancelClick(id)}
            color="secondary"
          />,
        ];
      }

      return [
        onUpdate && ( // Only show edit button if onUpdate handler is provided
          <GridActionsCellItem
            key="edit"
            icon={
              <Tooltip title="Edit">
                <EditIcon />
              </Tooltip>
            }
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="secondary"
          />
        ),
        onDelete && ( // Only show delete button if onDelete handler is provided
          <GridActionsCellItem
            key="delete"
            icon={
              <Tooltip title="Delete">
                <DeleteIcon />
              </Tooltip>
            }
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="error"
          />
        ),
      ].filter(Boolean); // Filter out null/undefined actions if handlers are not provided
    },
  };

  // Combine provided columns with the automatically generated actions column
  const columns = [...propColumns, actionsColumn];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      onRowClick={handleRowClick} // Add the onRowClick handler
    />
  );
}

export default memo(DataTableComponent)
