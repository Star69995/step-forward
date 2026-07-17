import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Single source for "fetch a user's saved plans" — used by the profile
// list and the header's plan switcher, so there's one place that defines
// how plans are read and sorted instead of two separate Firestore queries.
export const usePlans = (uid) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
        if (!uid) return;

        let cancelled = false;
        const fetchPlans = async () => {
            setLoading(true);
            const plansRef = collection(db, `users/${uid}/plans`);
            const snap = await getDocs(plansRef);
            const plansData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Newest-created plan first, everywhere plans are listed.
            plansData.sort(
                (a, b) => (b.createdAt?.toDate() || new Date(0)) - (a.createdAt?.toDate() || new Date(0))
            );
            if (!cancelled) {
                setPlans(plansData);
                setLoading(false);
            }
        };
        fetchPlans();

        return () => {
            cancelled = true;
        };
    }, [uid, refreshIndex]);

    const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

    return { plans, loading, refetch, setPlans };
};
