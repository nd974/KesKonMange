import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { messaging } from "./config/firebase"; // ton fichier firebase.js
import { onMessage } from "firebase/messaging";

// ⚡ Enregistrer le SW une seule fois
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(registration => console.log('Service Worker enregistré', registration))
    .catch(err => console.error('Erreur SW', err));
}

// Demander la permission de notification
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  console.log("Notification permission granted.");

  // Foreground notifications : on les logue seulement
  onMessage(messaging, (payload) => {
    console.log("Notification reçue au premier plan :", payload);
    // ⚠ Ne pas afficher de Notification ici pour éviter doublons
  });
}

requestNotificationPermission();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
