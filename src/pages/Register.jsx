import React, { useEffect, useState } from "react";
import { auth, provider } from "../services/firebase";
import {
    signInWithPopup,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Footprints, Lock, LogIn, Mail, User, Check } from "lucide-react";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/useAuth";
import { createUserProfile, fetchUserProfile } from "../services/userProfile";
import { ROLE_META } from "../services/roles";

const ROLE_DESCRIPTIONS = {
    recipient: "ממלאים תוכנית אישית לקידום מטרות ויכולים לשתף אותה עם נותני שירות",
    provider: "מלווים תוכניות של מקבלי שירות שבחרו לשתף איתם",
};

const ROLES = Object.entries(ROLE_META).map(([value, meta]) => ({
    value,
    label: meta.label,
    icon: meta.icon,
    description: ROLE_DESCRIPTIONS[value],
}));

const Register = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [role, setRole] = useState("recipient");
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // A Google sign-in (here or on the Login page) auto-creates the Firebase
    // Auth account even for a brand-new user, bypassing this page's normal
    // signup form. Landing here already signed-in with no users/{uid} doc
    // yet means: just ask for the name (prefilled from the Google account)
    // and the role, instead of showing the full signup form again.
    const [checkingExisting, setCheckingExisting] = useState(!!currentUser);
    const [needsRoleOnly, setNeedsRoleOnly] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!currentUser) {
                if (!cancelled) setCheckingExisting(false);
                return;
            }
            if (!cancelled) setCheckingExisting(true);
            const profile = await fetchUserProfile(currentUser.uid);
            if (cancelled) return;
            if (profile) {
                navigate("/form", { replace: true });
            } else {
                setName(currentUser.displayName || "");
                setNeedsRoleOnly(true);
                setCheckingExisting(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [currentUser, navigate]);

    const handleCompleteRoleOnly = async () => {
        if (!name.trim()) {
            toast.error("יש למלא שם", { position: "bottom-center" });
            return;
        }
        try {
            setLoading(true);
            if (name.trim() !== (currentUser.displayName || "")) {
                await updateProfile(currentUser, { displayName: name.trim() });
            }
            await createUserProfile(currentUser, role);
            toast.success("ההרשמה בוצעה בהצלחה", { position: "bottom-center" });
            navigate("/form");
        } catch (error) {
            toast.error("שגיאה בסיום ההרשמה: " + error.message, { position: "bottom-center" });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            setLoading(true);
            const { user } = await signInWithPopup(auth, provider);
            const existingProfile = await fetchUserProfile(user.uid);
            if (existingProfile) {
                toast.success("ההתחברות בוצעה בהצלחה", { position: "bottom-center" });
                navigate("/form");
                return;
            }
            setName(user.displayName || "");
            setNeedsRoleOnly(true);
        } catch (error) {
            toast.error("שגיאה בהרשמה עם Google: " + error.message, { position: "bottom-center" });
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast.error("יש למלא את כל השדות", { position: "bottom-center" });
            return;
        }

        try {
            setLoading(true);
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(user, { displayName: name });
            await createUserProfile(user, role);
            await sendEmailVerification(user);
            toast.success("ההרשמה בוצעה בהצלחה, ברוכים הבאים", { position: "bottom-center" });
            toast.info("נשלח מייל לאישור הכתובת — האישור נדרש בהמשך כדי לשתף/להתחבר עם משתמשים אחרים", {
                position: "bottom-center",
                autoClose: 8000,
            });
            navigate("/form");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("המייל כבר רשום במערכת", { position: "bottom-center" });
            } else if (error.code === "auth/weak-password") {
                toast.error("הסיסמה חלשה מדי, נדרשים לפחות 6 תווים", { position: "bottom-center" });
            } else {
                toast.error("שגיאה: " + error.message, { position: "bottom-center" });
            }
        } finally {
            setLoading(false);
        }
    };

    const roleSelector = (
        <div className="mb-6">
            <span className="block text-sm font-semibold text-heading mb-2">סוג המשתמש</span>
            <div className="grid grid-cols-1 gap-3">
                {ROLES.map(({ value, label, description, icon: Icon }) => {
                    const selected = role === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setRole(value)}
                            aria-pressed={selected}
                            className={`flex items-start gap-3 text-right p-4 rounded-xl border-2 transition ${
                                selected ? "border-primary bg-primary/5" : "border-border hover:border-border"
                            }`}
                        >
                            <Icon size={22} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
                            <span className="flex-1">
                                <span className="flex items-center gap-2 font-bold text-heading">
                                    {label}
                                    {selected && <Check size={16} className="text-primary" aria-hidden="true" />}
                                </span>
                                <span className="block text-sm text-body mt-0.5">{description}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="flex justify-center items-center min-h-screen p-4" dir="rtl">
            <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="text-white py-8 px-6 text-center bg-linear-to-br from-headerFrom to-headerTo">
                    <h1 className="flex items-center justify-center gap-2 text-4xl font-bold mb-2">
                        <Footprints size={32} aria-hidden="true" />
                        צעד קדימה
                    </h1>
                    <p className="opacity-90 text-lg">
                        {needsRoleOnly ? "השלמת ההרשמה" : "יצירת חשבון חדש"}
                    </p>
                </div>

                {/* Body */}
                <div className="p-[var(--space-hero-pad)]">
                    {checkingExisting ? (
                        <div className="flex justify-center py-6">
                            <Spinner size={32} className="text-primary" />
                        </div>
                    ) : needsRoleOnly ? (
                        <>
                            <p className="text-body mb-4 text-sm">
                                ההתחברות בוצעה בהצלחה — נותר לאשר את השם ולבחור את סוג המשתמש כדי לסיים את ההרשמה.
                            </p>
                            <TextField
                                className="mb-4"
                                icon={User}
                                label="שם מלא"
                                type="text"
                                placeholder="השם המלא"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                            {roleSelector}
                            <Button
                                variant="primary"
                                fullWidth
                                rounded="rounded-lg"
                                loading={loading}
                                onClick={handleCompleteRoleOnly}
                            >
                                סיום הרשמה
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                icon={LogIn}
                                loading={loading}
                                loadingText="טוען..."
                                fullWidth
                                rounded="rounded-xl"
                                onClick={handleGoogleSignup}
                                className="mb-4"
                            >
                                הרשמה עם Google
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
                                    icon={User}
                                    label="שם מלא"
                                    type="text"
                                    placeholder="השם המלא"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                />

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
                                    placeholder="לפחות 6 תווים"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    hint="הסיסמה חייבת להכיל לפחות 6 תווים"
                                />

                                {roleSelector}

                                <Button type="submit" variant="primary" fullWidth rounded="rounded-lg" loading={loading}>
                                    הרשמה
                                </Button>
                            </form>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!needsRoleOnly && !checkingExisting && (
                    <div className="bg-surface-muted px-8 py-6 border-t border-border text-center">
                        <small className="text-body">
                            יש כבר חשבון?{" "}
                            <Link to="/login" className="font-bold text-secondary transition hover:text-purple-800">
                                מעבר לכניסה
                            </Link>
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
