import React from "react";

const DENSE_CLASS =
    "w-full px-3 py-[var(--space-field-dense-y)] border-2 border-border rounded-lg focus:border-primary focus:outline-hidden text-sm transition disabled:bg-surface-muted disabled:text-muted";

const FULL_CLASS =
    "w-full px-[var(--space-field-full-x)] py-[var(--space-field-full-y)] border-2 border-border rounded-lg bg-surface-muted text-heading font-sans transition focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/10 focus:bg-surface hover:border-border disabled:bg-surface-muted disabled:text-muted";

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
                <label className="flex items-center gap-2 text-sm font-semibold text-heading mb-2 tracking-wide">
                    {Icon && <Icon size={16} aria-hidden="true" />}
                    {label}
                </label>
            )}
            <Field
                rows={as === "textarea" ? rows : undefined}
                className={dense ? DENSE_CLASS : FULL_CLASS}
                style={
                    as === "textarea"
                        ? { lineHeight: "1.6", resize: "vertical", ...style }
                        : style
                }
                {...fieldProps}
            />
            {hint && (
                <small className="flex items-center gap-1 text-body mt-2 text-xs italic">{hint}</small>
            )}
        </div>
    );
};

export default TextField;
