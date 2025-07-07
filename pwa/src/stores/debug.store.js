import { v4 as uuid } from 'uuid'
import { create } from 'zustand'

const useDebugStore = create((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => ({ logs: [...state.logs, { id: uuid(), ...log }] })),
  clearLogs: () => set({ logs: [] }),
}))

export default useDebugStore
