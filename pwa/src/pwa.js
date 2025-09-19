// src/utils/initPWA.js
import { registerSW } from 'virtual:pwa-register'

export const initPWA = () => {
  const pwaRegister = registerSW({
    onRegistered(registration) {
      console.log('Service Worker registered!', registration)
      // Check for updates every hour
      setInterval(
        () => {
          registration.update()
        },
        1000 * 60 * 60
      )
    },
    onNeedRefresh() {
      console.log('New content available, reloading...')
      // Prompt user or auto-reload
      if (confirm('Nova versão disponível. Deseja recarregar?')) {
        window.location.reload()
      }
    },
    onOfflineReady() {
      console.log('App ready for offline use!')
    },
    onRegisterError(error) {
      console.error('Service Worker registration failed:', error)
    },
  })

  return pwaRegister
}
