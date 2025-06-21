import useTaskStore from "src/stores/task.store";
import useConfigStore from "src/stores/config.store";

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'; // Switch to wss://ws.portal.com in prod

const ws = new WebSocket(WS_URL);

ws.onopen = () => {
  console.log("Connected to WebSocket");
};

ws.onmessage = async (event) => {
  try {
    const { key, timestamp } = JSON.parse(event.data);

    // Regex to extract UUIDs from /api/workspaces/<ws_id>/tasks/<task_id>/comments/
    const commentMatch = key.match(
      /^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\/([0-9a-f-]{36})\/comments\//
    );

    // Regex to extract UUIDs from /api/workspaces/<ws_id>/tasks/
    const taskMatch = key.match(
      /^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\//
    );

    // Regex to extract UUIDs from /api/workspaces/<ws_id>/
    const workspaceMatch = key.match(
      /^\/api\/workspaces\/([0-9a-f-]{36})\//
    );

    if (commentMatch) {
      const [, ws_id, task_id] = commentMatch;
      useTaskStore.getState().fetchComments({ id: ws_id }, task_id)
    } else if (taskMatch) {
      const [, ws_id] = taskMatch;
      useTaskStore.getState().fetchTasks({ id: ws_id })
    } else if (workspaceMatch) {
      const [, ws_id] = workspaceMatch;
      useConfigStore.getState().fetchConfig({ id: ws_id })
    }

    console.log(`Received update: key=${key}, timestamp=${timestamp}`);
  } catch (error) {
    console.error("WebSocket message error:", error);
  }
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = () => {
  console.log("WebSocket disconnected");
};

export default ws;
