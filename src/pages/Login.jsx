import React, { useState } from "react";
import { auth, provider } from "../services/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Footprints, Lock, LogIn, Mail } from "lucide-react";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import { fetchUserProfile } from "../services/userProfile";

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Google sign-in auto-creates the Firebase Auth account for a brand-new
    // user too — if there's no users/{uid} profile doc yet, send them to
    // /register to pick a role instead of dropping them straight into /form.
    const goToAppOrFinishRegistration = async (user) => {
        const profile = await fetchUserProfile(user.uid);
        navigate(profile ? "/form" : "/register");
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { user } = await signInWithPopup(auth, provider);
            toast.success("ההתחברות בוצעה בהצלחה", { position: "bottom-center" });
            await goToAppOrFinishRegistration(user);
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
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("ההתחברות בוצעה בהצלחה", { position: "bottom-center" });
            navigate("/form");
        } catch (error) {
            if (error.code === "auth/user-not-found") {
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
            <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="text-white py-8 px-6 text-center bg-linear-to-br from-headerFrom to-headerTo">
                    <h1 className="flex items-center justify-center gap-2 text-4xl font-bold mb-2">
                        <Footprints size={32} aria-hidden="true" />
                        צעד קדימה
                    </h1>
                    <p className="opacity-90 text-lg">כניסה למערכת</p>
                </div>

                {/* Body */}
                <div className="p-[var(--space-hero-pad)]">
                    <Button variant="outline" icon={LogIn} loading={loading} loadingText="טוען..." fullWidth rounded="rounded-xl" onClick={handleGoogleLogin} className="mb-4">
                        התחברות עם Google
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-muted text-sm">או</span>
                        <div className="flex-1 h-px bg-border"></div>
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
                            placeholder="יש להזין סיסמה"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />

                        <Button type="submit" variant="success" fullWidth rounded="rounded-lg" loading={loading}>
                            כניסה
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-surface-muted px-8 py-6 border-t border-border text-center">
                    <small className="text-body">
                        אין עדיין חשבון?{" "}
                        <Link to="/register" className="font-bold text-secondary transition hover:text-purple-800">
                            מעבר להרשמה
                        </Link>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;
