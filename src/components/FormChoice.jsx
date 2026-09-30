import React from "react";
import { useController, useFormContext } from "react-hook-form";
import SegmentedToggle from "./ui/SegmentedToggle";

// react-hook-form-bound SegmentedToggle — the choice counterpart of
// FormSection (text fields). Clicking the already-selected option clears
// it back to unset, since a radio-style choice has no other way to undo an
// accidental pick.
const FormChoice = ({ name, options, ariaLabel, stretch, className }) => {
    const { control } = useFormContext();
    const { field } = useController({ name, control, defaultValue: "" });

    return (
        <SegmentedToggle
            options={options}
            value={field.value}
            onChange={(val) => field.onChange(val === field.value ? "" : val)}
            ariaLabel={ariaLabel}
            strong
            stretch={stretch}
            className={className}
        />
    );
};

export default FormChoice;
