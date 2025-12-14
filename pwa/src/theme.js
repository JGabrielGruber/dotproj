import { createTheme } from '@mui/material'

// Nord palette
const nord = {
  polarNight: {
    darkest: '#2E3440', // Backgrounds (dark mode)
    dark: '#3B4252', // Surfaces
    medium: '#434C5E', // Subtle borders
    light: '#4C566A', // Text secondary
  },
  snowStorm: {
    light: '#ECEFF4', // Backgrounds (light mode)
    medium: '#E5E9F0', // Surfaces
    dark: '#D8DEE9', // Subtle borders
  },
  frost: {
    primary: '#88C0D0', // Primary actions
    dark: '#5E81AC', // Hover states
    light: '#8fbcbb', // Info
  },
  aurora: {
    green: '#A3BE8C', // Secondary actions
    red: '#BF616A', // Errors
    yellow: '#EBCB8B', // Warnings
  },
}

export const chartColors = {
  // A set of colors for chart series, derived from Nord
  nordChartPalette: [
    nord.frost.primary, // Primary blue
    nord.aurora.green, // Green for secondary/success
    nord.aurora.yellow, // Yellow for warnings
    nord.aurora.red, // Red for errors
    nord.frost.dark, // Darker blue
    nord.aurora.orange, // Orange
    nord.aurora.purple, // Purple
    nord.polarNight.medium, // A neutral for subtle series
    nord.snowStorm.dark, // Another neutral for subtle series
    nord.frost.light, // Lighter blue-green
    nord.frost.frost1, // Another frost variation
  ],
}

/**
 * MUI theme for DotProj with Nord-inspired colors
 * @type {import('@mui/material').Theme}
 */
export const theme = createTheme(
  {
    colorSchemes: {
      dark: {
        palette: {
          mode: 'dark',
          primary: {
            main: nord.frost.primary, // #88C0D0
            dark: nord.frost.dark, // #5E81AC
            contrastText: nord.polarNight.darkest, // #2E3440
          },
          secondary: {
            main: nord.aurora.green, // #A3BE8C
            contrastText: nord.polarNight.darkest,
          },
          background: {
            default: nord.polarNight.darkest, // #2E3440
            paper: nord.polarNight.dark, // #3B4252
          },
          text: {
            primary: nord.snowStorm.light, // #ECEFF4
            secondary: nord.snowStorm.medium, // #4C566A
          },
          error: {
            main: nord.aurora.red, // #BF616A
          },
          warning: {
            main: nord.aurora.yellow, // #EBCB8B
          },
          info: {
            main: nord.frost.light,
          },
        },
      },
      light: {
        palette: {
          mode: 'light',
          primary: {
            main: nord.frost.primary, // #88C0D0
            dark: nord.frost.dark, // #5E81AC
            contrastText: nord.polarNight.darkest, // #2E3440
          },
          secondary: {
            main: nord.aurora.green, // #A3BE8C
            contrastText: nord.polarNight.darkest,
          },
          background: {
            default: nord.snowStorm.light, // #ECEFF4
            paper: nord.snowStorm.medium, // #E5E9F0
          },
          text: {
            primary: nord.polarNight.darkest, // #2E3440
            secondary: nord.polarNight.medium, // #434C5E
          },
          error: {
            main: nord.aurora.red, // #BF616A
          },
          warning: {
            main: nord.aurora.yellow, // #EBCB8B
          },
          info: {
            main: nord.frost.light,
          },
        },
      },
    },
  }
)

/**
 * Global styles for scrollbar and text selection
 */
export const globalStyles = {
  // Scrollbar styles (WebKit browsers: Chrome, Edge, Safari)
  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '::-webkit-scrollbar-track': {
    backgroundColor: nord.polarNight.medium, // #434C5E
    borderRadius: '4px',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: nord.frost.primary, // #88C0D0
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: nord.frost.dark, // #5E81AC
    },
  },
  // Scrollbar fallback for Firefox
  html: {
    scrollbarWidth: 'thin',
    scrollbarColor: `${nord.frost.primary} ${nord.polarNight.medium}`,
  },
  // Text selection styles
  '::selection': {
    backgroundColor: nord.aurora.green, // #A3BE8C
    color: nord.polarNight.darkest, // #2E3440
  },
  '::-moz-selection': {
    backgroundColor: nord.aurora.green, // #A3BE8C
    color: nord.polarNight.darkest, // #2E3440
  },
}

export const drawerWidth = 240
