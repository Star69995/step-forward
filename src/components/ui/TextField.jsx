import React from "react";

const DENSE_CLASS =
    "w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none text-sm transition";

const FULL_CLASS =
    "w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-sans transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:bg-white hover:border-gray-400";

// Single visual source for a labeled text field, used both by form-bound
// fields (FormSection, via react-hook-form's register spread) and plain
// controlled fields (Login) so the look only has to be defined once.
const TextField = ({
    as = "input",
    icon: Icon,
    label,
    hint,
    dense = false,
    rows,
    className = "",
    style,
    ...fieldProps
}) => {
    const Field = as;

    return (
        <div className={className}>
            {label && (
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                    {Icon && <Icon size={16} aria-hidden="true" />}
                    {label}
                </label>
            )}
            <Field
                rows={as === "textarea" ? rows : undefined}
                className={dense ? DENSE_CLASS : FULL_CLASS}
                style={
                    as === "textarea"
                        ? { lineHeight: "1.6", resize: "vertical", minHeight: rows ? `${rows * 2.5}rem` : undefined, ...style }
                        : style
                }
                {...fieldProps}
            />
            {hint && (
                <small className="flex items-center gap-1 text-gray-600 mt-2 text-xs italic">{hint}</small>
            )}
        </div>
    );
};

export default TextField;
