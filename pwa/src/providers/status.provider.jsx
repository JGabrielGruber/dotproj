import React, { createContext, useContext } from 'react'

import StatusComponent from 'src/components/status.component'
import { useStatusStore } from 'src/stores/status.store'

/**
 * @typedef {Object} StatusContextType
 * @property {(status: import('src/stores/status.store').Status) => void} showStatus - Add a new status
 * @property {(slug: string) => void} hideStatus - Remove a status by slug
 */

/** @type {React.Context<StatusContextType>} */
const StatusContext = createContext(null)

/**
 * Hook to access status context
 * @returns {StatusContextType}
 */
export const useStatus = () => {
  const context = useContext(StatusContext)
  if (!context) throw new Error('useStatus must be used within StatusProvider')
  return context
}

/**
 * Status provider for managing status notifications
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {React.ComponentType<import('./Status').Status & { onClose: (slug: string) => void, index: number, total: number }>} [props.statusComponent]
 * @returns {JSX.Element}
 */
export const StatusProvider = ({ children }) => {
  const { statuses, removeStatus } = useStatusStore()
  const showStatus = useStatusStore((state) => state.addStatus)

  return (
    <StatusContext.Provider value={{ showStatus, hideStatus: removeStatus }}>
      {children}
      {statuses.map((status, index) => (
        <StatusComponent
          key={`${status.slug}-${index}`}
          {...status}
          onClose={removeStatus}
          index={index}
          total={statuses.length}
        />
      ))}
    </StatusContext.Provider>
  )
}
