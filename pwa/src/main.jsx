import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import App from "./App.jsx"
import routes from "./routes.jsx"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App>
      <Routes>
        {routes.map((route) => (
          <Route path={route.path} element={route.element} />
        ))}
      </Routes>
    </App>
  </BrowserRouter>,
)
