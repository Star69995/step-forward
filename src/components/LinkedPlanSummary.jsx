import React from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ExternalLink, ListPlus, Link2, Target } from "lucide-react";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Spinner from "./ui/Spinner";
import { formatPlanLabel } from "../services/usePlans";
import { SHORT_GOAL_KEYS, TARGET_INDEXES } from "../services/planFields";

// Only the goals that were actually written down, each with its filled-in
// targets - an empty slot in the old plan isn't something to review.
const goalsOf = (plan) =>
    SHORT_GOAL_KEYS.map((key) => {
        const goal = plan.shortGoals?.[key] || {};
        const targets = TARGET_INDEXES.map((n) => goal[`target${n}`] || {}).filter((t) => t.text?.trim());
        return { key, description: goal.description?.trim(), done: !!goal.done, targets };
    }).filter((g) => g.description || g.targets.length);

const DoneMark = ({ done, size = 16 }) =>
    done ? (
        <CheckCircle2 size={size} className="text-success shrink-0 mt-0.5" aria-label="הושג" />
    ) : (
        <Circle size={size} className="text-muted shrink-0 mt-0.5" aria-label="לא סומן כהושג" />
    );

// Read-only recap of the plan linked as this plan's previous one (see
// PreviousPlanPicker.jsx): its long-term goal and short-term goals with
// what was marked achieved, so the review below starts from the facts
// instead of from memory. "Fill in" copies the goal descriptions into the
// free-text "previous goals" field, one per line, skipping ones already there.
const LinkedPlanSummary = ({ linked, editable, routeTo }) => {
    const { getValues, setValue } = useFormContext();
    const navigate = useNavigate();

    if (linked.status === "none") return null;
    if (linked.status === "loading") {
        return (
            <div className="flex justify-center mb-6">
                <Spinner size={24} className="text-primary" />
            </div>
        );
    }
    if (linked.status !== "ready") return null;

    const { plan } = linked;
    const goals = goalsOf(plan);
    const targets = goals.flatMap((g) => g.targets);
    const goalLines = goals.map((g) => g.description).filter(Boolean);

    const fillPreviousGoals = () => {
        const current = (getValues("previousGoals") || "").trim();
        const existing = new Set(current.split("\n").map((l) => l.trim()));
        const additions = goalLines.filter((line) => !existing.has(line));
        setValue("previousGoals", [current, ...additions].filter(Boolean).join("\n"), { shouldDirty: true });
    };

    return (
        <div className="pdf-avoid-break mb-6 rounded-xl border border-border bg-surface overflow-hidden">
            <header className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 px-4 py-3 bg-surface-muted border-b border-border text-center sm:text-start">
                <h4 className="flex items-center gap-2 font-bold text-heading">
                    <Link2 size={16} className="text-secondary" aria-hidden="true" />
                    מהתוכנית הקודמת ({formatPlanLabel(plan)})
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {goals.length > 0 && (
                        <Badge variant="success">
                            {goals.filter((g) => g.done).length}/{goals.length} מטרות הושגו
                        </Badge>
                    )}
                    {targets.length > 0 && (
                        <Badge variant="info">
                            {targets.filter((t) => t.done).length}/{targets.length} יעדים הושלמו
                        </Badge>
                    )}
                    {plan.deletedAt && <Badge variant="warning">בפח המחזור</Badge>}
                </div>
            </header>

            <div className="p-4 flex flex-col gap-4">
                {plan.longTermGoal?.trim() && (
                    <div>
                        <span className="block text-xs font-semibold text-muted mb-1">מטרה לטווח ארוך</span>
                        <p className="text-sm text-body whitespace-pre-line">{plan.longTermGoal}</p>
                    </div>
                )}

                {goals.length === 0 ? (
                    <p className="text-sm text-muted">לא הוגדרו מטרות לטווח קצר בתוכנית הקודמת</p>
                ) : (
                    <ol className="flex flex-col divide-y divide-border">
                        {goals.map((goal, i) => (
                            <li key={goal.key} className="py-3 first:pt-0 last:pb-0">
                                <div className="flex items-start gap-2">
                                    <DoneMark done={goal.done} />
                                    <span className="text-sm font-semibold text-heading whitespace-pre-line">
                                        {goal.description || `מטרה #${i + 1}`}
                                    </span>
                                </div>
                                {goal.targets.length > 0 && (
                                    <ul className="mt-2 ps-6 flex flex-col gap-1.5">
                                        {goal.targets.map((t, j) => (
                                            <li key={j} className="flex items-start gap-2 text-sm text-body">
                                                <Target size={14} className="text-muted shrink-0 mt-0.5" aria-hidden="true" />
                                                <span className="flex-1 min-w-0">{t.text}</span>
                                                <DoneMark done={!!t.done} size={14} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ol>
                )}

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pdf-hidden">
                    {editable && goalLines.length > 0 && (
                        <Button variant="outline" size="sm" wrap icon={ListPlus} onClick={fillPreviousGoals}>
                            מילוי היעדים מהתוכנית הקודמת
                        </Button>
                    )}
                    <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => {
                            const { to, state } = routeTo(plan);
                            navigate(to, { state });
                        }}>
                        פתיחת התוכנית הקודמת
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LinkedPlanSummary;
