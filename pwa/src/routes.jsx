import { useStore } from "zustand"
import { AssignmentTurnedIn, Rocket, RocketLaunch, Settings } from "@mui/icons-material"

import HomePage from "./pages/home"
import useConfigStore from "./stores/config.store"
import ConfigPage from "./pages/config"
import { routes as configRoutes } from "./pages/config/config"

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
    key: 'config-spacer',
    type: 'spacer',
    path: '/config',
  },
  {
    key: 'config-div',
    type: 'divider',
  },
  {
    key: 'config',
    type: 'link',
    icon: <Rocket />,
    activeIcon: <RocketLaunch />,
    title: 'Avançado',
    path: '/config',
    element: <ConfigPage />,
    expandable: true,
  },
  {
    key: 'config-items',
    type: 'menu',
    path: '/config',
    query: 'item',
    provider: () => configRoutes,
  },
]

export default routes
