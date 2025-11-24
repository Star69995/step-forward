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
            className="navbar navbar-expand-lg sticky-top shadow-sm"
            dir="rtl"
            style={{
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                padding: "1rem 0"
            }}
        >
            <div className="container-fluid px-4">
                {/* Logo & Brand */}
                <div
                    className="d-flex align-items-center gap-3"
                    style={{ marginRight: "auto" }}
                >
                    <span
                        className="navbar-brand fw-bold mb-0"
                        style={{
                            fontSize: "1.5rem",
                            color: "white",
                            letterSpacing: "0.5px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            whiteSpace: "nowrap",
                            marginLeft: "auto",  // ✅ צמוד לימין
                            marginRight: "1rem"   // ✅ רווח משמאל
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.05)";
                            e.target.style.textShadow = "0 2px 8px rgba(255, 255, 255, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                            e.target.style.textShadow = "none";
                        }}
                    >
                        🌟 צעד קדימה
                    </span>

                    <div
                        className="d-none d-md-block ps-3"
                        style={{
                            borderRight: "1px solid rgba(255, 255, 255, 0.3)",
                            paddingRight: "1rem"
                        }}
                    >
                        <small style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                            👤 {currentUser.displayName || currentUser.email}
                        </small>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div
                    className="d-flex gap-2 flex-wrap"
                    style={{ justifyContent: "flex-end" }}
                >
                    {location.pathname !== "/form" && (
                        <button
                            className="btn btn-sm fw-500"
                            onClick={() => navigate("/form")}
                            style={{
                                background: isActive("/form")
                                    ? "white"
                                    : "rgba(255, 255, 255, 0.15)",
                                color: isActive("/form") ? "#667eea" : "white",
                                border: isActive("/form")
                                    ? "1.5px solid white"
                                    : "1.5px solid rgba(255, 255, 255, 0.4)",
                                borderRadius: "25px",
                                padding: "0.6rem 1.2rem",
                                fontSize: "0.95rem",
                                fontWeight: "500",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                whiteSpace: "nowrap",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive("/form")) {
                                    e.target.style.background = "rgba(255, 255, 255, 0.25)";
                                    e.target.style.borderColor = "white";
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive("/form")) {
                                    e.target.style.background = "rgba(255, 255, 255, 0.15)";
                                    e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                }
                            }}
                        >
                            📝 הטופס שלי
                        </button>
                    )}

                    {location.pathname !== "/profile" && (
                        <button
                            className="btn btn-sm fw-500"
                            onClick={() => navigate("/profile")}
                            style={{
                                background: isActive("/profile")
                                    ? "white"
                                    : "rgba(255, 255, 255, 0.15)",
                                color: isActive("/profile") ? "#667eea" : "white",
                                border: isActive("/profile")
                                    ? "1.5px solid white"
                                    : "1.5px solid rgba(255, 255, 255, 0.4)",
                                borderRadius: "25px",
                                padding: "0.6rem 1.2rem",
                                fontSize: "0.95rem",
                                fontWeight: "500",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                whiteSpace: "nowrap",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive("/profile")) {
                                    e.target.style.background = "rgba(255, 255, 255, 0.25)";
                                    e.target.style.borderColor = "white";
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive("/profile")) {
                                    e.target.style.background = "rgba(255, 255, 255, 0.15)";
                                    e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                }
                            }}
                        >
                            👤 הפרופיל שלי
                        </button>
                    )}

                    <button
                        className="btn btn-sm fw-500"
                        onClick={logout}
                        style={{
                            background: "rgba(255, 255, 255, 0.15)",
                            color: "white",
                            border: "1.5px solid rgba(255, 255, 255, 0.4)",
                            borderRadius: "25px",
                            padding: "0.6rem 1.2rem",
                            fontSize: "0.95rem",
                            fontWeight: "500",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            whiteSpace: "nowrap",
                            cursor: "pointer"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "rgba(220, 53, 69, 0.3)";
                            e.target.style.borderColor = "rgba(220, 53, 69, 0.8)";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.15)";
                            e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        🚪 התנתקות
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Header;