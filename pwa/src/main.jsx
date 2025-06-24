import { createRoot } from "react-dom/client"
import { createBrowserRouter, Route, RouterProvider, Routes } from "react-router"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import App from "src/App.jsx"
import routes from "src/routes.jsx"
import ProtectedRoute from "src/components/protected_route.component.jsx"
import LoginPage from "src/pages/login.page"

const router = createBrowserRouter([
  {
    path: 'login',
    element: <LoginPage />
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
  <RouterProvider router={router} />
)
