import React from "react";
import { useFormContext } from "react-hook-form";
import { FileText } from "lucide-react";
import TextField from "./ui/TextField";

const FormSection = ({
    name,
    label,
    rows = 3,
    showLabel = true,
    icon: Icon = FileText,
    placeholder = "ניתן לכתוב כאן את המחשבות בחופשיות",
}) => {
    const { register } = useFormContext();
    const isSingleLine = rows === 1;

    return (
        <div className={isSingleLine ? "" : "mb-6 fade-in"}>
            <TextField
                as={isSingleLine ? "input" : "textarea"}
                type={isSingleLine ? "text" : undefined}
                dense={isSingleLine}
                icon={showLabel ? Icon : undefined}
                label={showLabel ? label : undefined}
                rows={isSingleLine ? undefined : rows}
                placeholder={placeholder}
                {...register(name)}
            />
        </div>
    );
};

export default FormSection;
