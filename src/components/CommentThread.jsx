import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { addComment, deleteComment, restoreComment, deleteCommentForever } from "../services/useComments";
import { ROLE_META } from "../services/roles";
import Button from "./ui/Button";
import TextField from "./ui/TextField";
import ConfirmDialog from "./ui/ConfirmDialog";
import TrashSection from "./ui/TrashSection";
import { MessageSquare, Send, Trash2 } from "lucide-react";

// A dated, author-attributed comment log — usable both for a whole plan
// (targetGoal=null) and for one specific short-term goal. Hidden from the
// PDF export (pdf-hidden) since it's an internal collaboration log, not
// part of the printed plan itself.
const CommentThread = ({
    ownerUid,
    planId,
    targetGoal = null,
    comments,
    trashedComments = [],
    loading,
    onAdded,
    onTrashed,
    onRestored,
    onDeletedForever,
    isOwner,
    title = "הערות ועדכוני התקדמות",
}) => {
    const { currentUser, role } = useAuth();
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;

        setSubmitting(true);
        try {
            const authorName = currentUser.displayName || currentUser.email;
            const id = await addComment(ownerUid, planId, {
                text: trimmed,
                targetGoal,
                authorUid: currentUser.uid,
                authorName,
                authorRole: role,
            });
            onAdded({
                id,
                text: trimmed,
                targetGoal: targetGoal || null,
                authorUid: currentUser.uid,
                authorName,
                authorRole: role,
                createdAt: null,
            });
            setText("");
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בשליחת ההערה");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;
        setDeleting(true);
        try {
            await deleteComment(ownerUid, planId, pendingDelete.id);
            onTrashed(pendingDelete);
            toast.success("ההערה הועברה לפח המחזור");
        } catch (error) {
            console.error(error);
            toast.error("שגיאה במחיקת ההערה");
        } finally {
            setDeleting(false);
            setPendingDelete(null);
        }
    };

    const handleRestore = async (comment) => {
        await restoreComment(ownerUid, planId, comment.id);
        onRestored(comment);
        toast.success("ההערה שוחזרה בהצלחה");
    };

    const handleDeleteForever = async (comment) => {
        await deleteCommentForever(ownerUid, planId, comment.id);
        onDeletedForever(comment.id);
        toast.success("ההערה נמחקה לצמיתות");
    };

    // A viewer only manages their own trashed comments — the recipient
    // (isOwner) can manage all of them, matching the same split the
    // firestore.rules update/delete rule already enforces.
    const manageableTrashed = isOwner
        ? trashedComments
        : trashedComments.filter((c) => c.authorUid === currentUser.uid);

    return (
        <div className="pdf-hidden mt-4 pt-4 border-t border-border/70">
            <h4 className="flex items-center gap-2 text-sm font-bold text-heading mb-3">
                <MessageSquare size={16} aria-hidden="true" />
                {title}
            </h4>

            {loading ? (
                <p className="text-sm text-muted mb-3">טוען הערות...</p>
            ) : comments.length === 0 ? (
                <p className="text-sm text-muted mb-3">אין עדיין הערות</p>
            ) : (
                <ul className="flex flex-col gap-2 mb-3 max-h-64 overflow-y-auto">
                    {comments.map((comment) => (
                        <li key={comment.id} className="bg-surface-muted rounded-lg p-3 text-sm">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-heading">{comment.authorName}</span>
                                    <span className="text-muted text-xs">
                                        {ROLE_META[comment.authorRole]?.label}
                                    </span>
                                </div>
                                {(isOwner || comment.authorUid === currentUser.uid) && (
                                    <button
                                        type="button"
                                        onClick={() => setPendingDelete(comment)}
                                        className="text-muted hover:text-danger transition shrink-0"
                                        aria-label="מחיקת הערה"
                                    >
                                        <Trash2 size={14} aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                            <p className="text-body mt-1 wrap-break-word">{comment.text}</p>
                            <span className="text-muted text-xs">
                                {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString("he-IL") : "כרגע"}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
                <TextField
                    as="input"
                    type="text"
                    dense
                    className="flex-1"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="הוספת הערה..."
                    disabled={submitting}
                />
                <Button type="submit" size="sm" variant="primary" icon={Send} loading={submitting} className="shrink-0">
                    <span className="hidden sm:inline">שליחה</span>
                </Button>
            </form>

            <TrashSection
                items={manageableTrashed}
                renderLabel={(comment) => comment.text}
                onRestore={handleRestore}
                onDeleteForever={handleDeleteForever}
                title="הערות שנמחקו"
                className="mt-4"
            />

            <ConfirmDialog
                open={!!pendingDelete}
                title="מחיקת הערה"
                message="ההערה תועבר לפח המחזור למשך 30 יום, בזמנם ניתן יהיה לשחזר אותה או למחוק אותה לצמיתות."
                confirmLabel="מחיקה"
                cancelLabel="ביטול"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    );
};

export default CommentThread;
