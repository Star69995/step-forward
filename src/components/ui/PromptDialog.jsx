import React from "react";
import Button from "./Button";
import TextField from "./TextField";

// Like ConfirmDialog, but for the (rarer) case where confirming needs some
// typed input first — e.g. a name entered just for a PDF export, or a
// password (and possibly a new email) re-entered before a sensitive account
// change. `fields` is a list of plain TextField prop objects
// ({ label, type, value, onChange, placeholder, hint }) so one or several
// inputs can share the same modal chrome instead of each caller rebuilding it.
const PromptDialog = ({
    open,
    title,
    message,
    fields = [],
    confirmLabel = "אישור",
    cancelLabel = "ביטול",
    loading = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
            dir="rtl"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-[var(--space-card-pad)] fade-in">
                {title && <h3 className="text-lg font-bold text-heading mb-2 wrap-break-word">{title}</h3>}
                {message && <p className="text-body mb-4 wrap-break-word">{message}</p>}
                {fields.map((field, index) => (
                    <TextField
                        key={field.label || index}
                        className={index === fields.length - 1 ? "mb-6" : "mb-4"}
                        disabled={loading}
                        {...field}
                    />
                ))}
                <div className="flex gap-3 justify-end flex-wrap">
                    <Button variant="outline" size="sm" rounded="rounded-lg" onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button variant="primary" size="sm" rounded="rounded-lg" onClick={onConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PromptDialog;
