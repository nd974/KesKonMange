import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { messaging, requestWebPushToken } from "./firebase.js";
import { onMessage } from "firebase/messaging";

// ✅ Enregistre le service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch(err => console.error('Service Worker registration failed:', err));
}

// ✅ Request permission et listener foreground
async function initNotifications() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");
    const token = await requestWebPushToken();
    console.log("FCM Token:", token);

    // 🔹 Ajouter un guard pour éviter double listener
    if (!window.fcmListenerAdded) {
      onMessage(messaging, (payload) => {
        console.log("Foreground notification received:", payload);
        if (payload.notification) {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/favicon.ico",
          });
        }
      });
      window.fcmListenerAdded = true;
    }
  } else {
    console.log("Notification permission denied.");
  }
}

initNotifications();

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
