import { useState, useEffect } from 'react'
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'

import DataTable from 'src/components/data_table.component'
import ChoresResponsiblesConfig from 'src/pages/config/configs/chores/chores-responsibles'
import { useStatus } from 'src/providers/status.provider'
import useChoreStore from 'src/stores/chore.store'
import useConfigStore from 'src/stores/config.store'
import useWorkspaceStore from 'src/stores/workspace.store'

function StepResponsibles({ onSubmit, onError }) {
  const [rows, setRows] = useState([])

  const { chore, addResponsible } = useChoreStore()
  const { members } = useConfigStore()
  const { workspace } = useWorkspaceStore()

  const { showStatus, showError } = useStatus()

  useEffect(() => {
    if (chore && Array.isArray(chore.responsibles)) {
      setRows(chore.responsibles)
    }
  }, [chore])

  const handleAdd = ({ user }) => {
    addResponsible(workspace, chore.id, { user })
      .then(() => {
        showStatus({
          slug: 'chores-responsibles',
          title: 'Responsável adicionado!',
          type: 'success',
        })
      })
      .catch((error) => {
        showError({
          slug: 'chores-responsibles-error',
          title: 'Falha ao adicionar Responsável',
          description: error,
        })
        console.error(error)
      })
  }

  return (
    <Box component="form" id="step-form" onSubmit={onSubmit}>
      <DataTable
        columns={[
          {
            field: 'user',
            headerName: 'Membro',
            width: 300,
            editable: true,
            type: 'singleSelect',
            valueOptions: members,
            valueGetter: (value) => {
              return value?.id || value
            },
            getOptionLabel: (value) => {
              return value.name
            },
            getOptionValue: (value) => {
              return value.user
            },
          },
        ]}
        rows={rows}
        onAdd={handleAdd}
        onDelete={console.log}
      />
    </Box>
  )
}

export default StepResponsibles
