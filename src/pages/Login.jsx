import React, { useState } from "react";
import { auth, provider } from "../services/firebase";
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await signInWithPopup(auth, provider);
            toast.success("✅ התחברת בהצלחה!", { position: "bottom-center" });
            navigate("/form");
        } catch (error) {
            toast.error("❌ שגיאה בהתחברות עם Google: " + error.message, {
                position: "bottom-center"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("⚠️ אנא מלא את כל השדות", { position: "bottom-center" });
            return;
        }

        try {
            setLoading(true);

            if (isSignup) {
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success("✅ הרשמה בהצלחה! ברוכים הבאים!", { position: "bottom-center" });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("✅ התחברת בהצלחה!", { position: "bottom-center" });
            }

            navigate("/form");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("❌ המייל כבר רשום במערכת", { position: "bottom-center" });
            } else if (error.code === "auth/weak-password") {
                toast.error("❌ הסיסמה חלשה מדי (לפחות 6 תווים)", { position: "bottom-center" });
            } else if (error.code === "auth/user-not-found") {
                toast.error("❌ משתמש זה לא קיים", { position: "bottom-center" });
            } else if (error.code === "auth/wrong-password") {
                toast.error("❌ סיסמה שגויה", { position: "bottom-center" });
            } else {
                toast.error("❌ שגיאה: " + error.message, { position: "bottom-center" });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            dir="rtl"
            style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "1rem"
            }}
        >
            {/* Main Card */}
            <div
                className="card border-0 shadow-lg"
                style={{
                    maxWidth: "420px",
                    width: "100%",
                    borderRadius: "16px",
                    overflow: "hidden"
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        padding: "2rem 1.5rem",
                        color: "white",
                        textAlign: "center"
                    }}
                >
                    <h1 className="fw-bold mb-2" style={{ fontSize: "2rem" }}>
                        🌟 צעד קדימה
                    </h1>
                    <p className="mb-0 opacity-90">
                        {isSignup ? "יצירת חשבון חדש" : "התחברות למערכת"}
                    </p>
                </div>

                {/* Body */}
                <div style={{ padding: "2rem 1.5rem" }}>
                    {/* Google Login Button */}
                    <button
                        className="btn fw-bold w-100 mb-4"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            background: "white",
                            color: "#333",
                            border: "2px solid #e0e0e0",
                            borderRadius: "10px",
                            padding: "0.75rem",
                            fontSize: "1rem",
                            transition: "all 0.3s ease",
                            fontWeight: "600"
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.borderColor = "#667eea";
                                e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
                                e.target.style.transform = "translateY(-2px)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.borderColor = "#e0e0e0";
                                e.target.style.boxShadow = "none";
                                e.target.style.transform = "translateY(0)";
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    style={{ width: "1rem", height: "1rem" }}
                                ></span>
                                טוען...
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: "1.2rem", marginLeft: "0.5rem" }}>🔐</span>
                                התחברות עם Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "1.5rem"
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                height: "1px",
                                backgroundColor: "#e0e0e0"
                            }}
                        ></div>
                        <span style={{ color: "#999", fontSize: "0.9rem" }}>או</span>
                        <div
                            style={{
                                flex: 1,
                                height: "1px",
                                backgroundColor: "#e0e0e0"
                            }}
                        ></div>
                    </div>

                    {/* Email & Password Form */}
                    <form onSubmit={handleFormSubmit}>
                        {/* Email Input */}
                        <div className="mb-3">
                            <label
                                className="form-label fw-semibold mb-2"
                                style={{
                                    color: "#333",
                                    fontSize: "0.95rem",
                                    letterSpacing: "0.3px"
                                }}
                            >
                                📧 אימייל
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                style={{
                                    borderRadius: "10px",
                                    borderColor: "#e0e0e0",
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.95rem",
                                    fontFamily: "Rubik, sans-serif",
                                    transition: "all 0.3s ease",
                                    backgroundColor: "#fafafa"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#667eea";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                                    e.target.style.backgroundColor = "white";
                                    e.target.style.borderWidth = "2px";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e0e0e0";
                                    e.target.style.boxShadow = "none";
                                    e.target.style.backgroundColor = "#fafafa";
                                    e.target.style.borderWidth = "1px";
                                }}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mb-4">
                            <label
                                className="form-label fw-semibold mb-2"
                                style={{
                                    color: "#333",
                                    fontSize: "0.95rem",
                                    letterSpacing: "0.3px"
                                }}
                            >
                                🔐 סיסמה
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder={isSignup ? "לפחות 6 תווים" : "הזן את הסיסמה שלך"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                style={{
                                    borderRadius: "10px",
                                    borderColor: "#e0e0e0",
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.95rem",
                                    fontFamily: "Rubik, sans-serif",
                                    transition: "all 0.3s ease",
                                    backgroundColor: "#fafafa"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#667eea";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                                    e.target.style.backgroundColor = "white";
                                    e.target.style.borderWidth = "2px";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e0e0e0";
                                    e.target.style.boxShadow = "none";
                                    e.target.style.backgroundColor = "#fafafa";
                                    e.target.style.borderWidth = "1px";
                                }}
                            />
                            {isSignup && (
                                <small
                                    style={{
                                        color: "#999",
                                        marginTop: "0.5rem",
                                        display: "block",
                                        fontSize: "0.8rem"
                                    }}
                                >
                                    💡 הסיסמה חייבת להכיל לפחות 6 תווים
                                </small>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn fw-bold w-100"
                            disabled={loading}
                            style={{
                                background: isSignup
                                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                padding: "0.75rem",
                                fontSize: "1rem",
                                fontWeight: "600",
                                transition: "all 0.3s ease",
                                boxShadow: isSignup
                                    ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                                    : "0 4px 12px rgba(16, 185, 129, 0.3)"
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = isSignup
                                        ? "0 6px 20px rgba(102, 126, 234, 0.4)"
                                        : "0 6px 20px rgba(16, 185, 129, 0.4)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = isSignup
                                        ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                                        : "0 4px 12px rgba(16, 185, 129, 0.3)";
                                }
                            }}
                        >
                            {isSignup ? "הרשמה" : "כניסה"}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div
                    style={{
                        backgroundColor: "#f9f9f9",
                        padding: "1rem 1.5rem",
                        borderTop: "1px solid #e0e0e0",
                        textAlign: "center"
                    }}
                >
                    <small style={{ color: "#666" }}>
                        {!isSignup ? "אין לך חשבון? " : "כבר יש לך חשבון? "}
                        <button
                            className="btn btn-link p-0 fw-bold"
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setEmail("");
                                setPassword("");
                            }}
                            style={{
                                color: "#667eea",
                                textDecoration: "none",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.color = "#764ba2";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = "#667eea";
                            }}
                        >
                            {isSignup ? "כניסה כאן" : "הרשמה כאן"}
                        </button>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;