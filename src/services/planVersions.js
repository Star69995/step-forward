import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import { ASSESSMENT_DOMAINS, REVIEW_ROWS, REVIEW_PERSPECTIVES } from "./planFields";

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
            try {
                const versionsRef = collection(db, `users/${ownerUid}/plans/${planId}/versions`);
                const snap = await getDocs(query(versionsRef, orderBy("startedAt", "asc")));
                if (!cancelled) {
                    setVersions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                    setLoading(false);
                }
            } catch (error) {
                if (cancelled) return;
                console.error(error);
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
const OPAQUE_ID_PATHS = new Set(["previousPlanId"]);

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
            // A linked plan's id is meaningless to read - shown as linked or not.
            const opaque = OPAQUE_ID_PATHS.has(path.join("."));
            diffs.push({
                path: path.join("."),
                before: opaque ? !!beforeVal : beforeVal,
                after: opaque ? !!afterVal : afterVal,
            });
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
    futureVision: "מטרת-על (תמונת עתיד - החלום)",
    socialWorker: "שם העו״ס",
    counselor: "שם המדריך/ה",
    previousPlanDate: "התוכנית הקודמת",
    previousPlanId: "קישור לתוכנית קודמת מהאתר",
    nextPlanIn: "התוכנית הבאה בעוד",
    previousGoals: "היעדים שהוצבו בתוכנית הקודמת",
    recipientNotes: "ההערות שלי לתוכנית",
    staffNotes: "הערות הגורם הטיפולי",
};

// assessment.{domain}.{item|notes} / review.{row}.{perspective} — labeled
// from planFields.js, the same list the form itself renders from.
const labelForListPath = (parts) => {
    if (parts[0] === "assessment" && parts.length === 3) {
        const domain = ASSESSMENT_DOMAINS.find((d) => d.key === parts[1]);
        if (!domain) return null;
        const item = parts[2] === "notes" ? "הערות" : domain.items.find((i) => i.key === parts[2])?.label;
        return item ? `הערכה תפקודית - ${domain.label} - ${item}` : null;
    }
    if (parts[0] === "review" && parts.length === 3) {
        const row = REVIEW_ROWS.find((r) => r.key === parts[1]);
        const perspective = REVIEW_PERSPECTIVES.find((v) => v.key === parts[2]);
        return row && perspective ? `${row.label} - ${perspective.label}` : null;
    }
    return null;
};

const GOAL_INDEX_LABELS = { one: "1", two: "2", three: "3" };

const GOAL_FIELD_LABELS = {
    description: "תיאור המטרה",
    actions: "פעולות",
    obstacles: "אתגרים",
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
            return `מטרה קצרת טווח #${goalNum} - יעד #${rest.replace("target", "")} - ${targetLabel}`;
        }

        return `מטרה קצרת טווח #${goalNum} - ${GOAL_FIELD_LABELS[rest] || rest}`;
    }

    return labelForListPath(parts) || TOP_LEVEL_LABELS[path] || path;
};
