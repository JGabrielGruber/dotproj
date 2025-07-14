import { useEffect, useState } from 'react'
import { Link as RouteLink, useSearchParams } from 'react-router'
import {
  Box,
  Breadcrumbs,
  Container,
  DialogTitle,
  Fade,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { LineChart, PieChart } from '@mui/x-charts'

import useTaskStore from 'src/stores/task.store'
import useConfigStore from 'src/stores/config.store'

import { routes } from './config'
import configs from './configs/'
import { chartColors } from 'src/theme'
import { useCurrentBreakpoint } from 'src/hooks/currentbreakpoint'
import { MenuNavigationComponent } from 'src/components/bar_navigation.component'
import { useMemo } from 'react'

function DashboardConfig() {
  const [tasksByCategory, setTasksByCategory] = useState([])
  const [tasksByStage, setTasksByStage] = useState([])
  const [tasksCreatedPerDay, setTasksCreatedPerDay] = useState([])
  const [tasksUpdatedPerDay, setTasksUpdatedPerDay] = useState([])
  const [tasksPerDay, setTasksPerDay] = useState([])

  const currentBreakpoint = useCurrentBreakpoint()
  const theme = useTheme()

  const { tasks } = useTaskStore()
  const { categories, stages } = useConfigStore()

  useEffect(() => {
    const tbc = [{ id: 'null', value: 0, label: 'Sem Categoria' }]
    const tbc_ids = { null: 0 }
    categories.forEach(({ key, label }, index) => {
      tbc.push({ id: key, value: 0, label })
      tbc_ids[key] = index + 1
    })

    const tbs = [{ id: 'null', value: 0, label: 'Sem Etapa' }]
    const tbs_ids = { null: 0 }
    stages.forEach(({ key, label }, index) => {
      tbs.push({ id: key, value: 0, label })
      tbs_ids[key] = index + 1
    })

    const tcpd = {}
    const tupd = {}
    const tpd = {}

    tasks.forEach(({ category_key, stage_key, created_at, updated_at }) => {
      let index = tbc_ids[category_key] || 0
      tbc[index].value = tbc[index].value + 1
      index = tbs_ids[stage_key]
      tbs[index].value = tbs[index].value + 1
      let dayCreated = new Date(created_at).toLocaleDateString('en-CA')
      tpd[dayCreated] = null
      let dayUpdated = new Date(updated_at).toLocaleDateString('en-CA')
      tpd[dayUpdated] = null
      tcpd[dayCreated] = tcpd[dayCreated] + 1 || 1
      tupd[dayUpdated] = tupd[dayUpdated] + 1 || 1
    })

    let days = Object.keys(tpd)

    days.sort((a, b) => new Date(b) - new Date(a))

    const cpd = []
    const upd = []
    days.forEach((day) => {
      cpd.push(tcpd[day] || 0)
      upd.push(tupd[day] || 0)
    })

    setTasksByCategory(tbc)
    setTasksByStage(tbs)
    setTasksCreatedPerDay(cpd)
    setTasksUpdatedPerDay(upd)
    setTasksPerDay(days)
  }, [tasks, categories, stages])

  return (
    <Box>
      <DialogTitle>
        <Typography variant="body1">Relatório de Tarefas</Typography>
      </DialogTitle>
      <Paper elevation={0} variant="outlined" sx={{ backgroundColor: theme.palette.background.default }}>
        <Grid container spacing={4} padding={4} justifyContent="start">
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <PieChart
              colors={chartColors.nordChartPalette}
              series={[{ data: tasksByStage }]}
              width={currentBreakpoint == 'xs' ? 100 : 200}
              height={currentBreakpoint == 'xs' ? 100 : 200}
            />
          </Grid>
          <Grid size={12}>
            <LineChart
              colors={chartColors.nordChartPalette}
              height={currentBreakpoint == 'xs' ? 200 : 300}
              series={[
                { data: tasksCreatedPerDay, label: 'Criadas' },
                { data: tasksUpdatedPerDay, label: 'Atualizadas' },
              ]}
              xAxis={[
                {
                  scaleType: 'point',
                  data: tasksPerDay,
                },
              ]}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

function MenuConfig() {
  return <MenuNavigationComponent />
}

const BreadLink = ({ to, label, current }) => (
  <Link component={RouteLink} to={to} underline="hover" color="inherit">
    <Typography variant={current ? 'h5' : 'body2'} gutterBottom>
      {label}
    </Typography>
  </Link>
)

function ConfigPage() {
  const [currentRoute, setCurrentRoute] = useState(null)
  const [CurrentConfig, setCurrentConfig] = useState(
    () => MenuNavigationComponent
  )

  const currentBreakpoint = useCurrentBreakpoint()

  const DefaultConfig = useMemo(
    () =>
      currentBreakpoint == 'xs' ? MenuNavigationComponent : DashboardConfig,
    [currentBreakpoint]
  )

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
  }, [searchParams, DefaultConfig])

  return (
    <Stack>
      <Container maxWidth="xl">
        <Breadcrumbs>
          <BreadLink to="/config" label="Avançado" current={!currentRoute} />
          {currentRoute && (
            <BreadLink
              to={`/config?item=${currentRoute.key}`}
              label={currentRoute.label}
              current
            />
          )}
        </Breadcrumbs>
        <Fade in={true} timeout={300} key={currentRoute?.key || 'default'}>
          <Paper>
            <CurrentConfig />
          </Paper>
        </Fade>
      </Container>
    </Stack>
  )
}

export default ConfigPage
