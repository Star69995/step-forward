import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { normalizeUsername } from "./anonymousAccount";

// Claims users/{uid}'s chosen, unique, public handle. Mirrors emailIndex's
// structure, but deliberately stores nothing beyond {uid, role, username} —
// unlike emailIndex, usernameIndex's `get` is public/unauthenticated (see
// firestore.rules), so a real name stored here would be readable by anyone
// on the internet who knows or guesses a username, without ever logging in.
//
// No transaction needed to avoid a duplicate-claim race: firestore.rules
// evaluates a write to an already-existing document as an "update", not a
// "create", regardless of arrival order — so if two callers race for the
// same new username, whichever commits first wins the "create", and the
// second is evaluated as an "update" by a different uid than the doc's
// owner and rejected. Throws (permission-denied) if the username is taken.
export const claimUsername = async (user, role, username) => {
    const usernameId = normalizeUsername(username);
    await setDoc(doc(db, `usernameIndex/${usernameId}`), {
        uid: user.uid,
        role,
        username: usernameId,
    });
};
