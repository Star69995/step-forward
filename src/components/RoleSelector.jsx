import { Check } from "lucide-react";
import { ROLE_META } from "../services/roles";

// Single source for the role-choice UI shown at signup (Register.jsx's full
// form, and Login.jsx's username-method create-on-login fallback) — not
// under components/ui since it's domain-specific (recipient/provider),
// mirroring RoleBadge.jsx's split between the generic Badge and this
// role-aware wrapper. See roles.js for label/icon; descriptions live here
// since nothing else needs them.
const ROLE_DESCRIPTIONS = {
    recipient: "ממלאים תוכנית אישית לקידום מטרות ויכולים לשתף אותה עם נותני שירות",
    provider: "מלווים תוכניות של מקבלי שירות שבחרו לשתף איתם",
};

const ROLES = Object.entries(ROLE_META).map(([value, meta]) => ({
    value,
    label: meta.label,
    icon: meta.icon,
    description: ROLE_DESCRIPTIONS[value],
}));

const RoleSelector = ({ value, onChange, label = "סוג המשתמש", className = "" }) => (
    <div className={className}>
        {label && <span className="block text-sm font-semibold text-heading mb-2">{label}</span>}
        <div className="grid grid-cols-1 gap-3">
            {ROLES.map(({ value: roleValue, label: roleLabel, description, icon: Icon }) => {
                const selected = value === roleValue;
                return (
                    <button
                        key={roleValue}
                        type="button"
                        onClick={() => onChange(roleValue)}
                        aria-pressed={selected}
                        className={`flex items-start gap-3 text-right p-4 rounded-xl border-2 transition ${
                            selected ? "border-primary bg-primary/5" : "border-border hover:border-border"
                        }`}
                    >
                        <Icon size={22} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
                        <span className="flex-1">
                            <span className="flex items-center gap-2 font-bold text-heading">
                                {roleLabel}
                                {selected && <Check size={16} className="text-primary" aria-hidden="true" />}
                            </span>
                            <span className="block text-sm text-body mt-0.5">{description}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    </div>
);

export default RoleSelector;
