import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";
import useAnchoredPosition from "../../services/useAnchoredPosition";

// Small "?" hint next to a label, for fields whose intent isn't obvious
// or that benefit from a guiding sub-question. Hidden during PDF export
// (pdf-hidden) since it's UI chrome, not plan content.
//
// Hover only opens it for a real mouse: a tap also fires emulated
// mouseenter/focus before its click, and letting those open it made the
// click's toggle close it again straight away, so on touch it never showed.
// On touch it's tap to toggle, and a tap anywhere else closes it.
const InfoHint = ({ text }) => {
    const [open, setOpen] = useState(false);
    const id = useId();
    const anchorRef = useRef(null);
    const panelRef = useRef(null);

    useAnchoredPosition(anchorRef, panelRef, open, { width: 224, gap: 4 });

    useEffect(() => {
        if (!open) return;
        const handlePointerDown = (e) => {
            if (!anchorRef.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [open]);

    const onMouse = (value) => (e) => e.pointerType === "mouse" && setOpen(value);

    return (
        <span className="relative inline-flex pdf-hidden">
            <button
                ref={anchorRef}
                type="button"
                aria-expanded={open}
                aria-describedby={id}
                onClick={() => setOpen((o) => !o)}
                onPointerEnter={onMouse(true)}
                onPointerLeave={onMouse(false)}
                onBlur={() => setOpen(false)}
                className="text-muted hover:text-primary transition"
            >
                <HelpCircle size={15} aria-hidden="true" />
                <span className="sr-only">הסבר נוסף</span>
            </button>
            {open &&
                createPortal(
                    <span
                        ref={panelRef}
                        id={id}
                        role="tooltip"
                        dir="rtl"
                        className="fixed z-40 bg-heading text-surface text-xs font-normal leading-relaxed rounded-lg p-2.5 shadow-lg"
                    >
                        {text}
                    </span>,
                    document.body
                )}
        </span>
    );
};

export default InfoHint;
