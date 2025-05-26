import { Backdrop, CircularProgress } from "@mui/material"
import { Navigate, Outlet } from "react-router"

import useAuthStore from "src/stores/auth.store"

function ProtectedRoute() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <Backdrop open>
        <CircularProgress color="primary" />
      </Backdrop>
    ) // Show a loading state while checking auth
  }

  if (!user) {
    return (<Navigate to="/login" replace />) // Redirect to login if not authenticated
  }

  return (<Outlet />) // Render child routes if authenticated
}

export default ProtectedRoute
