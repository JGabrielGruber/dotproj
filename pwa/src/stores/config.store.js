import { create } from "zustand"

import supabase from "src/utils/supabase"
import { apiWithAuth } from "src/utils/django"

const useConfigStore = create((set, get) => ({
  categories: [],
  stages: [],
  members: [],
  isLoading: false,
  fetchConfig: async (workspace) => {
    if (get().isLoading || workspace == null) {
      return
    }
    try {
      set({
        isLoading: true,
        error: null,
      })
      const categories = await apiWithAuth('get', `/api/workspaces/${workspace.id}/categories/`)
      const stages = await apiWithAuth('get', `/api/workspaces/${workspace.id}/stages/`)
      const members = []
      if (categories && stages && members) {
        set({
          categories: categories,
          stages: stages,
          members: members,
        })
      }
    } catch (e) {
      set({
        error: e,
      })
      throw e;
    } finally {
      set({
        isLoading: false,
      });
    }
  },
  setCategories: async (workspace, items) => {
    const data = await apiWithAuth(
      'put',
      `/api/workspaces/${workspace.id}/categories/upsert/`,
      items
    )
    set(() => ({
      categories: data,
    }))
    return data
  },
  setStages: async (workspace, items) => {
    const data = await apiWithAuth(
      'put',
      `/api/workspaces/${workspace.id}/stages/upsert/`,
      items
    )
    set(() => ({
      stages: data,
    }))
    return data
  },
  setMembers: async (workspace, items) => {
    const { data, error } = await supabase
      .from('workspace_members')
      .upsert(items, { defaultToNull: false })
      .select()
    if (error) throw error;
    set(() => ({
      members: data,
    }))
    return data
  },
}))

export default useConfigStore
