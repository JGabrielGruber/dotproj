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
  },
  updateTask: async (id, { title, description, category, stage }) => {
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
  },
  deleteTask: async (id) => {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .select()
      .single()
    if (error) throw error;
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? undefined : task
      ),
    }))
    return data
  },
  getTasks: (category = '') =>
    get().tasks.filter((task) => (category ? task.category === category : true)),
  getTask: (id) => get().tasks.find((task) => id === task.id),
}))

export default useTaskStore
