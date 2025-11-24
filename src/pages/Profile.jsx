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
            style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                minHeight: "100vh",
                paddingTop: "2rem",
                paddingBottom: "2rem"
            }}
        >
            <div className="container" style={{ maxWidth: "900px" }}>
                {/* Header Section */}
                <div
                    className="card border-0 shadow-lg mb-4"
                    style={{
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
                        backdropFilter: "blur(10px)"
                    }}
                >
                    <div style={{ padding: "2rem" }}>
                        <div
                            className="d-flex justify-content-between align-items-center mb-3"
                            style={{ flexWrap: "wrap", gap: "1rem" }}
                        >
                            <div>
                                <h2 className="fw-bold mb-1" style={{ color: "#333", fontSize: "1.8rem" }}>
                                    👤 שלום, {currentUser?.displayName || currentUser?.email}
                                </h2>
                                <small style={{ color: "#999" }}>
                                    {currentUser?.email}
                                </small>
                            </div>
                            <button
                                className="btn fw-bold"
                                onClick={logout}
                                style={{
                                    background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    padding: "0.75rem 1.5rem",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 6px 20px rgba(220, 53, 69, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
                                }}
                            >
                                🚪 התנתק
                            </button>
                        </div>
                    </div>
                </div>

                {/* Plans Section */}
                <div>
                    {/* Section Header with New Plan Button */}
                    <div
                        className="d-flex justify-content-between align-items-center mb-4"
                        style={{ flexWrap: "wrap", gap: "1rem" }}
                    >
                        <h3 className="fw-bold mb-0" style={{ color: "white", fontSize: "1.5rem" }}>
                            📋 התוכניות השמורות שלי
                        </h3>
                        <button
                            className="btn fw-bold"
                            onClick={handleNewPlan}
                            style={{
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                padding: "0.75rem 1.5rem",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                            }}
                        >
                            <span style={{ fontSize: "1.2rem" }}>➕</span>
                            <span>תוכנית חדשה</span>
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div
                            className="card border-0 shadow-sm"
                            style={{
                                borderRadius: "12px",
                                padding: "3rem",
                                textAlign: "center"
                            }}
                        >
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p style={{ color: "#666" }}>טוען את התוכניות שלך...</p>
                        </div>
                    ) : plans.length === 0 ? (
                        /* Empty State */
                        <div
                            className="card border-0 shadow-sm"
                            style={{
                                borderRadius: "12px",
                                padding: "3rem",
                                textAlign: "center",
                                backgroundColor: "white"
                            }}
                        >
                            <h4 style={{ color: "#999", marginBottom: "1rem" }}>📭 אין עדיין תוכניות</h4>
                            <p style={{ color: "#bbb", marginBottom: "1.5rem" }}>
                                התחל ליצור את התוכנית הראשונה שלך לקידום המטרות שלך
                            </p>
                            <button
                                className="btn fw-bold mx-auto"
                                onClick={handleNewPlan}
                                style={{
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    padding: "0.75rem 1.5rem"
                                }}
                            >
                                ✨ צור תוכנית עכשיו
                            </button>
                        </div>
                    ) : (
                        /* Plans Grid */
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                gap: "1.5rem"
                            }}
                        >
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="card border-0 shadow-sm"
                                    style={{
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        backgroundColor: "white",
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
                                    <div
                                        style={{
                                            padding: "1.5rem",
                                            backgroundColor: "#f9f9f9",
                                            borderBottom: "1px solid #e0e0e0"
                                        }}
                                    >
                                        <h5
                                            className="fw-bold mb-2"
                                            style={{
                                                color: "#333",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            📌 {plan.name || "תוכנית ללא שם"}
                                        </h5>
                                        {plan.updatedAt && (
                                            <small style={{ color: "#999" }}>
                                                🕐 עודכן: {plan.updatedAt.toDate().toLocaleString("he-IL")}
                                            </small>
                                        )}
                                    </div>

                                    {/* Card Body with Plan Info */}
                                    <div style={{ padding: "1.5rem" }}>
                                        <div style={{ marginBottom: "1rem" }}>
                                            <small style={{ color: "#666" }}>
                                                <strong>ID:</strong> {plan.id.substring(0, 8)}...
                                            </small>
                                        </div>

                                        {/* Action Buttons */}
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: "0.75rem"
                                            }}
                                        >
                                            <button
                                                className="btn btn-sm fw-bold"
                                                onClick={() => navigate(`/form?planId=${plan.id}`)}
                                                style={{
                                                    background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    padding: "0.6rem",
                                                    transition: "all 0.3s ease",
                                                    fontSize: "0.9rem"
                                                }}
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
                                                className="btn btn-sm fw-bold"
                                                onClick={() => handleDelete(plan.id, plan.name || "התוכנית")}
                                                disabled={deleting === plan.id}
                                                style={{
                                                    background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    padding: "0.6rem",
                                                    transition: "all 0.3s ease",
                                                    fontSize: "0.9rem",
                                                    opacity: deleting === plan.id ? 0.7 : 1,
                                                    cursor: deleting === plan.id ? "not-allowed" : "pointer"
                                                }}
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
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            style={{ width: "0.85rem", height: "0.85rem" }}
                                                        ></span>
                                                        מוחק...
                                                    </>
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