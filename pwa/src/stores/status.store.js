import { create } from 'zustand'

/**
 * @typedef {'success' | 'info' | 'warning' | 'error'} StatusType
 */

/**
 * @typedef {Object} Status
 * @property {string} slug - Unique identifier for the status
 * @property {string} title - Status title
 * @property {string|null} [description] - Optional status description
 * @property {StatusType} [type='info'] - Status type
 * @property {React.ReactNode|null} [actions] - Optional action buttons
 * @property {boolean} [persistent=false] - Persist until dismissed
 * @property {number} [timeout=1] - Timeout in seconds
 */

/**
 * @typedef {Object} StatusState
 * @property {Status[]} statuses - Array of active statuses
 * @property {(status: Status) => void} addStatus - Add a new status
 * @property {(slug: string) => void} removeStatus - Remove a status by slug
 * @property {(slug: string, updates: Partial<Status>) => void} updateStatus - Update a status by slug
 */

/**
 * Zustand store for managing status notifications
 * @type {import('zustand').StoreApi<StatusState>['getState']}
 */
export const useStatusStore = create((set, get) => ({
  statuses: [],
  addStatus: (status) =>
    set((state) => ({
      statuses: [...state.statuses, status],
    })),
  removeStatus: (slug) => {
    const item = get().statuses.find((s) => s.slug === slug)
    if (item) {
      set((state) => ({
        statuses: state.statuses.filter((s) => s.slug !== slug),
      }))
    }
  },
  updateStatus: (slug, updates) =>
    set((state) => ({
      statuses: state.statuses.map((s) =>
        s.slug === slug ? { ...s, ...updates } : s
      ),
    })),
}))
