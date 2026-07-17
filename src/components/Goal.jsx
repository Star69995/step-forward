import React from "react";
import { useFormContext } from "react-hook-form";
import { Target, Calendar } from "lucide-react";
import twConfig from "../../tailwind.config.js";

const colors = twConfig.theme.extend.colors;

const Goal = ({ baseName, index, color = colors.primary }) => {
    const { register } = useFormContext();

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
                        className="accent-field w-full px-4 py-3 rounded-lg bg-white text-gray-800 font-sans"
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
                        className="accent-field w-full px-4 py-3 rounded-lg bg-white text-gray-800 font-sans"
                        style={{ "--accent": color }}
                    />
                </div>
            </div>

            <small className="block text-gray-600 mt-3 text-xs italic">
                יש להגדיר יעד קטן, מדיד, ברור ובעל לוח זמנים
            </small>
        </div>
    );
};

export default Goal;
