import { doc, collection, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { v4 as uuidv4 } from "uuid";

// Edits that land within this gap of the current version's last update fold
// into the same version doc instead of opening a new one — so a plan that's
// autosaved every couple of seconds while someone is actively typing doesn't
// turn into dozens of separate "versions". A gap this size (or a page
// reload hours/days later) starts a fresh version instead, which is exactly
// what surfaces "someone edited this long after it was created" in the
// version history UI. See planVersions.js/VersionHistory.jsx.
export const VERSION_SESSION_GAP_MS = 60 * 60 * 1000;

// Meta fields live on the plan document itself but aren't part of its
// editable content, so they're excluded from the snapshot stored on each
// version (which represents "what the form looked like", not bookkeeping).
const META_FIELDS = ["createdAt", "updatedAt", "versionSessionId", "versionSessionAt"];

const contentOnly = (planData) => {
    const content = { ...planData };
    META_FIELDS.forEach((key) => delete content[key]);
    return content;
};

// editor identifies whoever is saving right now ({ uid, name, role }) — the
// recipient themself or a provider with an edit grant, exactly like
// CommentThread's authorUid/authorName/authorRole. It's optional so any
// future caller that doesn't need version tracking can omit it, but the
// only caller today (FormPage.jsx) always has it available.
//
// forceNewVersion/revertedFromVersionId are used by VersionHistory.jsx's
// revert action: a revert always opens its own version (regardless of the
// session gap) so it's never silently folded into — and so hides — the
// version that was open right before it.
export const savePlan = async (
    uid,
    planData,
    planId = null,
    editor = null,
    { forceNewVersion = false, revertedFromVersionId = null } = {}
) => {
    const id = planId || uuidv4();
    const ref = doc(db, `users/${uid}/plans/${id}`);

    const dataToSave = {
        ...planData,
        updatedAt: serverTimestamp(),
    };

    if (!planId || !planData.createdAt) {
        dataToSave.createdAt = serverTimestamp();
    } else {
        dataToSave.createdAt = planData.createdAt;
    }

    const batch = writeBatch(db);

    if (editor) {
        const sessionAt = planData.versionSessionAt?.toDate ? planData.versionSessionAt.toDate() : null;
        const withinSameSession =
            !forceNewVersion &&
            !!planData.versionSessionId &&
            !!sessionAt &&
            Date.now() - sessionAt.getTime() < VERSION_SESSION_GAP_MS;

        const content = contentOnly(dataToSave);
        const editedBy = {
            editedByUid: editor.uid,
            editedByName: editor.name,
            editedByRole: editor.role,
        };

        let versionSessionId;
        if (withinSameSession) {
            versionSessionId = planData.versionSessionId;
            batch.set(
                doc(db, `users/${uid}/plans/${id}/versions/${versionSessionId}`),
                { data: content, updatedAt: serverTimestamp(), ...editedBy },
                { merge: true }
            );
        } else {
            const versionRef = doc(collection(db, `users/${uid}/plans/${id}/versions`));
            versionSessionId = versionRef.id;
            batch.set(versionRef, {
                data: content,
                startedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                ...editedBy,
                ...(revertedFromVersionId ? { revertedFromVersionId } : {}),
            });
        }

        dataToSave.versionSessionId = versionSessionId;
        dataToSave.versionSessionAt = serverTimestamp();
    }

    batch.set(ref, dataToSave, { merge: true });
    await batch.commit();
    return id;
};
