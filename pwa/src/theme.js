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
  extra: {
    orange: ''
  },
}

export const chartColors = {
  nordChartPalette: [
    // Core / "normal" variations – similar saturation to original Nord Aurora + Frost
    '#81A1C1',   // nord9   – slightly darker blue
    '#88C0D0',   // nord8   – blue / cyan
    '#A3BE8C',   // nord14  – green
    '#EBCB8B',   // nord13  – yellow
    '#D08770',   // nord12  – orange / peach
    '#BF616A',   // nord11  – red
    '#B48EAD',   // nord15  – purple
    '#8FBCBB',   // nord7   – teal / cyan (lighter blue-green)
    '#5E81AC',   // nord10  – deep blue

    // Lighter tints (increased lightness, still muted)
    '#A0D4E2',   // lighter blue
    '#B9D7B2',   // lighter green
    '#F0DDB0',   // lighter yellow
    '#E0A68A',   // lighter orange
    '#D69FA5',   // lighter red
    '#C9B0C5',   // lighter purple
    '#B1D4D3',   // lighter teal
    '#8CA1C9',   // lighter deep blue
    '#9BB3D9',   // extra light blue variant

    // Darker shades (decreased lightness, still pastel-like)
    '#6FAAB8',   // darker blue
    '#6A8FA1',   // darker teal-blue
    '#8AA978',   // darker green
    '#D0B070',   // darker yellow
    '#B87660',   // darker orange
    '#A14F58',   // darker red
    '#9A7495',   // darker purple
    '#6F9C9B',   // darker teal
    '#4C6A8F',   // darker deep blue
  ],
};

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
