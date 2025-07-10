import { create } from 'zustand'

import { apiWithAuth } from 'src/utils/django'
import { persist } from 'zustand/middleware'

const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      task: null,
      notifications: {},
      isLoading: false,
      getTasks: (category = '') =>
        get().tasks.filter((task) =>
          category ? task.category_key === category : true
        ),
      getTask: (id) => get().tasks.find((task) => id === task.id),
      setTask: (id) =>
        set((state) => ({
          task: state.tasks.find((task) => id === task.id),
          notifications: { ...state.notifications, [id]: false },
        })),
      addNotification: (id) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [id]: state.task?.id !== id,
          },
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

          const data = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/tasks/`
          )
          if (data) {
            const tasks = []
            let task = null
            const notifications = get().notifications
            const id = get().task?.id
            data.forEach((item) => {
              if (item.id === id) {
                task = item
              }
              if (!(item.id in notifications) || item.updated_at > notifications[item.id]) {
                notifications[item.id] = item.updated_at
              }
              get().tasks.forEach((task) => {
                if (task.id === item.id) {
                  item.comments = task.comments
                  item.summary = task.summary
                  return
                }
              })
              tasks.push(item)
            })
            set({
              tasks,
              task,
              notifications,
            })
            data.forEach((task) => {
              get().fetchComments(workspace, task.id)
              get().fetchSummary(workspace, task.id)
            })
          }
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
      fetchTask: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })

          const data = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/tasks/${id}/`
          )
          set((state) => ({
            tasks: state.tasks.map((task) => (task.id === id ? data : task)),
          }))
          get().fetchComments(workspace, id)
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
      addTask: async ({
        title,
        description,
        category_key,
        stage_key,
        workspace,
        owner,
      }) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          const data = await apiWithAuth(
            'post',
            `/api/workspaces/${workspace}/tasks/`,
            {
              title,
              description,
              category_key,
              stage_key,
              workspace,
              owner: owner?.id,
            }
          )
          set((state) => ({
            tasks: [data, ...state.tasks],
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
      updateTask: async (
        workspace,
        id,
        { title, description, category_key, stage_key, owner }
      ) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })

          const data = await apiWithAuth(
            'patch',
            `/api/workspaces/${workspace.id}/tasks/${id}/`,
            { title, description, category_key, stage_key, owner: owner?.id }
          )
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                  ...task,
                  title,
                  description,
                  category_key,
                  stage_key,
                  owner,
                }
                : task
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

      deleteTask: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          await apiWithAuth(
            'delete',
            `/api/workspaces/${workspace.id}/tasks/${id}/`
          )
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
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
      fetchComments: async (workspace, id) => {
        if (workspace == null || id == null) {
          return
        }
        try {
          set({
            isLoading: true,
            error: null,
          })

          const data = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/tasks/${id}/comments/`
          )
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                  ...task,
                  comments: data,
                }
                : task
            ),
            task:
              state.task?.id === id
                ? {
                  ...state.task,
                  comments: data,
                }
                : state.task,
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
      addComment: async (workspace, id, formData) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          const data = await apiWithAuth(
            'post',
            `/api/workspaces/${workspace.id}/tasks/${id}/comments/upload`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          )
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                  ...task,
                  comments: [data, ...(task.comments || [])],
                  comment_files: [
                    ...data.files,
                    ...(task.comment_files || []),
                  ],
                }
                : task
            ),
            task: {
              ...state.task,
              comments: [data, ...(state.task.comments || [])],
              comment_files: [
                ...data.files,
                ...(state.task.comment_files || []),
              ],
            },
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
      fetchSummary: async (workspace, id) => {
        if (workspace == null || id == null) {
          return
        }
        try {
          set({
            isLoading: true,
            error: null,
          })

          const data = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/tasks/${id}/summary`
          )
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                  ...task,
                  summary: data,
                }
                : task
            ),
            task:
              state.task?.id === id
                ? {
                  ...state.task,
                  summary: data,
                }
                : state.task,
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
    }),
    {
      name: 'task-storage',
      getStorage: () => localStorage,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['isLoading', 'error', 'task'].includes(key)
          )
        ),
    }
  )
)

export default useTaskStore
