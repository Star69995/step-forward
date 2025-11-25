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
            className="goal-section border-0 rounded-2xl shadow-sm mb-4 overflow-hidden transition"
            style={{
                borderLeft: `4px solid ${badgeColor2}`,
                backgroundColor: "white"
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
            {/* HEADER */}
            <div
                className="p-4 cursor-pointer select-none transition"
                style={{
                    backgroundColor: open ? `${badgeColor2}10` : "white",
                    borderBottom: open ? `2px solid ${badgeColor2}30` : "none"
                }}
                onClick={() => setOpen(!open)}
            >
                <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Arrow Icon */}
                        <div
                            className="arrow-icon flex items-center justify-center w-6 h-6 flex-shrink-0 transition"
                            style={{
                                color: badgeColor2,
                                transform: open ? "rotate(90deg)" : "rotate(0deg)",
                                fontSize: "1.5rem"
                            }}
                        >
                            ▶
                        </div>

                        {/* Title */}
                        <h5
                            className="m-0 font-bold text-lg overflow-hidden text-ellipsis whitespace-nowrap"
                            style={{ color: badgeColor2 }}
                        >
                            {title || `מטרה לטווח קצר #${index}`}
                        </h5>
                    </div>

                    {/* Badge */}
                    <div
                        className="badge text-white px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: badgeColor2 }}
                    >
                        #{index}
                    </div>
                </div>
            </div>

            {/* EXPANDED CONTENT */}
            <div
                className="goal-content overflow-hidden transition-all"
                style={{
                    maxHeight: open ? "1000px" : "0px",
                    opacity: open ? 1 : 0
                }}
            >
                <div className="p-4 bg-white">
                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                            📝 תיאור המטרה
                        </label>
                        <textarea
                            {...register(`${baseName}.description`)}
                            rows={3}
                            placeholder="תאר את המטרה שלך בפירוט..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-sans transition focus:border-2 focus:outline-none focus:ring-2 focus:bg-white"
                            style={{
                                borderColor: "rgb(224, 224, 224)",
                                fontFamily: "Rubik, sans-serif",
                                lineHeight: "1.6",
                                resize: "vertical"
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = badgeColor2;
                                e.target.style.boxShadow = `0 0 0 3px ${badgeColor2}20`;
                                e.target.style.backgroundColor = "white";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = "rgb(224, 224, 224)";
                                e.target.style.boxShadow = "none";
                                e.target.style.backgroundColor = "rgb(250, 250, 250)";
                            }}
                        />
                    </div>

                    {/* Targets Section */}
                    <div>
                        <label
                            className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"
                            style={{ letterSpacing: "0.3px" }}
                        >
                            <span
                                className="w-1 h-5 rounded"
                                style={{ backgroundColor: badgeColor2 }}
                            ></span>
                            🎯 יעדים ספציפיים
                        </label>

                        <div>
                            <Goal baseName={baseName} index={1} color={badgeColor2} />
                            <Goal baseName={baseName} index={2} color={badgeColor2} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalSection;