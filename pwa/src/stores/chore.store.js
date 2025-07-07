import { create } from 'zustand'

import { apiWithAuth } from 'src/utils/django'
import { persist } from 'zustand/middleware'

const useChoreStore = create(
  persist(
    (set, get) => ({
      chores: [],
      chore: null,
      notifications: {},
      isLoading: false,
      getChores: (category = '') =>
        get().chores.filter((chore) =>
          category ? chore.category_key === category : true
        ),
      getChore: (id) => get().chores.find((chore) => id === chore.id),
      setChore: (id) =>
        set((state) => ({
          chore: state.chores.find((chore) => id === chore.id),
          notifications: { ...state.notifications, [id]: false },
        })),
      addNotification: (id) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [id]: state.chore?.id !== id,
          },
        })),
      fetchChores: async (workspace) => {
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
            `/api/workspaces/${workspace.id}/chores/`
          )
          if (data) {
            const chores = []
            let chore = null
            const notifications = get().notifications
            const id = get().chore?.id
            data.forEach((item) => {
              if (item.id === id) {
                chore = item
              }
              if (!(item.id in notifications)) {
                notifications[item.id] = true
              }
              chores.push(item)
            })
            set({
              chores,
              chore,
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
      fetchChore: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })

          const data = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/chores/${id}/`
          )
          set((state) => ({
            chores: state.chores.map((chore) =>
              chore.id === id ? data : chore
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
      addChore: async (
        workspace,
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
            'post',
            `/api/workspaces/${workspace.id}/chores/`,
            {
              title,
              description,
              category_key,
              stage_key,
              workspace: workspace.id,
              owner: owner?.id,
            }
          )
          set((state) => ({
            chores: [...state.chores, data],
            chore: data,
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
      updateChore: async (
        workspace,
        id,
        { title, description, category_key, recurrence, schedule }
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
            `/api/workspaces/${workspace.id}/chores/${id}/`,
            { title, description, category_key, recurrence, schedule }
          )
          set((state) => ({
            chores: state.chores.map((chore) =>
              chore.id === id ? { ...chore, ...data } : chore
            ),
            chore: { ...state.chore, ...data },
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

      deleteChore: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          await apiWithAuth(
            'delete',
            `/api/workspaces/${workspace.id}/chores/${id}/`
          )
          set((state) => ({
            chores: state.chores.filter((chore) => chore.id !== id),
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
      addResponsible: async (workspace, id, { user }) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          const data = await apiWithAuth(
            'post',
            `/api/workspaces/${workspace.id}/chores/${id}/responsibles/`,
            { user }
          )
          set((state) => ({
            chores: state.chores.map((chore) =>
              chore.id === id
                ? {
                    ...chore,
                    responsibles: [data, ...(chore.responsibles || [])],
                  }
                : chore
            ),
            chore: {
              ...state.chore,
              responsibles: [data, ...(state.chore.responsibles || [])],
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
    }),
    {
      name: 'chore-storage',
      getStorage: () => localStorage,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['isLoading, error, chore'].includes(key)
          )
        ),
    }
  )
)

export default useChoreStore
