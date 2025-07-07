import { registerSW } from 'virtual:pwa-register'

export const initPWA = () => {
  const pwaRegister = registerSW({
    onRegistered() {
      console.log('Service worker registered!')
    },
    onNeedRefresh() {
      console.log('Service worker registered!')
      window.location.reload()
    },
    onOfflineReady() {
      console.log('App ready for offline use!')
    },
    onRegisterError(error) {
      console.error('Service worker registration failed:', error)
    },
  })

  return pwaRegister
}
