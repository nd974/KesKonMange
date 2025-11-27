import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { messaging } from "./config/firebase";
import { onMessage } from "firebase/messaging";

// Enregistrer le service worker
navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then((registration) => {
    console.log('Service Worker registered:', registration);
  })
  .catch(err => console.error('Service Worker registration failed:', err));

// Demander la permission de notification
Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    console.log("Notification permission granted.");

    // Foreground notifications
    onMessage(messaging, (payload) => {
      console.log("Notification reçue au premier plan :", payload);

      // 🔹 Vérifier que ce n'est pas un message déjà géré par le SW
      if (payload?.notification) {
        // Ici tu peux soit afficher custom notification
        // soit simplement mettre à jour le UI (sans new Notification)
        // Exemple : affichage custom UI dans React
        alert(`Notification: ${payload.notification.title} - ${payload.notification.body}`);
      }
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
