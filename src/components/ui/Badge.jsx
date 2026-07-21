import React from "react";

// Single source for the small colored pill look — role badges (Header,
// Profile), and permission/scope tags (Providers, RecipientPlans) all read
// through this instead of each screen inventing its own pill markup.
const VARIANTS = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    gray: "bg-surface-muted text-body",
    // For placement on the header's dark gradient, where the tinted
    // variants above don't have enough contrast.
    onDark: "bg-white/20 text-white",
};

const Badge = ({ variant = "gray", icon: Icon, children, className = "" }) => (
    <span
        className={[
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap",
            VARIANTS[variant],
            className,
        ]
            .filter(Boolean)
            .join(" ")}
    >
        {Icon && <Icon size={12} aria-hidden="true" />}
        {children}
    </span>
);

export default Badge;
