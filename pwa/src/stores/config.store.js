import { create } from 'zustand'

import { apiWithAuth } from 'src/utils/django'
import { persist } from 'zustand/middleware'

const useConfigStore = create(
  persist(
    (set, get) => ({
      categories: [],
      categoriesEtag: null,
      stages: [],
      stagesEtag: null,
      members: [],
      membersEtag: null,
      isLoading: false,
      fetchConfig: async (workspace) => {
        try {
          if (get().isLoading || workspace == null) {
            return
          }
          set({
            isLoading: true,
            error: null,
          })
          const { data: categories, etag: categoriesEtag } = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/categories/`
          )
          const { data: stages, etag: stagEtag } = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/stages/`
          )
          const { data: members, etag: membersEtag } = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/members/`
          )
          if (categories && get().categoriesEtag !== categoriesEtag) {
            set({
              categories: categories,
              categoriesEtag: categoriesEtag,
            })
          }
          if (stages && get().stagesEtag !== stagEtag) {
            set({
              stages: stages,
              stagesEtag: stagEtag,
            })
          }
          if (members && get().membersEtag !== membersEtag) {
            set({
              members: members,
              membersEtag: membersEtag,
            })
          }
        } catch (e) {
          console.error(e)
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
      setCategories: async (workspace, items) => {
        const { data } = await apiWithAuth(
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
        const { data } = await apiWithAuth(
          'put',
          `/api/workspaces/${workspace.id}/stages/upsert/`,
          items
        )
        set(() => ({
          stages: data,
        }))
        return data
      },
      createInvite: async (workspace) => {
        const { data } = await apiWithAuth(
          'post',
          `/api/workspaces/${workspace.id}/invites/`,
          { workspace: workspace.id }
        )
        return data.token
      },
      acceptInvite: async (token) => {
        const { data } = await apiWithAuth(
          'get',
          `/api/invite/${token}/accept/`
        )
        return data.workspace_id
      },
      updateMember: async (workspace, id, { role }) => {
        const { data } = await apiWithAuth(
          'patch',
          `/api/workspaces/${workspace.id}/members/${id}/`,
          { role }
        )
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, role } : member
          ),
        }))
        return data
      },
      deleteMember: async (workspace, id) => {
        await apiWithAuth(
          'delete',
          `/api/workspaces/${workspace.id}/members/${id}/`
        )
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        }))
        return null
      },
    }),
    {
      name: 'config-storage',
      getStorage: () => localStorage,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) =>
              ![
                'isLoading, error, categoriesEtag, stagesEtag, membersEtag',
              ].includes(key)
          )
        ),
    }
  )
)

export default useConfigStore
