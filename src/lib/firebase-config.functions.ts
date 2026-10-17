import { createServerFn } from "@tanstack/react-start";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

// Firebase's browser SDK needs the web API key at runtime. The key is public by
// design (Firebase protects data with Security Rules, not secrecy), but it is
// kept in the secret store so it never sits in the source tree. Read it inside
// the handler only — module-scope process.env is bundled to the client.
export const getFirebaseConfig = createServerFn({ method: "GET" }).handler(async (): Promise<FirebaseConfig> => {
  const apiKey = process.env["GOOGLE_API_KEY"] ?? "";
  return {
    apiKey,
    authDomain: "mozaic-vault.firebaseapp.com",
    projectId: "mozaic-vault",
    storageBucket: "mozaic-vault.firebasestorage.app",
    messagingSenderId: "1045629930316",
    appId: "1:1045629930316:web:852d783053c7a291a29de9",
  };
});
