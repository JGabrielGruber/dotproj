import { create } from "zustand"

import { apiWithAuth } from "src/utils/django"
import { persist } from "zustand/middleware"

const useFileStore = create(
  persist((set, get) => ({
    taskFiles: [],
    isLoading: false,
    fetchTaskFiles: async (workspace) => {
      if (get().isLoading || workspace == null) {
        return
      }
      try {
        set({
          isLoading: true,
          error: null,
        })

        const data = await apiWithAuth('get', `/api/workspaces/${workspace.id}/task-files/`)
        if (data) {
          set({
            taskFiles: data,
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
        });
      }
    },
  }),
    {
      name: 'file-storage',
      getStorage: () => localStorage,
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['isLoading'].includes(key)),
      ),
    }
  ),
)

export default useFileStore
