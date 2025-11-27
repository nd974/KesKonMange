import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { messaging } from "./config/firebase";
import { onMessage } from "firebase/messaging";

// ⚠️ Pour éviter double notification
if (!window.fcmListenerAdded) {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      onMessage(messaging, (payload) => {
        console.log("Foreground notification:", payload);
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: "/favicon.ico",
        });
      });
    }
  });
  window.fcmListenerAdded = true;
}

// Enregistrer service worker (une seule fois)
if ('serviceWorker' in navigator && !window.swRegistered) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => console.log('SW registered:', registration))
    .catch(err => console.error('SW registration failed:', err));
  window.swRegistered = true;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
