import { Link, useLocation } from "react-router"
import {
  Autocomplete, Box, Collapse, Divider, Icon, IconButton, List,
  ListItem, ListItemButton, ListItemIcon,
  ListItemText, TextField, Toolbar, Typography,
} from "@mui/material"

import routes from "src/routes"
import { Circle, ExpandLess, ExpandMore, Logout } from "@mui/icons-material"

function NavigationComponent({ header = (<></>), footer = (<></>) }) {

  const location = useLocation()
  const currentPath = location.pathname
  const queryParams = new URLSearchParams(location.search)

  return (
    <>
      {header}
      <Divider />
      <List>
        {routes.map((item) => {
          if (item.type == 'link') {
            const selected = item.path == currentPath
            return (
              <ListItem key={item.key} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={selected}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                  {item.expandable && (
                    selected ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>
            )
          } else if (item.type == 'menu') {
            const selected = item.path == currentPath
            const items = item.provider ? item.provider(...item.args ?? []) : []
            return (
              <Collapse key={item.key} in={selected} unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}>
                  {items.map((subitem) => {
                    const selected = queryParams.get(item.query) == subitem.id
                    return (
                      <ListItemButton
                        key={subitem.id}
                        component={Link}
                        to={`${item.path}?${item.query}=${subitem.id}`}
                        selected={selected}
                      >
                        <ListItemIcon>{subitem.emoji}</ListItemIcon>
                        <ListItemText primary={subitem.label} />
                      </ListItemButton>
                    )
                  })}
                </List>
              </Collapse>
            )
          } else if (item.type == 'divider') {
            return (
              <Divider key={item.key} component="li" />
            )
          }
        })}
      </List>
      <Box sx={{ height: '100%' }} />
      <Divider />
      {footer}
    </>
  )
}

export default NavigationComponent

