import React, { useEffect, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
import { db } from "../services/firebase";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usePlans, formatPlanLabel } from "../services/usePlans";
import { softDeleteDoc, restoreDoc } from "../services/trash";
import {
    User,
    LogOut,
    ClipboardList,
    Plus,
    Inbox,
    Clock,
    Eye,
    Trash2,
    FileDown,
    HeartHandshake,
    MailCheck,
    MailWarning,
    Maximize2,
    Minimize2,
} from "lucide-react";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import TrashSection from "../components/ui/TrashSection";
import RoleBadge from "../components/RoleBadge";
import Badge from "../components/ui/Badge";
import SegmentedToggle from "../components/ui/SegmentedToggle";

const Profile = () => {
    const { currentUser, role, logout, density, setDensity } = useAuth();
    const { plans, trashedPlans, loading, setPlans, setTrashedPlans } = usePlans(currentUser?.uid);
    const [deleting, setDeleting] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [emailVerified, setEmailVerified] = useState(currentUser?.emailVerified ?? false);
    const [sendingVerification, setSendingVerification] = useState(false);
    const navigate = useNavigate();

    // currentUser.emailVerified can be stale if verification happened in a
    // different tab/session — reload() refreshes the underlying Firebase
    // user in place, so the local state is re-read from it afterwards.
    useEffect(() => {
        if (!currentUser) return;
        currentUser.reload().then(() => setEmailVerified(currentUser.emailVerified));
    }, [currentUser]);

    const handleResendVerification = async () => {
        setSendingVerification(true);
        try {
            await sendEmailVerification(currentUser);
            toast.success("נשלח מייל אימות חדש לכתובת שלך");
        } catch (error) {
            if (error.code === "auth/too-many-requests") {
                toast.error("נשלחו יותר מדי בקשות, יש להמתין מעט לפני ניסיון נוסף");
            } else {
                toast.error("שגיאה בשליחת מייל האימות: " + error.message);
            }
        } finally {
            setSendingVerification(false);
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;
        const { id } = pendingDelete;

        setDeleting(id);
        try {
            await softDeleteDoc(doc(db, `users/${currentUser.uid}/plans/${id}`));
            setPlans((prev) => prev.filter((p) => p.id !== id));
            setTrashedPlans((prev) => [...prev, { ...pendingDelete, deletedAt: { toDate: () => new Date() } }]);
            toast.success("התוכנית הועברה לפח המחזור");
        } catch (error) {
            console.error("Error deleting plan:", error);
            toast.error("שגיאה במחיקת התוכנית");
        } finally {
            setDeleting(null);
            setPendingDelete(null);
        }
    };

    const handleRestorePlan = async (plan) => {
        await restoreDoc(doc(db, `users/${currentUser.uid}/plans/${plan.id}`));
        setTrashedPlans((prev) => prev.filter((p) => p.id !== plan.id));
        setPlans((prev) => [...prev, { ...plan, deletedAt: null }]);
        toast.success("התוכנית שוחזרה בהצלחה");
    };

    const handleDeletePlanForever = async (plan) => {
        await deleteDoc(doc(db, `users/${currentUser.uid}/plans/${plan.id}`));
        setTrashedPlans((prev) => prev.filter((p) => p.id !== plan.id));
        toast.success("התוכנית נמחקה לצמיתות");
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

    // Reuses the same PDFButton export logic as the plan page itself — it
    // needs the plan's content actually rendered in the DOM to export, so
    // this opens the plan and triggers the export automatically there
    // instead of duplicating the PDF logic on the list page.
    const exportPlan = (plan) => {
        navigate(`/form?planId=${plan.id}`, { state: { planData: plan, autoExport: true } });
    };

    return (
        <div dir="rtl" className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg mb-8 p-[var(--space-hero-pad)]">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                            <h2 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-1">
                                <User size={26} aria-hidden="true" />
                                שלום, {currentUser?.displayName || currentUser?.email}
                                <RoleBadge role={role} />
                            </h2>
                            <small className="text-gray-500">{currentUser?.email}</small>
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                {emailVerified ? (
                                    <Badge variant="success" icon={MailCheck}>
                                        מייל מאושר
                                    </Badge>
                                ) : (
                                    <>
                                        <Badge variant="warning" icon={MailWarning}>
                                            מייל לא מאושר
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            rounded="rounded-lg"
                                            loading={sendingVerification}
                                            loadingText="שולח..."
                                            onClick={handleResendVerification}
                                        >
                                            שליחת מייל אימות מחדש
                                        </Button>
                                    </>
                                )}
                            </div>
                            <div className="mt-4 flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-semibold text-gray-700">צפיפות תצוגה</span>
                                <SegmentedToggle
                                    value={density}
                                    onChange={setDensity}
                                    options={[
                                        { value: "spacious", label: "מרווח", icon: Maximize2 },
                                        { value: "compact", label: "קומפקטי", icon: Minimize2 },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {role === "recipient" && (
                                <Button
                                    variant="outline"
                                    icon={HeartHandshake}
                                    rounded="rounded-lg"
                                    onClick={() => navigate("/providers")}
                                >
                                    ניהול גישה לנותני השירות שלי
                                </Button>
                            )}
                            <Button variant="danger" icon={LogOut} rounded="rounded-lg" onClick={logout}>
                                התנתקות
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Plans Section */}
                <div>
                    <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
                        <h3 className="flex items-center gap-2 text-2xl font-bold text-primary">
                            <ClipboardList size={24} className="text-primary" aria-hidden="true" />
                            התוכניות השמורות
                        </h3>
                        <Button variant="success" icon={Plus} rounded="rounded-lg" onClick={handleNewPlan}>
                            תוכנית חדשה
                        </Button>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-2xl shadow-xs p-12 text-center text-gray-600">
                            טוען את התוכניות...
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-xs p-12 text-center">
                            <Inbox size={40} className="mx-auto text-gray-400 mb-3" aria-hidden="true" />
                            <h4 className="text-2xl text-gray-400 mb-3">אין עדיין תוכניות</h4>
                            <p className="text-gray-500 mb-6">ניתן להתחיל ליצור את התוכנית הראשונה לקידום המטרות</p>
                            <Button variant="success" icon={Plus} onClick={handleNewPlan} className="mx-auto">
                                יצירת תוכנית עכשיו
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-section-gap)]">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="bg-white rounded-2xl shadow-xs overflow-hidden transition hover:-translate-y-1 hover:shadow-lg border-l-4 border-primary"
                                >
                                    {/* Card Header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h5 className="flex items-center gap-1.5 font-bold text-gray-800 wrap-break-word">
                                            <Clock size={14} aria-hidden="true" />
                                            {formatPlanLabel(plan)}
                                        </h5>
                                    </div>

                                    {/* Card Body */}
                                    <div className="px-6 py-4">
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <Button
                                                variant="blue"
                                                size="sm"
                                                rounded="rounded-lg"
                                                icon={Eye}
                                                onClick={() => openPlan(plan)}
                                            >
                                                הצגה
                                            </Button>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                rounded="rounded-lg"
                                                icon={FileDown}
                                                onClick={() => exportPlan(plan)}
                                            >
                                                ייצוא ל-PDF
                                            </Button>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            rounded="rounded-lg"
                                            icon={Trash2}
                                            fullWidth
                                            loading={deleting === plan.id}
                                            loadingText="מוחק..."
                                            onClick={() => setPendingDelete(plan)}
                                        >
                                            מחיקה
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <TrashSection
                        items={trashedPlans}
                        renderLabel={(plan) => formatPlanLabel(plan)}
                        onRestore={handleRestorePlan}
                        onDeleteForever={handleDeletePlanForever}
                        className="mt-6"
                    />
                </div>
            </div>

            <ConfirmDialog
                open={!!pendingDelete}
                title="מחיקת תוכנית"
                message={`האם להעביר את התוכנית מתאריך ${formatPlanLabel(pendingDelete)} לפח המחזור? ניתן יהיה לשחזר אותה או למחוק אותה לצמיתות במשך 30 יום.`}
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
