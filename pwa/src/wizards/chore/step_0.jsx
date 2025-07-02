import { Autocomplete, Box, Grid, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import useConfigStore from "src/stores/config.store"
import useChoreStore from "src/stores/chore.store"
import useWorkspaceStore from "src/stores/workspace.store"

function StepChore({ onSubmit, onError }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(null)
  const [description, setDescription] = useState('')

  const { categories } = useConfigStore()
  const { chore, addChore, updateChore, setChore } = useChoreStore()
  const { workspace } = useWorkspaceStore()

  useEffect(() => {
    setTitle(chore?.title || '')
    setCategory(categories.find((category) => category.key === chore?.category_key) || null)
    setDescription(chore?.description || '')
  }, [chore, categories])

  const handleSubmit = (event) => {
    event.preventDefault()

    const data = {
      title,
      category_key: category?.key,
      description,
    }

    if (chore) {
      updateChore(workspace, chore.id, data)
        .then(() => {
          setChore(chore.id)
          onSubmit()
        })
        .catch(onError)
    } else {
      addChore(workspace, data)
        .then(onSubmit)
        .catch(onError)
    }
  }

  const handleChangeTitle = (event) => {
    setTitle(event.target.value)
  }

  const handleChangeCategory = (event, value) => {
    event.preventDefault()
    setCategory(value)
  }

  const handleChangeDescription = (event) => {
    setDescription(event.target.value)
  }

  return (
    <Box component="form" id="step-form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="title"
            label="Título do Afazer"
            placeholder="Conferir Relatórios"
            value={title}
            onChange={handleChangeTitle}
            maxRows={1}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            name="category"
            options={categories}
            value={category}
            onChange={handleChangeCategory}
            renderInput={(params) => <TextField {...params} label="Categoria" />}
            fullWidth
          />
        </Grid>
        <Grid size={12}>
          <TextField
            name="description"
            label="Descrição"
            placeholder="Acessar o relatório através do painel Avançado do dotproj, conferir as atividades realizadas no dia e analisar a criação de mais tarefas."
            value={description}
            onChange={handleChangeDescription}
            multiline
            minRows={8}
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default StepChore
