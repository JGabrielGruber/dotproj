import { create } from "zustand"

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
      const members = await apiWithAuth('get', `/api/workspaces/${workspace.id}/members/`)
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
  setCategories: async (workspace, items) => {
    const data = await apiWithAuth(
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
    const data = await apiWithAuth(
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
    const data = await apiWithAuth(
      'post',
      `/api/workspaces/${workspace.id}/invites/`,
      { workspace: workspace.id },
    )
    return data.token
  },
  acceptInvite: async (token) => {
    const data = await apiWithAuth(
      'get',
      `/api/invite/${token}/accept/`,
    )
    return data.workspace_id
  },
  updateMember: async (workspace, id, { role }) => {
    const data = await apiWithAuth(
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
      `/api/workspaces/${workspace.id}/members/${id}/`,
    )
    set((state) => ({
      members: state.members.filter((member) => member.id !== id),
    }))
    return null
  },
}))

export default useConfigStore
