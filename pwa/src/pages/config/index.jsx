import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { Container, Grid, Paper, Stack, Typography } from "@mui/material"

import { routes } from "./config"
import configs from "./configs/"

function DefaultConfig() {
  return (
    <Grid container spacing={4} padding={4}>
      <Grid>
        <Typography>Bem vindo as configurações</Typography>
      </Grid>
    </Grid>
  )
}

function ConfigPage() {

  const [currentRoute, setCurrentRoute] = useState(null)
  const [CurrentConfig, setCurrentConfig] = useState(() => DefaultConfig)

  const [searchParams] = useSearchParams()

  useEffect(() => {
    const item = searchParams.get('item')
    if (item) {
      routes.forEach((route) => {
        if (route.key === item) {
          setCurrentRoute(route)
          setCurrentConfig(() => configs[item] || DefaultConfig)
          return true
        }
        return false
      })
    } else {
      setCurrentRoute(null)
      setCurrentConfig(() => DefaultConfig)
    }
  }, [searchParams])

  return (
    <Stack>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Avançado {currentRoute ? `- ${currentRoute.label}` : ''}
        </Typography>
        <Paper>
          <CurrentConfig />
        </Paper>
      </Container>
    </Stack>
  )
}

export default ConfigPage
