import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Footprints, FileText, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PlanSwitcher from "./PlanSwitcher";

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!currentUser) return null;

    const isActive = (path) => location.pathname === path;

    const navButtonClass = (path) =>
        `px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            isActive(path)
                ? "bg-white text-headerTo"
                : "bg-white/15 text-white border-2 border-white/40 hover:bg-white/25 hover:border-white"
        }`;

    return (
        <nav
            className="sticky top-0 z-50 shadow-lg bg-gradient-to-r from-headerFrom to-headerTo"
            dir="rtl"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4 flex-wrap">
                {/* Logo - Right Side */}
                <div className="flex items-center gap-2 order-2 lg:order-1">
                    <span className="flex items-center gap-2 text-2xl font-bold text-white whitespace-nowrap">
                        <Footprints size={24} aria-hidden="true" />
                        צעד קדימה
                    </span>

                    <div className="hidden lg:flex items-center gap-1.5 border-r border-white/30 ps-4 ms-4">
                        <User size={14} className="text-white/90" aria-hidden="true" />
                        <small className="text-white/90 whitespace-nowrap">
                            {currentUser.displayName || currentUser.email}
                        </small>
                    </div>
                </div>

                {/* Navigation Buttons - Left Side */}
                <div className="flex gap-2 flex-wrap justify-end order-1 lg:order-2">
                    <PlanSwitcher />

                    {location.pathname !== "/form" && (
                        <button className={navButtonClass("/form")} onClick={() => navigate("/form")}>
                            <FileText size={16} aria-hidden="true" />
                            הטופס
                        </button>
                    )}

                    {location.pathname !== "/profile" && (
                        <button className={navButtonClass("/profile")} onClick={() => navigate("/profile")}>
                            <User size={16} aria-hidden="true" />
                            פרופיל
                        </button>
                    )}

                    <button
                        className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition flex items-center gap-1.5 bg-white/15 text-white border-2 border-white/40 hover:bg-danger/30 hover:border-danger"
                        onClick={logout}
                    >
                        <LogOut size={16} aria-hidden="true" />
                        יציאה
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Header;
