import React, { useState } from "react";
import html2pdf from "html2pdf.js";

const PDFButton = ({ targetId }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const handleExport = () => {
        setIsExporting(true);
        setExportProgress(0);

        // 1️⃣ Open all collapsible sections (GoalSection)
        const sections = document.querySelectorAll(".goal-section");
        sections.forEach((s) => s.classList.add("open-for-pdf"));

        // 2️⃣ Hide buttons that shouldn't appear in PDF
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

        // 3️⃣ Wait a tick so CSS changes (open-for-pdf) render
        setTimeout(() => {
            setExportProgress(50);

            html2pdf()
                .set(opt)
                .from(element)
                .save()
                .then(() => {
                    setExportProgress(100);

                    // 4️⃣ Restore everything
                    sections.forEach((s) => s.classList.remove("open-for-pdf"));
                    hiddenButtons.forEach((btn) => (btn.style.display = ""));

                    // Reset after success
                    setTimeout(() => {
                        setIsExporting(false);
                        setExportProgress(0);
                    }, 500);
                })
                .catch((err) => {
                    console.error("PDF creation failed:", err);
                    setIsExporting(false);
                    setExportProgress(0);

                    // Restore on error
                    sections.forEach((s) => s.classList.remove("open-for-pdf"));
                    hiddenButtons.forEach((btn) => (btn.style.display = ""));
                });
        }, 400);
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <button
                className="btn fw-bold"
                onClick={handleExport}
                disabled={isExporting}
                style={{
                    background: isExporting
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    padding: "0.75rem 1.5rem",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: isExporting ? "not-allowed" : "pointer",
                    opacity: isExporting ? 0.9 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    letterSpacing: "0.3px"
                }}
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
            >
                {isExporting ? (
                    <>
                        <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                            style={{ width: "1rem", height: "1rem" }}
                        ></span>
                        <span>ייצוא...</span>
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: "1.2rem" }}>📄</span>
                        <span>יצוא ל-PDF</span>
                    </>
                )}
            </button>

            {/* Progress Bar */}
            {isExporting && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "-8px",
                        left: 0,
                        right: 0,
                        height: "4px",
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        borderRadius: "2px",
                        overflow: "hidden"
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                            width: `${exportProgress}%`,
                            transition: "width 0.3s ease",
                            borderRadius: "2px"
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default PDFButton;