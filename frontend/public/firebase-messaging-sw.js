// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 🔹 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBcNuWgI95vc4N9h71AkW382IYl6JtAeFU",
  authDomain: "keskonmange-9bc45.firebaseapp.com",
  projectId: "keskonmange-9bc45",
  storageBucket: "keskonmange-9bc45.firebasestorage.app",
  messagingSenderId: "304045775610",
  appId: "1:304045775610:web:38b723f19ef49246ec0743",
  measurementId: "G-7YS1KC9T91"
};

// Initialisation Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ------------------- Notifications Background -------------------
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Message background reçu:', payload);

  // Ne rien faire si notification déjà affichée par le frontend
  if (!payload.notification) return;

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ------------------- Gestion des notifications au premier plan -------------------
self.addEventListener('push', function(event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) return;

  const data = event.data ? event.data.json() : {};

  // Éviter les doublons : on vérifie que c’est bien une notification unique
  if (!data.notification || !data.notification.title) return;

  event.waitUntil(
    self.registration.showNotification(data.notification.title, {
      body: data.notification.body,
      icon: '/favicon.ico',
      tag: data.notification.tag || 'keskonmange-notif' // même tag = remplace notif précédente
    })
  );
});

// ------------------- Click sur notification -------------------
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
