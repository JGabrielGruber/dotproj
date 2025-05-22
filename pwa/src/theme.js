import { createTheme } from "@mui/material"
import { ptBR } from "@mui/material/locale"

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
  },
  aurora: {
    green: '#A3BE8C', // Secondary actions
    red: '#BF616A', // Errors
    yellow: '#EBCB8B', // Warnings
  },
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
        },
      },
    },
  },
  ptBR,
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
