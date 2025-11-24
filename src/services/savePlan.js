import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { v4 as uuidv4 } from "uuid";

export const savePlan = async (uid, planData, planId = null) => {
    const id = planId || uuidv4();
    const ref = doc(db, `users/${uid}/plans/${id}`);

    // Build document object safely
    const dataToSave = {
        ...planData,
        updatedAt: serverTimestamp(),
    };

    if (!planId || !planData.createdAt) {
        dataToSave.createdAt = serverTimestamp();
    } else {
        dataToSave.createdAt = planData.createdAt;
    }

    await setDoc(ref, dataToSave, { merge: true });
    console.log('dataToSave: ', dataToSave);
    return id;
};