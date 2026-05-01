/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAgb6mJMy0Sk1ZrYNs_pEt5Bw0W_mmBbzo",
  authDomain: "task-management-5ccaa.firebaseapp.com",
  projectId: "task-management-5ccaa",
  storageBucket: "task-management-5ccaa.firebasestorage.app",
  messagingSenderId: "493883723517",
  appId: "1:493883723517:web:004b4e98e5b607a8f67894",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "New notification";
  const body = payload?.notification?.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/vite.svg",
  });
});