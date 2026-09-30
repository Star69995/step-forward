import React from "react";

// Generic two/N-option segmented control — single source for this look so
// a two-way setting (density, theme) or a form choice (assessment ratings,
// see FunctionalAssessment.jsx) doesn't grow a bespoke toggle per screen.
// Chrome padding is fixed on purpose, same as Badge — a control this small
// isn't a density-bloat contributor itself. Its buttons are also disabled
// natively by an enclosing `<fieldset disabled>` (the plan's view mode).
// `strong` fills the selected option with the primary color — for a choice
// that's read back later (a rating), not just a setting the user is flipping.
// A `strong` choice is a form field, so its track follows the text-field look:
// surface + border while editable, muted once the enclosing fieldset disables it.
// `stretch` makes the options share the track's full width in equal parts
// (a control that should line up with the full-width fields around it);
// `stretch="narrow"` does so only below `sm`, where the control spans its
// row, and hugs its content from `sm` up.
const SegmentedToggle = ({ options, value, onChange, ariaLabel, strong = false, stretch = false, className = "" }) => (
    <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={`inline-flex flex-wrap items-center gap-1 rounded-lg p-1 ${
            strong
                ? "bg-surface border-2 border-border has-[button:disabled]:bg-surface-muted"
                : "bg-surface-muted"
        } ${className}`}
    >
        {options.map(({ value: optValue, label, icon: Icon, title }) => {
            const active = optValue === value;
            return (
                <button
                    key={optValue}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    title={title}
                    onClick={() => onChange(optValue)}
                    className={[
                        stretch === "narrow" ? "flex-1 basis-0 sm:flex-none sm:basis-auto" : stretch ? "flex-1 basis-0" : "",
                        "flex items-center justify-center gap-1.5 min-w-8 px-3 py-1.5 rounded-md text-sm font-semibold transition disabled:cursor-not-allowed",
                        active
                            ? strong
                                ? "bg-primary text-white shadow-xs"
                                : "bg-surface text-primary shadow-xs"
                            : "text-body hover:text-heading disabled:text-muted disabled:hover:text-muted",
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
