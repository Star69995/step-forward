import React from "react";
import { Loader2 } from "lucide-react";

const Spinner = ({ size = 18, className = "" }) => (
    <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden="true" />
);

export default Spinner;
