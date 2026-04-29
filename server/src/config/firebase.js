import admin from "firebase-admin";
import { env } from "./env.js";

let firebaseApp = null;

export const initializeFirebaseAdmin = () => {
  const hasFirebaseConfig =
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY;

  if (!hasFirebaseConfig) {
    console.warn("Firebase Admin not initialized. Missing Firebase env values.");
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  console.log("Firebase Admin initialized successfully");

  return firebaseApp;
};

export const getFirebaseMessaging = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }

  if (!firebaseApp) {
    return null;
  }

  return admin.messaging();
};