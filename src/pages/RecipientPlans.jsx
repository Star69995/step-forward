import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { usePlans, formatPlanLabel } from "../services/usePlans";
import { fetchShare } from "../services/useShares";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { ClipboardList, Clock, Eye, ShieldCheck, Inbox, ArrowLeft } from "lucide-react";

// Provider-side view of one recipient's shared plans — usePlans already
// takes a plain uid, and Firestore only ever returns the plans this
// provider is actually allowed to read (see firestore.rules), so no extra
// client-side filtering by scope is needed here.
const RecipientPlans = () => {
    const { recipientUid } = useParams();
    const { currentUser } = useAuth();
    const { plans, loading } = usePlans(recipientUid);
    const [share, setShare] = useState(null);
    const [shareLoading, setShareLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || !recipientUid) return;
        let cancelled = false;
        fetchShare(recipientUid, currentUser.uid).then((data) => {
            if (!cancelled) {
                setShare(data);
                setShareLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [recipientUid, currentUser]);

    const recipientLabel = share?.recipientDisplayName || share?.recipientEmail || "מקבל השירות";

    const openPlan = (plan) => {
        navigate(`/form?planId=${plan.id}&ownerUid=${recipientUid}`, {
            state: { planData: plan, ownerName: recipientLabel },
        });
    };

    if (shareLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size={48} className="text-primary" />
            </div>
        );
    }

    if (!share) {
        return (
            <div dir="rtl" className="min-h-screen py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-surface rounded-2xl shadow-xs p-12 text-center">
                        <Inbox size={40} className="mx-auto text-muted mb-3" aria-hidden="true" />
                        <p className="text-body mb-6">
                            אין (או שאין יותר) גישה לתוכניות של המשתמש הזה — ייתכן שהשיתוף בוטל.
                        </p>
                        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/form")}>
                            חזרה
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-surface/95 backdrop-blur-sm rounded-3xl shadow-lg mb-8 p-[var(--space-hero-pad)]">
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-heading">
                            <ClipboardList size={24} aria-hidden="true" />
                            התוכניות של {recipientLabel}
                        </h2>
                        <Badge variant={share.permission === "edit" ? "success" : "info"} icon={share.permission === "edit" ? ShieldCheck : Eye}>
                            {share.permission === "edit" ? "צפייה ועריכה" : "צפייה בלבד"}
                        </Badge>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-surface rounded-2xl shadow-xs p-12 text-center text-body">
                        טוען את התוכניות...
                    </div>
                ) : plans.length === 0 ? (
                    <div className="bg-surface rounded-2xl shadow-xs p-12 text-center">
                        <Inbox size={40} className="mx-auto text-muted mb-3" aria-hidden="true" />
                        <p className="text-muted">אין עדיין תוכניות משותפות</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-section-gap)]">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-surface rounded-2xl shadow-xs overflow-hidden transition hover:-translate-y-1 hover:shadow-lg border-l-4 border-primary"
                            >
                                <div className="bg-surface-muted px-6 py-4 border-b border-border">
                                    <h5 className="flex items-center gap-1.5 font-bold text-heading wrap-break-word">
                                        <Clock size={14} aria-hidden="true" />
                                        {formatPlanLabel(plan, plans)}
                                    </h5>
                                </div>
                                <div className="px-6 py-4">
                                    <Button variant="blue" size="sm" rounded="rounded-lg" fullWidth onClick={() => openPlan(plan)}>
                                        פתיחת התוכנית
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipientPlans;
