// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
// };

// const app = initializeApp(firebaseConfig);
// export const messaging = getMessaging(app);

// // export async function requestWebPushToken() {
// //   const permission = await Notification.requestPermission();
// //   if (permission !== "granted") return null;

// //   try {
// //     const token = await getToken(messaging, {
// //       vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
// //     });
// //     return token;
// //   } catch (err) {
// //     console.error("Erreur FCM token:", err);
// //     return null;
// //   }
// // }

// // // Foreground notifications
// // export function listenForegroundNotifications() {
// //   onMessage(messaging, (payload) => {
// //     console.log("Notification reçue au premier plan :", payload);

// //     // 🔹 Afficher la notif seulement si l'app est visible
// //     if (document.visibilityState === "visible") {
// //       new Notification(payload.notification.title, {
// //         body: payload.notification.body,
// //         icon: "/favicon.ico",
// //       });
// //     }
// //   });
// // }
