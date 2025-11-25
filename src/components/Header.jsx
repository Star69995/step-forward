import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!currentUser) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className="sticky top-0 z-50 shadow-lg"
            style={{
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
            }}
            dir="rtl"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4 flex-wrap">
                {/* Logo - Right Side */}
                <div className="flex items-center gap-2 order-2 lg:order-1">
                    <span
                        className="text-2xl font-bold text-white whitespace-nowrap cursor-pointer transition hover:scale-105"
                        style={{
                            textShadow: "0 2px 8px rgba(255, 255, 255, 0.2)"
                            
                        }}
                    >
                        🌟 צעד קדימה
                    </span>

                    <div className="hidden lg:block border-r border-white border-opacity-30 ps-4 ms-4">
                        <small className="text-white text-opacity-90 whitespace-nowrap">
                            👤 {currentUser.displayName || currentUser.email}
                        </small>
                    </div>
                </div>

                {/* Navigation Buttons - Left Side */}
                <div className="flex gap-2 flex-wrap justify-end order-1 lg:order-2">
                    {location.pathname !== "/form" && (
                        <button
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${isActive("/form")
                                    ? "bg-white text-purple-600"
                                    : "bg-white bg-opacity-15 text-white border-2 border-white border-opacity-40 hover:bg-opacity-25 hover:border-white"
                                }`}
                            onClick={() => navigate("/form")}
                        >
                            📝 הטופס
                        </button>
                    )}

                    {location.pathname !== "/profile" && (
                        <button
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${isActive("/profile")
                                    ? "bg-white text-purple-600"
                                    : "bg-white bg-opacity-15 text-white border-2 border-white border-opacity-40 hover:bg-opacity-25 hover:border-white"
                                }`}
                            onClick={() => navigate("/profile")}
                        >
                            👤 פרופיל
                        </button>
                    )}

                    <button
                        className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition bg-white bg-opacity-15 text-white border-2 border-white border-opacity-40 hover:bg-red-500 hover:bg-opacity-30 hover:border-red-500"
                        onClick={logout}
                    >
                        🚪 יציאה
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Header;