import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from 'react-router'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import App from 'src/App.jsx'
import routes from 'src/routes.jsx'
import ProtectedRoute from 'src/components/protected_route.component.jsx'
import LoginPage from 'src/pages/login.page'
import { initDebug } from 'src/utils/debug'

import { messages as enMessages } from 'src/locales/en/messages'
import { messages as ptMessages } from 'src/locales/pt-BR/messages'

i18n.load({
  en: enMessages,
  'en-US': enMessages,
  'pt-BR': ptMessages,
})

i18n.activate(navigator.language || navigator.userLanguage)

const router = createBrowserRouter([
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <App />,
        children: routes.filter((route) => route.type === 'link'),
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <I18nProvider i18n={i18n}>
    <RouterProvider router={router} />
  </I18nProvider>
)
