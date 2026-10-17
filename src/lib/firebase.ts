// Firebase initialization. Web API keys are public by design (protected by
// Firebase Security Rules, not secrecy). Fill the values from your Firebase
// console: Project settings → General → Your apps → SDK setup and configuration.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  // Firebase web API keys are publishable (protected by Security Rules).
  // Paste the apiKey value from the Firebase console here.
  apiKey: "",
  authDomain: "mozaic-vault.firebaseapp.com",
  projectId: "mozaic-vault",
  storageBucket: "mozaic-vault.firebasestorage.app",
  messagingSenderId: "1045629930316",
  appId: "1:1045629930316:web:852d783053c7a291a29de9",
};

let app: FirebaseApp | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured yet — add your project config values in src/lib/firebase.ts");
  }
  return app ?? (app = getApps().length ? getApp() : initializeApp(firebaseConfig));
}
