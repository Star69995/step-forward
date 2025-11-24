import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDGMyNqGdVD2Vowb53TqQFLdCg34-HueVc",
    authDomain: "beyond-borders-23adb.firebaseapp.com",
    projectId: "beyond-borders-23adb",
    storageBucket: "beyond-borders-23adb.appspot.com",
    messagingSenderId: "183027104842",
    appId: "1:183027104842:web:430a530aef0da40ffb3ab3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);