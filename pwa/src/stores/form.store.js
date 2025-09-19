import { create } from 'zustand'

import { apiWithAuth } from 'src/utils/django'
import { persist } from 'zustand/middleware'

const useFormStore = create(
  persist(
    (set, get) => ({
      forms: [],
      formsEtag: null,
      form: null,
      submissions: [],
      submissionsEtag: null,
      submission: null,
      notifications: {},
      isLoading: false,
      getForms: (category = '') =>
        get().forms.filter((form) =>
          category ? form.category_key === category : true
        ),
      getForm: (id) => get().forms.find((form) => id === form.id),
      setForm: (id) => {
        set((state) => ({
          form: state.forms.find((form) => id === form.id),
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
            [id]: state.form?.id !== id,
          },
        })),
      fetchForms: async (workspace) => {
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
            `/api/workspaces/${workspace.id}/forms/`
          )
          if (data && get().formsEtag !== etag) {
            const forms = []
            let form = null
            const notifications = get().notifications
            const id = get().form?.id
            data.forEach((item) => {
              if (item.id === id) {
                form = item
              }
              if (
                !(item.id in notifications) ||
                item.updated_at > notifications[item.id]
              ) {
                notifications[item.id] = item.updated_at
              }
              get().forms.forEach((form) => {
                if (form.id === item.id) {
                  item.comments = form.comments
                  item.summary = form.summary
                  return
                }
              })
              forms.push(item)
            })
            set({
              forms,
              formsEtag: etag,
              form,
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
      fetchForm: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })

          const { data } = await apiWithAuth(
            'get',
            `/api/workspaces/${workspace.id}/forms/${id}/`
          )
          set((state) => ({
            forms: state.forms.map((form) => (form.id === id ? data : form)),
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
      addForm: async ({
        title,
        description,
        category_key,
        fields,
        workspace,
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
            `/api/workspaces/${workspace}/forms/`,
            {
              title,
              description,
              category_key,
              fields,
              workspace,
            }
          )
          set((state) => ({
            forms: [data, ...state.forms],
            form: data,
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
      updateForm: async (
        workspace,
        id,
        { title, description, category_key, fields }
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
            `/api/workspaces/${workspace.id}/forms/${id}/`,
            { title, description, category_key, fields }
          )
          set((state) => ({
            forms: state.forms.map((form) =>
              form.id === id
                ? {
                    ...form,
                    title,
                    description,
                    category_key,
                    fields,
                  }
                : form
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

      deleteForm: async (workspace, id) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          await apiWithAuth(
            'delete',
            `/api/workspaces/${workspace.id}/forms/${id}/`
          )
          set((state) => ({
            forms: state.forms.filter((form) => form.id !== id),
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
            `/api/workspaces/${workspace.id}/forms/${id}/comments/`
          )
          const forms = get().forms
          const index = forms.findIndex((form) => form.id === id)
          if (data && index > -1 && forms[index].commentsEtag !== etag) {
            forms[index].comments = data
            forms[index].commentsEtag = etag
            set((state) => ({
              forms: forms,
              form:
                state.form?.id === id
                  ? {
                      ...state.form,
                      comments: data,
                      commentsEtag: etag,
                    }
                  : state.form,
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
      addComment: async (workspace, id, formData) => {
        if (get().isLoading) {
          return
        }
        try {
          set({
            isLoading: true,
          })
          const { data } = await apiWithAuth(
            'post',
            `/api/workspaces/${workspace.id}/forms/${id}/comments/upload`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          )
          set((state) => ({
            forms: state.forms.map((form) =>
              form.id === id
                ? {
                    ...form,
                    comments: [data, ...(form.comments || [])],
                    comment_files: [
                      ...data.files,
                      ...(form.comment_files || []),
                    ],
                  }
                : form
            ),
            form: {
              ...state.form,
              comments: [data, ...(state.form.comments || [])],
              comment_files: [
                ...data.files,
                ...(state.form.comment_files || []),
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
            `/api/workspaces/${workspace.id}/forms/${id}/summary`
          )
          const forms = get().forms
          const index = forms.findIndex((form) => form.id === id)
          if (data && forms[index].summaryEtag !== etag) {
            forms[index].summary = data
            forms[index].summaryEtag = etag
            set((state) => ({
              forms: forms,
              form:
                state.form?.id === id
                  ? {
                      ...state.form,
                      summary: data,
                      summaryEtag: etag,
                    }
                  : state.form,
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
      name: 'form-storage',
      getStorage: () => localStorage,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['isLoading', 'error', 'form'].includes(key)
          )
        ),
    }
  )
)

export default useFormStore
