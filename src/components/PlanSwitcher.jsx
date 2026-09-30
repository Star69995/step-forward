import React from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { useAuth } from "../context/useAuth";
import Dropdown from "./ui/Dropdown";
import { usePlans, formatPlanLabel } from "../services/usePlans";

// Lets the user jump directly to any of their saved plans from wherever
// they are, instead of always going back through the profile page first.
const PlanSwitcher = () => {
    const { currentUser } = useAuth();
    const { plans, loading } = usePlans(currentUser?.uid);
    const navigate = useNavigate();

    if (!currentUser) return null;

    const openPlan = (plan, close) => {
        close();
        navigate(`/form?planId=${plan.id}`, { state: { planData: plan } });
    };

    return (
        <Dropdown
            icon={FolderOpen}
            label="התוכניות שלי"
            triggerClassName="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition flex items-center gap-1.5 bg-white/15 text-white border-2 border-white/40 hover:bg-white/25 hover:border-white"
        >
            {(close) => (
                <>
                    <div className="max-h-72 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-muted text-sm">טוען...</div>
                        ) : plans.length === 0 ? (
                            <div className="p-4 text-center text-muted text-sm">אין עדיין תוכניות</div>
                        ) : (
                            plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => openPlan(plan, close)}
                                    className="w-full text-right px-4 py-3 hover:bg-surface-muted border-b border-border flex flex-col gap-0.5 transition"
                                >
                                    <span className="font-semibold text-heading text-sm truncate">
                                        {formatPlanLabel(plan, plans)}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            close();
                            navigate("/profile");
                        }}
                        className="w-full text-center px-4 py-2.5 text-sm font-semibold text-secondary hover:bg-surface-muted transition"
                    >
                        כל התוכניות
                    </button>
                </>
            )}
        </Dropdown>
    );
};

export default PlanSwitcher;
