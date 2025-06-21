import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import App from "src/App.jsx"
import routes from "src/routes.jsx"
import ProtectedRoute from "src/components/protected_route.component.jsx"
import LoginPage from "src/pages/login.page"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<App />}>
          {routes.map((route) => (
            <Route path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>,
)
