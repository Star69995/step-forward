import React from "react";
import { useFormContext } from "react-hook-form";
import { Target, Calendar } from "lucide-react";
import CompletionCheck from "./ui/CompletionCheck";

// Theme colors now live solely in the `@theme` block in index.css (Tailwind
// v4) — read them via their CSS custom properties instead of duplicating
// the values here, so that stays the single source of truth.
const colors = { primary: "var(--color-primary)" };

// viewMode gates two mutually-exclusive layers: while defining the plan
// (viewMode=false) the target's own content is editable but progress can't
// be marked yet; once reviewing an existing plan (viewMode=true) the content
// locks and only the completion checkbox/date stay live — see FormPage.jsx.
const Goal = ({ baseName, index, color = colors.primary, viewMode = false, canEdit = true }) => {
    const { register, watch, setValue } = useFormContext();

    const doneField = `${baseName}.target${index}.done`;
    const doneDateField = `${baseName}.target${index}.doneDate`;
    register(doneField);
    register(doneDateField);
    const done = watch(doneField);
    const doneDate = watch(doneDateField);

    return (
        <div
            className="pdf-avoid-break rounded-lg p-5 mb-4 transition hover:shadow-md border-r-4"
            style={{
                backgroundColor: `color-mix(in srgb, ${color} 8%, var(--color-surface))`,
                borderRightColor: color,
            }}
        >
            {/* Goal Number Badge */}
            <div
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-sm mb-4"
                style={{ backgroundColor: color }}
            >
                {index}
            </div>

            <fieldset disabled={viewMode} className="border-0 min-w-0">
                <div className="grid grid-cols-1 gap-4">
                    {/* Goal Text Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-heading mb-2 tracking-wide">
                            <Target size={16} aria-hidden="true" />
                            תיאור היעד
                        </label>
                        <input
                            type="text"
                            {...register(`${baseName}.target${index}.text`)}
                            placeholder={`תאר את היעד #${index}`}
                            className="accent-field w-full px-[var(--space-field-full-x)] py-[var(--space-field-full-y)] rounded-lg bg-surface text-heading font-sans disabled:bg-surface-muted disabled:text-muted"
                            style={{ "--accent": color }}
                        />
                    </div>

                    {/* End Date Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-heading mb-2 tracking-wide">
                            <Calendar size={16} aria-hidden="true" />
                            תאריך סיום
                        </label>
                        <input
                            type="date"
                            {...register(`${baseName}.target${index}.endDate`)}
                            className="accent-field w-full px-[var(--space-field-full-x)] py-[var(--space-field-full-y)] rounded-lg bg-surface text-heading font-sans disabled:bg-surface-muted disabled:text-muted"
                            style={{ "--accent": color }}
                        />
                    </div>
                </div>
            </fieldset>

            <small className="block text-body mt-3 text-xs italic">
                יש להגדיר יעד קטן, מדיד, ברור ובעל לוח זמנים
            </small>

            <div className="mt-4 pt-4 border-t border-border/70">
                <CompletionCheck
                    checked={!!done}
                    onCheckedChange={(val) => setValue(doneField, val, { shouldDirty: true })}
                    date={doneDate || ""}
                    onDateChange={(val) => setValue(doneDateField, val, { shouldDirty: true })}
                    color={color}
                    label="היעד הושלם"
                    disabled={!viewMode || !canEdit}
                />
            </div>
        </div>
    );
};

export default Goal;
