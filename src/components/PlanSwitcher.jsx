import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { usePlans } from "../services/usePlans";

// Lets the user jump directly to any of their saved plans from wherever
// they are, instead of always going back through the profile page first.
const PlanSwitcher = () => {
    const { currentUser } = useAuth();
    const { plans, loading } = usePlans(currentUser?.uid);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    if (!currentUser) return null;

    const openPlan = (plan) => {
        setOpen(false);
        navigate(`/form?planId=${plan.id}`, { state: { planData: plan } });
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition flex items-center gap-1.5 bg-white/15 text-white border-2 border-white/40 hover:bg-white/25 hover:border-white"
            >
                <FolderOpen size={16} aria-hidden="true" />
                התוכניות שלי
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
                            ) : plans.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">אין עדיין תוכניות</div>
                            ) : (
                                plans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        onClick={() => openPlan(plan)}
                                        className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 flex flex-col gap-0.5 transition"
                                    >
                                        <span className="font-semibold text-gray-800 text-sm truncate">
                                            {plan.name || "תוכנית ללא שם"}
                                        </span>
                                        {plan.createdAt && (
                                            <span className="text-xs text-gray-500">
                                                {plan.createdAt.toDate().toLocaleDateString("he-IL")}
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                navigate("/profile");
                            }}
                            className="w-full text-center px-4 py-2.5 text-sm font-semibold text-secondary hover:bg-gray-50 transition"
                        >
                            כל התוכניות
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlanSwitcher;
