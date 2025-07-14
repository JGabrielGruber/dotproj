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
    label: 'Tarefas',
    type: 'subheader',
  },
  {
    key: 'tasks',
    label: 'Tarefas',
    icon: <AssignmentTurnedIn />,
  },
  {
    key: 'tasks-files',
    label: 'Arquivos',
    icon: <Attachment />,
  },
  {
    key: 'chores-configs',
    label: 'Afazeres',
    type: 'subheader',
  },
  {
    key: 'chores',
    label: 'Afazeres',
    icon: <Handyman />,
  },
  {
    key: 'chores-assignments',
    label: 'Atribuições',
    icon: <Assignment />,
  },
  {
    key: 'chores-responsibles',
    label: 'Responsáveis',
    icon: <AssignmentInd />,
  },
  {
    key: 'workspaces-configs',
    label: 'Projeto',
    type: 'subheader',
  },
  {
    key: 'workspaces-categories',
    label: 'Categorias',
    icon: <EmojiEmotions />,
  },
  {
    key: 'workspaces-stages',
    label: 'Etapas',
    icon: <ViewWeek />,
  },
]

export { routes }
