import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { messaging, listenForegroundNotifications } from "./config/firebase";

// Enregistrement du service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(reg => console.log('Service Worker enregistré:', reg))
    .catch(err => console.error('SW registration failed:', err));
}

// Demande de permission notification
Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    console.log("Permission notifications accordée.");
    listenForegroundNotifications(); // écoute les notifications foreground
  } else {
    console.log("Permission notifications refusée.");
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
