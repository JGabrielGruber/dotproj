import { Backdrop, CircularProgress, Paper, ThemeProvider } from "@mui/material"
import { GlobalStyles } from "@mui/styled-engine"
import { Navigate, Outlet } from "react-router"

import useAuthStore from "src/stores/auth.store"
import { theme } from "src/theme"

function ProtectedRoute() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Paper elevation={24} sx={{ width: '100vw', height: '100vh' }}>
          <Backdrop open>
            <CircularProgress color="primary" disableShrink />
          </Backdrop>
        </Paper>
      </ThemeProvider>
    ) // Show a loading state while checking auth
  }

  if (!user) {
    return (<Navigate to="/login" replace />) // Redirect to login if not authenticated
  }

  return (<Outlet />) // Render child routes if authenticated
}

export default ProtectedRoute
