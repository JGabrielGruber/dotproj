import { create } from 'zustand'

import { API_URL, apiWithAuth } from 'src/utils/django'
import { persist } from 'zustand/middleware'

const useAssignedStore = create(
  persist(
    (set, get) => ({
      assignments: [],
      assigned: null,
      notifications: {},
      isLoading: false,
      getAssignments: (category = '') =>
        get().assignments.filter((assigned) =>
          category ? assigned.category_key === category : true
        ),
      getAssigned: (id) =>
        get().assignments.find((assigned) => id === assigned.id),
      setAssigned: (id) =>
        set((state) => ({
          assigned: state.assignments.find((assigned) => id === assigned.id),
          notifications: { ...state.notifications, [id]: false },
        })),
      addNotification: (id) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [id]: state.assigned?.id !== id,
          },
        })),
      fetchAssignments: async (workspace, user) => {
        if (get().isLoading || workspace == null) {
          return
        }
        try {
          set({
            isLoading: true,
            error: null,
          })

          const url = new URL(`/api/workspaces/${workspace.id}/assignments/`, API_URL)
          if (user) {
            url.searchParams.append('user', user.id)
          }

          const data = await apiWithAuth(
            'get',
            url.toString()
          )
          if (data) {
            const assignments = []
            let assigned = null
            const notifications = get().notifications
            const id = get().assigned?.id
            data.forEach((item) => {
              if (item.id === id) {
                assigned = item
              }
              if (!(item.id in notifications)) {
                notifications[item.id] = true
              }
              assignments.push(item)
            })
            set({
              assignments,
              assigned,
              notifications,
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
      fetchAssigned: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })

          const data = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/assignments/${id}/`
          )
          set((state) => ({
            assignments: state.assignments.map((assigned) =>
              assigned.id === id ? data : assigned
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
      addAssigned: async ({
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
            `/api/workspaces/${workspace}/assignments/`,
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
            assignments: [...state.assignments, data],
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
      updateAssigned: async (
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
            `/api/workspaces/${workspace.id}/assignments/${id}/`,
            { title, description, category_key, stage_key, owner: owner?.id }
          )
          set((state) => ({
            assignments: state.assignments.map((assigned) =>
              assigned.id === id
                ? {
                  ...assigned,
                  title,
                  description,
                  category_key,
                  stage_key,
                  owner,
                }
                : assigned
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

      deleteAssigned: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          await apiWithAuth(
            'delete',
            `/api/workspaces/${workspace.id}/assignments/${id}/`
          )
          set((state) => ({
            assignments: state.assignments.filter(
              (assigned) => assigned.id !== id
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
    }),
    {
      name: 'assigned-storage',
      getStorage: () => localStorage,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['isLoading, error, assigned'].includes(key)
          )
        ),
    }
  )
)

export default useAssignedStore
