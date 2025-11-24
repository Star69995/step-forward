import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import Goal from "./Goal";

const GoalSection = ({ title, baseName, index, badgeColor = "primary" }) => {
    const [open, setOpen] = useState(false);
    const { register } = useFormContext();

    const badgeColors = {
        primary: "#667eea",
        info: "#0dcaf0",
        success: "#198754",
        warning: "#ffc107",
        danger: "#dc3545"
    };

    const badgeColor2 = badgeColors[badgeColor] || badgeColors.primary;

    return (
        <div
            className="goal-section border-0 shadow-sm mb-3"
            style={{
                borderRadius: "12px",
                overflow: "hidden",
                transition: "all 0.3s ease",
                backgroundColor: "white",
                borderLeft: `4px solid ${badgeColor2}`
            }}
            onMouseEnter={(e) => {
                if (!open) {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.1)";
                }
            }}
            onMouseLeave={(e) => {
                if (!open) {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
                }
            }}
        >
            {/* ===== HEADER with rotating triangle ===== */}
            <div
                className="p-4"
                style={{
                    cursor: "pointer",
                    userSelect: "none",
                    backgroundColor: open ? `${badgeColor2}10` : "white",
                    transition: "all 0.3s ease",
                    borderBottom: open ? `2px solid ${badgeColor2}30` : "none"
                }}
                onClick={() => setOpen(!open)}
            >
                <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ gap: "1rem" }}
                >
                    <div className="d-flex align-items-center" style={{ gap: "0.75rem", minWidth: 0 }}>
                        {/* Arrow Icon */}
                        <div
                            className="arrow-icon"
                            style={{
                                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                transform: open ? "rotate(90deg)" : "rotate(0deg)",
                                fontSize: "1.5rem",
                                color: badgeColor2,
                                lineHeight: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "24px",
                                height: "24px",
                                flexShrink: 0
                            }}
                        >
                            ▶
                        </div>

                        {/* Title */}
                        <h5
                            className="m-0 fw-bold"
                            style={{
                                color: badgeColor2,
                                fontSize: "1.1rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {title || `מטרה לטווח קצר #${index}`}
                        </h5>
                    </div>

                    {/* Badge Counter */}
                    <div
                        className="badge"
                        style={{
                            backgroundColor: badgeColor2,
                            color: "white",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.85rem",
                            borderRadius: "20px",
                            flexShrink: 0,
                            fontWeight: "600"
                        }}
                    >
                        #{index}
                    </div>
                </div>
            </div>

            {/* ===== EXPANDED CONTENT ===== */}
            <div
                className={`goal-content ${open ? "shown" : "hidden"}`}
                style={{
                    maxHeight: open ? "1000px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                    opacity: open ? 1 : 0
                }}
            >
                <div className="p-4" style={{ backgroundColor: "white" }}>
                    {/* Description */}
                    <div className="mb-4">
                        <label
                            className="form-label fw-bold mb-2"
                            style={{
                                color: "#333",
                                fontSize: "0.95rem",
                                letterSpacing: "0.3px"
                            }}
                        >
                            📝 תיאור המטרה
                        </label>
                        <textarea
                            {...register(`${baseName}.description`)}
                            rows={3}
                            className="form-control"
                            placeholder="תאר את המטרה שלך בפירוט..."
                            style={{
                                borderRadius: "8px",
                                borderColor: "#e0e0e0",
                                fontSize: "0.95rem",
                                fontFamily: "Rubik, sans-serif",
                                transition: "all 0.3s ease",
                                resize: "vertical"
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = badgeColor2;
                                e.target.style.boxShadow = `0 0 0 3px ${badgeColor2}20`;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = "#e0e0e0";
                                e.target.style.boxShadow = "none";
                            }}
                        ></textarea>
                    </div>

                    {/* Targets Section */}
                    <div>
                        <label
                            className="form-label fw-bold mb-3"
                            style={{
                                color: "#333",
                                fontSize: "0.95rem",
                                letterSpacing: "0.3px",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}
                        >
                            <span
                                style={{
                                    width: "4px",
                                    height: "20px",
                                    backgroundColor: badgeColor2,
                                    borderRadius: "2px"
                                }}
                            ></span>
                            🎯 יעדים ספציפיים
                        </label>

                        <div
                            style={{
                                display: "grid",
                                gap: "1rem",
                                gridTemplateColumns: "1fr"
                            }}
                        >
                            {/* יעד #1 */}
                            <Goal
                                baseName={baseName}
                                index={1}
                                color={badgeColor2}
                            />

                            {/* יעד #2 */}
                            <Goal
                                baseName={baseName}
                                index={2}
                                color={badgeColor2}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalSection;