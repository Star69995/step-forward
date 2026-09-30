import React from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "../context/useAuth";
import Dropdown from "./ui/Dropdown";
import { useSharedWithMe } from "../services/useSharedWithMe";
import { formatUserLabel } from "../services/userProfile";
import { isSyntheticEmail } from "../services/anonymousAccount";

// Provider-side counterpart to PlanSwitcher — lets a provider jump directly
// to any recipient who has shared with them, from wherever they are.
const ProviderSwitcher = () => {
    const { currentUser } = useAuth();
    const { recipients, loading } = useSharedWithMe(currentUser?.uid);
    const navigate = useNavigate();

    if (!currentUser) return null;

    const openRecipient = (recipient, close) => {
        close();
        navigate(`/recipients/${recipient.recipientUid}`);
    };

    return (
        <Dropdown
            icon={Users}
            label="מקבלי שירות"
            triggerClassName="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition flex items-center gap-1.5 bg-white/15 text-white border-2 border-white/40 hover:bg-white/25 hover:border-white"
        >
            {(close) => (
                <>
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
                                    onClick={() => openRecipient(recipient, close)}
                                    className="w-full text-right px-4 py-3 hover:bg-surface-muted border-b border-border flex flex-col gap-0.5 transition"
                                >
                                    <span className="font-semibold text-heading text-sm truncate">
                                        {recipient.recipientLabel ||
                                            formatUserLabel({
                                                displayName: recipient.recipientDisplayName,
                                                email: recipient.recipientEmail,
                                            })}
                                    </span>
                                    {!isSyntheticEmail(recipient.recipientEmail) && recipient.recipientEmail && (
                                        <span className="text-xs text-muted truncate">{recipient.recipientEmail}</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </>
            )}
        </Dropdown>
    );
};

export default ProviderSwitcher;
