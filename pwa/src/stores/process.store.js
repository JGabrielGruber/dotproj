import { create } from 'zustand'

import { apiWithAuth } from 'src/utils/django'
import { persist } from 'zustand/middleware'

const useProcessStore = create(
  persist(
    (set, get) => ({
      processes: [],
      processesEtag: null,
      process: null,
      instances: [],
      instancesEtag: null,
      instance: null,
      notifications: {},
      isLoading: false,
      getProcesses: (category = '') =>
        get().processes.filter((process) =>
          category ? process.category_key === category : true
        ),
      getProcess: (id) => get().processes.find((process) => id === process.id),
      setProcess: (id) => {
        set((state) => ({
          process: state.processes.find((process) => id === process.id),
        }))
        if (get().notifications[id]) {
          set((state) => ({
            notifications: { ...state.notifications, [id]: false },
          }))
        }
      },
      addNotification: (id) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [id]: state.process?.id !== id,
          },
        })),
      fetchProcesses: async (workspace) => {
        if (get().isLoading || workspace == null) {
          return
        }
        try {
          set({
            isLoading: true,
            error: null,
          })

          const { data, etag } = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/processes/`
          )
          if (data && get().processesEtag !== etag) {
            const processes = []
            let process = null
            const notifications = get().notifications
            const id = get().process?.id
            data.forEach((item) => {
              if (item.id === id) {
                process = item
              }
              if (
                !(item.id in notifications) ||
                item.updated_at > notifications[item.id]
              ) {
                notifications[item.id] = item.updated_at
              }
              get().processes.forEach((process) => {
                if (process.id === item.id) {
                  item.comments = process.comments
                  item.summary = process.summary
                  return
                }
              })
              processes.push(item)
            })
            set({
              processes,
              processesEtag: etag,
              process,
              notifications,
            })
            data.forEach((process) => {
              get().fetchComments(workspace, process.id)
              get().fetchSummary(workspace, process.id)
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
      fetchProcess: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })

          const { data } = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/processes/${id}/`
          )
          set((state) => ({
            processes: state.processes.map((process) =>
              process.id === id ? data : process
            ),
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
      addProcess: async ({
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
          const { data } = await apiWithAuth(
            'post',
            `/api/workspaces/${workspace}/processes/`,
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
            processes: [data, ...state.processes],
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
      updateProcess: async (
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

          const { data } = await apiWithAuth(
            'patch',
            `/api/workspaces/${workspace.id}/processes/${id}/`,
            { title, description, category_key, stage_key, owner: owner?.id }
          )
          set((state) => ({
            processes: state.processes.map((process) =>
              process.id === id
                ? {
                    ...process,
                    title,
                    description,
                    category_key,
                    stage_key,
                    owner,
                  }
                : process
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

      deleteProcess: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          await apiWithAuth(
            'delete',
            `/api/workspaces/${workspace.id}/processes/${id}/`
          )
          set((state) => ({
            processes: state.processes.filter((process) => process.id !== id),
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

          const { data, etag } = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/processes/${id}/comments/`
          )
          const processes = get().processes
          const index = processes.findIndex((process) => process.id === id)
          if (data && index > -1 && processes[index].commentsEtag !== etag) {
            processes[index].comments = data
            processes[index].commentsEtag = etag
            set((state) => ({
              processes: processes,
              process:
                state.process?.id === id
                  ? {
                      ...state.process,
                      comments: data,
                      commentsEtag: etag,
                    }
                  : state.process,
            }))
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
      addComment: async (workspace, id, processData) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          const { data } = await apiWithAuth(
            'post',
            `/api/workspaces/${workspace.id}/processes/${id}/comments/upload`,
            processData,
            { headers: { 'Content-Type': 'multipart/process-data' } }
          )
          set((state) => ({
            processes: state.processes.map((process) =>
              process.id === id
                ? {
                    ...process,
                    comments: [data, ...(process.comments || [])],
                    comment_files: [
                      ...data.files,
                      ...(process.comment_files || []),
                    ],
                  }
                : process
            ),
            process: {
              ...state.process,
              comments: [data, ...(state.process.comments || [])],
              comment_files: [
                ...data.files,
                ...(state.process.comment_files || []),
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

          const { data, etag } = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/processes/${id}/summary`
          )
          const processes = get().processes
          const index = processes.findIndex((process) => process.id === id)
          if (data && processes[index].summaryEtag !== etag) {
            processes[index].summary = data
            processes[index].summaryEtag = etag
            set((state) => ({
              processes: processes,
              process:
                state.process?.id === id
                  ? {
                      ...state.process,
                      summary: data,
                      summaryEtag: etag,
                    }
                  : state.process,
            }))
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
    }),
    {
      name: 'process-storage',
      getStorage: () => localStorage,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['isLoading', 'error', 'process'].includes(key)
          )
        ),
    }
  )
)

export default useProcessStore
