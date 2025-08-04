function parsePushData(event) {
  try {
    const data = event.data.json();
    if (!data) throw new Error('Push event data is empty');
    return data;
  } catch (error) {
    console.error('Push event data is not JSON:', error);
    return null;
  }
}

async function findVisibleClient() {
  const allClients = await clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  return allClients.find(
    (client) => client.url.startsWith(self.location.origin) && client.visibilityState === 'visible'
  ) || null;
}

function buildNotificationOptions({ key, timestamp }) {
  const defaultOptions = {
    body: `Mudanças em ${key}!`,
    data: { key, timestamp },
    tag: key,
    renotify: true,
    icon: '/icon-192.png',
    title: 'Atualização no Projeto',
    actions: [
      {
        action: 'open',
        title: 'Abrir',
      },
    ],
  };

  const commentMatch = key.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\/([0-9a-f-]{36})\/comments\/\*\//);
  const taskMatch = key.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\/([0-9a-f-]{36})\//);
  const tasksMatch = key.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/tasks\/\*\//);
  const choresMatch = key.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/chores\/\*\//);

  if (commentMatch) {
    const [, ws_id, task_id] = commentMatch;
    return { ...defaultOptions, body: task_id, title: `Atualização em ${ws_id}`, icon: '/chat.svg' };
  } else if (taskMatch) {
    const [, ws_id, task_id] = taskMatch;
    return { ...defaultOptions, body: task_id, title: `Atualização em ${ws_id}`, icon: '/task.svg' };
  } else if (tasksMatch) {
    const [, ws_id] = tasksMatch;
    return { ...defaultOptions, body: 'Nova tarefa!', title: `Atualização em ${ws_id}`, icon: '/task.svg' };
  } else if (choresMatch) {
    const [, ws_id] = choresMatch;
    return { ...defaultOptions, body: 'Novo afazer!', title: `Atualização em ${ws_id}`, icon: '/assignment.svg' };
  }
  return null;
}

self.addEventListener("push", (event) => {
  console.log('Push event', event);
  const data = parsePushData(event);
  if (!data) return;

  const { key, timestamp } = data;

  event.waitUntil(
    (async () => {
      try {
        const appClient = await findVisibleClient();
        if (appClient) {
          console.log("App is open and visible. Sending message to client to handle update.");
          appClient.postMessage({ type: "push_update", key, timestamp });
        }

        const options = buildNotificationOptions({ key, timestamp });
        if (!options) return;

        await self.registration.showNotification(options.title, options);
      } catch (error) {
        console.error('Push event processing error:', error);
      }
    })()
  );
});

function parseNotificationKey(key) {
  const pathSegments = key.split('/').filter(Boolean);
  const urlParams = new URLSearchParams();
  const extractedIds = {};

  const wsIndex = pathSegments.indexOf('workspaces');
  const taskIndex = pathSegments.indexOf('tasks');

  if (wsIndex !== -1 && wsIndex + 1 < pathSegments.length) {
    extractedIds.workspaceId = pathSegments[wsIndex + 1];
    urlParams.append('ws', extractedIds.workspaceId);
  }
  if (taskIndex !== -1 && taskIndex + 1 < pathSegments.length) {
    extractedIds.taskId = pathSegments[taskIndex + 1];
    urlParams.append('task', extractedIds.taskId);
  }

  const targetUrl = `/?${urlParams.toString()}`;
  return { targetUrl, extractedIds };
}

async function findOrOpenClient(targetUrl) {
  const clientList = await clients.matchAll({ type: "window" });
  const clientToFocus = clientList.find((client) => client.url.startsWith(self.location.origin + '/'));

  if (clientToFocus) {
    console.log("Focusing existing client:", clientToFocus.url);
    await clientToFocus.focus();
    if (clientToFocus.url !== self.location.origin + targetUrl) {
      await clientToFocus.navigate(targetUrl);
    }
    return clientToFocus;
  }

  console.log("No existing client. Opening new window to:", targetUrl);
  return await clients.openWindow(targetUrl);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { key, timestamp } = event.notification.data;
  console.log(`Notification clicked: ${key}`);

  event.waitUntil(
    (async () => {
      try {
        const { targetUrl, extractedIds } = parseNotificationKey(key);
        const client = await findOrOpenClient(targetUrl);
        if (client) {
          client.postMessage({ type: "notification_click", key, timestamp, ...extractedIds });
        } else {
          console.error("Failed to open or focus client for URL:", targetUrl);
        }
      } catch (error) {
        console.error("Notification click processing error:", error);
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  console.log('Message from PWA:', event.data);
});

const CACHE_NAME = 'dotproj-v0';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

// Install: Pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// Fetch: Cache tiles dynamically, serve offline
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Cache map tiles (.png, .jpg)
  if (url.match(/\.png$|\.jpg$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Serve from cache
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          // Cache the tile
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // Offline: Return cached tile or nothing
          return caches.match(event.request);
        });
      })
    );
  } else {
    // For non-tile requests (e.g., app assets), try cache first
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).catch(() => {
          // Fallback to index.html for SPA routing
          return caches.match('/index.html');
        });
      })
    );
  }
});
