import { create } from "zustand"

import supabase from "src/utils/supabase"

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  fetchTasks: async (workspace) => {
    if (get().isLoading || workspace == null) {
      return
    }
    try {
      set({
        isLoading: true,
        error: null,
      })
      const { data, error } = await supabase.from('tasks').select('*').eq('workspace_id', workspace.id)
      if (error) throw error;
      set({
        tasks: data,
      })
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
  addTask: async ({ title, description, category, stage, workspace_id }) => {
    if (get().isLoading) {
      return
    }
    try {
      set({
        isLoading: true,
      })
      const { data, error } = await supabase
        .from('tasks')
        .insert({ title, description, category, stage, workspace_id })
        .select()
        .single()
      if (error) throw error;
      set((state) => ({
        tasks: [...state.tasks, data],
      }))
      return data
    } catch (e) {
      set({
        error: e,
      })
      throw e;

    } finally {
      set({
        isLoading: false,
      })
    }
  },
  updateTask: async (id, { title, description, category, stage }) => {
    if (get().isLoading) {
      return
    }
    try {
      set({
        isLoading: true,
      })
      const { data, error } = await supabase
        .from('tasks')
        .update({ title, description, category, stage })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error;
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? data : task
        ),
      }))
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
  deleteTask: async (id) => {
    if (get().isLoading) {
      return
    }
    try {
      set({
        isLoading: true,
      })
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      if (error) throw error;
      set((state) => ({
        tasks: state.tasks.filter((task) =>
          task.id !== id
        ),
      }))
      return null
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
  getTasks: (category = '') =>
    get().tasks.filter((task) => (category ? task.category === category : true)),
  getTask: (id) => get().tasks.find((task) => id === task.id),
}))

export default useTaskStore
