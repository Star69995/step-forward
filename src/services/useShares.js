import { useCallback, useEffect, useState } from "react";
import {
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { splitByTrash, purgeExpired, softDeleteDoc, restoreDoc } from "./trash";
import { ensureFreshVerifiedEmail, formatUserLabel } from "./userProfile";

// Recipient-side view of their saved providers (users/{uid}/shares/*) —
// each doc is both a grant record and the entry shown on the "נותני שירות"
// management screen. Revoked shares (deletedAt set) are split into a
// separate trash list rather than removed outright — see removeShare below.
export const useShares = (recipientUid) => {
    const [shares, setShares] = useState([]);
    const [trashedShares, setTrashedShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
        if (!recipientUid) return;

        let cancelled = false;
        const fetchShares = async () => {
            setLoading(true);
            try {
                const snap = await getDocs(collection(db, `users/${recipientUid}/shares`));
                const sharesData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                const { active, trashed } = splitByTrash(sharesData);
                if (!cancelled) {
                    setShares(active);
                    setTrashedShares(trashed);
                    setLoading(false);
                }
                purgeExpired(trashed, (share) => doc(db, `users/${recipientUid}/shares/${share.id}`));
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                setLoading(false);
            }
        };
        fetchShares();

        return () => {
            cancelled = true;
        };
    }, [recipientUid, refreshIndex]);

    const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

    return { shares, trashedShares, loading, refetch };
};

// scope/planIds/permission fully replace the previous grant — the
// management screen always sends the complete desired state, not a partial
// patch, so there's no risk of a stale planIds array lingering after a
// scope change from "selected" back to "all". createdAt is preserved on an
// existing grant rather than reset on every edit.
export const addOrUpdateShare = async (
    recipientUid,
    providerUid,
    {
        providerEmail,
        providerLabel,
        scope,
        planIds,
        permission,
        recipientEmail,
        recipientDisplayName,
        recipientLabel,
        recipientIsAnonymous,
    }
) => {
    const ref = doc(db, `users/${recipientUid}/shares/${providerUid}`);
    const existing = await getDoc(ref);

    await setDoc(
        ref,
        {
            providerUid,
            providerEmail,
            providerLabel,
            scope,
            planIds: scope === "selected" ? planIds : [],
            permission,
            // Denormalized so the provider side (ProviderSwitcher/RecipientPlans)
            // can show a readable label without an extra read per recipient.
            // providerLabel/recipientLabel are the single precomputed display
            // string (see userProfile.js's formatUserLabel) — the other
            // fields are kept only as a fallback source for shares written
            // before this field existed. recipientIsAnonymous lets a
            // provider's view of a shared plan (FormPage.jsx) know the
            // owner never stores a real name, without an extra profile read.
            recipientEmail,
            recipientDisplayName: recipientDisplayName || "",
            recipientLabel,
            recipientIsAnonymous: !!recipientIsAnonymous,
            updatedAt: serverTimestamp(),
            // Saving a share always means "this grant is active" — clears any
            // prior trashing if the same provider is re-added before the
            // 30-day window elapsed, instead of silently leaving it trashed.
            deletedAt: null,
            ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
    );
};

// Revocation moves the grant to the trash instead of deleting it outright,
// but must still block the provider's access immediately — see
// firestore.rules' shareActive() helper, which treats a trashed share as
// inactive the same as a missing one.
export const removeShare = async (recipientUid, providerUid) => {
    await softDeleteDoc(doc(db, `users/${recipientUid}/shares/${providerUid}`));
};

export const restoreShare = async (recipientUid, providerUid) => {
    await restoreDoc(doc(db, `users/${recipientUid}/shares/${providerUid}`));
};

export const deleteShareForever = async (recipientUid, providerUid) => {
    await deleteDoc(doc(db, `users/${recipientUid}/shares/${providerUid}`));
};

// A provider's own live grant for one recipient — fetched fresh (not from
// cached list state) whenever a permission decision actually gates a write,
// since a revoked/downgraded grant must take effect immediately.
export const fetchShare = async (recipientUid, providerUid) => {
    const snap = await getDoc(doc(db, `users/${recipientUid}/shares/${providerUid}`));
    return snap.exists() ? snap.data() : null;
};

// ---------------------------------------------------------------------
// Pending shares — an invite by email for someone who hasn't registered
// yet, kept at users/{recipientUid}/pendingShares/{lowercasedEmail} (same
// exact-match-by-email-only principle as emailIndex/resolveEmailToUser —
// see Providers.jsx's handleSubmit, which falls back to this when
// resolveEmailToUser finds no account). Same shape as a share (scope,
// planIds, permission, denormalized recipient label) minus providerUid/
// providerLabel, which don't exist yet. Goes through the same soft-delete/
// trash pattern as every other entity (see CLAUDE.md) — canceling an invite
// before it's claimed is a soft-delete like any other.
// ---------------------------------------------------------------------
export const usePendingShares = (recipientUid) => {
    const [pendingShares, setPendingShares] = useState([]);
    const [trashedPendingShares, setTrashedPendingShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
        if (!recipientUid) return;

        let cancelled = false;
        const fetchPending = async () => {
            setLoading(true);
            try {
                const snap = await getDocs(collection(db, `users/${recipientUid}/pendingShares`));
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                const { active, trashed } = splitByTrash(data);
                if (!cancelled) {
                    setPendingShares(active);
                    setTrashedPendingShares(trashed);
                    setLoading(false);
                }
                purgeExpired(trashed, (item) => doc(db, `users/${recipientUid}/pendingShares/${item.id}`));
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                setLoading(false);
            }
        };
        fetchPending();

        return () => {
            cancelled = true;
        };
    }, [recipientUid, refreshIndex]);

    const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

    return { pendingShares, trashedPendingShares, loading, refetch };
};

export const addOrUpdatePendingShare = async (
    recipientUid,
    email,
    { scope, planIds, permission, recipientEmail, recipientDisplayName, recipientLabel, recipientIsAnonymous }
) => {
    const emailId = email.trim().toLowerCase();
    const ref = doc(db, `users/${recipientUid}/pendingShares/${emailId}`);
    const existing = await getDoc(ref);

    await setDoc(
        ref,
        {
            email: emailId,
            scope,
            planIds: scope === "selected" ? planIds : [],
            permission,
            recipientEmail,
            recipientDisplayName: recipientDisplayName || "",
            recipientLabel,
            recipientIsAnonymous: !!recipientIsAnonymous,
            updatedAt: serverTimestamp(),
            deletedAt: null,
            ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
    );
};

export const removePendingShare = async (recipientUid, email) => {
    await softDeleteDoc(doc(db, `users/${recipientUid}/pendingShares/${email}`));
};

export const restorePendingShare = async (recipientUid, email) => {
    await restoreDoc(doc(db, `users/${recipientUid}/pendingShares/${email}`));
};

export const deletePendingShareForever = async (recipientUid, email) => {
    await deleteDoc(doc(db, `users/${recipientUid}/pendingShares/${email}`));
};

// Called once per session for a signed-in user right after their profile
// loads (see AuthContext.jsx, alongside ensureEmailIndex) — finds any
// pendingShares docs invited by email before this account existed, and
// converts each into a real, active share for this uid, deleting the
// pending doc so it's claimed exactly once. Only a provider account can be
// shared with (see Providers.jsx's role check on direct-resolve), so this
// is a no-op for a recipient account — the invite is left untouched in case
// the intended person registers later with the right role. Best-effort,
// same as ensureEmailIndex — a failure here must never block sign-in.
export const claimPendingSharesForEmail = async (user, profile) => {
    if (!profile || profile.role !== "provider") return;
    try {
        if (!(await ensureFreshVerifiedEmail(user))) return;

        const emailId = user.email.toLowerCase();
        const snap = await getDocs(query(collectionGroup(db, "pendingShares"), where("email", "==", emailId)));
        const providerLabel = formatUserLabel({
            displayName: profile.displayName,
            username: profile.username,
            email: user.email,
        });

        for (const pendingDoc of snap.docs) {
            // Each match is claimed independently — one recipient's bad/
            // stale invite must not block claiming the others.
            try {
                const pending = pendingDoc.data();
                if (pending.deletedAt) continue; // cancelled invite — nothing to claim
                const recipientUid = pendingDoc.ref.parent.parent.id;

                const batch = writeBatch(db);
                batch.set(doc(db, `users/${recipientUid}/shares/${user.uid}`), {
                    providerUid: user.uid,
                    providerEmail: emailId,
                    providerLabel,
                    scope: pending.scope,
                    planIds: pending.planIds || [],
                    permission: pending.permission,
                    recipientEmail: pending.recipientEmail || "",
                    recipientDisplayName: pending.recipientDisplayName || "",
                    recipientLabel: pending.recipientLabel,
                    recipientIsAnonymous: !!pending.recipientIsAnonymous,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    deletedAt: null,
                });
                batch.delete(pendingDoc.ref);
                await batch.commit();
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
};
