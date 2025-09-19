import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router'
import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'

import useProcessStore from 'src/stores/process.store'
import useWorkspaceStore from 'src/stores/workspace.store'
import useFuzzySearch from 'src/hooks/fuzzysearch'

const options = { keys: ['id', 'title', 'description'] }

function FormPage() {
  const { workspace } = useWorkspaceStore()
  const { processes, fetchProcesses } = useProcessStore()

  const { results, search } = useFuzzySearch(processes, options)

  const location = useLocation()

  useEffect(() => {
    fetchProcesses(workspace)
  }, [workspace, fetchProcesses])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const query = searchParams.get('q')
    if (query) {
      search(query)
    } else {
      search('')
    }
  }, [location, search])

  console.log(results)

  return (
    <Stack>
      <Typography variant="h4" gutterBottom>
        Formulários
      </Typography>
      <Grid container>
        {results &&
          results.map((item) => (
            <Grid
              key={item.id}
              size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
              sx={{ width: '100%' }}
            >
              <Card>
                <CardActionArea>
                  <CardContent>
                    <Typography>{item.title}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Stack>
  )
}

export default FormPage
