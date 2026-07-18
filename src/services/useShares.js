import { useCallback, useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { splitByTrash, purgeExpired, softDeleteDoc, restoreDoc } from "./trash";

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
            const snap = await getDocs(collection(db, `users/${recipientUid}/shares`));
            const sharesData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const { active, trashed } = splitByTrash(sharesData);
            if (!cancelled) {
                setShares(active);
                setTrashedShares(trashed);
                setLoading(false);
            }
            purgeExpired(trashed, (share) => doc(db, `users/${recipientUid}/shares/${share.id}`));
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
    { providerEmail, scope, planIds, permission, recipientEmail, recipientDisplayName }
) => {
    const ref = doc(db, `users/${recipientUid}/shares/${providerUid}`);
    const existing = await getDoc(ref);

    await setDoc(
        ref,
        {
            providerUid,
            providerEmail,
            scope,
            planIds: scope === "selected" ? planIds : [],
            permission,
            // Denormalized so the provider side (ProviderSwitcher/RecipientPlans)
            // can show a readable label without an extra read per recipient.
            recipientEmail,
            recipientDisplayName: recipientDisplayName || "",
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
