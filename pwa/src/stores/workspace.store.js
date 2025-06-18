import { create } from "zustand"

import { apiWithAuth } from "src/utils/django"
import { persist } from "zustand/middleware"

const useWorkspaceStore = create(
  persist((set, get) => ({
    workspaces: [],
    workspace: null,
    isLoading: false,
    error: null,
    fetchWorkspaces: async () => {
      if (get().isLoading) {
        return
      }
      try {
        set({
          isLoading: true,
          error: null,
        })
        const data = await apiWithAuth('get', '/api/workspaces/')
        if (!data || data.length == 0) {
          return
        }
        set({
          workspaces: data,
        })
        if (get().workspace === null) {
          set({
            workspace: data[0],
          })
        }
        return data
      } catch (e) {
        set({
          error: e,
        })
        throw e
      } finally {
        set({
          isLoading: false,
        })
      }
    },
    setWorkspace: (workspace) =>
      set({ workspace }),
    setWorkspaceById: (workspace_id) =>
      set((state) => ({
        workspace: state.workspaces.find((ws) => ws.id === workspace_id),
      })),
    addWorkspace: async ({ label }) => {
      const data = await apiWithAuth(
        'post',
        '/api/workspaces/',
        { label }
      )
      if (!data) {
        return
      }
      set((state) => ({
        workspaces: [...state.workspaces, data],
        workspace: data,
      }))
      return data
    },
    updateWorkspace: async (workspace, { label }) => {
      const data = await apiWithAuth(
        'patch',
        `/api/workspaces/${workspace.id}/`,
        { label }
      )
      if (!data) {
        return
      }
      set((state) => ({
        workspaces: state.workspaces.map((ws) =>
          ws.id === workspace.id ? { ...ws, label } : ws
        ),
        workspace: { ...state.workspace, label },
      }))
      return data
    }
  }),
    {
      name: 'workspace-storage',
      getStorage: () => localStorage,
    }
  )
)


export default useWorkspaceStore
