import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { initializeFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
// ignoreUndefinedProperties: form fields like a goal's `done`/`doneDate`
// stay undefined in react-hook-form state until the user first interacts
// with them; without this, setDoc()/updateDoc() throw on any save of a
// plan whose completion checkboxes were never touched.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });

// Local-only: point the SDK at the Firebase Local Emulator Suite instead of
// the real project, so signup/sharing/comments can be exercised end to end
// without touching production Auth/Firestore data. Toggled by an env flag
// (see .env.example) rather than always-on so a normal `npm run dev` still
// talks to the real project.
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
    // Talk to the emulators through the page's own origin - the dev server
    // proxies their endpoints (see `emulatorProxy` in vite.config.js) - so
    // opening the dev server from a phone on the LAN via the host machine's
    // IP needs no extra ports, and the Google sign-in popup is same-origin.
    const { origin, hostname, port, protocol } = window.location;
    connectAuthEmulator(auth, origin, { disableWarnings: true });
    connectFirestoreEmulator(db, hostname, Number(port) || (protocol === "https:" ? 443 : 80));
}
