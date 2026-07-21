import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

// A plan's version history — one read of the (small, bounded — one entry per
// ~hour-long editing session over the plan's whole lifetime) versions
// subcollection written by savePlan.js. Unlike comments/shares/plans there's
// no trash split here: history is permanent (firestore.rules denies delete
// outright), so nothing to purge. Fetched eagerly alongside the rest of the
// page's data, same as useComments.js, rather than lazily on first expand.
export const usePlanVersions = (ownerUid, planId) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
        if (!ownerUid || !planId) return;

        let cancelled = false;
        const fetchVersions = async () => {
            setLoading(true);
            const versionsRef = collection(db, `users/${ownerUid}/plans/${planId}/versions`);
            const snap = await getDocs(query(versionsRef, orderBy("startedAt", "asc")));
            if (!cancelled) {
                setVersions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            }
        };
        fetchVersions();

        return () => {
            cancelled = true;
        };
    }, [ownerUid, planId, refreshIndex]);

    const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

    return { versions, loading, refetch };
};

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// Recursively compares two content snapshots (as stored in a version's
// `data` field) and returns every leaf field that changed, dotted-path style
// (e.g. "shortGoals.one.description"). Used to show what changed between one
// version and the one before it.
export const diffPlanContent = (before = {}, after = {}, pathPrefix = []) => {
    const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    const diffs = [];
    for (const key of keys) {
        const path = [...pathPrefix, key];
        const beforeVal = before?.[key];
        const afterVal = after?.[key];
        if (isPlainObject(beforeVal) || isPlainObject(afterVal)) {
            diffs.push(...diffPlanContent(beforeVal || {}, afterVal || {}, path));
        } else if ((beforeVal ?? "") !== (afterVal ?? "")) {
            diffs.push({ path: path.join("."), before: beforeVal, after: afterVal });
        }
    }
    return diffs;
};

// Hebrew labels for the diff view only — a focused, single-purpose source
// distinct from the form's own JSX labels (FormPage.jsx/GoalSection.jsx/
// Goal.jsx), which stay as plain inline text since they aren't reused
// anywhere else. An unmapped path (e.g. a future new field) still shows,
// just as its raw dotted path, instead of being silently hidden.
const TOP_LEVEL_LABELS = {
    name: "שם מלא",
    startDate: "תחילת התהליך",
    endDate: "כתיבת התוכנית",
    partners: "שותפים",
    successUntilNow: "מה הצלחתי עד עכשיו",
    toolsUsed: "אילו כלים",
    whatILearned: "מה למדתי",
    motivatingFactors: "מה מסקרן אותי",
    whoHelpsMe: "מי/מה עוזר",
    whatImportantNow: "מה חשוב לי עכשיו",
    myStrengths: "כוחות ומשאבים",
    longTermGoal: "מטרה לטווח ארוך",
    futureVision: "מטרת-על (תמונת עתיד)",
};

const GOAL_INDEX_LABELS = { one: "1", two: "2", three: "3" };

const GOAL_FIELD_LABELS = {
    description: "תיאור המטרה",
    done: "המטרה הושגה",
    doneDate: "תאריך השגת המטרה",
};

const TARGET_FIELD_LABELS = {
    text: "תיאור היעד",
    endDate: "תאריך סיום",
    done: "היעד הושלם",
    doneDate: "תאריך השלמת היעד",
};

export const labelForPath = (path) => {
    const parts = path.split(".");

    if (parts[0] === "shortGoals" && parts.length >= 3) {
        const goalNum = GOAL_INDEX_LABELS[parts[1]] || parts[1];
        const rest = parts[2];

        if (rest.startsWith("target") && parts.length >= 4) {
            const targetLabel = TARGET_FIELD_LABELS[parts[3]] || parts[3];
            return `מטרה קצרת טווח #${goalNum} — יעד #${rest.replace("target", "")} — ${targetLabel}`;
        }

        return `מטרה קצרת טווח #${goalNum} — ${GOAL_FIELD_LABELS[rest] || rest}`;
    }

    return TOP_LEVEL_LABELS[path] || path;
};
