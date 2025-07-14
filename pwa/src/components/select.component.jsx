import { useMemo, useCallback } from 'react'
import {
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'

import { useBreakpointValue } from 'src/hooks/currentbreakpoint'

/**
 * A responsive MUI select component that renders Autocomplete on desktop and Select on mobile.
 * @param {Object} props - Component props
 * @param {Array<Object>} props.options - Array of option objects (e.g., [{ name: string, ... }])
 * @param {Object|null} props.value - Selected option object (e.g., { name: string, ... }) or null
 * @param {(event: Event, value: Object|null) => void} props.onChange - Handler for selection changes
 * @param {(option: Object) => string} props.getOptionLabel - Function to get display label from option
 * @param {string} props.label - Label for the input field
 * @param {boolean} props.fullWidth - Whether the select should take up the full width of the container
 * @param {Object} props.sx - Additional styles to apply to the select
 * @param {boolean} props.required - Whether the select should be required
 * @returns {JSX.Element} Autocomplete (desktop) or Select (mobile) component
 */
function ResponsiveSelect({
  options,
  value,
  onChange,
  label,
  getOptionLabel = (option) => option.label,
  fullWidth = false,
  sx,
  required = false,
}) {
  const breakpointValue = useBreakpointValue()
  const selectId = 'responsive-select'
  const labelId = 'responsive-select-label'

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options || [], [options])

  // Memoize onChange to ensure stability
  const handleChange = useCallback(
    (event, newValue) => {
      if (onChange) {
        if (breakpointValue > 2) {
          onChange(event, newValue)
        } else {
          onChange(event, event.target.value)
        }
      }
    },
    [onChange, breakpointValue]
  )

  // Desktop: Autocomplete
  if (breakpointValue > 2) {
    return (
      <Autocomplete
        options={memoizedOptions}
        value={value}
        onChange={handleChange}
        getOptionLabel={getOptionLabel}
        renderInput={(params) => <TextField {...params} label={label} required={required} />}
        fullWidth={fullWidth}
        sx={sx}
      />
    )
  }

  // Mobile: Select with MUI guidelines
  return (
    <FormControl fullWidth={fullWidth} sx={sx}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={selectId}
        value={value || ''} // Handle null value
        label={label}
        onChange={handleChange}
        required={required}
        fullWidth={fullWidth}
      >
        {memoizedOptions.map((option) => (
          <MenuItem key={option.key} value={option}>
            {getOptionLabel(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default ResponsiveSelect
