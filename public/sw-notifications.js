// Imported into the generated service worker (see vite.config.ts → workbox.importScripts).
// Tapping a reminder notification focuses an open Viz it window, or opens a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin);
      return open ? open.focus() : self.clients.openWindow(self.registration.scope);
    }),
  );
});
