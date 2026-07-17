import React from "react";
import Spinner from "./Spinner";

// Neutral elevation (shadow-md/lg) rather than a colored glow, and darker
// two-tone gradients within one hue — reads as institutional, not a
// consumer-app "neon" button.
const VARIANTS = {
    primary: "bg-linear-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg",
    success: "bg-linear-to-r from-success to-teal-800 text-white shadow-md hover:shadow-lg",
    danger: "bg-linear-to-r from-danger to-red-800 text-white shadow-md hover:shadow-lg",
    blue: "bg-linear-to-r from-blue-700 to-blue-900 text-white shadow-md hover:shadow-lg",
    outline: "bg-white text-gray-800 border-2 border-gray-300 hover:border-primary shadow-xs hover:shadow-md",
};

const SIZES = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
};

// Single source for the "action button" look (gradient/outline + hover lift + loading state)
// so every button in the app behaves and updates consistently from one place.
const Button = ({
    variant = "primary",
    size = "md",
    rounded = "rounded-lg",
    icon: Icon,
    loading = false,
    loadingText = "טוען...",
    fullWidth = false,
    disabled = false,
    type = "button",
    className = "",
    children,
    ...props
}) => (
    <button
        type={type}
        disabled={disabled || loading}
        className={[
            fullWidth ? "w-full" : "",
            rounded,
            SIZES[size],
            "font-bold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap",
            "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
            "disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed",
            VARIANTS[variant],
            className,
        ]
            .filter(Boolean)
            .join(" ")}
        {...props}
    >
        {loading ? (
            <>
                <Spinner size={size === "sm" ? 14 : 16} />
                <span>{loadingText}</span>
            </>
        ) : (
            <>
                {Icon && <Icon size={size === "sm" ? 16 : 18} aria-hidden="true" />}
                {children}
            </>
        )}
    </button>
);

export default Button;
