import { useStore } from 'zustand'
import {
  AssignmentInd,
  AssignmentTurnedIn,
  Handyman,
  Rocket,
  RocketLaunch,
  Settings,
} from '@mui/icons-material'

import HomePage from './pages/home'
import ChorePage from './pages/chore'
import ConfigPage from './pages/config'
import { routes as configRoutes } from './pages/config/config'
import useConfigStore from './stores/config.store'

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
    key: 'chore',
    type: 'link',
    icon: <Handyman />,
    title: 'Afazeres',
    path: '/chore',
    element: <ChorePage />,
    expandable: true,
  },
  {
    key: 'chore-items',
    type: 'menu',
    path: '/chore',
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
