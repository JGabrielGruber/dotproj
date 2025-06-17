import { create } from "zustand"

import supabase from "src/utils/supabase"
import { apiWithAuth } from "src/utils/django"

const useWorkspaceStore = create((set, get) => ({
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
        workspace: data[0],
      })
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
  }
}))

export default useWorkspaceStore
