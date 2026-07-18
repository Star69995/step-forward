import { useCallback, useEffect, useState } from "react";
import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { splitByTrash } from "./trash";

// Provider-side: every recipient who currently has an active grant for this
// provider, discovered via a collection-group query across all
// users/*/shares docs (see firestore.rules + firestore.indexes.json field
// override on shares.providerUid) instead of any kind of user directory.
export const useSharedWithMe = (providerUid) => {
    const [recipients, setRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
        if (!providerUid) return;

        let cancelled = false;
        const fetchShares = async () => {
            setLoading(true);
            const snap = await getDocs(query(collectionGroup(db, "shares"), where("providerUid", "==", providerUid)));
            const shares = snap.docs.map((d) => ({
                // A recipient's shares subcollection lives at users/{recipientUid}/shares/{providerUid}.
                recipientUid: d.ref.parent.parent.id,
                ...d.data(),
            }));
            // Filtered client-side rather than with a deletedAt Firestore
            // filter: a `where("deletedAt", "==", null)` clause would silently
            // exclude any share document that predates this field entirely
            // (missing != null in Firestore), which would hide pre-existing
            // shares. This query is already scoped to one provider's own
            // grants, so the extra client-side split costs nothing.
            const { active } = splitByTrash(shares);
            if (!cancelled) {
                setRecipients(active);
                setLoading(false);
            }
        };
        fetchShares();

        return () => {
            cancelled = true;
        };
    }, [providerUid, refreshIndex]);

    const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

    return { recipients, loading, refetch };
};
