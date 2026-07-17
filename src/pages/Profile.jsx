import React, { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usePlans } from "../services/usePlans";
import {
    User,
    LogOut,
    ClipboardList,
    Plus,
    Inbox,
    Pin,
    Clock,
    Pencil,
    Trash2,
} from "lucide-react";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const { plans, loading, setPlans } = usePlans(currentUser?.uid);
    const [deleting, setDeleting] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (!pendingDelete) return;
        const { id } = pendingDelete;

        setDeleting(id);
        try {
            await deleteDoc(doc(db, `users/${currentUser.uid}/plans/${id}`));
            setPlans((prev) => prev.filter((p) => p.id !== id));
            toast.success("התוכנית נמחקה בהצלחה");
        } catch (error) {
            console.error("Error deleting plan:", error);
            toast.error("שגיאה במחיקת התוכנית");
        } finally {
            setDeleting(null);
            setPendingDelete(null);
        }
    };

    // New plans are created lazily: no Firestore write happens until the
    // user actually edits a field, so opening the form for nothing doesn't
    // cost a write.
    const handleNewPlan = () => {
        navigate("/form?planId=new");
    };

    // Plan data was already fetched for the list above — hand it to the
    // form via navigation state so it doesn't issue a second read for data
    // we already have in memory.
    const openPlan = (plan) => {
        navigate(`/form?planId=${plan.id}`, { state: { planData: plan } });
    };

    return (
        <div dir="rtl" className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Section */}
                <div className="bg-white/95 backdrop-blur rounded-3xl shadow-lg mb-8 p-8">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                            <h2 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-1">
                                <User size={26} aria-hidden="true" />
                                שלום, {currentUser?.displayName || currentUser?.email}
                            </h2>
                            <small className="text-gray-500">{currentUser?.email}</small>
                        </div>
                        <Button variant="danger" icon={LogOut} rounded="rounded-lg" onClick={logout}>
                            התנתקות
                        </Button>
                    </div>
                </div>

                {/* Plans Section */}
                <div>
                    <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
                        <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
                            <ClipboardList size={24} aria-hidden="true" />
                            התוכניות השמורות
                        </h3>
                        <Button variant="success" icon={Plus} rounded="rounded-lg" onClick={handleNewPlan}>
                            תוכנית חדשה
                        </Button>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-600">
                            טוען את התוכניות...
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <Inbox size={40} className="mx-auto text-gray-400 mb-3" aria-hidden="true" />
                            <h4 className="text-2xl text-gray-400 mb-3">אין עדיין תוכניות</h4>
                            <p className="text-gray-500 mb-6">ניתן להתחיל ליצור את התוכנית הראשונה לקידום המטרות</p>
                            <Button variant="success" icon={Plus} onClick={handleNewPlan} className="mx-auto">
                                יצירת תוכנית עכשיו
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="bg-white rounded-2xl shadow-sm overflow-hidden transition hover:-translate-y-1 hover:shadow-lg border-l-4 border-primary"
                                >
                                    {/* Card Header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h5 className="flex items-center gap-1.5 font-bold text-gray-800 mb-2 break-words">
                                            <Pin size={14} aria-hidden="true" />
                                            {plan.name || "תוכנית ללא שם"}
                                        </h5>
                                        {plan.createdAt && (
                                            <small className="flex items-center gap-1 text-gray-500">
                                                <Clock size={12} aria-hidden="true" />
                                                נוצר: {plan.createdAt.toDate().toLocaleString("he-IL")}
                                            </small>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="px-6 py-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="blue"
                                                size="sm"
                                                rounded="rounded-lg"
                                                icon={Pencil}
                                                onClick={() => openPlan(plan)}
                                            >
                                                עריכה
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                rounded="rounded-lg"
                                                icon={Trash2}
                                                loading={deleting === plan.id}
                                                loadingText="מוחק..."
                                                onClick={() => setPendingDelete(plan)}
                                            >
                                                מחיקה
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={!!pendingDelete}
                title="מחיקת תוכנית"
                message={`האם למחוק את התוכנית "${pendingDelete?.name || "התוכנית"}"? פעולה זו אינה הפיכה.`}
                confirmLabel="מחיקה"
                cancelLabel="ביטול"
                loading={!!deleting}
                onConfirm={handleDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    );
};

export default Profile;
