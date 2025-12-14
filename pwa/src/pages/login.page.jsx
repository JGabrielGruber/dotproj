import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  Assignment,
  Google,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Collapse,
  Container,
  CssBaseline,
  Divider,
  Fade,
  FormControl,
  FormLabel,
  GlobalStyles,
  Link,
  MobileStepper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material'

import useAuthStore from 'src/stores/auth.store'
import { globalStyles, theme } from 'src/theme'
import { renderGoogleButton } from 'src/utils/google'

const steps = 5

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { t: _ } = useLingui()

  const [step, setStep] = useState(0)

  const navigate = useNavigate()
  const { signInWithEmail, signInWithGoogle, initGoogleAuth } = useAuthStore()
  const { google } = window

  useEffect(() => {
    if (google) {
      initGoogleAuth(() => navigate('/'))
      renderGoogleButton('google-login')
    }
  }, [initGoogleAuth, navigate, google])

  useEffect(() => {
    // animate steps every 5 seconds
    const interval = setInterval(() => {
      if (step === steps - 1) {
        setStep(0)
      } else {
        setStep((step) => step + 1)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [step])

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

  const Media = (_, index) => (
    <Fade in={step === index} timeout={500}>
      <CardMedia
        key={index}
        component="img"
        image={`/assets/dotproj.com_${index}.png`}
        width="auto"
        sx={{
          objectFit: 'contain',
          height: '70vh',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </Fade>
  )

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={globalStyles} />
      <CssBaseline />
      <Stack
        alignItems="center"
        justifyItems="center"
        justifyContent="center"
        flexDirection="row"
        sx={{ minHeight: '100vh' }}
      >
        <Container maxWidth="lg" sx={{ display: { xs: 'none', sm: 'block' } }}>
          <CardContent>
            <Box position="relative" height="70vh">
              {Array(steps).fill(0).map(Media)}
            </Box>
            <MobileStepper
              variant="dots"
              steps={steps}
              activeStep={step}
              position="static"
              backButton={
                <Button
                  size="small"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 0}
                >
                  <KeyboardArrowLeft />
                  <Trans>Previous</Trans>
                </Button>
              }
              nextButton={
                <Button
                  size="small"
                  onClick={() => setStep(step + 1)}
                  disabled={step === steps - 1}
                >
                  <KeyboardArrowRight />
                  <Trans>Next</Trans>
                </Button>
              }
            />
          </CardContent>
        </Container>
        <Container maxWidth="xs">
          <Card component="form" onSubmit={handleLogin}>
            <CardContent>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4">
                  <Assignment />
                  <b>DotProj</b>
                </Typography>
                <Typography variant="body2">
                  <Trans>Sign-in to continue.</Trans>
                </Typography>
              </Box>
              <Stack spacing={2}>
                <div id="google-login"><Trans>Access with Google</Trans></div>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Stack>
      <Box
        alignItems="center"
        justifyItems="center"
        position="fixed"
        bottom={0}
        width="100%"
      >
        <Typography color="textDisabled" variant="h6">
          <Link
            href="https://github.com/JGabrielGruber/dotproj"
            target="_blank"
            rel="noopener"
          >
            dotproj
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
    </ThemeProvider>
  )
}

export default LoginPage
