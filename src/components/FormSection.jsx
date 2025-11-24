import React from "react";
import { useFormContext } from "react-hook-form";

const FormSection = ({ name, label, rows = 3, showLabel = true, icon = "📝" }) => {
    const { register } = useFormContext();

    return (
        <div
            style={{
                marginBottom: "1.5rem",
                animation: "fadeIn 0.3s ease-out"
            }}
        >
            {/* Label with Icon */}
            {showLabel && (
                <label
                    className="form-label fw-semibold mb-2"
                    style={{
                        color: "#333",
                        fontSize: "0.95rem",
                        letterSpacing: "0.3px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}
                >
                    <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                    {label}
                </label>
            )}

            {/* Textarea */}
            <textarea
                {...register(name)}
                rows={rows}
                className="form-control"
                placeholder="כתוב את המחשבות שלך כאן..."
                style={{
                    borderRadius: "10px",
                    borderColor: "#e0e0e0",
                    borderWidth: "1.5px",
                    padding: "1rem",
                    fontSize: "0.95rem",
                    fontFamily: "Rubik, sans-serif",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    backgroundColor: "#fafafa",
                    resize: "vertical",
                    minHeight: `${rows * 2.5}rem`,
                    color: "#333",
                    lineHeight: "1.6"
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                    e.target.style.backgroundColor = "white";
                    e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "#fafafa";
                    e.target.style.borderWidth = "1.5px";
                }}
                onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                        e.target.style.borderColor = "#d0d0d0";
                        e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                        e.target.style.borderColor = "#e0e0e0";
                        e.target.style.boxShadow = "none";
                    }
                }}
            />

            {/* Character Count (Optional) */}
            <small
                style={{
                    color: "#999",
                    marginTop: "0.5rem",
                    display: "block",
                    fontSize: "0.8rem"
                }}
            >
                💡 שתף את הרעיונות והרגשות שלך בחופשיות
            </small>
        </div>
    );
};

export default FormSection;