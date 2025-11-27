import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { messaging } from "./config/firebase";
import { onMessage } from "firebase/messaging";

// Enregistrer service worker
navigator.serviceWorker.register("/firebase-messaging-sw.js")
  .then((registration) => console.log("Service Worker registered:", registration))
  .catch((err) => console.error("SW registration failed:", err));

// Demander permission notifications
Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    console.log("Notification permission granted.");

    // Foreground notifications
    // ⚠️ On ne crée plus manuellement de Notification ici
    onMessage(messaging, (payload) => {
      console.log("Notification reçue au premier plan :", payload);
      // Le service worker s'occupe déjà d'afficher la notification
    });
  } else {
    console.log("Notification permission denied.");
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
