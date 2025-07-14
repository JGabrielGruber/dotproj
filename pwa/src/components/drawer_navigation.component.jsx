import { Link, useLocation } from 'react-router'
import {
  Autocomplete,
  Box,
  Collapse,
  Divider,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'

import routes from 'src/routes'
import { Circle, ExpandLess, ExpandMore, Logout } from '@mui/icons-material'

function DrawerNavigationComponent({ header = <></>, footer = <></> }) {
  const location = useLocation()
  const currentPath = location.pathname
  const queryParams = new URLSearchParams(location.search)

  return (
    <>
      {header}
      <Divider />
      <List
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
          overflowX: 'auto',
        }}
      >
        {routes.map((item) => {
          if (item.type == 'link') {
            const selected = item.path == currentPath
            return (
              <ListItem key={item.key} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={selected}
                  viewTransition
                >
                  <ListItemIcon>
                    {selected && item.activeIcon ? item.activeIcon : item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                  {item.expandable &&
                    (selected ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>
            )
          } else if (item.type == 'menu') {
            const selected = item.path == currentPath
            const items = item.provider
              ? item.provider(...(item.args ?? []))
              : []
            return (
              <Collapse key={item.key} in={selected} unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}>
                  {items.map((subitem) => {
                    const selected = queryParams.get(item.query) == subitem.key
                    if (subitem.type == 'subheader') {
                      return (
                        <ListSubheader key={subitem.key}>
                          {subitem.label}
                        </ListSubheader>
                      )
                    }
                    return (
                      <ListItemButton
                        key={subitem.key}
                        component={Link}
                        to={`${item.path}?${item.query}=${subitem.key}`}
                        selected={selected}
                      >
                        <ListItemIcon>
                          {subitem.emoji || subitem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subitem.label} />
                      </ListItemButton>
                    )
                  })}
                </List>
              </Collapse>
            )
          } else if (item.type == 'divider') {
            return <Divider key={item.key} component="li" />
          } else if (item.type == 'spacer') {
            const selected = item.path == currentPath
            return <Box key={item.key} flexGrow={selected ? 0 : 1} />
          }
        })}
      </List>
      <Divider />
      {footer}
    </>
  )
}

export default DrawerNavigationComponent
