import { HeartHandshake, UserRound } from "lucide-react";

// Single source for how each role is labeled/colored/iconified across the
// app (Header, Profile, Register, Providers, RecipientPlans) — one place
// to change if the wording or colors ever need to differ.
export const ROLE_META = {
    recipient: { label: "מקבל/ת שירות", variant: "primary", icon: UserRound },
    provider: { label: "נותן/ת שירות", variant: "success", icon: HeartHandshake },
};
