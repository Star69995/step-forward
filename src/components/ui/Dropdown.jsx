import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useAnchoredPosition from "../../services/useAnchoredPosition";

// Single source for a button that opens a floating menu (PlanSwitcher,
// ProviderSwitcher): outside-tap/Escape to close, and viewport-aware
// positioning so the menu stays on screen at any width. `children` is a
// render function that receives `close`, for items that navigate away.
const Dropdown = ({ icon: Icon, label, triggerClassName = "", width = 288, children }) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const panelRef = useRef(null);
    const close = () => setOpen(false);

    useAnchoredPosition(anchorRef, panelRef, open, { width });

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open]);

    return (
        <>
            <button
                ref={anchorRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className={triggerClassName}
            >
                {Icon && <Icon size={16} aria-hidden="true" />}
                {label}
            </button>

            {open &&
                createPortal(
                    <>
                        <div className="fixed inset-0 z-50" onClick={close} />
                        <div
                            ref={panelRef}
                            dir="rtl"
                            className="fixed z-50 bg-surface rounded-xl shadow-2xl overflow-hidden text-right"
                        >
                            {children(close)}
                        </div>
                    </>,
                    document.body
                )}
        </>
    );
};

export default Dropdown;
