import {
  Assignment,
  AssignmentInd,
  AssignmentTurnedIn,
  Attachment,
  EmojiEmotions,
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
    key: 'tasks-categories',
    label: 'Categorias',
    icon: <EmojiEmotions />,
  },
  {
    key: 'tasks-stages',
    label: 'Etapas',
    icon: <ViewWeek />,
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
    icon: <AssignmentInd />,
  },
  {
    key: 'chores-assignments',
    label: 'Atribuições',
    icon: <Assignment />,
  },
]

export { routes }
