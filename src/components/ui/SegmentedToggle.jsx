import React from "react";

// Generic two/N-option segmented control — single source for this look so
// a two-way setting (density today, possibly others later) doesn't grow a
// bespoke toggle per screen. Chrome padding is fixed on purpose, same as
// Badge — a control this small isn't a density-bloat contributor itself.
const SegmentedToggle = ({ options, value, onChange, className = "" }) => (
    <div role="radiogroup" className={`inline-flex items-center gap-1 bg-surface-muted rounded-lg p-1 ${className}`}>
        {options.map(({ value: optValue, label, icon: Icon }) => {
            const active = optValue === value;
            return (
                <button
                    key={optValue}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange(optValue)}
                    className={[
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition",
                        active ? "bg-surface text-primary shadow-xs" : "text-body hover:text-heading",
                    ].join(" ")}
                >
                    {Icon && <Icon size={16} aria-hidden="true" />}
                    {label}
                </button>
            );
        })}
    </div>
);

export default SegmentedToggle;
