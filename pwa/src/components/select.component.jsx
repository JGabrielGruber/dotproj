import React, { useMemo, useCallback } from 'react'
import {
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'

import { useBreakpointValue } from 'src/hooks/currentbreakpoint'

const MobileSelect = React.memo(
  ({
    name,
    options,
    value,
    onChange,
    label,
    fullWidth,
    required,
    sx,
    getOptionLabel,
    getOptionValue,
  }) => (
    <FormControl fullWidth={fullWidth} sx={sx} required={required}>
      <InputLabel id="select-label">{label}</InputLabel>
      <Select
        labelId="select-label"
        id="select-id"
        name={name}
        value={value}
        label={label}
        onChange={onChange}
        fullWidth={fullWidth}
      >
        {(!required || !value) && (
          <MenuItem value="">
            <em>-</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
)

/**
 * A responsive MUI select component that renders Autocomplete on desktop and Select on mobile.
 * @param {Object} props - Component props
 * @param {string} props.name - Input name
 * @param {Array<Object>} props.options - Array of option objects (e.g., [{ name: string, id: 1 }])
 * @param {Object|null} props.value - Selected option object (e.g., { name: string, id: 1 }) or null
 * @param {(event: Event, value: Object|null) => void} props.onChange - Handler for selection changes
 * @param {(option: Object) => string} props.getOptionLabel - Function to get display label from option
 * @param {(option: Object) => any} [props.getOptionValue] - Function to get the primitive value from an option for MUI Select's internal use (defaults to option.id or option.value)
 * @param {string} props.label - Label for the input field
 * @param {boolean} props.fullWidth - Whether the select should take up the full width of the container
 * @param {Object} props.sx - Additional styles to apply to the select
 * @param {boolean} props.required - Whether the select should be required
 * @returns {JSX.Element} Autocomplete (desktop) or Select (mobile) component
 */
function ResponsiveSelect({
  name,
  options,
  value,
  onChange,
  label,
  getOptionLabel = (option) => option.label,
  getOptionValue = (option) => option.id || option.value,
  fullWidth = false,
  sx,
  required = false,
}) {
  const breakpointValue = useBreakpointValue()

  const memoizedOptions = useMemo(() => options || [], [options])

  const handleChange = useCallback(
    (event, newValue) => {
      if (onChange) {
        if (breakpointValue > 2) {
          onChange(event, newValue)
        } else {
          const selectedPrimitiveValue = event.target.value
          const selectedOption = memoizedOptions.find(
            (option) => getOptionValue(option) === selectedPrimitiveValue
          )
          onChange(event, selectedOption || null)
        }
      }
    },
    [onChange, breakpointValue, memoizedOptions, getOptionValue]
  )

  const selectValue = useMemo(() => {
    if (breakpointValue <= 2 && value) {
      return getOptionValue(value)
    }
    return ''
  }, [breakpointValue, value, getOptionValue])

  if (breakpointValue > 2) {
    return (
      <Autocomplete
        options={memoizedOptions}
        value={value}
        onChange={handleChange}
        getOptionLabel={getOptionLabel}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            label={label}
            required={required}
          />
        )}
        fullWidth={fullWidth}
        sx={sx}
      />
    )
  }

  return (
    <MobileSelect
      name={name}
      options={memoizedOptions}
      value={selectValue}
      onChange={handleChange}
      label={label}
      fullWidth={fullWidth}
      required={required}
      sx={sx}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
    />
  )
}

export default ResponsiveSelect
