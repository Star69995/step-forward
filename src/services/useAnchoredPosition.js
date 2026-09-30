import { useLayoutEffect } from "react";

// Positions a floating panel (dropdown menu, tooltip) under its anchor while
// keeping it fully inside the viewport. Right edges line up by default (RTL),
// but the panel is shifted/shrunk as needed so it never runs off either side
// of a narrow phone screen, wherever the anchor happens to land (e.g. after
// the header's buttons wrap onto another line).
//
// The panel is expected to be `position: fixed` (rendered through a portal,
// so an ancestor with a transform can't become its containing block). Its
// style is written directly to the DOM rather than through state, so
// following the anchor on scroll/resize doesn't re-render the component.
const useAnchoredPosition = (anchorRef, panelRef, open, { width, gap = 8, margin = 16 }) => {
    useLayoutEffect(() => {
        if (!open) return;
        const update = () => {
            const anchor = anchorRef.current;
            const panel = panelRef.current;
            if (!anchor || !panel) return;
            const rect = anchor.getBoundingClientRect();
            const viewportWidth = document.documentElement.clientWidth;
            const panelWidth = Math.min(width, viewportWidth - margin * 2);
            const left = Math.min(Math.max(margin, rect.right - panelWidth), viewportWidth - margin - panelWidth);
            panel.style.top = `${rect.bottom + gap}px`;
            panel.style.left = `${left}px`;
            panel.style.width = `${panelWidth}px`;
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [anchorRef, panelRef, open, width, gap, margin]);
};

export default useAnchoredPosition;
