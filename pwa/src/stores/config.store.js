import { create } from "zustand"

import supabase from "src/utils/supabase"

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
      const categories = await supabase.from('categories').select('*').eq('workspace_id', workspace.id)
      const stages = await supabase.from('stages').select('*').eq('workspace_id', workspace.id)
      const members = await supabase.from('workspace_members').select('*').eq('workspace_id', workspace.id)
      if (categories.data && stages.data && members.data) {
        set({
          categories: categories.data,
          stages: stages.data,
          members: members.data,
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
