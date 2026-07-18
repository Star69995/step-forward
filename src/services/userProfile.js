import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Single place that creates/reads the users/{uid} profile doc (role +
// display info) — the one thing Firebase Auth itself doesn't store.
export const createUserProfile = async (user, role) => {
    const ref = doc(db, `users/${user.uid}`);
    await setDoc(
        ref,
        {
            role,
            email: user.email,
            displayName: user.displayName || "",
            createdAt: serverTimestamp(),
        },
        { merge: true }
    );
};

export const fetchUserProfile = async (uid) => {
    const snap = await getDoc(doc(db, `users/${uid}`));
    return snap.exists() ? snap.data() : null;
};

// Generic merge-update for self-service profile preferences (e.g. display
// density) — anything that isn't the protected `role` field.
export const updateUserProfile = async (uid, fields) => {
    const ref = doc(db, `users/${uid}`);
    await setDoc(ref, fields, { merge: true });
};

// Best-effort: lets other users find this account by exact email (see
// firestore.rules — requires a verified email, so this silently does
// nothing until the user confirms their address). Not calling this is
// never a user-facing failure, so permission-denied is swallowed here
// rather than surfaced as an error.
//
// Verification usually happens by clicking the emailed link in a different
// tab/session, so the local user object and its cached ID token can both be
// stale here — reload() refreshes `emailVerified`, and getIdToken(true)
// forces a fresh token so the `email_verified` claim firestore.rules checks
// is actually up to date, instead of silently failing on a stale token.
export const ensureEmailIndex = async (user, role, displayName) => {
    await user.reload();
    if (!user.email || !user.emailVerified) return;
    await user.getIdToken(true);

    const emailId = user.email.toLowerCase();
    try {
        await setDoc(
            doc(db, `emailIndex/${emailId}`),
            { uid: user.uid, role, displayName: displayName || "", email: emailId },
            { merge: true }
        );
    } catch (error) {
        console.error("Could not update email index:", error);
    }
};
