import React, { useState } from "react";
import { savePlan } from "../services/savePlan";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const CloudSaveButton = ({ data, planId, setPlanId, isSaving }) => {
    const { currentUser } = useAuth();
    const [localSaving, setLocalSaving] = useState(false);

    const handleSave = async () => {
        if (!currentUser) {
            toast.error("💾 התחבר למערכת כדי לשמור");
            return;
        }

        setLocalSaving(true);

        try {
            const id = await savePlan(currentUser.uid, data, planId);
            setPlanId(id);
            toast.success("✅ נשמר בהצלחה בענן!", {
                position: "bottom-center",
                autoClose: 3000,
            });
        } catch (error) {
            console.error(error);
            toast.error("❌ שגיאה בשמירה! נסה שוב.", {
                position: "bottom-center",
                autoClose: 3000,
            });
        } finally {
            setLocalSaving(false);
        }
    };

    const isLoading = isSaving || localSaving;

    return (
        <button
            className="btn fw-bold"
            onClick={handleSave}
            disabled={isLoading}
            style={{
                background: isLoading
                    ? "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                color: "white",
                border: "none",
                borderRadius: "25px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.9 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                letterSpacing: "0.3px"
            }}
            onMouseEnter={(e) => {
                if (!isLoading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                }
            }}
            onMouseLeave={(e) => {
                if (!isLoading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                }
            }}
        >
            {isLoading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                        style={{
                            width: "1rem",
                            height: "1rem",
                            borderWidth: "2px"
                        }}
                    ></span>
                    <span>שומר...</span>
                </>
            ) : (
                <>
                    <span style={{ fontSize: "1.2rem" }}>☁️</span>
                    <span>שמירה לענן</span>
                </>
            )}
        </button>
    );
};

export default CloudSaveButton;