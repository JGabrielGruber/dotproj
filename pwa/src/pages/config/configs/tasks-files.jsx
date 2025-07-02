import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid'
import { Box, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from "@mui/material"

import DataTable from 'src/components/data_table.component';
import useConfigStore from 'src/stores/config.store';
import { useStatus } from 'src/providers/status.provider';
import useWorkspaceStore from 'src/stores/workspace.store';
import useFileStore from 'src/stores/file.store';

function TasksFilesConfig() {
  const [rows, setRows] = useState([])

  const { categories } = useConfigStore()
  const { taskFiles, fetchTaskFiles } = useFileStore()
  const { workspace } = useWorkspaceStore()
  const { showStatus, showError } = useStatus()

  useEffect(() => {
    if (workspace) {
      fetchTaskFiles(workspace)
        .then(() => {
          showStatus({ slug: "fetch-taskfile", title: "Sucesso ao carregar arquivos" });
        })
        .catch((error) => {
          console.error(error);
          showError({ slug: "fetch-taskfile-error", title: "Error ao buscar arquivos", description: error });
        });
    }
  }, [workspace, fetchTaskFiles, showStatus, showError]);

  useEffect(() => {
    if (Array.isArray(taskFiles)) {
      setRows(taskFiles)
    }
  }, [taskFiles])

  const columns = [
    { field: 'file_name', headerName: 'Nome do Arquivo', width: 200, editable: false },
    { field: 'content_type', headerName: 'Tipo de Arquivo', width: 150, editable: false },
    { field: 'task_title', headerName: 'Título da Tarefa', width: 150, editable: false },
    {
      field: 'task_category_key',
      headerName: 'Categoria',
      width: 100,
      type: 'singleSelect',
      valueOptions: categories, // Assuming categories is an array like [{ key: 'nf', label: 'Nota Fiscal' }, ...]
      getOptionLabel: (value) => value.label || '',
      getOptionValue: (value) => value.key || '',
      editable: false,
    },
    { field: 'comment_content', headerName: 'Comentário', width: 200, editable: false },
    { field: 'owner', headerName: 'Responsável', width: 150, editable: false },
    { field: 'workspace', headerName: 'Workspace', width: 150, editable: false },
    {
      field: 'created_at',
      headerName: 'Criado',
      width: 200,
      type: 'dateTime',
      valueGetter: (value) => new Date(value),
      editable: false,
    },
  ]

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Etapas exibidas nas tarefas</Typography>
      </DialogTitle>
      <DataTable
        columns={columns}
        rows={rows}
      />
    </Box>
  )
}

export default TasksFilesConfig
