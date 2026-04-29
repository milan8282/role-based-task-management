import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const getFirebaseMessaging = async () => {
  const supported = await isSupported();

  if (!supported) return null;

  return getMessaging(app);
};

export const requestFirebaseToken = async () => {
  const messaging = await getFirebaseMessaging();

  if (!messaging) return null;

  const permission = await Notification.requestPermission();

  if (permission !== "granted") return null;

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
  });

  return token;
};

export const listenForegroundMessages = async (callback) => {
  const messaging = await getFirebaseMessaging();

  if (!messaging) return null;

  return onMessage(messaging, callback);
};