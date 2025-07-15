import { useEffect, useState } from 'react'
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
} from '@mui/material'
import { Add } from '@mui/icons-material'

import useConfigStore from 'src/stores/config.store'
import useWorkspaceStore from 'src/stores/workspace.store'

function StepStage({ onSubmit, onError }) {
  const [items, setItems] = useState([])

  const { setStages, stages } = useConfigStore()
  const { workspace } = useWorkspaceStore()

  useEffect(() => {
    if (stages) {
      setItems([...stages])
    }
  }, [stages])

  const handleAdd = (event) => {
    event.preventDefault()
    setItems([...items, {}])
  }

  const handleChange = (index) => (value) => {
    const item = items[index]
    const key = value.label
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w-]/g, '')
    if (item) {
      setItems((prevItems) =>
        prevItems.map((item, i) =>
          i === index
            ? { ...item, ...value, workspace: workspace.id, key }
            : item
        )
      )
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setStages(workspace, items).then(onSubmit).catch(onError)
  }

  return (
    <Box component="form" id="step-form" onSubmit={handleSubmit}>
      <List
        subheader={
          <ListSubheader sx={{ zIndex: 2 }}>
            Adicionar Etapa{' '}
            <IconButton onClick={handleAdd}>
              <Add />
            </IconButton>
          </ListSubheader>
        }
      >
        <Divider />
        {items.map((item, index) => (
          <StageItem
            key={`item-${index}`}
            value={item}
            onChange={handleChange(index)}
          />
        ))}
      </List>
    </Box>
  )
}

function StageItem({ value, onChange }) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (value && value.label) {
      setLabel(value.label)
    }
  }, [value])

  const handleChangeLabel = (event) => {
    setLabel(event.target.value)
    onChange({
      label: event.target.value,
    })
  }

  return (
    <ListItem>
      <ListItemText>
        <TextField
          value={label}
          onChange={handleChangeLabel}
          label="Nome da Etapa"
          fullWidth
        />
      </ListItemText>
    </ListItem>
  )
}

export default StepStage
