self.addEventListener("push", async (event) => {
  const data = event.data.json();
  const { key, timestamp } = data;

  // Use the 'key' as the tag to automatically replace older notifications for the same resource
  const notificationTag = key; // Your current implementation uses 'key' as tag, which is good

  // Try to find an open client that matches the PWA scope
  const allClients = await clients.matchAll({
    includeUncontrolled: true, // Include clients not yet controlled by this SW
    type: "window", // Only interested in browser windows/tabs
  });

  let appClient = null;
  for (const client of allClients) {
    // Check if the client's URL matches your PWA's base URL
    // And if it's currently visible/focused
    if (client.url.startsWith(self.location.origin + '/') && client.visibilityState === 'visible') {
      appClient = client;
      break;
    }
  }

  if (appClient) {
    // App is open and visible.
    // Send a message to the client to process the update.
    // The client can then decide if it needs to update the UI or show a less intrusive in-app notification.
    console.log("App is open and visible. Sending message to client to handle update.");
    appClient.postMessage({ type: "push_update", key, timestamp });

    // OPTIONAL: Prevent showing a system notification if the app is already open
    // If you want to *never* show a system notification when the app is open and visible,
    // then you can return here.
    // However, for important updates, you might still want a system notification
    // to bring attention even if the app is open but minimized/in background.
    // For a tool, perhaps showing it is fine if it's not on the relevant page.
    // For now, we'll still show the notification to ensure visibility.
    // You could add logic here to check `appClient.url` against the `key` to be more precise.
    // E.g., if appClient.url matches the task ID in the key, then *don't* show system notification.
  }

  // Show notification (this will replace existing notifications with the same tag)
  const options = {
    body: `Mudanças em ${key}!`, // A bit more user-friendly for the body
    data: { key, timestamp },
    tag: notificationTag, // Group notifications by resource
    renotify: true, // Re-notify if a new notification with the same tag arrives
    // Add an icon from your manifest, e.g.:
    icon: '/icon-192.png',
  };

  event.waitUntil(
    self.registration.showNotification("Atualização no Projeto", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { key, timestamp } = event.notification.data;

  event.waitUntil(async () => {
    // --- Step 1: Parse the 'key' to get IDs and prepare the target URL ---
    let targetUrl = '/'; // Default fallback
    let pathSegments = key.split('/').filter(Boolean); // Remove empty strings from split
    let extractedIds = {};
    let urlParams = new URLSearchParams();

    // Example parsing based on your key format: /api/workspaces/{ws_id}/tasks/{task_id}/comments/
    if (pathSegments.includes('workspaces') && pathSegments.includes('tasks')) {
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
      targetUrl = `/?${urlParams.toString()}`;
    }
    // Add more conditions here for other URL structures you might send
    // e.g., if (pathSegments.includes('chores')) { ... extractedIds.choreId = ... }
    // Or if you only have '/api/workspaces/{ws_id}/'
    else if (pathSegments.includes('workspaces')) {
      const wsIndex = pathSegments.indexOf('workspaces');
      if (wsIndex !== -1 && wsIndex + 1 < pathSegments.length) {
        extractedIds.workspaceId = pathSegments[wsIndex + 1];
        urlParams.append('ws', extractedIds.workspaceId);
      }
      targetUrl = `/?${urlParams.toString()}`;
    }
    // You might need a more robust parsing logic if your 'key' structure is very varied
    // Consider using a regex or a more structured object in your push payload if it gets complex.

    console.log("Parsed IDs for deep linking:", extractedIds);
    console.log("Target URL for notification click:", targetUrl);

    // --- Step 2: Focus existing client or open new one ---
    const clientList = await clients.matchAll({ type: "window" });
    let clientToFocus = null;

    for (let i = 0; i < clientList.length; i++) {
      let client = clientList[i];
      // Check if client is already at the base URL of the PWA
      if (client.url.startsWith(self.location.origin + '/')) {
        clientToFocus = client;
        break; // Found an existing PWA tab
      }
    }

    if (clientToFocus) {
      // If client exists, focus it and navigate/post message
      console.log("Focusing existing client:", clientToFocus.url);
      await clientToFocus.focus();

      // Navigate the existing client to the target URL
      // Use navigate() to ensure the URL changes if the user is on a different page
      if (clientToFocus.url !== self.location.origin + targetUrl) {
        await clientToFocus.navigate(targetUrl);
      }

      // Post message to the client (regardless of navigation)
      // The client-side PWA can listen for this and use the 'key' or extractedIds for internal routing/data sync.
      clientToFocus.postMessage({ type: "notification_click", key, timestamp, ...extractedIds });
    } else {
      // No existing client found, open a new window/tab to the target URL
      console.log("No existing client. Opening new window to:", targetUrl);
      const newClient = await clients.openWindow(targetUrl);
      // You could also post a message to the newClient here if needed,
      // but the URL parameters already carry the primary data for routing.
    }
  });
});

// Listener for messages from the PWA (optional, but good for two-way communication)
self.addEventListener('message', (event) => {
  console.log('Message from PWA:', event.data);
  // Example: if the PWA tells the SW it handled an update, the SW could then decide not to show future similar notifications.
});
