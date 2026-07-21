import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const ACCENT_TEXT_CLASSES = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
    danger: "text-danger",
};

// Single collapsible-card implementation shared by GoalSection (dynamic,
// per-instance accentColor) and FormPage's main sections (fixed accent
// tokens), so every collapsible section in the app opens/closes and
// exports to PDF the same way.
const CollapsibleSection = ({
    title,
    icon: Icon,
    accent = "primary",
    accentColor,
    badge,
    defaultOpen = true,
    className = "",
    children,
}) => {
    const [open, setOpen] = useState(defaultOpen);
    const titleColorClass = accentColor ? "" : ACCENT_TEXT_CLASSES[accent] || ACCENT_TEXT_CLASSES.primary;
    const colorStyle = accentColor ? { color: accentColor } : undefined;

    return (
        <div className={`collapsible-section pdf-avoid-break bg-surface rounded-2xl shadow-xs mb-[var(--space-section-gap)] overflow-hidden transition hover:shadow-md ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-3 p-4 sm:p-[var(--space-card-pad)] text-right transition hover:bg-surface-muted"
            >
                <span className={`flex items-center gap-2 text-lg font-bold min-w-0 ${titleColorClass}`} style={colorStyle}>
                    {Icon && <Icon size={20} className="shrink-0" aria-hidden="true" />}
                    <span className="truncate">{title}</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                    {badge}
                    <ChevronDown
                        size={20}
                        className={`collapsible-chevron text-muted transition-transform ${open ? "rotate-180" : ""}`}
                        style={colorStyle}
                        aria-hidden="true"
                    />
                </span>
            </button>
            <div
                className={`collapsible-content grid transition-all duration-200 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <div className="px-4 sm:px-[var(--space-card-pad)] pb-4 sm:pb-[var(--space-card-pad)]">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default CollapsibleSection;
