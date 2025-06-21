self.addEventListener("push", async (event) => {
  const data = event.data.json();
  const { key, timestamp } = data;

  // Show notification
  const options = {
    body: `Nova atualização para ${key}`,
    data: { key, timestamp },
    tag: key, // Group notifications by resource
    renotify: true,
  };
  event.waitUntil(
    self.registration.showNotification("Atualização no Projeto", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { key, timestamp } = event.notification.data;

  // Focus or open PWA and trigger sync
  event.waitUntil(
    clients.openWindow("/").then((windowClient) => {
      // Optionally send message to PWA to trigger specific sync
      windowClient.postMessage({ key, timestamp });
    })
  );
});
