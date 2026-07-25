import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useSharedWithMe } from "../services/useSharedWithMe";

// Provider-side counterpart to PlanSwitcher — lets a provider jump directly
// to any recipient who has shared with them, from wherever they are.
const ProviderSwitcher = () => {
    const { currentUser } = useAuth();
    const { recipients, loading } = useSharedWithMe(currentUser?.uid);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    if (!currentUser) return null;

    const openRecipient = (recipient) => {
        setOpen(false);
        navigate(`/recipients/${recipient.recipientUid}`);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition flex items-center gap-1.5 bg-white/15 text-white border-2 border-white/40 hover:bg-white/25 hover:border-white"
            >
                <Users size={16} aria-hidden="true" />
                מקבלי שירות
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        dir="rtl"
                        className="absolute left-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface rounded-xl shadow-2xl z-50 overflow-hidden text-right"
                    >
                        <div className="max-h-72 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-muted text-sm">טוען...</div>
                            ) : recipients.length === 0 ? (
                                <div className="p-4 text-center text-muted text-sm">
                                    אין עדיין מקבלי שירות ששיתפו איתך
                                </div>
                            ) : (
                                recipients.map((recipient) => (
                                    <button
                                        key={recipient.recipientUid}
                                        type="button"
                                        onClick={() => openRecipient(recipient)}
                                        className="w-full text-right px-4 py-3 hover:bg-surface-muted border-b border-border flex flex-col gap-0.5 transition"
                                    >
                                        <span className="font-semibold text-heading text-sm truncate">
                                            {recipient.recipientDisplayName || recipient.recipientEmail}
                                        </span>
                                        <span className="text-xs text-muted truncate">{recipient.recipientEmail}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProviderSwitcher;
