import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { TransitionGroup } from 'react-transition-group'
import { useShallow } from 'zustand/react/shallow'
import { Box, Card, CardActionArea, CardContent, Collapse, Divider, Grid, Stack, Typography } from '@mui/material'

import useAssignedStore from 'src/stores/assigned.store'
import useAuthStore from 'src/stores/auth.store'
import useConfigStore from 'src/stores/config.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import { useStatus } from 'src/providers/status.provider'

const stages = [
  { key: 'pending', label: 'Pra Fazer' },
  { key: 'doing', label: 'Fazendo' },
  { key: 'done', label: 'Feito' },
  { key: 'cancelled', label: 'Cancelado' },
]

function AssignedPage() {
  const [localAssignments, setLocalAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const { fetchAssignments } = useAssignedStore()
  const { user } = useAuthStore()
  const { assignments } = useAssignedStore(
    useShallow((state) => ({ assignments: state.assignments }))
  )
  const { categories } = useConfigStore()
  const { workspace } = useWorkspaceStore()

  const { showStatus, showError } = useStatus()

  const [searchParams] = useSearchParams()
  const currentCategory = searchParams.get('category')

  useEffect(() => {
    setLocalAssignments(assignments)
  }, [assignments])

  useEffect(() => {
    if (workspace) {
      setIsLoading(true)
      fetchAssignments(workspace, user)
        .then(() => {
          showStatus({
            slug: 'fetch-assignment',
            title: 'Sucesso ao carregar afazeres',
          })
        })
        .catch((error) => {
          console.error(error)
          showError({
            slug: 'fetch-assignment-error',
            title: 'Error ao buscar tarefas',
            description: error,
          })
          setIsLoading(false)
        })
    }
  }, [workspace, user, fetchAssignments, showStatus, showError])

  const filteredAssignments = useMemo(() => {
    return currentCategory
      ? localAssignments.filter((assigned) => assigned.chore.category_key === currentCategory)
      : localAssignments
  }, [localAssignments, currentCategory])

  const emojiMap = useMemo(() => {
    return categories.reduce((map, cat) => {
      map[cat.key] = cat.emoji
      return map
    }, {})
  }, [categories])

  return (
    <Stack>
      <Typography variant="h4" gutterBottom>
        Afazeres {currentCategory ? `(${currentCategory})` : ''}
      </Typography>
      <Grid container spacing={2}>
        {stages.map((stage) => (
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }} key={stage.key}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5">{stage.label}</Typography>
              <Divider sx={{ mb: 2 }} />
              <TransitionGroup component={Stack} spacing={2}>
                {filteredAssignments
                  .filter((assigned) => assigned.status === stage.key)
                  .map((assigned) => (
                    <Collapse key={assigned.id}>
                      <Card key={assigned.id}>
                        <CardActionArea>
                          <CardContent>
                            <Typography variant="body1">
                              {emojiMap[assigned.chore.category_key] || ''} {assigned.chore.title}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Collapse>
                  ))}
              </TransitionGroup>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

export default AssignedPage
