import { create } from "zustand"

const useConfigStore = create(() => ({
  categories: [
    { id: 'starred', label: 'Favorito', emoji: '⭐' },
    { id: 'urgent', label: 'Urgente', emoji: '⚠️' },
    { id: 'completed', label: 'Completdo', emoji: '✅' },
  ],
  steps: [
    { id: 'backlog', label: 'Pendente' },
    { id: 'todo', label: 'Para Fazer' },
    { id: 'doing', label: 'Fazendo' },
    { id: 'review', label: 'Em Revisão' },
    { id: 'done', label: 'Feito!' },
  ],
}))

export default useConfigStore
