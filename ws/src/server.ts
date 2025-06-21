import { serve } from "bun";
import { authenticateSession } from "./auth";
import { setupRedis, getResourceUsers, getUserResources, clientsMap, getRedisClient } from "./redis";
import { env } from "./env";
import { ResourceUpdate } from "./types";

const server = serve({
  port: env.PORT,
  async fetch(req, server) {
    const cookie = req.headers.get("cookie") || undefined;
    const userId = await authenticateSession(cookie);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (server.upgrade(req, { data: { userId } })) {
      return;
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    async open(ws) {
      const userId = ws.data.userId;
      ws.subscribe(`user:${userId}`);
      if (!clientsMap.has(userId)) clientsMap.set(userId, new Set());
      clientsMap.get(userId)!.add(ws);
      ws.isAlive = true;
      console.log(`Client connected: userId=${userId}`);

      // Hydrate user with recent resource updates
      try {
        const redisClient = await getRedisClient();
        const resources = await getUserResources(redisClient, userId);
        for (const update of resources) {
          server.publish(
            `user:${userId}`,
            JSON.stringify({ key: update.key, timestamp: update.timestamp })
          );
        }
        await redisClient.quit();
      } catch (error) {
        console.error(`Failed to hydrate user ${userId}:`, error);
      }
    },
    message(ws, message) {
      // Handle keepalive pings
      if (message === "ping") ws.send("pong");
    },
    close(ws, code, reason) {
      const userId = ws.data.userId;
      if (userId) {
        ws.unsubscribe(`user:${userId}`);
        const clients = clientsMap.get(userId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) clientsMap.delete(userId);
        }
      }
      console.log(`Client disconnected: userId=${userId}, code=${code}`);
    },
    pong(ws) {
      ws.isAlive = true;
    },
    sendPings: true,
    idleTimeout: 120,
  },
});

// Heartbeat to clean up dead connections
setInterval(() => {
  for (const [userId, clients] of clientsMap) {
    for (const ws of clients) {
      if (!ws.isAlive) {
        ws.close();
        clients.delete(ws);
      } else {
        ws.isAlive = false;
        ws.ping();
      }
    }
    if (clients.size === 0) clientsMap.delete(userId);
  }
}, 30000);

// Redis subscription for updates
setupRedis(async (update: ResourceUpdate, clients: Map<string, Set<WebSocket>>) => {
  const redisClient = await getRedisClient();
  const userIds = await getResourceUsers(redisClient, update.key);
  for (const userId of userIds) {
    server.publish(
      `user:${userId}`,
      JSON.stringify({ key: update.key, timestamp: update.timestamp })
    );
  }
  await redisClient.quit();
});

console.log(`WebSocket server running on ${server.hostname}:${server.port}`);
