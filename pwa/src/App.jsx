import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router"
import {
  Autocomplete, Box, CssBaseline, Drawer,
  GlobalStyles, IconButton, TextField, ThemeProvider,
  Toolbar, Typography,
} from "@mui/material"
import { Logout, Settings } from "@mui/icons-material"

import NavigationComponent from "src/components/navigation.component"
import { globalStyles, theme, drawerWidth } from "src/theme"
import useWorkspaceStore from "src/stores/workspace.store"
import useConfigStore from "src/stores/config.store"
import WorkspaceWizard from "./wizards/workspace"
import useAuthStore from "./stores/auth.store"

function App() {
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false)

  const navigate = useNavigate()

  const { workspace, workspaces, setWorkspace, fetchWorkspaces } = useWorkspaceStore()
  const { fetchConfig } = useConfigStore()
  const { user, signOut } = useAuthStore()

  useEffect(() => {
    fetchWorkspaces().then((data) => {
      if (!data) {
        setShowWorkspaceWizard(true)
      }
    })
  }, [fetchWorkspaces])

  useEffect(() => {
    if (workspace) {
      fetchConfig(workspace).catch(console.error)
    }
  }, [workspace, fetchConfig])

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

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={globalStyles} />
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <NavigationComponent
            header={
              <Toolbar>
                <Autocomplete
                  value={workspace}
                  onChange={handleChangeWorkspace}
                  options={workspaces}
                  renderInput={(props) => <TextField {...props} label="Projeto" variant="standard" />}
                  fullWidth
                  sx={{ py: 2 }}
                />
              </Toolbar>
            }
            footer={
              <Toolbar>
                <IconButton onClick={handleOpenWorkspaceWizard}><Settings /></IconButton>
                <Box flexGrow={1} />
                <Typography variant='caption'>{user.email}</Typography>
                <Box flexGrow={1} />
                <IconButton onClick={handleSignOut}><Logout /></IconButton>
              </Toolbar>
            }
            value={workspace}
            options={workspaces}
            onChange={setWorkspace}
            label="Projeto"
          />
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
        >
          <Outlet />
        </Box>
        <WorkspaceWizard open={showWorkspaceWizard} onClose={handleCloseWorkspaceWizard} />
      </Box>
    </ThemeProvider>
  )
}

export default App
