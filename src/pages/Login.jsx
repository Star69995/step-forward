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
            className="flex justify-center items-center min-h-screen p-4"
            dir="rtl"
            style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}
        >
            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div
                    className="text-white py-8 px-6 text-center"
                    style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    }}
                >
                    <h1 className="text-4xl font-bold mb-2">🌟 צעד קדימה</h1>
                    <p className="opacity-90 text-lg">
                        {isSignup ? "צרו חשבון חדש" : "התחברו למערכת"}
                    </p>
                </div>

                {/* Body */}
                <div className="p-8">
                    {/* Google Login Button */}
                    <button
                        className="w-full bg-white text-gray-800 border-2 border-gray-300 rounded-xl py-3 px-4 font-bold transition mb-4 flex items-center justify-center gap-2"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.borderColor = "#667eea";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.borderColor = "#e5e7eb";
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateY(0)";
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin inline-block">⏳</span>
                                <span>טוען...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-xl">🔐</span>
                                <span>התחברות עם Google</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-gray-500 text-sm">או</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    {/* Email & Password Form */}
                    <form onSubmit={handleFormSubmit}>
                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                                📧 אימייל
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-sans transition focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                style={{
                                    fontFamily: "Rubik, sans-serif"
                                }}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                                🔐 סיסמה
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-sans transition focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white"
                                placeholder={isSignup ? "לפחות 6 תווים" : "הזן את הסיסמה שלך"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                style={{
                                    fontFamily: "Rubik, sans-serif"
                                }}
                            />
                            {isSignup && (
                                <small className="block text-gray-600 mt-2 text-xs italic">
                                    💡 הסיסמה חייבת להכיל לפחות 6 תווים
                                </small>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full font-bold py-3 px-4 rounded-lg text-white transition flex items-center justify-center gap-2"
                            disabled={loading}
                            style={{
                                background: isSignup
                                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                boxShadow: isSignup
                                    ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                                    : "0 4px 12px rgba(16, 185, 129, 0.3)"
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = isSignup
                                        ? "0 6px 20px rgba(102, 126, 234, 0.4)"
                                        : "0 6px 20px rgba(16, 185, 129, 0.4)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = isSignup
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
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center">
                    <small className="text-gray-700">
                        {!isSignup ? "אין לך חשבון? " : "כבר יש לך חשבון? "}
                        <button
                            className="font-bold text-purple-600 transition hover:text-purple-800 bg-transparent border-none p-0 cursor-pointer"
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setEmail("");
                                setPassword("");
                            }}
                        >
                            {isSignup ? "היכנס כאן" : "הירשם כאן"}
                        </button>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;