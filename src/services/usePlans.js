import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { splitByTrash, purgeExpired } from "./trash";

// Single source for "fetch a user's saved plans" — used by the profile
// list and the header's plan switcher, so there's one place that defines
// how plans are read and sorted instead of two separate Firestore queries.
// Trashed plans (deletedAt set) are split out separately rather than
// filtered server-side, since the whole collection is already fetched
// unfiltered today and is small (one user's own plans).
export const usePlans = (uid) => {
    const [plans, setPlans] = useState([]);
    const [trashedPlans, setTrashedPlans] = useState([]);
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
            const { active, trashed } = splitByTrash(plansData);
            if (!cancelled) {
                setPlans(active);
                setTrashedPlans(trashed);
                setLoading(false);
            }
            purgeExpired(trashed, (plan) => doc(db, `users/${uid}/plans/${plan.id}`));
        };
        fetchPlans();

        return () => {
            cancelled = true;
        };
    }, [uid, refreshIndex]);

    const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

    return { plans, trashedPlans, loading, refetch, setPlans, setTrashedPlans };
};

// Plans have no user-chosen title — everywhere a plan needs a label in the
// UI, it's identified by its creation date instead. Single place for that
// formatting so every list (Profile, PlanSwitcher, RecipientPlans, Providers)
// shows the same label. When two or more plans share the same creation date,
// pass the sibling list (allPlans) so later ones get a "(2)", "(3)"... suffix
// in creation order — otherwise they'd be visually indistinguishable.
export const formatPlanLabel = (plan, allPlans = []) => {
    if (!plan?.createdAt) return "תוכנית חדשה";
    const dateLabel = plan.createdAt.toDate().toLocaleDateString("he-IL");

    const sameDay = allPlans
        .filter((p) => p.createdAt && p.createdAt.toDate().toLocaleDateString("he-IL") === dateLabel)
        .sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate());
    const ordinal = sameDay.findIndex((p) => p.id === plan.id) + 1;

    return ordinal > 1 ? `${dateLabel} (${ordinal})` : dateLabel;
};
