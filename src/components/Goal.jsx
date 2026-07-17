import React from "react";
import { useFormContext } from "react-hook-form";
import { Target, Calendar } from "lucide-react";
import twConfig from "../../tailwind.config.js";
import CompletionCheck from "./ui/CompletionCheck";

const colors = twConfig.theme.extend.colors;

// viewMode gates two mutually-exclusive layers: while defining the plan
// (viewMode=false) the target's own content is editable but progress can't
// be marked yet; once reviewing an existing plan (viewMode=true) the content
// locks and only the completion checkbox/date stay live — see FormPage.jsx.
const Goal = ({ baseName, index, color = colors.primary, viewMode = false }) => {
    const { register, watch, setValue } = useFormContext();

    const doneField = `${baseName}.target${index}.done`;
    const doneDateField = `${baseName}.target${index}.doneDate`;
    register(doneField);
    register(doneDateField);
    const done = watch(doneField);
    const doneDate = watch(doneDateField);

    return (
        <div
            className="rounded-lg p-5 mb-4 transition hover:shadow-md border-r-4"
            style={{
                backgroundColor: `color-mix(in srgb, ${color} 8%, white)`,
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Goal Text Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                            <Target size={16} aria-hidden="true" />
                            תיאור היעד
                        </label>
                        <input
                            type="text"
                            {...register(`${baseName}.target${index}.text`)}
                            placeholder={`תאר את היעד #${index}`}
                            className="accent-field w-full px-4 py-3 rounded-lg bg-white text-gray-800 font-sans disabled:bg-gray-100 disabled:text-gray-500"
                            style={{ "--accent": color }}
                        />
                    </div>

                    {/* End Date Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                            <Calendar size={16} aria-hidden="true" />
                            תאריך סיום
                        </label>
                        <input
                            type="date"
                            {...register(`${baseName}.target${index}.endDate`)}
                            className="accent-field w-full px-4 py-3 rounded-lg bg-white text-gray-800 font-sans disabled:bg-gray-100 disabled:text-gray-500"
                            style={{ "--accent": color }}
                        />
                    </div>
                </div>
            </fieldset>

            <small className="block text-gray-600 mt-3 text-xs italic">
                יש להגדיר יעד קטן, מדיד, ברור ובעל לוח זמנים
            </small>

            <div className="mt-4 pt-4 border-t border-gray-200/70">
                <CompletionCheck
                    checked={!!done}
                    onCheckedChange={(val) => setValue(doneField, val, { shouldDirty: true })}
                    date={doneDate || ""}
                    onDateChange={(val) => setValue(doneDateField, val, { shouldDirty: true })}
                    color={color}
                    label="היעד הושלם"
                    disabled={!viewMode}
                />
            </div>
        </div>
    );
};

export default Goal;
