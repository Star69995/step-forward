import React from "react";
import Button from "./Button";

// Shared confirmation modal so destructive actions ask consistently,
// instead of relying on the browser's unstyled window.confirm.
const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = "אישור",
    cancelLabel = "ביטול",
    loading = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            dir="rtl"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 fade-in">
                {title && <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>}
                {message && <p className="text-gray-600 mb-6">{message}</p>}
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        rounded="rounded-lg"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        rounded="rounded-lg"
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
