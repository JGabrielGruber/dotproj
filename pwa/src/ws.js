import useTaskStore from 'src/stores/task.store'
import useConfigStore from 'src/stores/config.store'
import useChoreStore from 'src/stores/chore.store'
import { initPWA } from './pwa'
import useWorkspaceStore from './stores/workspace.store'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
let ws = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5
const baseReconnectDelay = 1000
let isReconnecting = false
let lastTimestamp = null

// Register service worker and subscribe to push
async function registerServiceWorkerAndSubscribePush() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported.')
    return
  }

  try {
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      throw new Error(
        'VAPID public key is missing. Please set VITE_VAPID_PUBLIC_KEY in your .env file.'
      )
    }

    // Wait for the service worker managed by vite-plugin-pwa to be ready
    const registration = await navigator.serviceWorker.ready
    console.log('Service worker ready:', registration)

    // Check if there's an existing subscription
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // Subscribe to push notifications if not already subscribed
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey, // Add VAPID key
      })
      console.log('Push subscription created:', subscription)
    } else {
      console.log('Existing push subscription found:', subscription)
    }

    // Send subscription to Bun server
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', subscription }))
    } else {
      console.log(
        'WebSocket not open, subscription queued. Will send on WS open.'
      )
      // Retry on open
      const sendSubscriptionOnOpen = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'subscribe', subscription }))
        }
      }
      ws.addEventListener('open', sendSubscriptionOnOpen, { once: true })
    }

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', async (event) => {
      console.log('Message from service worker:', event.data)
      const { key, timestamp } = event.data
      await handleMessage({ key, timestamp })
    })
  } catch (error) {
    console.error('Service worker or Push subscription failed:', error)
  }
}

async function handleMessage({ key, timestamp }) {
  // TODO: yeah yeah, this is a mess that'll be refactored soon™
  try {
    const commentMatch = key.match(
      /^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\/([0-9a-f-]{36})\/comments\/\*\//
    )
    const taskMatch = key.match(
      /^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\/([0-9a-f-]{36})\//
    )
    const tasksMatch = key.match(
      /^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\/\*\//
    )
    const choresMatch = key.match(
      /^\/api\/workspaces\/([0-9a-f-]{36})\/chores\/\*\//
    )
    const workspaceMatch = key.match(/^\/api\/workspaces\/([0-9a-f-]{36})\//)

    if (commentMatch) {
      const [, ws_id, task_id] = commentMatch
      await useTaskStore.getState().fetchComments({ id: ws_id }, task_id)
      useTaskStore.getState().addNotification(task_id)
    } else if (taskMatch) {
      const [, ws_id, task_id] = taskMatch
      await useTaskStore.getState().fetchTask({ id: ws_id }, task_id)
      useTaskStore.getState().addNotification(task_id)
    } else if (tasksMatch) {
      const [, ws_id] = tasksMatch
      await useTaskStore.getState().fetchTasks({ id: ws_id })
    } else if (choresMatch) {
      const [, ws_id] = choresMatch
      await useChoreStore.getState().fetchChores({ id: ws_id })
    } else if (workspaceMatch) {
      const [, ws_id] = workspaceMatch
      await useConfigStore.getState().fetchConfig({ id: ws_id })
    }

    lastTimestamp = timestamp
    console.log(`Processed update: ${key}, timestamp: ${timestamp}`)
  } catch (error) {
    console.error('Message processing error:', error)
  }
}

function connectWebSocket() {
  if (isReconnecting || (ws && ws.readyState === WebSocket.OPEN)) return

  if (ws) {
    ws.onopen = null
    ws.onmessage = null
    ws.onerror = null
    ws.onclose = null
    if (ws.readyState !== WebSocket.CLOSED) ws.close()
  }

  isReconnecting = true
  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    reconnectAttempts = 0
    isReconnecting = false
    console.log('Connected to WebSocket')
    startKeepalive()
    // Call the push subscription logic AFTER the WebSocket is open
    registerServiceWorkerAndSubscribePush()
    sync()
  }

  ws.onmessage = async (event) => {
    event.preventDefault()
    try {
      if (event.data === 'pong') return
      const data = JSON.parse(event.data)
      if (data.type === 'subscribe') return // Ignore subscription messages
      await handleMessage(data)
    } catch (error) {
      console.error('WebSocket message error:', error)
    }
  }

  ws.onerror = (event) => {
    event.preventDefault()
    console.error('WebSocket error:', event)
  }

  ws.onclose = () => {
    console.log('WebSocket disconnected')
    isReconnecting = false
    const delay = baseReconnectDelay * reconnectAttempts
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++
    }
    setTimeout(connectWebSocket, delay)
    console.log(
      `Reconnecting WebSocket: attempt ${reconnectAttempts}, delay ${delay}ms`
    )
  }
}

function startKeepalive() {
  const keepaliveInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('ping')
    } else {
      clearInterval(keepaliveInterval)
    }
  }, 30000)
}

async function sync() {
  if (ws) {
    ws.send(JSON.stringify({ type: 'sync', timestamp: lastTimestamp }))
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('App became visible, checking WebSocket')
    if (
      !ws ||
      ws.readyState === WebSocket.CLOSED ||
      ws.readyState === WebSocket.CLOSING
    ) {
      reconnectAttempts = 0
      connectWebSocket()
    } else {
      sync()
    }
  }
})

// Initialize PWA registration early
initPWA()
// Connect WebSocket
connectWebSocket()

export default ws
