import React from "react";
import { useFormContext } from "react-hook-form";

const Goal = ({ baseName, index, color = "#0d6efd" }) => {
    const { register } = useFormContext();

    return (
        <div
            style={{
                backgroundColor: `${color}08`,
                borderRadius: "10px",
                padding: "1.25rem",
                borderRight: `3px solid ${color}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                marginBottom: "1rem"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 4px 12px ${color}20`;
                e.currentTarget.style.transform = "translateX(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateX(0)";
            }}
        >
            {/* Goal Number Badge */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: color,
                    color: "white",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    marginBottom: "0.75rem"
                }}
            >
                {index}
            </div>

            {/* Row Container */}
            <div
                className="row g-3 align-items-end"
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem"
                }}
            >
                {/* Goal Text Input */}
                <div>
                    <label
                        className="form-label fw-semibold mb-2"
                        style={{
                            color: "#333",
                            fontSize: "0.9rem",
                            letterSpacing: "0.3px"
                        }}
                    >
                        🎯 תיאור היעד
                    </label>
                    <input
                        type="text"
                        {...register(`${baseName}.target${index}.text`)}
                        className="form-control"
                        placeholder={`תאר את היעד #${index} שלך...`}
                        style={{
                            borderRadius: "8px",
                            borderColor: "#e0e0e0",
                            padding: "0.75rem 1rem",
                            fontSize: "0.95rem",
                            fontFamily: "Rubik, sans-serif",
                            transition: "all 0.3s ease",
                            backgroundColor: "white"
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = color;
                            e.target.style.boxShadow = `0 0 0 3px ${color}20`;
                            e.target.style.backgroundColor = `${color}05`;
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "#e0e0e0";
                            e.target.style.boxShadow = "none";
                            e.target.style.backgroundColor = "white";
                        }}
                    />
                </div>

                {/* End Date Input */}
                <div>
                    <label
                        className="form-label fw-semibold mb-2"
                        style={{
                            color: "#333",
                            fontSize: "0.9rem",
                            letterSpacing: "0.3px"
                        }}
                    >
                        📅 תאריך סיום
                    </label>
                    <input
                        type="date"
                        {...register(`${baseName}.target${index}.endDate`)}
                        className="form-control"
                        style={{
                            borderRadius: "8px",
                            borderColor: "#e0e0e0",
                            padding: "0.75rem 1rem",
                            fontSize: "0.95rem",
                            fontFamily: "Rubik, sans-serif",
                            transition: "all 0.3s ease",
                            backgroundColor: "white"
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = color;
                            e.target.style.boxShadow = `0 0 0 3px ${color}20`;
                            e.target.style.backgroundColor = `${color}05`;
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "#e0e0e0";
                            e.target.style.boxShadow = "none";
                            e.target.style.backgroundColor = "white";
                        }}
                    />
                </div>
            </div>

            {/* Helper Text */}
            <small
                style={{
                    color: "#666",
                    marginTop: "0.5rem",
                    display: "block",
                    fontSize: "0.8rem",
                    fontStyle: "italic"
                }}
            >
                💡 הגדר יעד קטן, מדידה, ברור ובעל לוח זמנים
            </small>
        </div>
    );
};

export default Goal;