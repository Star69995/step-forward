import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { savePlan } from "../services/savePlan";
import { toast } from "react-toastify";

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const navigate = useNavigate();

    // Fetch all user's saved plans
    useEffect(() => {
        const fetchPlans = async () => {
            if (currentUser) {
                try {
                    const plansRef = collection(db, `users/${currentUser.uid}/plans`);
                    const snap = await getDocs(plansRef);
                    const plansData = snap.docs.map((d) => ({
                        id: d.id,
                        ...d.data()
                    }));
                    // Sort by updatedAt (newest first)
                    plansData.sort((a, b) =>
                        (b.updatedAt?.toDate() || new Date(0)) - (a.updatedAt?.toDate() || new Date(0))
                    );
                    setPlans(plansData);
                } catch (error) {
                    console.error("Error fetching plans:", error);
                    toast.error("❌ שגיאה בטעינת התוכניות");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPlans();
    }, [currentUser]);

    // Handle deleting a plan
    const handleDelete = async (id, planName) => {
        const confirm = window.confirm(`האם אתה בטוח שברצונך למחוק את התוכנית "${planName}"?`);
        if (!confirm) return;

        setDeleting(id);
        try {
            await deleteDoc(doc(db, `users/${currentUser.uid}/plans/${id}`));
            setPlans(plans.filter((p) => p.id !== id));
            toast.success("✅ התוכנית נמחקה בהצלחה");
        } catch (error) {
            console.error("Error deleting plan:", error);
            toast.error("❌ שגיאה במחיקת התוכנית");
        } finally {
            setDeleting(null);
        }
    };

    // ✅ Create new plan
    const handleNewPlan = async () => {
        if (!currentUser) {
            toast.error("❌ עליך להיות מחובר כדי ליצור תוכנית");
            return;
        }
        const newId = uuidv4();
        await savePlan(currentUser.uid, {}, newId);
        toast.success("✅ תוכנית חדשה נוצרה");
        navigate(`/form?planId=${newId}`);
    };

    return (
        <div
            dir="rtl"
            className="min-h-screen py-8"
            style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}
        >
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Section */}
                <div
                    className="bg-white rounded-3xl shadow-lg mb-8 p-8"
                    style={{
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
                        backdropFilter: "blur(10px)"
                    }}
                >
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-1">
                                👤 שלום, {currentUser?.displayName || currentUser?.email}
                            </h2>
                            <small className="text-gray-500">
                                {currentUser?.email}
                            </small>
                        </div>
                        <button
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap"
                            onClick={logout}
                            onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 20px rgba(220, 53, 69, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
                            }}
                            style={{
                                boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)"
                            }}
                        >
                            <span className="text-lg">🚪</span>
                            <span>התנתק</span>
                        </button>
                    </div>
                </div>

                {/* Plans Section */}
                <div>
                    {/* Section Header with New Plan Button */}
                    <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
                        <h3 className="text-2xl font-bold text-white">
                            📋 התוכניות השמורות שלי
                        </h3>
                        <button
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap"
                            onClick={handleNewPlan}
                            onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                            }}
                            style={{
                                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                            }}
                        >
                            <span className="text-xl">➕</span>
                            <span>תוכנית חדשה</span>
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <div className="inline-block animate-spin text-4xl mb-4">
                                ⏳
                            </div>
                            <p className="text-gray-600">טוען את התוכניות שלך...</p>
                        </div>
                    ) : plans.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <h4 className="text-2xl text-gray-400 mb-3">📭 אין עדיין תוכניות</h4>
                            <p className="text-gray-500 mb-6">
                                התחל ליצור את התוכנית הראשונה שלך לקידום המטרות שלך
                            </p>
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold transition mx-auto flex items-center gap-2"
                                onClick={handleNewPlan}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                }}
                            >
                                <span>✨</span>
                                <span>צור תוכנית עכשיו</span>
                            </button>
                        </div>
                    ) : (
                        /* Plans Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="bg-white rounded-2xl shadow-sm overflow-hidden transition"
                                    style={{
                                        borderLeft: "4px solid #667eea"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
                                    }}
                                >
                                    {/* Card Header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h5 className="font-bold text-gray-800 mb-2 break-words">
                                            📌 {plan.name || "תוכנית ללא שם"}
                                        </h5>
                                        {plan.updatedAt && (
                                            <small className="text-gray-500">
                                                🕐 עודכן: {plan.updatedAt.toDate().toLocaleString("he-IL")}
                                            </small>
                                        )}
                                    </div>

                                    {/* Card Body with Plan Info */}
                                    <div className="px-6 py-4">
                                        <div className="mb-4">
                                            <small className="text-gray-600">
                                                <strong>ID:</strong> {plan.id.substring(0, 8)}...
                                            </small>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-bold text-sm transition"
                                                onClick={() => navigate(`/form?planId=${plan.id}`)}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = "scale(1.05)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = "scale(1)";
                                                }}
                                            >
                                                ✏️ עריכה
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-bold text-sm transition disabled:opacity-70"
                                                onClick={() => handleDelete(plan.id, plan.name || "התוכנית")}
                                                disabled={deleting === plan.id}
                                                onMouseEnter={(e) => {
                                                    if (deleting !== plan.id) {
                                                        e.target.style.transform = "scale(1.05)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (deleting !== plan.id) {
                                                        e.target.style.transform = "scale(1)";
                                                    }
                                                }}
                                            >
                                                {deleting === plan.id ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <span className="inline-block animate-spin">⏳</span>
                                                        <span>מוחק...</span>
                                                    </div>
                                                ) : (
                                                    "🗑️ מחיקה"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;