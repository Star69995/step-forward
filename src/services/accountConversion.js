import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, sendEmailVerification } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { updateUserProfile } from "./userProfile";
import { syntheticEmailForUsername } from "./anonymousAccount";

// Both conversion directions require re-entering the current password first
// — Firebase requires a "recent" sign-in before a sensitive change like
// updateEmail, and there's no existing reauthentication flow anywhere else
// in this app to reuse. Scoped to password-based accounts only (see
// Profile.jsx) — a Google-only account has no password to reauthenticate
// with, and already has a real, recoverable identity via Google, so
// converting it either direction is out of scope for now.
const reauthenticate = async (user, currentPassword) => {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
};

// Regular (real-email) account -> anonymous. The username itself never
// changes — its usernameIndex claim and any existing shares (uid-keyed, not
// email-keyed) stay valid untouched. The old emailIndex entry is removed so
// sharing-by-email can no longer resolve to this now-anonymous account.
export const convertToAnonymous = async (user, currentPassword, username) => {
    await reauthenticate(user, currentPassword);
    const oldEmail = user.email;
    const syntheticEmail = syntheticEmailForUsername(username);
    await updateEmail(user, syntheticEmail);
    // Firebase doesn't auto-refresh the cached ID token after updateEmail —
    // force one so any immediately-following Firestore write already carries
    // the new email in its auth token (see ensureEmailIndex for the same pattern).
    await user.getIdToken(true);
    await updateUserProfile(user.uid, { email: syntheticEmail, isAnonymous: true });
    if (oldEmail) {
        await deleteDoc(doc(db, `emailIndex/${oldEmail.toLowerCase()}`)).catch(() => {});
    }
};

// Anonymous account -> regular (real-email). emailIndex creation itself
// keeps happening the same way it always does for any account — via
// AuthContext's ensureEmailIndex self-heal, once the new address is
// verified — no new code needed for that part.
export const convertToRegular = async (user, currentPassword, newEmail) => {
    await reauthenticate(user, currentPassword);
    const normalizedEmail = newEmail.trim().toLowerCase();
    await updateEmail(user, normalizedEmail);
    await user.getIdToken(true);
    await updateUserProfile(user.uid, { email: normalizedEmail, isAnonymous: false });
    await sendEmailVerification(user);
};
