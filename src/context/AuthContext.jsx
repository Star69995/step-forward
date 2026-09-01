import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../services/firebase";
import { AuthContext } from "./AuthContextValue";
import { ensureEmailIndex, fetchUserProfile, updateUserProfile } from "../services/userProfile";

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Loaded once per signed-in uid and cached here, not refetched on every
    // page — role rarely changes and every other screen just reads it off
    // this context instead of hitting Firestore again. Takes an explicit
    // `user` rather than always closing over this render's `currentUser` —
    // a caller that just created/signed in a user locally (Register.jsx)
    // may run before onAuthStateChanged has propagated that user into this
    // context's own state, so it passes the user it already has directly
    // instead of racing this context's stale closure.
    const loadProfile = async (user) => {
        if (!user) {
            setUserProfile(null);
            return;
        }
        try {
            const profile = await fetchUserProfile(user.uid);
            setUserProfile(profile);
            if (profile) ensureEmailIndex(user, profile.role, profile.displayName);
        } catch (error) {
            // A sign-out mid-fetch (or a revoked session) rejects this
            // read after the caller stopped caring — nothing to show the
            // user for a profile they're no longer viewing.
            console.error(error);
            setUserProfile(null);
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!currentUser) {
                if (!cancelled) setUserProfile(null);
                return;
            }
            try {
                const profile = await fetchUserProfile(currentUser.uid);
                if (cancelled) return;
                setUserProfile(profile);
                if (profile) ensureEmailIndex(currentUser, profile.role, profile.displayName);
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                setUserProfile(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [currentUser]);

    // Exposed for the rare case a screen mutates users/{uid} in a way that
    // must be reflected app-wide right away — either because the currently
    // signed-in user's own profile just changed (Profile.jsx's account-type
    // conversion) or because a brand-new profile was just created and needs
    // to be visible before this context's own currentUser effect would
    // otherwise pick it up (Register.jsx's signup flows). Everything else
    // just relies on the effect above re-running when currentUser changes.
    const refreshProfile = (user) => loadProfile(user || currentUser);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בהתנתקות, יש לנסות שוב");
        }
    };

    // Anything other than the literal "compact" (including logged-out or an
    // existing account with no density field yet) renders as the original
    // spacious look — no migration needed for existing users.
    const density = userProfile?.density === "compact" ? "compact" : "spacious";

    useEffect(() => {
        document.documentElement.setAttribute("data-density", density);
    }, [density]);

    const setDensity = async (value) => {
        if (!currentUser) return;
        const previous = userProfile?.density;
        setUserProfile((prev) => ({ ...(prev || {}), density: value }));
        try {
            await updateUserProfile(currentUser.uid, { density: value });
        } catch (error) {
            console.error(error);
            setUserProfile((prev) => ({ ...(prev || {}), density: previous }));
            toast.error("שגיאה בשמירת העדפת התצוגה");
        }
    };

    // Unlike density, this can't be derived from userProfile alone: it has
    // to render correctly before Firestore (or even auth) resolves, so a
    // logged-out visitor on Login/Landing still gets the right theme. The
    // inline script in index.html already reads the same localStorage key
    // to set data-theme before React's first paint — this just keeps state
    // in sync after hydration and once the profile loads.
    const [themeMode, setThemeModeState] = useState(() => {
        try {
            const stored = localStorage.getItem("themeMode");
            return ["light", "dark", "auto"].includes(stored) ? stored : "auto";
        } catch {
            return "auto";
        }
    });
    const [resolvedTheme, setResolvedTheme] = useState(() =>
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );

    // Firestore is the long-term source of truth once the profile loads.
    useEffect(() => {
        if (userProfile?.themeMode && ["light", "dark", "auto"].includes(userProfile.themeMode)) {
            setThemeModeState(userProfile.themeMode);
        }
    }, [userProfile]);

    useEffect(() => {
        if (themeMode !== "auto") {
            setResolvedTheme(themeMode);
            return;
        }
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const updateFromSystem = () => setResolvedTheme(mediaQuery.matches ? "dark" : "light");
        updateFromSystem();
        mediaQuery.addEventListener("change", updateFromSystem);
        return () => mediaQuery.removeEventListener("change", updateFromSystem);
    }, [themeMode]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", resolvedTheme);
    }, [resolvedTheme]);

    const setThemeMode = async (value) => {
        const previous = themeMode;
        setThemeModeState(value);
        try {
            localStorage.setItem("themeMode", value);
        } catch {
            // best-effort cache only, safe to ignore
        }
        if (!currentUser) return;
        try {
            await updateUserProfile(currentUser.uid, { themeMode: value });
        } catch (error) {
            console.error(error);
            setThemeModeState(previous);
            try {
                localStorage.setItem("themeMode", previous);
            } catch {
                // best-effort cache only, safe to ignore
            }
            toast.error("שגיאה בשמירת מצב התצוגה");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                userProfile,
                refreshProfile,
                role: userProfile?.role,
                density,
                setDensity,
                themeMode,
                resolvedTheme,
                setThemeMode,
                logout,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};