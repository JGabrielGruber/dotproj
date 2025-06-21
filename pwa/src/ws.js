import useTaskStore from "src/stores/task.store";
import useConfigStore from "src/stores/config.store";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
let ws = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const baseReconnectDelay = 1000;
let isReconnecting = false;

// Register service worker and subscribe to push
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error("VAPID public key is missing");
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service worker registered");

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey, // Add VAPID key
      });

      // Send subscription to Bun server
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "subscribe", subscription }));
      } else {
        console.log("WebSocket not open, subscription queued");
        // Retry on open
        ws.addEventListener("open", () => {
          ws.send(JSON.stringify({ type: "subscribe", subscription }));
        }, { once: true });
      }

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener("message", async (event) => {
        const { key, timestamp } = event.data;
        await handleMessage({ key, timestamp });
      });
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  }
}

async function handleMessage({ key, timestamp }) {
  try {
    const commentMatch = key.match(
      /^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\/([0-9a-f-]{36})\/comments\//
    );
    const taskMatch = key.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\//);
    const workspaceMatch = key.match(/^\/api\/workspaces\/([0-9a-f-]{36})\//);

    if (commentMatch) {
      const [, ws_id, task_id] = commentMatch;
      await useTaskStore.getState().fetchComments({ id: ws_id }, task_id);
    } else if (taskMatch) {
      const [, ws_id] = taskMatch;
      await useTaskStore.getState().fetchTasks({ id: ws_id });
    } else if (workspaceMatch) {
      const [, ws_id] = workspaceMatch;
      await useConfigStore.getState().fetchConfig({ id: ws_id });
    }

    console.log(`Processed update: key=${key}, timestamp=${timestamp}`);
  } catch (error) {
    console.error("Message processing error:", error);
  }
}

function connectWebSocket() {
  if (isReconnecting || (ws && ws.readyState === WebSocket.OPEN)) return;

  if (ws) {
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    if (ws.readyState !== WebSocket.CLOSED) ws.close();
  }

  isReconnecting = true;
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    reconnectAttempts = 0;
    isReconnecting = false;
    console.log("Connected to WebSocket");
    startKeepalive();
    syncStores();
    registerServiceWorker(); // Register SW on connect
  };

  ws.onmessage = async (event) => {
    try {
      if (event.data === "pong") return;
      const data = JSON.parse(event.data);
      if (data.type === "subscribe") return; // Ignore subscription messages
      await handleMessage(data);
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  };

  ws.onerror = (event) => {
    console.error("WebSocket error:", event);
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected");
    isReconnecting = false;
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
      reconnectAttempts++;
      setTimeout(connectWebSocket, delay);
      console.log(`Reconnecting WebSocket: attempt ${reconnectAttempts}, delay ${delay}ms`);
    } else {
      console.error("Max reconnect attempts reached");
    }
  };
}

function startKeepalive() {
  const keepaliveInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("ping");
    } else {
      clearInterval(keepaliveInterval);
    }
  }, 30000);
}

async function syncStores() {
  try {
    console.log("Syncing stores after reconnect");
    const taskStore = useTaskStore.getState();
    const configStore = useConfigStore.getState();
    const workspaces = configStore.workspaces || [];
    for (const ws of workspaces) {
      if (ws.id) {
        await configStore.fetchConfig({ id: ws.id });
        await taskStore.fetchTasks({ id: ws.id });
        const tasks = taskStore.tasks?.[ws.id] || [];
        for (const task of tasks) {
          if (task.id) {
            await taskStore.fetchComments({ id: ws.id }, task.id);
          }
        }
      }
    }
  } catch (error) {
    console.error("Store sync error:", error);
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("App became visible, checking WebSocket");
    if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
      reconnectAttempts = 0;
      connectWebSocket();
    }
  }
});

connectWebSocket();

export default ws;
