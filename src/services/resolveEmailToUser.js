import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// The only place in the app that turns a typed email into a uid — a single
// getDoc by exact key (see firestore.rules: emailIndex allows `get`, never
// `list`), so there is no way to browse/search registered users this way.
export const resolveEmailToUser = async (email) => {
    const emailId = email.trim().toLowerCase();
    if (!emailId) return null;

    const snap = await getDoc(doc(db, `emailIndex/${emailId}`));
    return snap.exists() ? snap.data() : null;
};
