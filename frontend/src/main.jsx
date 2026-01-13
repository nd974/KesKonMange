import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";

// ------------------------------ TODO ----------------------------------------
// // ⚡ Enregistrer le SW une seule fois
// import { messaging } from "./config/firebase";
// import { onMessage } from "firebase/messaging";
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/firebase-messaging-sw.js')
//     .then(registration => console.log('Service Worker enregistré', registration))
//     .catch(err => console.error('Erreur SW', err));
// }

// // Demander la permission de notification
// async function requestNotificationPermission() {
//   const permission = await Notification.requestPermission();
//   if (permission !== "granted") return;

//   console.log("Notification permission granted.");

//   // Foreground notifications : on les logue seulement
//   onMessage(messaging, (payload) => {
//     console.log("Notification reçue au premier plan :", payload);
//     // ⚠ Ne pas afficher de Notification ici pour éviter doublons
//   });
// }

// requestNotificationPermission();
// ----------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
