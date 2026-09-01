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
import { Footprints, Lock, LogIn, Mail, User, Check, AtSign, AlertTriangle, X } from "lucide-react";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import Spinner from "../components/ui/Spinner";
import SegmentedToggle from "../components/ui/SegmentedToggle";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/useAuth";
import { createUserProfile, fetchUserProfile, updateUserProfile } from "../services/userProfile";
import { claimUsername } from "../services/usernameIndex";
import { resolveUsernameToUser } from "../services/resolveUsernameToUser";
import { USERNAME_REGEX, normalizeUsername, syntheticEmailForUsername } from "../services/anonymousAccount";
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

const validateUsernameFormat = (value) => {
    const normalized = normalizeUsername(value);
    if (!normalized) return "יש לבחור שם משתמש";
    if (!USERNAME_REGEX.test(normalized)) {
        return "שם משתמש יכול להכיל רק אותיות אנגליות קטנות, ספרות וקו תחתון, באורך 3-20 תווים";
    }
    return null;
};

const ANONYMOUS_WARNING =
    "לא ניתן לשחזר חשבון זה בשום צורה — אין מייל, ואי אפשר לאפס סיסמה שנשכחה. אם הסיסמה תישכח, כל התוכן בחשבון יאבד לצמיתות.";

const Register = () => {
    const navigate = useNavigate();
    const { currentUser, refreshProfile } = useAuth();
    const [role, setRole] = useState("recipient");
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [usernameStatus, setUsernameStatus] = useState("idle"); // idle | checking | available | taken | invalid
    const [method, setMethod] = useState("email"); // "email" | "anonymous" — only relevant before signup
    const [confirmAnonymousOpen, setConfirmAnonymousOpen] = useState(false);

    // A Google sign-in (here or on the Login page) auto-creates the Firebase
    // Auth account even for a brand-new user, bypassing this page's normal
    // signup form. Landing here already signed-in with no users/{uid} doc
    // yet means: just ask for the name (prefilled from the Google account),
    // role, and username instead of showing the full signup form again.
    // The same completion screen also covers two other cases: (a) a
    // real-email signup whose account was created but whose username claim
    // failed (profile never got created — profileMissing stays true, role/
    // name are already known from the initial form so needsRole stays
    // false), and (b) an existing pre-feature account that has a profile
    // and role already, just no username yet (needsRole false, profileMissing
    // false). See usernameIndex.js/claimUsername for why an anonymous
    // account's username claim failure is handled completely differently
    // (delete + restart) instead of funneling through this screen.
    const [checkingExisting, setCheckingExisting] = useState(!!currentUser);
    const [needsRole, setNeedsRole] = useState(false);
    const [needsUsername, setNeedsUsername] = useState(false);
    const [profileMissing, setProfileMissing] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!currentUser) {
                if (!cancelled) setCheckingExisting(false);
                return;
            }
            if (!cancelled) setCheckingExisting(true);
            try {
                const profile = await fetchUserProfile(currentUser.uid);
                if (cancelled) return;
                if (profile && profile.username) {
                    navigate("/form", { replace: true });
                } else if (profile) {
                    // Pre-existing account (created before usernames existed) —
                    // role/name are already set, only username is missing.
                    setRole(profile.role);
                    setProfileMissing(false);
                    setNeedsRole(false);
                    setNeedsUsername(true);
                    setCheckingExisting(false);
                } else {
                    setName(currentUser.displayName || "");
                    setProfileMissing(true);
                    setNeedsRole(true);
                    setNeedsUsername(true);
                    setCheckingExisting(false);
                }
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error("שגיאה בבדיקת החשבון, יש לנסות שוב", { position: "bottom-center" });
                setCheckingExisting(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [currentUser, navigate]);

    // Live "is this available" check — works signed-out too, since
    // usernameIndex's get is intentionally public (see firestore.rules).
    const usernameFieldVisible = needsUsername || (!currentUser && !checkingExisting);
    useEffect(() => {
        if (!usernameFieldVisible) return;
        const normalized = normalizeUsername(username);
        if (!normalized) {
            setUsernameStatus("idle");
            return;
        }
        if (!USERNAME_REGEX.test(normalized)) {
            setUsernameStatus("invalid");
            return;
        }
        setUsernameStatus("checking");
        let cancelled = false;
        const timeoutId = setTimeout(async () => {
            try {
                const resolved = await resolveUsernameToUser(normalized);
                if (!cancelled) setUsernameStatus(resolved ? "taken" : "available");
            } catch {
                if (!cancelled) setUsernameStatus("idle");
            }
        }, 450);
        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [username, usernameFieldVisible]);

    const usernameHint = {
        checking: <span className="text-muted">בודק זמינות...</span>,
        available: (
            <span className="text-success flex items-center gap-1">
                <Check size={12} aria-hidden="true" />
                השם פנוי
            </span>
        ),
        taken: (
            <span className="text-danger flex items-center gap-1">
                <X size={12} aria-hidden="true" />
                השם כבר תפוס
            </span>
        ),
        invalid: <span className="text-muted">אותיות אנגליות קטנות, ספרות וקו תחתון בלבד, 3-20 תווים</span>,
        idle: <span className="text-muted">אותיות אנגליות קטנות, ספרות וקו תחתון בלבד, 3-20 תווים</span>,
    }[usernameStatus];

    const usernameField = (
        <TextField
            className="mb-4"
            icon={AtSign}
            label="שם משתמש (ייחודי, לשיתוף ולהתחברות)"
            type="text"
            placeholder="שם משתמש"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            hint={usernameHint}
        />
    );

    const handleCompleteProfile = async () => {
        if (needsRole && !name.trim()) {
            toast.error("יש למלא שם", { position: "bottom-center" });
            return;
        }
        const usernameError = needsUsername ? validateUsernameFormat(username) : null;
        if (usernameError) {
            toast.error(usernameError, { position: "bottom-center" });
            return;
        }

        try {
            setLoading(true);
            const normalizedUsername = normalizeUsername(username);
            if (needsUsername) {
                try {
                    await claimUsername(currentUser, role, normalizedUsername);
                } catch {
                    toast.error("שם המשתמש כבר תפוס, יש לבחור שם אחר", { position: "bottom-center" });
                    return;
                }
            }
            if (needsRole && name.trim() !== (currentUser.displayName || "")) {
                await updateProfile(currentUser, { displayName: name.trim() });
            }
            if (profileMissing) {
                await createUserProfile(currentUser, role, {
                    ...(needsUsername ? { username: normalizedUsername } : {}),
                    isAnonymous: false,
                });
            } else if (needsUsername) {
                await updateUserProfile(currentUser.uid, { username: normalizedUsername });
            }
            // Makes the just-written profile visible app-wide immediately —
            // without this, AuthContext's own currentUser-driven fetch may
            // have already run (with no profile / no username yet) before
            // this write happened, leaving it stale until a manual reload.
            await refreshProfile(currentUser);
            toast.success("ההרשמה בוצעה בהצלחה", { position: "bottom-center" });
            navigate("/form");
        } catch (error) {
            toast.error("שגיאה בסיום ההרשמה: " + error.message, { position: "bottom-center" });
        } finally {
            setLoading(false);
        }
    };

    // Signing in here is all this needs to do — the effect above already
    // reacts to `currentUser` changing and decides where to route (straight
    // to /form for an existing account, or reveal the completion form for a
    // brand-new one), so it must not be duplicated here too. Duplicating it
    // meant two concurrent reads of the same freshly-created users/{uid} doc
    // right after sign-in, and this copy had no error handling — the second
    // read losing that race surfaced as an uncaught "Missing or insufficient
    // permissions" toast instead of the other copy's page state just doing
    // its job silently.
    const handleGoogleSignup = async () => {
        try {
            setLoading(true);
            await signInWithPopup(auth, provider);
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
        const usernameError = validateUsernameFormat(username);
        if (usernameError) {
            toast.error(usernameError, { position: "bottom-center" });
            return;
        }

        try {
            setLoading(true);
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(user, { displayName: name });
            await sendEmailVerification(user);
            try {
                await claimUsername(user, role, normalizeUsername(username));
            } catch {
                // The Auth account itself is fine (a real email, independent
                // of the username choice) — no need to delete it. The
                // mount effect above will pick up on the next render (once
                // `currentUser` updates) and show the completion screen to
                // finish with a different username, with role/name already
                // known from this same submission.
                toast.error("שם המשתמש כבר תפוס — יש לבחור שם אחר לסיום ההרשמה", { position: "bottom-center" });
                return;
            }
            await createUserProfile(user, role, { username: normalizeUsername(username), isAnonymous: false });
            // See the identical call in handleCompleteProfile — makes the
            // profile visible app-wide right away instead of waiting on
            // AuthContext's own (possibly already-stale) currentUser effect.
            await refreshProfile(user);
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

    const handleAnonymousFormSubmit = (e) => {
        e.preventDefault();
        const usernameError = validateUsernameFormat(username);
        if (usernameError) {
            toast.error(usernameError, { position: "bottom-center" });
            return;
        }
        if (!password) {
            toast.error("יש למלא את כל השדות", { position: "bottom-center" });
            return;
        }
        setConfirmAnonymousOpen(true);
    };

    const handleAnonymousConfirm = async () => {
        const normalizedUsername = normalizeUsername(username);
        const syntheticEmail = syntheticEmailForUsername(normalizedUsername);
        try {
            setLoading(true);
            const { user } = await createUserWithEmailAndPassword(auth, syntheticEmail, password);
            try {
                await claimUsername(user, role, normalizedUsername);
            } catch {
                // Unlike the real-email path, the username here is baked
                // permanently into this account's Auth email — letting the
                // user pick a *different* username on retry would leave an
                // account no future login could ever reach again (login
                // recomputes the synthetic email from the typed username).
                // So the account is deleted (safe: nothing was written to
                // Firestore yet) and the user restarts from a clean form.
                // This only happens when a real-email user already claimed
                // this exact username first — an anonymous-vs-anonymous
                // collision is already rejected earlier, by Firebase Auth's
                // own email uniqueness on createUserWithEmailAndPassword.
                await user.delete();
                toast.error("שם המשתמש הזה כבר תפוס, יש לבחור שם אחר", { position: "bottom-center" });
                return;
            }
            await createUserProfile(user, role, { username: normalizedUsername, isAnonymous: true });
            // See the identical call in handleCompleteProfile — makes the
            // profile visible app-wide right away instead of waiting on
            // AuthContext's own (possibly already-stale) currentUser effect.
            await refreshProfile(user);
            toast.success("ההרשמה בוצעה בהצלחה", { position: "bottom-center" });
            navigate("/form");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("שם המשתמש הזה כבר תפוס, יש לבחור שם אחר", { position: "bottom-center" });
            } else if (error.code === "auth/weak-password") {
                toast.error("הסיסמה חלשה מדי, נדרשים לפחות 6 תווים", { position: "bottom-center" });
            } else {
                toast.error("שגיאה: " + error.message, { position: "bottom-center" });
            }
        } finally {
            setLoading(false);
            setConfirmAnonymousOpen(false);
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

    const needsCompletion = needsRole || needsUsername;

    return (
        <div className="flex justify-center items-center min-h-screen p-4" dir="rtl">
            <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="text-white py-8 px-6 text-center bg-linear-to-br from-headerFrom to-headerTo">
                    <h1 className="flex items-center justify-center gap-2 text-4xl font-bold mb-2">
                        <Footprints size={32} aria-hidden="true" />
                        צעד קדימה
                    </h1>
                    <p className="opacity-90 text-lg">{needsCompletion ? "השלמת ההרשמה" : "יצירת חשבון חדש"}</p>
                </div>

                {/* Body */}
                <div className="p-[var(--space-hero-pad)]">
                    {checkingExisting ? (
                        <div className="flex justify-center py-6">
                            <Spinner size={32} className="text-primary" />
                        </div>
                    ) : needsCompletion ? (
                        <>
                            <p className="text-body mb-4 text-sm">
                                {needsRole
                                    ? "ההתחברות בוצעה בהצלחה — נותר לאשר את השם, לבחור את סוג המשתמש ולבחור שם משתמש כדי לסיים את ההרשמה."
                                    : "נדרש לבחור שם משתמש ייחודי כדי להמשיך להשתמש בחשבון (משמש גם לשיתוף וגם להתחברות)."}
                            </p>
                            {needsRole && (
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
                            )}
                            {needsUsername && usernameField}
                            {needsRole && roleSelector}
                            <Button
                                variant="primary"
                                fullWidth
                                rounded="rounded-lg"
                                loading={loading}
                                onClick={handleCompleteProfile}
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

                            <SegmentedToggle
                                className="mb-6 w-full justify-center"
                                value={method}
                                onChange={setMethod}
                                options={[
                                    { value: "email", label: "אימייל" },
                                    { value: "anonymous", label: "שם משתמש בלבד" },
                                ]}
                            />

                            {method === "email" ? (
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

                                    {usernameField}

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
                            ) : (
                                <form onSubmit={handleAnonymousFormSubmit}>
                                    <div className="flex items-start gap-2 p-4 mb-4 rounded-lg border-2 border-danger bg-danger/5">
                                        <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" aria-hidden="true" />
                                        <p className="text-sm text-danger">{ANONYMOUS_WARNING}</p>
                                    </div>

                                    {usernameField}

                                    <TextField
                                        className="mb-6"
                                        icon={Lock}
                                        label="סיסמה"
                                        type="password"
                                        placeholder="לפחות 6 תווים"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        hint="הסיסמה חייבת להכיל לפחות 6 תווים — אין דרך לשחזר אותה אם תישכח"
                                    />

                                    {roleSelector}

                                    <Button type="submit" variant="danger" fullWidth rounded="rounded-lg" loading={loading}>
                                        יצירת חשבון אנונימי
                                    </Button>
                                </form>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!needsCompletion && !checkingExisting && (
                    <div className="bg-surface-muted px-8 py-6 border-t border-border text-center">
                        <small className="text-body">
                            יש כבר חשבון?{" "}
                            <Link to="/login" className="font-bold text-secondary transition hover:opacity-75">
                                מעבר לכניסה
                            </Link>
                        </small>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmAnonymousOpen}
                title="יצירת חשבון אנונימי"
                message={ANONYMOUS_WARNING + " יש ללחוץ על \"יצירת חשבון\" רק לאחר שהאזהרה ברורה."}
                confirmLabel="יצירת חשבון"
                cancelLabel="חזרה"
                loading={loading}
                onConfirm={handleAnonymousConfirm}
                onCancel={() => setConfirmAnonymousOpen(false)}
            />
        </div>
    );
};

export default Register;
