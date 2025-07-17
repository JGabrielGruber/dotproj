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
  onUpdate: (update: ResourceUpdate) => Promise<void>
) {
  const client = await getRedisClient();

  const subscriber = client.duplicate();
  await subscriber.connect();
  await subscriber.subscribe("resource-updates", async (message) => {
    const update: ResourceUpdate = JSON.parse(message);
    // Store timestamp for the resource
    await client.set(`resource-timestamps:${update.key}`, update.timestamp);
    await onUpdate(update);
  });

  return client;
}

export async function getResourceUsers(client: any, key: string): Promise<string[]> {
  const users = await client.sMembers(`resource-users:${key}`);
  return users || [];
}

export async function getUserResources(client: any, userId: string, timestamp: number): Promise<ResourceUpdate[]> {
  const items: ResourceUpdate[] = [];

  const resources = await client.sMembers(`user-resources:${userId}`);
  for (const resource of resources) {
    const resourceTimestamp = await client.get(`resource-timestamps:${resource}`);
    if (resourceTimestamp && parseInt(resourceTimestamp) > timestamp) {
      items.push({ key: resource, timestamp: parseInt(resourceTimestamp) });
    }
  }

  return items;
}

export async function setUserTimestamp(client: any, userId: string, timestamp: number) {
  await client.set(`user-timestamps:${userId}`, timestamp);
}

export async function getUserTimestamp(client: any, userId: string): Promise<number> {
  const timestamp = await client.get(`user-timestamps:${userId}`);
  return timestamp ? parseInt(timestamp) : 0;
}

export async function storePushSubscription(client: any, userId: string, subscription: any) {
  await client.set(`push-subscription:${userId}`, JSON.stringify(subscription));
}

export async function getPushSubscription(client: any, userId: string): Promise<any> {
  const subscription = await client.get(`push-subscription:${userId}`);
  return subscription ? JSON.parse(subscription) : null;
}

