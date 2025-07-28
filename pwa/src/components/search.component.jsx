import { useEffect, useMemo, useState, useCallback } from "react"
import { useLocation, useNavigate } from "react-router"
import { Close, Search } from "@mui/icons-material"
import { IconButton, Input, InputAdornment, Paper, Stack, TextField } from "@mui/material"

function SearchComponent() {
  const [query, setQuery] = useState("")

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const q = queryParams.get('q')
    if (q) {
      setQuery(q)
    } else {
      setQuery('')
    }
  }, [location])

  const handleChange = (e) => {
    setQuery(e.target.value)
  }

  const handleClear = (e) => {
    e.preventDefault()
    setQuery('')
    const searchParams = new URLSearchParams(location.search)
    searchParams.delete('q')
    navigate(`${location.pathname}?${searchParams.toString()}`)
  }

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const searchParams = new URLSearchParams(location.search)
    if (!query || query === '') {
      searchParams.delete('q')
    } else {
      searchParams.set('q', query)
    }
    navigate(`${location.pathname}?${searchParams.toString()}`)
  }, [location, navigate, query])

  return (
    <Stack alignItems="center" direction="row" component="form" onSubmit={handleSubmit}>
      <Input
        placeholder="Busca"
        variant="standard"
        onChange={handleChange}
        value={query}
        endAdornment={query !== '' && (
          <InputAdornment position="end">
            <IconButton onClick={handleClear}><Close /></IconButton>
          </InputAdornment>
        )}
      />
      <IconButton edge="end" type="submit" ><Search /></IconButton>
    </Stack>
  )
}

export default SearchComponent

