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
        if (autoTrigger) handleExport();
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
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded overflow-hidden"
                    style={{ transform: "translateY(8px)" }}
                >
                    <div
                        className="h-full bg-gradient-to-r from-success to-emerald-600 transition-all"
                        style={{ width: `${exportProgress}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default PDFButton;
