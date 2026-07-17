import React from "react";
import { CheckCircle2, Calendar } from "lucide-react";

// Generic "mark as done" control: a styled checkbox plus an editable
// completion date that appears once checked (auto-filled with today's
// date, but the user can change it — e.g. to log when the task was
// actually completed). Controlled (value/onChange props) like
// Button/TextField/CollapsibleSection, so any parent can wire it to
// react-hook-form or plain state.
const CompletionCheck = ({
    checked = false,
    onCheckedChange,
    date = "",
    onDateChange,
    color = "#1E3A5F",
    label = "המשימה הושלמה",
    dateLabel = "תאריך ביצוע",
    disabled = false,
    className = "",
}) => {
    const todayISO = () => {
        const d = new Date();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${d.getFullYear()}-${month}-${day}`;
    };

    const handleToggle = (e) => {
        const isChecked = e.target.checked;
        onCheckedChange?.(isChecked);
        if (isChecked && !date) {
            onDateChange?.(todayISO());
        }
    };

    return (
        <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${className}`}>
            <label
                className={`flex items-center gap-2 text-sm font-semibold text-gray-800 select-none ${
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleToggle}
                    disabled={disabled}
                    className="w-5 h-5 rounded border-2 border-gray-300 transition disabled:cursor-not-allowed"
                    style={{ accentColor: color }}
                />
                <CheckCircle2
                    size={16}
                    aria-hidden="true"
                    className={checked ? "" : "text-gray-400"}
                    style={checked && !disabled ? { color } : undefined}
                />
                {label}
            </label>

            {checked && (
                <div className={`flex items-center gap-2 ${disabled ? "opacity-50" : ""}`}>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 tracking-wide">
                        <Calendar size={16} aria-hidden="true" />
                        {dateLabel}
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange?.(e.target.value)}
                        disabled={disabled}
                        className="accent-field px-3 py-1.5 rounded-lg bg-white text-gray-800 font-sans text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                        style={{ "--accent": color }}
                    />
                </div>
            )}
        </div>
    );
};

export default CompletionCheck;
