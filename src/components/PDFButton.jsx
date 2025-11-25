import React, { useState } from "react";
import html2pdf from "html2pdf.js";

const PDFButton = ({ targetId }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const handleExport = () => {
        setIsExporting(true);
        setExportProgress(0);

        const sections = document.querySelectorAll(".goal-section");
        sections.forEach((s) => s.classList.add("open-for-pdf"));

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

        setTimeout(() => {
            setExportProgress(50);

            html2pdf()
                .set(opt)
                .from(element)
                .save()
                .then(() => {
                    setExportProgress(100);
                    sections.forEach((s) => s.classList.remove("open-for-pdf"));
                    hiddenButtons.forEach((btn) => (btn.style.display = ""));

                    setTimeout(() => {
                        setIsExporting(false);
                        setExportProgress(0);
                    }, 500);
                })
                .catch((err) => {
                    console.error("PDF creation failed:", err);
                    setIsExporting(false);
                    setExportProgress(0);

                    sections.forEach((s) => s.classList.remove("open-for-pdf"));
                    hiddenButtons.forEach((btn) => (btn.style.display = ""));
                });
        }, 400);
    };

    return (
        <div className="relative inline-block">
            <button
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold transition disabled:opacity-90"
                onClick={handleExport}
                disabled={isExporting}
                onMouseEnter={(e) => {
                    if (!isExporting) {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isExporting) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                    }
                }}
                style={{
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                }}
            >
                <div className="flex items-center gap-2 whitespace-nowrap">
                    {isExporting ? (
                        <>
                            <span
                                className="inline-block animate-spin"
                                style={{ width: "1rem", height: "1rem" }}
                            >
                                ⏳
                            </span>
                            <span>ייצוא...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-lg">📄</span>
                            <span>יצוא ל-PDF</span>
                        </>
                    )}
                </div>
            </button>

            {/* Progress Bar */}
            {isExporting && (
                <div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded overflow-hidden"
                    style={{ transform: "translateY(8px)" }}
                >
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition"
                        style={{ width: `${exportProgress}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default PDFButton;