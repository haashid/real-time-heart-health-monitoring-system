// Firebase Cloud Messaging Service Worker
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

const firebase = self.firebase

firebase.initializeApp({
  apiKey: "AIzaSyBxsIb4yLh8xSh1ahZf9a4q2T_gBfzcLc0",
  authDomain: "healthapp-43e82.firebaseapp.com",
  projectId: "healthapp-43e82",
  storageBucket: "healthapp-43e82.appspot.com",
  messagingSenderId: "924708456975",
  appId: "1:924708456975:web:f086c31d1fbb4e18a7f17a",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload)

  const notificationTitle = payload.notification?.title || "Health Alert"
  const notificationOptions = {
    body: payload.notification?.body || "Check your health dashboard",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "health-alert",
    requireInteraction: true,
    vibrate: [200, 100, 200],
  }

  try {
    self.registration.showNotification(notificationTitle, notificationOptions)
    console.log("Background notification displayed")
  } catch (error) {
    console.error("Error showing background notification:", error)
  }
})

// Add event listener for notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)
  event.notification.close()

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus()
        }
        if (clients.openWindow) return clients.openWindow("/")
      }),
  )
})
