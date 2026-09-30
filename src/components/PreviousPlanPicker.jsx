import React from "react";
import { useFormContext } from "react-hook-form";
import { Link } from "react-router-dom";
import { Link2, Unlink, ExternalLink } from "lucide-react";
import Dropdown from "./ui/Dropdown";
import Spinner from "./ui/Spinner";
import { usePlans, formatPlanLabel } from "../services/usePlans";

// The owner's other plans, fetched only once the menu is actually opened
// (Dropdown mounts its children on open) - most visits never need the list.
const PlanOptions = ({ ownerUid, currentPlanId, onPick }) => {
    const { plans, loading } = usePlans(ownerUid);
    const others = plans.filter((p) => p.id !== currentPlanId);

    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <Spinner size={20} className="text-primary" />
            </div>
        );
    }
    if (others.length === 0) {
        return <div className="p-4 text-center text-muted text-sm">אין תוכניות נוספות לקישור</div>;
    }
    return (
        <div className="max-h-72 overflow-y-auto">
            {others.map((plan) => (
                <button
                    key={plan.id}
                    type="button"
                    onClick={() => onPick(plan)}
                    className="w-full text-right px-4 py-3 hover:bg-surface-muted border-b border-border last:border-b-0 transition"
                >
                    <span className="block font-semibold text-heading text-sm">{formatPlanLabel(plan, plans)}</span>
                    {plan.longTermGoal && <span className="block text-xs text-muted truncate">{plan.longTermGoal}</span>}
                </button>
            ))}
        </div>
    );
};

// A "smart link" from this plan to an earlier plan of the same owner made on
// the site (`previousPlanId`). Picking one also fills the previous-plan date
// from that plan's writing date; the linked plan's goals then show in the
// previous-plan summary (LinkedPlanSummary.jsx). `linked` is useLinkedPlan's
// result, shared with that summary so the linked plan is read only once;
// `routeTo(plan)` gives the { to, state } that opens it.
const PreviousPlanPicker = ({ ownerUid, currentPlanId, linked, editable, routeTo }) => {
    const { register, setValue, getValues } = useFormContext();
    register("previousPlanId");

    const pick = (plan, close) => {
        close();
        linked.provide(plan);
        setValue("previousPlanId", plan.id, { shouldDirty: true });
        const writtenOn = plan.endDate || plan.createdAt?.toDate().toISOString().split("T")[0];
        if (writtenOn && !getValues("previousPlanDate")) {
            setValue("previousPlanDate", writtenOn, { shouldDirty: true });
        }
    };

    if (linked.status === "none") {
        if (!editable) return null;
        return (
            <div className="mt-2 pdf-hidden">
                <Dropdown
                    icon={Link2}
                    label="קישור לתוכנית קודמת מהאתר"
                    triggerClassName="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                >
                    {(close) => (
                        <PlanOptions
                            ownerUid={ownerUid}
                            currentPlanId={currentPlanId}
                            onPick={(plan) => pick(plan, close)}
                        />
                    )}
                </Dropdown>
            </div>
        );
    }

    const statusText = {
        loading: "טוען את התוכנית המקושרת...",
        missing: "התוכנית המקושרת לא נמצאה",
        denied: "אין הרשאה לצפייה בתוכנית המקושרת",
    }[linked.status];

    return (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm pdf-hidden">
            <span className="flex items-center gap-1.5 font-semibold text-heading">
                <Link2 size={14} className="text-secondary shrink-0" aria-hidden="true" />
                {statusText || `מקושרת לתוכנית מ-${formatPlanLabel(linked.plan)}`}
            </span>
            {linked.status === "ready" && (
                <Link
                    {...routeTo(linked.plan)}
                    className="flex items-center gap-1 font-semibold text-secondary hover:underline"
                >
                    <ExternalLink size={14} aria-hidden="true" />
                    פתיחה
                </Link>
            )}
            {editable && (
                <button
                    type="button"
                    onClick={() => setValue("previousPlanId", "", { shouldDirty: true })}
                    className="flex items-center gap-1 font-semibold text-muted hover:text-danger"
                >
                    <Unlink size={14} aria-hidden="true" />
                    ביטול הקישור
                </button>
            )}
        </div>
    );
};

export default PreviousPlanPicker;
