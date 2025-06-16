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

  useEffect(() => {
    initGoogleAuth(() => navigate('/'))
    renderGoogleButton('google-login')
  }, [initGoogleAuth, navigate])

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
                <Button onClick={handleLoginOauth} startIcon={<Google />} variant="outlined">Acessar com Google</Button>
                <div id="google-login">Google</div>
                <Divider />
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <TextField
                    disabled
                    name="email"
                    type="email"
                    placeholder="josivaldo@email.com"
                    required
                    value={email}
                    onChange={handleChangeEmail}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Senha</FormLabel>
                  <TextField
                    disabled
                    name="password"
                    type="password"
                    placeholder="senha123"
                    required
                    value={password}
                    onChange={handleChangePassword}
                  />
                </FormControl>
              </Stack>
            </CardContent>
            <CardActions>
              <Button onClick={handleLogin} fullWidth variant="contained" type="submit">Acessar com email</Button>
            </CardActions>
          </Card>
        </Container>
      </Stack>
    </ThemeProvider>
  )
}

export default LoginPage
