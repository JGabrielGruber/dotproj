import { Box, CssBaseline, Drawer, GlobalStyles, ThemeProvider } from "@mui/material"

import NavigationComponent from "./components/navigation.component"
import { globalStyles, theme, drawerWidth } from "./theme"

function App({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={globalStyles} />
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <NavigationComponent />
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
