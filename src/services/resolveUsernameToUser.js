import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { normalizeUsername } from "./anonymousAccount";

// Mirrors resolveEmailToUser.js exactly — a single getDoc by exact key
// (usernameIndex allows `get`, never `list`), so there is no way to
// browse/search registered usernames this way. Unlike emailIndex, this
// `get` is public/unauthenticated (see firestore.rules), which also powers
// the live "is this username available" check during registration.
export const resolveUsernameToUser = async (username) => {
    const usernameId = normalizeUsername(username);
    if (!usernameId) return null;

    const snap = await getDoc(doc(db, `usernameIndex/${usernameId}`));
    return snap.exists() ? snap.data() : null;
};
