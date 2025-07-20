import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  GlobalStyles,
  IconButton,
  Link,
  Stack,
  SwipeableDrawer,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  Logout,
  Settings,
  Menu,
  RocketLaunch,
  Rocket,
  Adb,
} from '@mui/icons-material'

import DrawerNavigationComponent from 'src/components/drawer_navigation.component'
import { BarNavigationComponent } from 'src/components/bar_navigation.component'
import DebugModal from 'src/components/debug.component'
import ResponsiveSelect from 'src/components/select.component'
import { globalStyles, theme, drawerWidth } from 'src/theme'
import useWorkspaceStore from 'src/stores/workspace.store'
import useConfigStore from 'src/stores/config.store'
import WorkspaceWizard from 'src/wizards/workspace'
import useAuthStore from 'src/stores/auth.store'
import { StatusProvider } from 'src/providers/status.provider'

import 'src/ws'

function App() {
  const [showDrawer, setShowDrawer] = useState(false)
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const navigate = useNavigate()

  const { workspace, workspaces, setWorkspace, fetchWorkspaces } =
    useWorkspaceStore()
  const { fetchConfig } = useConfigStore()
  const { user, signOut } = useAuthStore()

  useEffect(() => {
    fetchWorkspaces().then((data) => {
      if (!data && !workspace) {
        setShowWorkspaceWizard(true)
      }
    })
  }, [fetchWorkspaces, workspace])

  useEffect(() => {
    if (workspace) {
      console.log('updating config')
      fetchConfig(workspace).catch(console.error)
    }
  }, [workspace, fetchConfig])

  const handleToggleDrawer = (event) => {
    event?.preventDefault()
    setShowDrawer(!showDrawer)
  }

  const handleSignOut = (event) => {
    event.preventDefault()
    signOut().then(() => navigate('/login'))
  }

  const handleOpenWorkspaceWizard = (event) => {
    event.preventDefault()
    setShowWorkspaceWizard(true)
  }

  const handleCloseWorkspaceWizard = () => {
    if (workspace) {
      setShowWorkspaceWizard(false)
    }
  }

  const handleChangeWorkspace = (event, value) => {
    event.preventDefault()
    setWorkspace(value)
  }

  const handleToggleDebug = (event) => {
    event?.preventDefault()
    setShowDebug(!showDebug)
  }

  const drawer = (
    <DrawerNavigationComponent
      header={
        <Toolbar>
          <ResponsiveSelect
            value={workspace}
            onChange={handleChangeWorkspace}
            options={workspaces}
            label="Projeto"
            fullWidth
            sx={{ my: 4 }}
          />
        </Toolbar>
      }
      footer={
        <Toolbar>
          <IconButton onClick={handleOpenWorkspaceWizard}>
            <Settings />
          </IconButton>
          <Box flexGrow={1} />
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {user.email}
          </Typography>
          <Box flexGrow={1} />
          <IconButton onClick={handleSignOut}>
            <Logout />
          </IconButton>
        </Toolbar>
      }
      value={workspace}
      options={workspaces}
      onChange={setWorkspace}
      label="Projeto"
    />
  )

  return (
    <ThemeProvider theme={theme}>
      <StatusProvider>
        <GlobalStyles styles={globalStyles} />
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar
            position="fixed"
            sx={{
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
              display: { xs: 'inherit', md: 'none' },
            }}
            color="transparent"
            variant="elevation"
            elevation={0}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleToggleDrawer}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <Menu />
              </IconButton>
              <Box flexGrow={1} />
              <IconButton
                color="inherit"
                aria-label="open debug"
                edge="start"
                onClick={handleToggleDebug}
              >
                <Adb />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
            variant="temporary"
            anchor="left"
            open={showDrawer}
            onClose={handleToggleDrawer}
            slotProps={{
              root: {
                keepMounted: true, // Better open performance on mobile.
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            sx={{
              width: drawerWidth,
              display: { xs: 'none', sm: 'block' },
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
            variant="permanent"
            anchor="left"
          >
            {drawer}
          </Drawer>
          <Stack
            component="main"
            justifyContent="space-between"
            flexGrow={1}
            paddingX={2}
            paddingTop={{ xs: 6, sm: 2 }}
            paddingBottom={{ xs: 0, sm: 2 }}
            marginBottom={{ xs: 10, sm: 0 }}
            minHeight="100vh"
          >
            <Outlet />
            <Box
              alignItems="center"
              justifyItems="center"
              marginLeft={{ xs: 0, sm: `-${drawerWidth}px` }}
            >
              <Typography color="textDisabled" variant="h6">
                <Link
                  href="https://github.com/JGabrielGruber/dotproj"
                  target="_blank"
                  rel="noopener"
                >
                  {'</>'}dotproj
                </Link>{' '}
                by{' '}
                <Link
                  href="https://jgabrielgruber.dev"
                  target="_blank"
                  rel="noopener"
                >
                  @JGabrielGruber
                </Link>
              </Typography>
            </Box>
          </Stack>
          <WorkspaceWizard
            open={showWorkspaceWizard}
            onClose={handleCloseWorkspaceWizard}
          />
          <DebugModal open={showDebug} onClose={() => setShowDebug(false)} />
          <Box
            sx={{
              display: { xs: 'block', sm: 'none' },
              position: { xs: 'fixed', sm: 'absolute' },
              bottom: 0,
              width: '100%',
              zIndex: 1000,
            }}
          >
            <BarNavigationComponent />
          </Box>
        </Box>
      </StatusProvider>
    </ThemeProvider>
  )
}

export default App
