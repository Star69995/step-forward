import React from "react";
import { useFormContext } from "react-hook-form";
import { FileText, Target } from "lucide-react";
import Goal from "./Goal";
import InfoHint from "./ui/InfoHint";
import CollapsibleSection from "./ui/CollapsibleSection";
import twConfig from "../../tailwind.config.js";

const colors = twConfig.theme.extend.colors;

const BADGE_COLORS = {
    primary: colors.primary,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
};

const GoalSection = ({ title, baseName, index, badgeColor = "primary" }) => {
    const { register } = useFormContext();
    const accent = BADGE_COLORS[badgeColor] || BADGE_COLORS.primary;

    return (
        <CollapsibleSection
            title={title || `מטרה לטווח קצר #${index}`}
            accentColor={accent}
            defaultOpen
            badge={
                <span
                    className="text-white px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: accent }}
                >
                    #{index}
                </span>
            }
        >
            <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                    <FileText size={16} aria-hidden="true" />
                    תיאור המטרה
                </label>
                <textarea
                    {...register(`${baseName}.description`)}
                    rows={3}
                    placeholder="יש לתאר את המטרה בפירוט"
                    className="accent-field w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-800 font-sans"
                    style={{ "--accent": accent, lineHeight: "1.6", resize: "vertical" }}
                />
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4 tracking-wide">
                    <span className="w-1 h-5 rounded" style={{ backgroundColor: accent }}></span>
                    <Target size={16} aria-hidden="true" />
                    יעדים ספציפיים
                    <InfoHint text="יעד קטן וממוקד שאפשר לבדוק אם הושג עד תאריך מסוים — למשל צעד מעשי אחד בדרך למטרה." />
                </label>

                <div>
                    <Goal baseName={baseName} index={1} color={accent} />
                    <Goal baseName={baseName} index={2} color={accent} />
                </div>
            </div>
        </CollapsibleSection>
    );
};

export default GoalSection;
