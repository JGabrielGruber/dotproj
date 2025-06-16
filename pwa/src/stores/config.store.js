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
  setCategories: async (items) => {
    const { data, error } = await supabase
      .from('categories')
      .upsert(items, { defaultToNull: false })
      .select()
    if (error) throw error;
    set(() => ({
      categories: data,
    }))
    return data
  },
  setStages: async (items) => {
    const { data, error } = await supabase
      .from('stages')
      .upsert(items, { defaultToNull: false })
      .select()
    if (error) throw error;
    set(() => ({
      stages: data,
    }))
    return data
  },
  setMembers: async (items) => {
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
