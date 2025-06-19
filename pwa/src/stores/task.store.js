import { create } from "zustand"

import { apiWithAuth } from "src/utils/django"
import { persist } from "zustand/middleware"

const useTaskStore = create(
  persist((set, get) => ({
    tasks: [],
    task: null,
    isLoading: false,
    comments: [],
    getTasks: (category = '') =>
      get().tasks.filter((task) => (category ? task.category_key === category : true)),
    getTask: (id) => get().tasks.find((task) => id === task.id),
    setTask: (id) => set((state) => ({
      task: state.tasks.find((task) => id === task.id),
    })),
    fetchTasks: async (workspace) => {
      if (get().isLoading || workspace == null) {
        return
      }
      try {
        set({
          isLoading: true,
          error: null,
        })

        const data = await apiWithAuth('get', `/api/workspaces/${workspace.id}/tasks/`)
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
    addTask: async ({ title, description, category_key, stage_key, workspace }) => {
      if (get().isLoading) {
        return
      }
      try {
        set({
          isLoading: true,
        })
        const data = await apiWithAuth(
          'post',
          '/api/tasks/',
          { title, description, category_key, stage_key, workspace }
        )
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
    updateTask: async (id, { title, description, category_key, stage_key }) => {
      if (get().isLoading) {
        return
      }
      try {
        set({
          isLoading: true,
        })

        const data = await apiWithAuth(
          'patch',
          `/api/tasks/${id}/`,
          { title, description, category_key, stage_key }
        )
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, title, description, category_key, stage_key } : task
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
        await apiWithAuth(
          'delete',
          `/api/tasks/${id}/`,
        )
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
    fetchComments: async (id) => {
      if (get().isLoading || id == null) {
        return
      }
      try {
        set({
          isLoading: true,
          error: null,
        })

        const data = await apiWithAuth('get', `/api/tasks/${id}/comments/`)
        set({
          comments: data,
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
    addComment: async (id, { content }) => {
      if (get().isLoading) {
        return
      }
      try {
        set({
          isLoading: true,
        })
        const data = await apiWithAuth(
          'post',
          `/api/tasks/${id}/comments/`,
          { content },
        )
        set((state) => ({
          comments: [...state.comments, data],
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
  }),
    {
      name: 'task-storage',
      getStorage: () => localStorage,
    }
  ),
)

export default useTaskStore
