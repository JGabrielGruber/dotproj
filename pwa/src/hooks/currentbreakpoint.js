import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

export const useCurrentBreakpoint = () => {
  const theme = useTheme()

  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const isSm = useMediaQuery(theme.breakpoints.only('sm'))
  const isMd = useMediaQuery(theme.breakpoints.only('md'))
  const isLg = useMediaQuery(theme.breakpoints.only('lg'))

  const currentBreakpoint = isXs
    ? 'xs'
    : isSm
      ? 'sm'
      : isMd
        ? 'md'
        : isLg
          ? 'lg'
          : 'xl'

  return currentBreakpoint
}
