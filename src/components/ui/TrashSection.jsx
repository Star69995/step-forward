import React, { useState } from "react";
import { Trash2, RotateCcw, Archive } from "lucide-react";
import CollapsibleSection from "./CollapsibleSection";
import Button from "./Button";
import Badge from "./Badge";
import ConfirmDialog from "./ConfirmDialog";
import { daysRemaining } from "../../services/trash";

// Single source for "here's what's in the trash" across the site — plans
// (Profile), shares (Providers) and comments (CommentThread) all render
// their trashed items through this instead of each screen building its own
// restore/purge list. Permanent deletion is the one truly irreversible
// action left in the app, so it gets its own ConfirmDialog here rather than
// relying on the caller to remember to ask again.
const TrashSection = ({
    items,
    getId = (item) => item.id,
    renderLabel,
    onRestore,
    onDeleteForever,
    title = "פח מחזור",
    emptyMessage = "הפח ריק",
    className = "",
}) => {
    const [restoringId, setRestoringId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);

    if (!items || items.length === 0) return null;

    const handleRestore = async (item) => {
        setRestoringId(getId(item));
        try {
            await onRestore(item);
        } finally {
            setRestoringId(null);
        }
    };

    const handleDeleteForever = async () => {
        if (!pendingDelete) return;
        setDeletingId(getId(pendingDelete));
        try {
            await onDeleteForever(pendingDelete);
        } finally {
            setDeletingId(null);
            setPendingDelete(null);
        }
    };

    return (
        <>
            <CollapsibleSection
                title={title}
                icon={Archive}
                accent="danger"
                defaultOpen={false}
                badge={<Badge variant="danger">{items.length}</Badge>}
                className={className}
            >
                {items.length === 0 ? (
                    <p className="text-sm text-gray-500">{emptyMessage}</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {items.map((item) => {
                            const id = getId(item);
                            return (
                                <li
                                    key={id}
                                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 flex-wrap"
                                >
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                        <span className="text-sm text-gray-700 wrap-break-word">
                                            {renderLabel(item)}
                                        </span>
                                        <Badge variant="gray">
                                            {daysRemaining(item.deletedAt)} ימים למחיקה סופית
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            rounded="rounded-lg"
                                            icon={RotateCcw}
                                            loading={restoringId === id}
                                            loadingText="משחזר..."
                                            onClick={() => handleRestore(item)}
                                        >
                                            שחזור
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            rounded="rounded-lg"
                                            icon={Trash2}
                                            loading={deletingId === id}
                                            loadingText="מוחק..."
                                            onClick={() => setPendingDelete(item)}
                                        >
                                            מחיקה לצמיתות
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CollapsibleSection>

            <ConfirmDialog
                open={!!pendingDelete}
                title="מחיקה לצמיתות"
                message="פעולה זו סופית ואינה הפיכה — הפריט יימחק לגמרי ולא ניתן יהיה לשחזר אותו."
                confirmLabel="מחיקה לצמיתות"
                cancelLabel="ביטול"
                loading={!!deletingId}
                onConfirm={handleDeleteForever}
                onCancel={() => setPendingDelete(null)}
            />
        </>
    );
};

export default TrashSection;
