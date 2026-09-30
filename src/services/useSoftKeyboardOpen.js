import { useEffect, useState } from "react";
import useMediaQuery from "./useMediaQuery";

// Input types that don't bring up an on-screen keyboard when focused.
const NON_TEXT_INPUT_TYPES = new Set([
    "checkbox",
    "radio",
    "button",
    "submit",
    "reset",
    "file",
    "range",
    "color",
    "image",
    "hidden",
]);

const opensKeyboard = (el) => {
    if (!el || el.disabled || el.readOnly) return false;
    if (el.isContentEditable || el.tagName === "TEXTAREA") return true;
    return el.tagName === "INPUT" && !NON_TEXT_INPUT_TYPES.has(el.type);
};

// True while a touch device most likely has its on-screen keyboard open, i.e.
// a text-entry field has focus. Based on focus rather than visualViewport size
// on purpose: iOS Safari doesn't fire visualViewport events continuously
// during the keyboard's open/close animation, while focusin/focusout are
// immediate. Always false on a fine pointer (desktop), where there's no
// on-screen keyboard to make room for.
const useSoftKeyboardOpen = () => {
    const isTouch = useMediaQuery("(pointer: coarse)");
    const [open, setOpen] = useState(() => opensKeyboard(document.activeElement));

    useEffect(() => {
        if (!isTouch) return;
        const handleFocusIn = (e) => setOpen(opensKeyboard(e.target));
        // relatedTarget is the element receiving focus next, so moving between
        // two fields doesn't flicker the state closed and open again.
        const handleFocusOut = (e) => setOpen(opensKeyboard(e.relatedTarget));
        document.addEventListener("focusin", handleFocusIn);
        document.addEventListener("focusout", handleFocusOut);
        return () => {
            document.removeEventListener("focusin", handleFocusIn);
            document.removeEventListener("focusout", handleFocusOut);
        };
    }, [isTouch]);

    return isTouch && open;
};

export default useSoftKeyboardOpen;
