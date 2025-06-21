import useTaskStore from "src/stores/task.store";
import useConfigStore from "src/stores/config.store";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
let ws = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const baseReconnectDelay = 1000;
let isReconnecting = false;

function connectWebSocket() {
  if (isReconnecting || (ws && ws.readyState === WebSocket.OPEN)) return;

  // Clean up existing connection
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
    // Start keepalive pings
    startKeepalive();
  };

  ws.onmessage = async (event) => {
    try {
      const { key, timestamp } = JSON.parse(event.data);
      const commentMatch = key.match(
        /^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\/([0-9a-f-]{36})\/comments\//
      );
      const taskMatch = key.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\//);
      const workspaceMatch = key.match(/^\/api\/workspaces\/([0-9a-f-]{36})\//);

      if (commentMatch) {
        const [, ws_id, task_id] = commentMatch;
        useTaskStore.getState().fetchComments({ id: ws_id }, task_id);
      } else if (taskMatch) {
        const [, ws_id] = taskMatch;
        useTaskStore.getState().fetchTasks({ id: ws_id });
      } else if (workspaceMatch) {
        const [, ws_id] = workspaceMatch;
        useConfigStore.getState().fetchConfig({ id: ws_id });
      }

      console.log(`Received update: key=${key}, timestamp=${timestamp}`);
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
      const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts); // Exponential backoff
      reconnectAttempts++;
      setTimeout(connectWebSocket, delay);
      console.log(`Reconnecting WebSocket: attempt ${reconnectAttempts}, delay ${delay}ms`);
    } else {
      console.error("Max reconnect attempts reached");
    }
  };
}

// Keepalive pings to prevent connection drops
function startKeepalive() {
  const keepaliveInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("ping");
    } else {
      clearInterval(keepaliveInterval);
    }
  }, 30000); // Every 30s
}

// Detect phone wake to trigger reconnect if needed
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("App became visible, checking WebSocket");
    if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
      reconnectAttempts = 0; // Reset attempts on wake
      connectWebSocket();
    }
  }
});

// Initial connection
connectWebSocket();

export default ws;
