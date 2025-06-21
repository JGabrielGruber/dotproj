import { createClient } from "redis";
import { env } from "./env";
import { ResourceUpdate } from "./types";

export async function setupRedis(
  onUpdate: (update: ResourceUpdate, clients: Map<string, Set<WebSocket>>) => Promise<void>
) {
  const client = createClient({
    url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`,
  });

  await client.connect();

  const subscriber = client.duplicate();

  await subscriber.connect();
  await subscriber.subscribe("resource-updates", async (message) => {
    const update: ResourceUpdate = JSON.parse(message);
    await onUpdate(update, clientsMap);
  });

  return client;
}

export async function getResourceUsers(client: any, key: string): Promise<string[]> {
  const users = await client.sMembers(`resource-users:${key}`);
  return users || [];
}

export const clientsMap = new Map<string, Set<WebSocket>>(); // userId -> Set<WebSocket>
