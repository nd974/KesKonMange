importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Config Firebase directement ici
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

// Notifications en background
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
