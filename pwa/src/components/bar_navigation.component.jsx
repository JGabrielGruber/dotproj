import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  Autocomplete,
  BottomNavigation,
  BottomNavigationAction,
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

export function BarNavigationComponent() {
  const location = useLocation()
  const navigate = useNavigate()

  const currentPath = useMemo(() => location.pathname, [location])
  const links = useMemo(() => routes.filter((item) => item.type == 'link'), [])
  const value = useMemo(
    () => links.findIndex((item) => item.path == currentPath),
    [links, currentPath]
  )

  const handleChange = (event, newValue) => {
    const item = links[newValue]
    if (item.path != currentPath) {
      navigate(item.path)
    }
  }

  const Actions = useMemo(() => {
    return links.map((item) => {
      if (item.type == 'link') {
        const selected = item.path == currentPath
        return (
          <BottomNavigationAction
            key={item.key}
            label={item.title}
            icon={selected && item.activeIcon ? item.activeIcon : item.icon}
          />
        )
      }
    })
  }, [links, currentPath])

  return (
    <BottomNavigation showLabels value={value} onChange={handleChange}>
      {Actions}
    </BottomNavigation>
  )
}

export function MenuNavigationComponent() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const currentPath = useMemo(() => location.pathname, [location])
  const route = useMemo(
    () =>
      routes.find((item) => item.path == currentPath && item.type == 'menu'),
    [currentPath]
  )

  const links = route.provider ? route.provider(...(route.args ?? [])) : []

  return (
    <List component="div" disablePadding>
      {links.map((subitem) => {
        const selected = queryParams.get(route.query) == subitem.key
        if (subitem.type == 'subheader') {
          return (
            <ListSubheader key={subitem.key}>{subitem.label}</ListSubheader>
          )
        }
        return (
          <ListItemButton
            key={subitem.key}
            component={Link}
            to={`${route.path}?${route.query}=${subitem.key}`}
            selected={selected}
          >
            <ListItemIcon>{subitem.icon}</ListItemIcon>
            <ListItemText primary={subitem.label} />
          </ListItemButton>
        )
      })}
    </List>
  )
}
