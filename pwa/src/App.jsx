import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router"
import {
  AppBar,
  Autocomplete, Box, CssBaseline, Drawer,
  GlobalStyles, IconButton, Link, Stack, SwipeableDrawer, TextField, ThemeProvider,
  Toolbar, Typography,
} from "@mui/material"
import { Logout, Settings, Menu, RocketLaunch, Rocket } from "@mui/icons-material"

import NavigationComponent from "src/components/navigation.component"
import { globalStyles, theme, drawerWidth } from "src/theme"
import useWorkspaceStore from "src/stores/workspace.store"
import useConfigStore from "src/stores/config.store"
import WorkspaceWizard from "src/wizards/workspace"
import useAuthStore from "src/stores/auth.store"
import { StatusProvider } from "./providers/status.provider"

import "src/ws"

function App() {
  const [showDrawer, setShowDrawer] = useState(false)
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false)

  const navigate = useNavigate()

  const { workspace, workspaces, setWorkspace, fetchWorkspaces } = useWorkspaceStore()
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

  const drawer = (
    <NavigationComponent
      header={
        <Toolbar>
          <Autocomplete
            value={workspace}
            onChange={handleChangeWorkspace}
            options={workspaces}
            renderInput={(props) => <TextField {...props} label="Projeto" variant="standard" />}
            fullWidth
            sx={{ py: 4 }}
          />
        </Toolbar>
      }
      footer={
        <Toolbar>
          <IconButton onClick={handleOpenWorkspaceWizard}>
            <Settings />
          </IconButton>
          <Box flexGrow={1} />
          <Typography variant='caption' sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {user.email}
          </Typography>
          <Box flexGrow={1} />
          <IconButton onClick={handleSignOut}><Logout /></IconButton>
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
            </Toolbar>
          </AppBar>
          <SwipeableDrawer
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
            onOpen={handleToggleDrawer}
            slotProps={{
              root: {
                keepMounted: true, // Better open performance on mobile.
              },
            }}
          >
            {drawer}
          </SwipeableDrawer>
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
            paddingTop={{ xs: 4, sm: 2 }}
            paddingBottom={{ xs: 0, sm: 2 }}
            minHeight="100vh"
          >
            <Outlet />
            <Box alignItems="center" justifyItems="center" marginLeft={{ xs: 0, sm: `-${drawerWidth}px` }}>
              <Typography color="textDisabled" variant="h6">
                <Link href="https://github.com/JGabrielGruber/dotproj" target="_blank" rel="noopener">
                  dotproj
                </Link>
                {' '}
                by
                {' '}
                <Link href="https://jgabrielgruber.dev" target="_blank" rel="noopener">
                  @JGabrielGruber
                </Link>
              </Typography>
            </Box>
          </Stack>
          <WorkspaceWizard open={showWorkspaceWizard} onClose={handleCloseWorkspaceWizard} />
        </Box>
      </StatusProvider>
    </ThemeProvider>
  )
}

export default App
