import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Footprints, FileText, User, LogOut, LogIn, HeartHandshake } from "lucide-react";
import { useAuth } from "../context/useAuth";
import PlanSwitcher from "./PlanSwitcher";
import ProviderSwitcher from "./ProviderSwitcher";
import RoleBadge from "./RoleBadge";
import ConfirmDialog from "./ui/ConfirmDialog";
import Dropdown from "./ui/Dropdown";
import { formatUserLabel } from "../services/userProfile";

const Header = () => {
    const { currentUser, userProfile, role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [confirmingLogout, setConfirmingLogout] = useState(false);

    const userLabel =
        currentUser &&
        formatUserLabel({
            displayName: currentUser.displayName,
            username: userProfile?.username,
            email: currentUser.email,
        });

    const isActive = (path) => location.pathname === path;

    const navButtonClass = (path) =>
        `px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            isActive(path)
                ? "bg-white text-headerTo"
                : "bg-white/15 text-white border-2 border-white/40 hover:bg-white/25 hover:border-white"
        }`;

    const logo = (
        <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-2xl font-bold text-white whitespace-nowrap bg-transparent border-none p-0 cursor-pointer"
        >
            <Footprints size={24} aria-hidden="true" />
            צעד קדימה
        </button>
    );

    if (!currentUser) {
        return (
            <nav className="sticky top-0 z-50 shadow-lg bg-headerMid bg-linear-to-r from-headerFrom to-headerTo" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center sm:justify-between items-center gap-x-4 gap-y-2 flex-wrap">
                    {logo}
                    <button className={navButtonClass("/login")} onClick={() => navigate("/login")}>
                        <LogIn size={16} aria-hidden="true" />
                        כניסה
                    </button>
                </div>
            </nav>
        );
    }

    return (
        <nav
            className="sticky top-0 z-50 shadow-lg bg-headerMid bg-linear-to-r from-headerFrom to-headerTo"
            dir="rtl"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center sm:justify-between items-center gap-x-4 gap-y-2 flex-wrap">
                {/* Logo - Right Side */}
                <div className="flex items-center gap-2 order-1 sm:order-2 lg:order-1">
                    {logo}

                    <div className="hidden lg:flex items-center gap-2 border-r border-white/30 ps-4 ms-4">
                        <User size={14} className="text-white/90" aria-hidden="true" />
                        <small className="text-white/90 whitespace-nowrap">
                            {userLabel}
                        </small>
                        <RoleBadge role={role} variant="onDark" />
                    </div>
                </div>

                {/* Navigation Buttons - Left Side */}
                <div className="flex gap-2 flex-wrap justify-center sm:justify-end order-2 sm:order-1 lg:order-2">
                    <PlanSwitcher />
                    {role === "provider" && <ProviderSwitcher />}

                    {location.pathname !== "/form" && (
                        <button className={navButtonClass("/form")} onClick={() => navigate("/form")}>
                            <FileText size={16} aria-hidden="true" />
                            הטופס
                        </button>
                    )}

                    <Dropdown
                        icon={User}
                        label="פרופיל"
                        width={240}
                        triggerClassName={navButtonClass("/profile")}
                    >
                        {(close) => (
                            <>
                                <div className="px-4 py-3 border-b border-border flex flex-col items-start gap-1.5">
                                    <span className="font-semibold text-heading text-sm truncate max-w-full">
                                        {userLabel}
                                    </span>
                                    <RoleBadge role={role} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        close();
                                        navigate("/profile");
                                    }}
                                    className="w-full text-right px-4 py-3 text-sm font-semibold text-heading hover:bg-surface-muted border-b border-border flex items-center gap-2 transition"
                                >
                                    <User size={16} aria-hidden="true" />
                                    הפרופיל שלי
                                </button>
                                {role === "recipient" && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            close();
                                            navigate("/providers");
                                        }}
                                        className="w-full text-right px-4 py-3 text-sm font-semibold text-heading hover:bg-surface-muted border-b border-border flex items-center gap-2 transition"
                                    >
                                        <HeartHandshake size={16} aria-hidden="true" />
                                        נותני השירות שלי
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        close();
                                        setConfirmingLogout(true);
                                    }}
                                    className="w-full text-right px-4 py-3 text-sm font-semibold text-danger hover:bg-surface-muted flex items-center gap-2 transition"
                                >
                                    <LogOut size={16} aria-hidden="true" />
                                    יציאה מהחשבון
                                </button>
                            </>
                        )}
                    </Dropdown>
                </div>
            </div>

            <ConfirmDialog
                open={confirmingLogout}
                title="יציאה מהחשבון"
                message="האם להתנתק מהחשבון?"
                confirmLabel="יציאה"
                cancelLabel="ביטול"
                onConfirm={() => {
                    setConfirmingLogout(false);
                    logout();
                }}
                onCancel={() => setConfirmingLogout(false)}
            />
        </nav>
    );
};

export default Header;
