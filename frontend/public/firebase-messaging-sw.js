importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBcNuWgI95vc4N9h71AkW382IYl6JtAeFU",
  authDomain: "keskonmange-9bc45.firebaseapp.com",
  projectId: "keskonmange-9bc45",
  storageBucket: "keskonmange-9bc45.firebasestorage.app",
  messagingSenderId: "304045775610",
  appId: "1:304045775610:web:38b723f19ef49246ec0743",
  measurementId: "G-7YS1KC9T91"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Notifications uniquement en background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/favicon.ico',
  });
});
