import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { Container, Fade, Grid, Paper, Stack, Typography } from "@mui/material"
import { LineChart, PieChart } from "@mui/x-charts"

import useTaskStore from "src/stores/task.store"
import useConfigStore from "src/stores/config.store"

import { routes } from "./config"
import configs from "./configs/"
import { chartColors } from 'src/theme'

function DefaultConfig() {
  const [tasksByCategory, setTasksByCategory] = useState([])
  const [tasksByStage, setTasksByStage] = useState([])
  const [tasksCreatedPerDay, setTasksCreatedPerDay] = useState([])
  const [tasksUpdatedPerDay, setTasksUpdatedPerDay] = useState([])
  const [tasksPerDay, setTasksPerDay] = useState([])

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

    days.sort((a, b) => new Date(b) - new Date(a));

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
    <Grid container spacing={4} padding={4}>
      <Grid size={12}>
        <Typography variant="h5" fontWeight="bold">Relatório de Tarefas</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <PieChart
          colors={chartColors.nordChartPalette}
          series={[{ data: tasksByStage, },]}
          width={200}
          height={200}
        />
      </Grid>
      <Grid size={12}>
        <LineChart
          colors={chartColors.nordChartPalette}
          height={300}
          series={[
            { data: tasksCreatedPerDay, label: 'Criadas' },
            { data: tasksUpdatedPerDay, label: 'Atualizadas' }
          ]}
          xAxis={[{
            scaleType: 'point', data: tasksPerDay
          }]}
        />
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
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Avançado {currentRoute ? `- ${currentRoute.label}` : ''}
        </Typography>
        <Fade
          in={true}
          timeout={300}
          key={currentRoute?.key || "default"}
        >
          <Paper>
            <CurrentConfig />
          </Paper>
        </Fade>
      </Container>
    </Stack>
  )
}

export default ConfigPage
