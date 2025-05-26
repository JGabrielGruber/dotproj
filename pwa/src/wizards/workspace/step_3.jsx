import { useEffect, useState } from "react"
import {
  Box, Divider, IconButton, List, ListItem,
  ListItemIcon, ListItemText, ListSubheader,
  TextField,
} from "@mui/material"
import { Add } from "@mui/icons-material"

import useConfigStore from "src/stores/config.store"
import useWorkspaceStore from "src/stores/workspace.store"

function StepMember({ onSubmit, onError }) {
  const [items, setItems] = useState([])

  const { setMembers, members } = useConfigStore()
  const { workspace } = useWorkspaceStore()

  useEffect(() => {
    if (members) {
      setItems([...members])
    }
  }, [members])

  const handleAdd = (event) => {
    event.preventDefault()
    setItems([...items, {}])
  }

  const handleChange = (index) => (value) => {
    const item = items[index]
    if (item) {
      setItems(
        (prevItems) => prevItems.map(
          (item, i) => (i === index ? { ...item, ...value, workspace_id: workspace.id } : item)
        )
      )
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setMembers(items)
      .then(onSubmit)
      .catch(onError)
  }

  return (
    <Box component="form" id="step-form" onSubmit={handleSubmit}>
      <List
        subheader={
          <ListSubheader>
            Adicionar Membro <IconButton onClick={handleAdd}><Add /></IconButton>
          </ListSubheader>
        }
      >
        <Divider />
        {items.map((item, index) => (
          <MemberItem
            key={`item-${index}`}
            value={item}
            onChange={handleChange(index)}
          />
        ))}
      </List>
    </Box>
  )
}

function MemberItem({ value, onChange }) {
  const [member_email, setMemberEmail] = useState('')

  useEffect(() => {
    if (value && value.member_email) {
      setMemberEmail(value.member_email)
    }
  }, [value])

  const handleChangeEmail = (event) => {
    setMemberEmail(event.target.value)
    onChange({
      member_email: event.target.value,
    })
  }

  return (
    <ListItem >
      <ListItemText>
        <TextField
          value={member_email}
          onChange={handleChangeEmail}
          label="E-mail do usuário"
          type="email"
          fullWidth
        />
      </ListItemText>
    </ListItem>
  )
}

export default StepMember
