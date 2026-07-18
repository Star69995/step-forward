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
                        className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl z-50 overflow-hidden text-right"
                    >
                        <div className="max-h-72 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500 text-sm">טוען...</div>
                            ) : recipients.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    אין עדיין מקבלי שירות ששיתפו איתך
                                </div>
                            ) : (
                                recipients.map((recipient) => (
                                    <button
                                        key={recipient.recipientUid}
                                        type="button"
                                        onClick={() => openRecipient(recipient)}
                                        className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 flex flex-col gap-0.5 transition"
                                    >
                                        <span className="font-semibold text-gray-800 text-sm truncate">
                                            {recipient.recipientDisplayName || recipient.recipientEmail}
                                        </span>
                                        <span className="text-xs text-gray-500 truncate">{recipient.recipientEmail}</span>
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
