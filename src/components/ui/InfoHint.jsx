import React, { useId, useState } from "react";
import { HelpCircle } from "lucide-react";

// Small "?" hint next to a label, for fields whose intent isn't obvious
// or that benefit from a guiding sub-question. Hidden during PDF export
// (pdf-hidden) since it's UI chrome, not plan content.
const InfoHint = ({ text }) => {
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
        <span className="relative inline-flex pdf-hidden">
            <button
                type="button"
                aria-expanded={open}
                aria-describedby={id}
                onClick={() => setOpen((o) => !o)}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                className="text-muted hover:text-primary transition"
            >
                <HelpCircle size={15} aria-hidden="true" />
                <span className="sr-only">הסבר נוסף</span>
            </button>
            {open && (
                <span
                    id={id}
                    role="tooltip"
                    className="absolute z-20 top-full right-0 mt-1 w-56 bg-heading text-surface text-xs font-normal leading-relaxed rounded-lg p-2.5 shadow-lg"
                >
                    {text}
                </span>
            )}
        </span>
    );
};

export default InfoHint;
