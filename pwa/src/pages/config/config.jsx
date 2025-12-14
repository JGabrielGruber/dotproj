import { msg } from '@lingui/core/macro'
import {
  Assignment,
  AssignmentInd,
  AssignmentTurnedIn,
  Attachment,
  EmojiEmotions,
  Engineering,
  Handyman,
  ViewWeek,
} from '@mui/icons-material'

const routes = [
  {
    key: 'tasks-configs',
    label: msg`Tasks`,
    type: 'subheader',
  },
  {
    key: 'tasks',
    label: msg`Tasks`,
    icon: <AssignmentTurnedIn />,
  },
  {
    key: 'tasks-files',
    label: msg`Files`,
    icon: <Attachment />,
  },
  {
    key: 'chores-configs',
    label: msg`Chores`,
    type: 'subheader',
  },
  {
    key: 'chores',
    label: msg`Chores`,
    icon: <Handyman />,
  },
  {
    key: 'chores-assignments',
    label: msg`Assingnments`,
    icon: <Assignment />,
  },
  {
    key: 'chores-responsibles',
    label: msg`Assigneds`,
    icon: <AssignmentInd />,
  },
  {
    key: 'workspaces-configs',
    label: msg`Project`,
    type: 'subheader',
  },
  {
    key: 'workspaces-categories',
    label: msg`Categories`,
    icon: <EmojiEmotions />,
  },
  {
    key: 'workspaces-stages',
    label: msg`Stages`,
    icon: <ViewWeek />,
  },
]

export { routes }
