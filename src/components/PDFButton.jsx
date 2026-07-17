import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { FileDown } from "lucide-react";
import { toast } from "react-toastify";
import Button from "./ui/Button";

const PDFButton = ({ targetId, autoTrigger = false }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const handleExport = () => {
        setIsExporting(true);
        setExportProgress(0);

        const sections = document.querySelectorAll(".collapsible-section");
        sections.forEach((s) => s.classList.add("pdf-force-open"));

        const hiddenButtons = document.querySelectorAll(".pdf-hidden");
        hiddenButtons.forEach((btn) => (btn.style.display = "none"));

        const element = document.getElementById(targetId);

        // A section's header is a sibling of its content, not a wrapper
        // around it, so avoiding a break inside the first card only pushes
        // that card to the next page — the header is left stranded above a
        // blank gap. Drag the header down next to that first card so they
        // move together. "fieldset"/".pdf-stack-grid" are pass-through
        // wrappers with no content of their own, so drill through those to
        // find the actual first card.
        const headerGlues = [];
        sections.forEach((section) => {
            const header = section.querySelector(":scope > button");
            let firstChild = section.querySelector(":scope > .collapsible-content > div > div")?.firstElementChild;
            while (firstChild && (firstChild.tagName === "FIELDSET" || firstChild.classList.contains("pdf-stack-grid"))) {
                firstChild = firstChild.firstElementChild;
            }
            if (!header || !firstChild || !firstChild.classList.contains("pdf-avoid-break")) return;

            const originalParent = firstChild.parentNode;
            const wrapper = document.createElement("div");
            wrapper.className = "pdf-avoid-break";
            header.insertAdjacentElement("beforebegin", wrapper);
            wrapper.appendChild(header);
            wrapper.appendChild(firstChild);
            headerGlues.push({ wrapper, header, firstChild, originalParent });
        });

        // The short-goal cards sit side by side on wide screens — readable
        // on screen, but cramped and awkward to paginate on a printed page.
        // Stack them for the duration of the capture.
        const stackGrids = element.querySelectorAll(".pdf-stack-grid");
        stackGrids.forEach((grid) => (grid.style.display = "block"));

        // Native inputs/textareas render as boxed form controls (and
        // html2canvas doesn't reliably draw their value at all) — swap each
        // one for a plain text node for the duration of the capture so the
        // export reads like a document instead of a blank form.
        const textFields = element.querySelectorAll(
            "textarea, input[type='text'], input[type='date'], input:not([type])"
        );
        const fieldSwaps = [];
        textFields.forEach((field) => {
            const display = document.createElement("div");
            display.textContent = field.value || "—";
            display.className = "pdf-plain-text";
            field.insertAdjacentElement("afterend", display);
            field.style.display = "none";
            fieldSwaps.push({ field, display });
        });

        setExportProgress(25);

        const opt = {
            margin: 0.5,
            filename: `צעד_קדימה_${new Date().toISOString().split("T")[0]}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };

        const restore = () => {
            sections.forEach((s) => s.classList.remove("pdf-force-open"));
            hiddenButtons.forEach((btn) => (btn.style.display = ""));
            stackGrids.forEach((grid) => (grid.style.display = ""));
            fieldSwaps.forEach(({ field, display }) => {
                field.style.display = "";
                display.remove();
            });
            headerGlues.forEach(({ wrapper, header, firstChild, originalParent }) => {
                wrapper.insertAdjacentElement("beforebegin", header);
                originalParent.insertBefore(firstChild, originalParent.firstChild);
                wrapper.remove();
            });
        };

        setTimeout(() => {
            setExportProgress(50);

            html2pdf()
                .set(opt)
                .from(element)
                .save()
                .then(() => {
                    setExportProgress(100);
                    restore();
                    setTimeout(() => {
                        setIsExporting(false);
                        setExportProgress(0);
                    }, 500);
                })
                .catch((err) => {
                    console.error("PDF creation failed:", err);
                    toast.error("שגיאה בייצוא ה-PDF, יש לנסות שוב");
                    setIsExporting(false);
                    setExportProgress(0);
                    restore();
                });
        }, 400);
    };

    // Lets a caller land on this plan and export it in one step (e.g. from
    // the plans list) instead of duplicating the export logic elsewhere.
    useEffect(() => {
        if (!autoTrigger) return;
        const timeoutId = setTimeout(handleExport, 0);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="relative inline-block">
            <Button
                variant="success"
                icon={FileDown}
                loading={isExporting}
                loadingText="מייצא..."
                onClick={handleExport}
            >
                ייצוא ל-PDF
            </Button>

            {isExporting && (
                <div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-sm overflow-hidden"
                    style={{ transform: "translateY(8px)" }}
                >
                    <div
                        className="h-full bg-linear-to-r from-success to-emerald-600 transition-all"
                        style={{ width: `${exportProgress}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default PDFButton;
