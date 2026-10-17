// Firebase initialization. The project id, auth domain, storage bucket and app
// id are public identifiers; the web API key is served at runtime by a server
// function that reads it from the secret store, so nothing sensitive lives in
// this file. Firebase guards access with Security Rules, not with a hidden key.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirebaseConfig } from "@/lib/firebase-config.functions";

let app: FirebaseApp | null = null;
let pending: Promise<FirebaseApp> | null = null;

// Resolve the Firebase app once, lazily, from the browser. Safe to call many
// times: the config fetch and initializeApp happen a single time.
export function getFirebaseApp(): Promise<FirebaseApp> {
  if (app) return Promise.resolve(app);
  pending ??= (async () => {
    const config = await getFirebaseConfig();
    if (!config.apiKey) {
      throw new Error("Firebase web API key is not saved yet — add it in Project Settings → Secrets as GOOGLE_API_KEY");
    }
    app = getApps().length ? getApp() : initializeApp(config);
    return app;
  })();
  return pending;
}

// Non-secret identifiers, used for status messages and diagnostics.
export const firebaseProjectId = "mozaic-vault";
