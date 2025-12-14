import { useEffect, useState } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  Autocomplete,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
} from '@mui/material'
import { Add, Delete, Share } from '@mui/icons-material'

import useConfigStore from 'src/stores/config.store'
import useWorkspaceStore from 'src/stores/workspace.store'

function StepMember({ onSubmit, onError }) {
  const [items, setItems] = useState([])
  const [token, setToken] = useState(null)

  const { members, createInvite, updateMember, deleteMember } = useConfigStore()
  const { workspace } = useWorkspaceStore()

  useEffect(() => {
    if (members) {
      setItems([...members])
    }
  }, [members])

  const handleShare = async (event) => {
    event.preventDefault()
    let t = token
    if (token === null) {
      await createInvite(workspace)
        .then((token) => {
          setToken(token)
          t = token
        })
        .catch(console.error)
    }
    if (t === null) {
      return
    }
    let url = window.location.origin
    url += `?token=${t}`
    navigator.clipboard.writeText(url)
    window.prompt('Convite criado', url)
  }

  const handleChange = (index) => (value) => {
    const item = items[index]
    if (item) {
      updateMember(workspace, item.id, value)
    }
  }

  const handleDelete = (index) => () => {
    const item = items[index]
    if (item) {
      deleteMember(workspace, item.id)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Box component="form" id="step-form" onSubmit={handleSubmit}>
      <List
        subheader={
          <ListSubheader sx={{ zIndex: 2 }}>
            <Trans>Invite Members</Trans>{' '}
            <IconButton onClick={handleShare}>
              <Share />
            </IconButton>
          </ListSubheader>
        }
      >
        <Divider />
        {items.map((item, index) => (
          <MemberItem
            key={`item-${index}`}
            value={item}
            onChange={handleChange(index)}
            onDelete={handleDelete(index)}
          />
        ))}
      </List>
    </Box>
  )
}

function MemberItem({ value, onChange, onDelete }) {
  const [role, setRole] = useState('viewer')

  const { t: _ } = useLingui()

  useEffect(() => {
    if (value && value.role) {
      setRole(value.role)
    }
  }, [value])

  const handleChangeRole = (event, value) => {
    event.preventDefault()
    setRole(value)
    onChange({
      role: value,
    })
  }

  const handleDelete = (event) => {
    event.preventDefault()
    onDelete()
  }

  return (
    <ListItem>
      <ListItemIcon>
        <IconButton onClick={handleDelete}>
          <Delete />
        </IconButton>
      </ListItemIcon>
      <ListItemText>{value.name}</ListItemText>
      <ListItemText>
        <Autocomplete
          disabled={value.role === 'owner'}
          fullWidth
          value={role}
          onChange={handleChangeRole}
          options={['viewer', 'user', 'manager']}
          renderInput={(params) => <TextField {...params} label={_`Role`} />}
        />
      </ListItemText>
    </ListItem>
  )
}

export default StepMember
