import {
  AccountTree,
  Assignment,
  AssignmentInd,
  AssignmentTurnedIn,
  Attachment,
  Checklist,
  Description,
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
    key: 'forms-configs',
    label: 'Formulários',
    type: 'subheader',
  },
  {
    key: 'forms',
    label: 'Formulários',
    icon: <Description />,
  },
  {
    key: 'forms-processes',
    label: 'Processos',
    icon: <AccountTree />,
  },
  {
    key: 'forms-checklists',
    label: 'Listas',
    icon: <Checklist />,
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
