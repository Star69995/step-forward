import React, { useState } from "react";
import { auth, provider } from "../services/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Footprints, Lock, LogIn, Mail, AtSign } from "lucide-react";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import SegmentedToggle from "../components/ui/SegmentedToggle";
import { fetchUserProfile } from "../services/userProfile";
import { syntheticEmailForUsername } from "../services/anonymousAccount";

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState("email"); // "email" | "username"
    const [identifier, setIdentifier] = useState(""); // email or username, depending on method
    const [password, setPassword] = useState("");

    // Google sign-in auto-creates the Firebase Auth account for a brand-new
    // user too — if there's no users/{uid} profile doc yet, or the profile
    // is missing a username (e.g. it predates this feature), send them to
    // /register to complete it instead of dropping them straight into /form.
    const goToAppOrFinishRegistration = async (user) => {
        const profile = await fetchUserProfile(user.uid);
        navigate(profile && profile.username ? "/form" : "/register");
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

        if (!identifier || !password) {
            toast.error("יש למלא את כל השדות", { position: "bottom-center" });
            return;
        }

        // Username-based login never needs a Firestore lookup — the account's
        // Auth email is deterministically derived from the username at
        // signup (see anonymousAccount.js), so it's simply recomputed here.
        const email = method === "username" ? syntheticEmailForUsername(identifier) : identifier;

        try {
            setLoading(true);
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            toast.success("ההתחברות בוצעה בהצלחה", { position: "bottom-center" });
            await goToAppOrFinishRegistration(user);
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                toast.error(method === "username" ? "שם משתמש זה לא קיים" : "משתמש זה לא קיים", {
                    position: "bottom-center",
                });
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

                    <SegmentedToggle
                        className="mb-6 w-full justify-center"
                        value={method}
                        onChange={(value) => {
                            setMethod(value);
                            setIdentifier("");
                        }}
                        options={[
                            { value: "email", label: "אימייל" },
                            { value: "username", label: "שם משתמש" },
                        ]}
                    />

                    {/* Email/Username & Password Form */}
                    <form onSubmit={handleFormSubmit}>
                        <TextField
                            className="mb-4"
                            icon={method === "email" ? Mail : AtSign}
                            label={method === "email" ? "אימייל" : "שם משתמש"}
                            type={method === "email" ? "email" : "text"}
                            placeholder={method === "email" ? "example@email.com" : "שם משתמש"}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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
                        <Link to="/register" className="font-bold text-secondary transition hover:opacity-75">
                            מעבר להרשמה
                        </Link>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;
