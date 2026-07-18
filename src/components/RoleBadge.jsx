import React from "react";
import Badge from "./ui/Badge";
import { ROLE_META } from "../services/roles";

// Shown next to a user's name (Header, Profile) so it's always obvious
// whether the account is a recipient or a provider.
const RoleBadge = ({ role, variant, className = "" }) => {
    const meta = ROLE_META[role];
    if (!meta) return null;

    return (
        <Badge variant={variant || meta.variant} icon={meta.icon} className={className}>
            {meta.label}
        </Badge>
    );
};

export default RoleBadge;
