import { useStore } from 'zustand'
import { msg } from '@lingui/core/macro'
import {
  AssignmentInd,
  AssignmentTurnedIn,
  Handyman,
  Map,
  Rocket,
  RocketLaunch,
  Settings,
} from '@mui/icons-material'

import HomePage from './pages/home'
import ChorePage from './pages/chore'
import ConfigPage from './pages/config'
import { routes as configRoutes } from './pages/config/config'
import useConfigStore from './stores/config.store'
import MapPage from './pages/map'

const routes = [
  {
    key: 'home',
    type: 'link',
    icon: <AssignmentTurnedIn />,
    title: msg`Tasks`,
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
    title: msg`Chores`,
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
    key: 'map',
    type: 'link',
    icon: <Map />,
    title: msg`Map`,
    path: '/map',
    element: <MapPage />,
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
    title: msg`Advanced`,
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
