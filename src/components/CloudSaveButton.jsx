import React, { useState } from "react";
import { Cloud } from "lucide-react";
import { savePlan } from "../services/savePlan";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Button from "./ui/Button";

const CloudSaveButton = ({ getData, planId, isSaving }) => {
    const { currentUser } = useAuth();
    const [localSaving, setLocalSaving] = useState(false);

    const handleSave = async () => {
        if (!currentUser) {
            toast.error("יש להתחבר למערכת כדי לשמור");
            return;
        }

        setLocalSaving(true);

        try {
            await savePlan(currentUser.uid, getData(), planId);
            toast.success("נשמר בהצלחה בענן", { position: "bottom-center", autoClose: 3000 });
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בשמירה, יש לנסות שוב", { position: "bottom-center", autoClose: 3000 });
        } finally {
            setLocalSaving(false);
        }
    };

    return (
        <Button
            variant="blue"
            icon={Cloud}
            loading={isSaving || localSaving}
            loadingText="שומר..."
            onClick={handleSave}
        >
            שמירה לענן
        </Button>
    );
};

export default CloudSaveButton;
