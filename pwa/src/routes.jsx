import { useStore } from "zustand"
import { AssignmentTurnedIn, Settings } from "@mui/icons-material"

import HomePage from "./pages/home"
import useConfigStore from "./stores/config.store"

const routes = [
  {
    key: 'home',
    type: 'link',
    icon: <AssignmentTurnedIn />,
    title: 'Tarefas',
    path: '/',
    element: <HomePage />,
    expandable: true,
  },
  {
    key: 'home-items',
    type: 'menu',
    path: '/',
    query: 'category',
    provider: useStore,
    args: [useConfigStore, (state) => state.categories],
  },
  {
    key: 'home-div',
    type: 'divider',
  },
  {
    key: 'config',
    type: 'link',
    icon: <Settings />,
    title: 'Configurações',
    path: '/config',
    element: <HomePage />,
  },
]

export default routes
