import { createClient } from "redis";
import { env } from "./env";
import { ResourceUpdate } from "./types";

export async function getRedisClient() {
  const client = createClient({
    url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`,
  });
  await client.connect();
  return client;
}

export async function setupRedis(
  onUpdate: (update: ResourceUpdate, clients: Map<string, Set<WebSocket>>) => Promise<void>
) {
  const client = await getRedisClient();

  const subscriber = client.duplicate();
  await subscriber.connect();
  await subscriber.subscribe("resource-updates", async (message) => {
    const update: ResourceUpdate = JSON.parse(message);
    // Store timestamp for the resource
    await client.set(`resource-timestamps:${update.key}`, update.timestamp);
    await onUpdate(update, clientsMap);
  });

  return client;
}

export async function getResourceUsers(client: any, key: string): Promise<string[]> {
  const users = await client.sMembers(`resource-users:${key}`);
  return users || [];
}

export async function getUserResources(client: any, userId: string): Promise<ResourceUpdate[]> {
  const resources: ResourceUpdate[] = [];
  // Scan for all resource-users:* keys
  for await (const key of client.scanIterator({ MATCH: "resource-users:*" })) {
    let resourcesKeys = key;
    if (typeof resources === 'string' || resources instanceof String) {
      resourcesKeys = [key];
    }

    await resourcesKeys.map(async (resourceKey: any) => {
      const users = await client.sMembers(resourceKey);
      if (users.includes(userId)) {
        const timestamp = await client.get(`resource-timestamps:${resourceKey}`);
        if (timestamp) {
          resources.push({ key: resourceKey, timestamp });
        }
      }
    })

  }
  return resources;
}

export async function storePushSubscription(client: any, userId: string, subscription: any) {
  await client.set(`push-subscription:${userId}`, JSON.stringify(subscription));
}

export async function getPushSubscription(client: any, userId: string): Promise<any> {
  const subscription = await client.get(`push-subscription:${userId}`);
  return subscription ? JSON.parse(subscription) : null;
}

export const clientsMap = new Map<string, Set<WebSocket>>(); // userId -> Set<WebSocket>
