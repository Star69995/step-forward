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
    // Use the hostname the page was loaded from (not a hardcoded
    // 127.0.0.1) so this also works when the dev server is opened from
    // another device on the LAN via the host machine's IP.
    const emulatorHost = window.location.hostname;
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, emulatorHost, 8080);
}
