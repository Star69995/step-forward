import { useCallback, useEffect, useState } from "react";
import { loadPlan } from "./loadPlan";

// The plan a plan links back to as its "previous plan" (`previousPlanId`,
// always another plan of the same owner). Read with a single getDoc only
// when a link exists, and not at all when the plan was just picked from a
// list that already holds its data - `provide` hands that data over.
// status: "none" (no link), "loading", "ready", "missing" (deleted for
// good) or "denied" (a provider whose grant doesn't cover the linked plan).
export const useLinkedPlan = (ownerUid, linkedPlanId) => {
    const [loaded, setLoaded] = useState({ id: null, plan: null, status: "none" });

    useEffect(() => {
        if (!linkedPlanId || loaded.id === linkedPlanId) return;
        let cancelled = false;
        const fetchLinked = async () => {
            try {
                const data = await loadPlan(ownerUid, linkedPlanId);
                if (cancelled) return;
                setLoaded({
                    id: linkedPlanId,
                    plan: data ? { id: linkedPlanId, ...data } : null,
                    status: data ? "ready" : "missing",
                });
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                setLoaded({ id: linkedPlanId, plan: null, status: "denied" });
            }
        };
        fetchLinked();
        return () => {
            cancelled = true;
        };
    }, [ownerUid, linkedPlanId, loaded.id]);

    const provide = useCallback((plan) => setLoaded({ id: plan.id, plan, status: "ready" }), []);

    if (!linkedPlanId) return { plan: null, status: "none", provide };
    if (loaded.id !== linkedPlanId) return { plan: null, status: "loading", provide };
    return { plan: loaded.plan, status: loaded.status, provide };
};
