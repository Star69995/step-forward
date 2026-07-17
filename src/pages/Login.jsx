import React, { useState } from "react";
import { auth, provider } from "../services/firebase";
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Footprints, Lock, LogIn, Mail } from "lucide-react";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";

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
            toast.success("ההתחברות בוצעה בהצלחה", { position: "bottom-center" });
            navigate("/form");
        } catch (error) {
            toast.error("שגיאה בהתחברות עם Google: " + error.message, { position: "bottom-center" });
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("יש למלא את כל השדות", { position: "bottom-center" });
            return;
        }

        try {
            setLoading(true);

            if (isSignup) {
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success("ההרשמה בוצעה בהצלחה, ברוכים הבאים", { position: "bottom-center" });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("ההתחברות בוצעה בהצלחה", { position: "bottom-center" });
            }

            navigate("/form");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("המייל כבר רשום במערכת", { position: "bottom-center" });
            } else if (error.code === "auth/weak-password") {
                toast.error("הסיסמה חלשה מדי, נדרשים לפחות 6 תווים", { position: "bottom-center" });
            } else if (error.code === "auth/user-not-found") {
                toast.error("משתמש זה לא קיים", { position: "bottom-center" });
            } else if (error.code === "auth/wrong-password") {
                toast.error("הסיסמה שגויה", { position: "bottom-center" });
            } else {
                toast.error("שגיאה: " + error.message, { position: "bottom-center" });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4" dir="rtl">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="text-white py-8 px-6 text-center bg-gradient-to-br from-primary to-secondary">
                    <h1 className="flex items-center justify-center gap-2 text-4xl font-bold mb-2">
                        <Footprints size={32} aria-hidden="true" />
                        צעד קדימה
                    </h1>
                    <p className="opacity-90 text-lg">{isSignup ? "יצירת חשבון חדש" : "כניסה למערכת"}</p>
                </div>

                {/* Body */}
                <div className="p-8">
                    <Button variant="outline" icon={LogIn} loading={loading} loadingText="טוען..." fullWidth rounded="rounded-xl" onClick={handleGoogleLogin} className="mb-4">
                        התחברות עם Google
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-gray-500 text-sm">או</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    {/* Email & Password Form */}
                    <form onSubmit={handleFormSubmit}>
                        <TextField
                            className="mb-4"
                            icon={Mail}
                            label="אימייל"
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />

                        <TextField
                            className="mb-6"
                            icon={Lock}
                            label="סיסמה"
                            type="password"
                            placeholder={isSignup ? "לפחות 6 תווים" : "יש להזין סיסמה"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            hint={isSignup ? "הסיסמה חייבת להכיל לפחות 6 תווים" : undefined}
                        />

                        <Button
                            type="submit"
                            variant={isSignup ? "primary" : "success"}
                            fullWidth
                            rounded="rounded-lg"
                            loading={loading}
                        >
                            {isSignup ? "הרשמה" : "כניסה"}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center">
                    <small className="text-gray-700">
                        {!isSignup ? "אין עדיין חשבון? " : "יש כבר חשבון? "}
                        <button
                            className="font-bold text-secondary transition hover:text-purple-800 bg-transparent border-none p-0 cursor-pointer"
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setEmail("");
                                setPassword("");
                            }}
                        >
                            {isSignup ? "מעבר לכניסה" : "מעבר להרשמה"}
                        </button>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;
