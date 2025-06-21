import { serve } from "bun";
import webPush from "web-push";
import { authenticateSession } from "./auth";
import {
  setupRedis,
  getResourceUsers,
  getUserResources,
  clientsMap,
  getRedisClient,
  storePushSubscription,
  getPushSubscription,
} from "./redis";
import { env } from "./env";
import { ResourceUpdate } from "./types";

// Configure VAPID
webPush.setVapidDetails(
  "mailto:support@dotproj.com",
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

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
    async message(ws, message) {
      if (message === "ping") {
        ws.send("pong");
        return;
      }
      try {
        const data = JSON.parse(message);
        if (data.type === "subscribe") {
          const redisClient = await getRedisClient();
          await storePushSubscription(redisClient, ws.data.userId, data.subscription);
          await redisClient.quit();
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
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
    if (true || !clients.has(userId) || clients.get(userId)!.size === 0) {
      const subscription = await getPushSubscription(redisClient, userId);
      console.log(subscription)
      if (subscription) {
        try {
          await webPush.sendNotification(
            subscription,
            JSON.stringify({ key: update.key, timestamp: update.timestamp })
          );
        } catch (error) {
          console.error(`Failed to send push to user ${userId}:`, error);
        }
      }
    }
  }
  await redisClient.quit();
});

console.log(`WebSocket server running on ${server.hostname}:${server.port}`);
