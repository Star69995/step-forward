// services/loadPlan.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const loadPlan = async (uid, planId) => {
    const ref = doc(db, `users/${uid}/plans/${planId}`);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        return snap.data();
    } else {
        console.log("No saved plan found");
        return null;
    }
};