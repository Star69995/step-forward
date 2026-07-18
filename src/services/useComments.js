import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { splitByTrash, purgeExpired, softDeleteDoc, restoreDoc } from "./trash";

// All of a plan's comments (whole-plan and per-goal) are fetched once here
// and filtered by targetGoal client-side wherever they're shown (FormPage's
// plan-level thread, each GoalSection's thread) — one read instead of one
// query per thread on the same page. Trashed comments (deletedAt set) are
// split out the same way, rather than filtered server-side, to avoid a
// second index-dependent query for a collection that's already small.
export const useComments = (ownerUid, planId) => {
    const [comments, setComments] = useState([]);
    const [trashedComments, setTrashedComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
        if (!ownerUid || !planId) return;

        let cancelled = false;
        const fetchComments = async () => {
            setLoading(true);
            const commentsRef = collection(db, `users/${ownerUid}/plans/${planId}/comments`);
            const snap = await getDocs(query(commentsRef, orderBy("createdAt", "asc")));
            const commentsData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const { active, trashed } = splitByTrash(commentsData);
            if (!cancelled) {
                setComments(active);
                setTrashedComments(trashed);
                setLoading(false);
            }
            purgeExpired(trashed, (comment) => doc(db, `users/${ownerUid}/plans/${planId}/comments/${comment.id}`));
        };
        fetchComments();

        return () => {
            cancelled = true;
        };
    }, [ownerUid, planId, refreshIndex]);

    const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

    return { comments, trashedComments, loading, refetch, setComments, setTrashedComments };
};

export const addComment = async (ownerUid, planId, { text, targetGoal, authorUid, authorName, authorRole }) => {
    const commentsRef = collection(db, `users/${ownerUid}/plans/${planId}/comments`);
    const docRef = await addDoc(commentsRef, {
        text,
        targetGoal: targetGoal || null,
        authorUid,
        authorName,
        authorRole,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const deleteComment = async (ownerUid, planId, commentId) => {
    await softDeleteDoc(doc(db, `users/${ownerUid}/plans/${planId}/comments/${commentId}`));
};

export const restoreComment = async (ownerUid, planId, commentId) => {
    await restoreDoc(doc(db, `users/${ownerUid}/plans/${planId}/comments/${commentId}`));
};

export const deleteCommentForever = async (ownerUid, planId, commentId) => {
    await deleteDoc(doc(db, `users/${ownerUid}/plans/${planId}/comments/${commentId}`));
};
