import { Google } from "@mui/icons-material"
import {
  Box, Button, Card, CardActions, CardContent, Container, CssBaseline, Divider, FormControl,
  FormLabel, GlobalStyles, Stack, TextField, ThemeProvider, Typography
} from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import useAuthStore from "src/stores/auth.store"
import { globalStyles, theme } from "src/theme"
import { renderGoogleButton } from "src/utils/google"


function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { signInWithEmail, signInWithGoogle, initGoogleAuth } = useAuthStore()
  const { google } = window

  useEffect(() => {
    if (google) {
      initGoogleAuth(() => navigate('/'))
      renderGoogleButton('google-login')
    }
  }, [initGoogleAuth, navigate, google])

  const handleChangeEmail = (event) => {
    setEmail(event.target.value)
  }

  const handleChangePassword = (event) => {
    setPassword(event.target.value)
  }

  const handleLogin = (event) => {
    event.preventDefault()
    signInWithEmail({ email, password })
  }

  const handleLoginOauth = (event) => {
    event.preventDefault()
    signInWithGoogle()
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={globalStyles} />
      <CssBaseline />
      <Stack alignItems="center" flexDirection="row" sx={{ minHeight: '100vh' }}>
        <Container maxWidth="sm">
          <Card component="form" onSubmit={handleLogin}>
            <CardContent>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4">
                  <b>Bem vindo!</b>
                </Typography>
                <Typography variant="body2">Identifique-se para continuar.</Typography>
              </Box>
              <Stack spacing={2}>
                <div id="google-login">Acessar com Google</div>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Stack>
    </ThemeProvider>
  )
}

export default LoginPage
