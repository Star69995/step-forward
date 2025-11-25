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
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-bold transition disabled:opacity-90 flex items-center gap-2 whitespace-nowrap"
            onClick={handleSave}
            disabled={isLoading}
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
            style={{
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
            }}
        >
            {isLoading ? (
                <>
                    <span
                        className="inline-block animate-spin"
                        style={{ width: "1rem", height: "1rem" }}
                    >
                        ⏳
                    </span>
                    <span>שומר...</span>
                </>
            ) : (
                <>
                    <span className="text-lg">☁️</span>
                    <span>שמירה לענן</span>
                </>
            )}
        </button>
    );
};

export default CloudSaveButton;