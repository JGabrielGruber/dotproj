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
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'

import useConfigStore from 'src/stores/config.store'
import useWorkspaceStore from 'src/stores/workspace.store'

function StepCategory({ onSubmit, onError }) {
  const [items, setItems] = useState([])

  const { setCategories, categories } = useConfigStore()
  const { workspace } = useWorkspaceStore()

  useEffect(() => {
    if (categories) {
      setItems([...categories])
    }
  }, [categories])

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
    setCategories(workspace, items).then(onSubmit).catch(onError)
  }

  return (
    <Box component="form" id="step-form" onSubmit={handleSubmit}>
      <List
        subheader={
          <ListSubheader>
            <Typography>
              Adicionar Categoria{' '}
              <IconButton onClick={handleAdd}>
                <Add />
              </IconButton>
            </Typography>
          </ListSubheader>
        }
      >
        <Divider />
        {items.map((item, index) => (
          <CategoryItem
            key={`item-${index}`}
            value={item}
            onChange={handleChange(index)}
          />
        ))}
      </List>
    </Box>
  )
}

function CategoryItem({ value, onChange }) {
  const [emoji, setEmoji] = useState('💪')
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (value && value.emoji && value.label) {
      setEmoji(value.emoji)
      setLabel(value.label)
    }
  }, [value])

  const handleChangeEmoji = (event) => {
    setEmoji(event.target.value)
    onChange({
      emoji: event.target.value,
      label,
    })
  }

  const handleChangeLabel = (event) => {
    setLabel(event.target.value)
    onChange({
      emoji,
      label: event.target.value,
    })
  }

  return (
    <ListItem>
      <ListItemIcon>
        <TextField
          value={emoji}
          onChange={handleChangeEmoji}
          inputProps={{ maxLength: 2 }}
          sx={{ width: '60px' }}
          label="Emoji"
          placeholder="🪟+."
        />
      </ListItemIcon>
      <ListItemText>
        <TextField
          value={label}
          onChange={handleChangeLabel}
          label="Nome da Categoria"
          fullWidth
        />
      </ListItemText>
    </ListItem>
  )
}

export default StepCategory
