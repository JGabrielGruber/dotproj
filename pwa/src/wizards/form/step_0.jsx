import { Autocomplete, Box, Grid, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import useConfigStore from 'src/stores/config.store'
import useFormStore from 'src/stores/form.store'
import useWorkspaceStore from 'src/stores/workspace.store'

function StepForm({ onSubmit, onError }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(null)
  const [description, setDescription] = useState('')

  const { categories } = useConfigStore()
  const { form, addForm, updateForm, setForm } = useFormStore()
  const { workspace } = useWorkspaceStore()

  useEffect(() => {
    setTitle(form?.title || '')
    setCategory(
      categories.find((category) => category.key === form?.category_key) || null
    )
    setDescription(form?.description || '')
  }, [form, categories])

  const handleSubmit = (event) => {
    event.preventDefault()

    const data = {
      title,
      category_key: category?.key,
      description,
      fields: form?.fields || {},
      workspace: workspace.id,
    }

    if (form) {
      updateForm(workspace, form.id, data)
        .then(() => {
          setForm(form.id)
          onSubmit()
        })
        .catch(onError)
    } else {
      addForm(data).then(onSubmit).catch(onError)
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
            label="Título do Formulário"
            placeholder="Venda de boi"
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
            renderInput={(params) => (
              <TextField {...params} label="Categoria" />
            )}
            fullWidth
          />
        </Grid>
        <Grid size={12}>
          <TextField
            name="description"
            label="Descrição"
            placeholder="Formulário para cadastro de movimentação de venda de boi."
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

export default StepForm
