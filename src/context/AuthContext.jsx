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
    // this context instead of hitting Firestore again.
    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!currentUser) {
                if (!cancelled) setUserProfile(null);
                return;
            }
            const profile = await fetchUserProfile(currentUser.uid);
            if (cancelled) return;
            setUserProfile(profile);
            if (profile) ensureEmailIndex(currentUser, profile.role, profile.displayName);
        })();

        return () => {
            cancelled = true;
        };
    }, [currentUser]);

    const logout = async () => await signOut(auth);

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

    return (
        <AuthContext.Provider value={{ currentUser, userProfile, role: userProfile?.role, density, setDensity, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};