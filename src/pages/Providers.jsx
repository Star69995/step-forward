import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { usePlans, formatPlanLabel } from "../services/usePlans";
import { useShares, addOrUpdateShare, removeShare, restoreShare, deleteShareForever } from "../services/useShares";
import { resolveEmailToUser } from "../services/resolveEmailToUser";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import Badge from "../components/ui/Badge";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import TrashSection from "../components/ui/TrashSection";
import {
    Mail,
    Plus,
    Trash2,
    Pencil,
    Eye,
    ShieldCheck,
    Globe,
    ListChecks,
    Inbox,
    HeartHandshake,
    X,
    Check,
} from "lucide-react";

const emptyForm = { email: "", scope: "all", permission: "view", planIds: [] };

// A single-select pair of "chip" buttons — used for both the scope choice
// (all/selected) and the permission choice (view/edit) so the toggle look
// is defined once instead of twice.
const ToggleOption = ({ selected, icon: Icon, label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition ${
            selected ? "border-primary bg-primary/5 text-primary" : "border-gray-300 text-gray-600 hover:border-gray-400"
        }`}
    >
        <Icon size={16} aria-hidden="true" />
        {label}
    </button>
);

const Providers = () => {
    const { currentUser, role } = useAuth();
    const { shares, trashedShares, loading, refetch } = useShares(currentUser?.uid);
    const { plans } = usePlans(currentUser?.uid);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null); // providerUid being edited, or "new"
    const [pendingRemove, setPendingRemove] = useState(null);
    const [removing, setRemoving] = useState(false);

    const openNewForm = () => {
        setForm(emptyForm);
        setEditingId("new");
    };

    const openEditForm = (share) => {
        setForm({
            email: share.providerEmail,
            scope: share.scope,
            permission: share.permission,
            planIds: share.planIds || [],
        });
        setEditingId(share.id);
    };

    const closeForm = () => setEditingId(null);

    const togglePlan = (planId) => {
        setForm((f) => ({
            ...f,
            planIds: f.planIds.includes(planId) ? f.planIds.filter((id) => id !== planId) : [...f.planIds, planId],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email) {
            toast.error("יש להזין כתובת מייל");
            return;
        }
        if (form.scope === "selected" && form.planIds.length === 0) {
            toast.error("יש לבחור לפחות תוכנית אחת לשיתוף");
            return;
        }

        setSubmitting(true);
        try {
            let providerUid = editingId !== "new" ? editingId : null;

            if (!providerUid) {
                const resolved = await resolveEmailToUser(form.email);
                if (!resolved) {
                    toast.error("לא נמצא משתמש רשום עם כתובת מייל זו, או שהמייל שלו טרם אומת");
                    return;
                }
                if (resolved.role !== "provider") {
                    toast.error("ניתן לשתף רק עם משתמש שנרשם כנותן שירות");
                    return;
                }
                if (resolved.uid === currentUser.uid) {
                    toast.error("לא ניתן לשתף עם עצמך");
                    return;
                }
                providerUid = resolved.uid;
            }

            await addOrUpdateShare(currentUser.uid, providerUid, {
                providerEmail: form.email.trim().toLowerCase(),
                scope: form.scope,
                planIds: form.planIds,
                permission: form.permission,
                recipientEmail: currentUser.email,
                recipientDisplayName: currentUser.displayName,
            });
            toast.success("הפרטים נשמרו בהצלחה");
            closeForm();
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בשמירת השיתוף");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async () => {
        if (!pendingRemove) return;
        setRemoving(true);
        try {
            await removeShare(currentUser.uid, pendingRemove.id);
            toast.success("השיתוף הועבר לפח המחזור");
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בביטול השיתוף");
        } finally {
            setRemoving(false);
            setPendingRemove(null);
        }
    };

    const handleRestoreShare = async (share) => {
        await restoreShare(currentUser.uid, share.id);
        toast.success("השיתוף שוחזר בהצלחה");
        refetch();
    };

    const handleDeleteShareForever = async (share) => {
        await deleteShareForever(currentUser.uid, share.id);
        toast.success("השיתוף נמחק לצמיתות");
        refetch();
    };

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 mb-4 border-2 border-primary/20">
            {editingId === "new" && (
                <TextField
                    className="mb-4"
                    icon={Mail}
                    label="מייל נותן השירות"
                    type="email"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    disabled={submitting}
                />
            )}

            <div className="mb-4">
                <span className="block text-sm font-semibold text-gray-800 mb-2">היקף השיתוף</span>
                <div className="flex gap-2">
                    <ToggleOption
                        selected={form.scope === "all"}
                        icon={Globe}
                        label="כל התוכניות"
                        onClick={() => setForm((f) => ({ ...f, scope: "all" }))}
                    />
                    <ToggleOption
                        selected={form.scope === "selected"}
                        icon={ListChecks}
                        label="תוכניות נבחרות"
                        onClick={() => setForm((f) => ({ ...f, scope: "selected" }))}
                    />
                </div>
            </div>

            {form.scope === "selected" && (
                <div className="mb-4 max-h-40 overflow-y-auto border-2 border-gray-200 rounded-lg p-3">
                    {plans.length === 0 ? (
                        <p className="text-sm text-gray-500">אין עדיין תוכניות לשיתוף</p>
                    ) : (
                        plans.map((plan) => (
                            <label key={plan.id} className="flex items-center gap-2 py-1 text-sm text-gray-800">
                                <input
                                    type="checkbox"
                                    checked={form.planIds.includes(plan.id)}
                                    onChange={() => togglePlan(plan.id)}
                                    className="accent-primary"
                                />
                                {formatPlanLabel(plan)}
                            </label>
                        ))
                    )}
                </div>
            )}

            <div className="mb-5">
                <span className="block text-sm font-semibold text-gray-800 mb-2">הרשאה</span>
                <div className="flex gap-2">
                    <ToggleOption
                        selected={form.permission === "view"}
                        icon={Eye}
                        label="צפייה בלבד"
                        onClick={() => setForm((f) => ({ ...f, permission: "view" }))}
                    />
                    <ToggleOption
                        selected={form.permission === "edit"}
                        icon={ShieldCheck}
                        label="צפייה ועריכה"
                        onClick={() => setForm((f) => ({ ...f, permission: "edit" }))}
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <Button type="submit" variant="primary" size="sm" icon={Check} loading={submitting}>
                    שמירה
                </Button>
                <Button type="button" variant="outline" size="sm" icon={X} onClick={closeForm} disabled={submitting}>
                    ביטול
                </Button>
            </div>
        </form>
    );

    if (role && role !== "recipient") {
        return (
            <div dir="rtl" className="min-h-screen py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xs p-12 text-center">
                        <Inbox size={40} className="mx-auto text-gray-400 mb-3" aria-hidden="true" />
                        <p className="text-gray-600">מקטע זה מיועד למקבלי שירות בלבד.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg p-[var(--space-hero-pad)]">
                    <div className="flex justify-between items-center gap-4 mb-[var(--space-section-gap)] flex-wrap">
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                            <HeartHandshake size={24} aria-hidden="true" />
                            נותני שירות
                        </h2>
                        {editingId === null && (
                            <Button variant="success" size="sm" icon={Plus} onClick={openNewForm}>
                                הוספת נותן שירות
                            </Button>
                        )}
                    </div>

                    {editingId === "new" && renderForm()}

                    {loading ? (
                        <div className="text-center text-gray-600 py-8">טוען...</div>
                    ) : shares.length === 0 ? (
                        <div className="text-center py-8">
                            <Inbox size={36} className="mx-auto text-gray-400 mb-3" aria-hidden="true" />
                            <p className="text-gray-500">אין עדיין נותני שירות שמורים</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {shares.map((share) =>
                                editingId === share.id ? (
                                    <div key={share.id}>{renderForm()}</div>
                                ) : (
                                    <div
                                        key={share.id}
                                        className="flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-gray-200 flex-wrap"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-800">{share.providerEmail}</p>
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                                <Badge variant="gray" icon={share.scope === "all" ? Globe : ListChecks}>
                                                    {share.scope === "all"
                                                        ? "כל התוכניות"
                                                        : `${share.planIds?.length || 0} תוכניות נבחרות`}
                                                </Badge>
                                                <Badge
                                                    variant={share.permission === "edit" ? "success" : "info"}
                                                    icon={share.permission === "edit" ? ShieldCheck : Eye}
                                                >
                                                    {share.permission === "edit" ? "צפייה ועריכה" : "צפייה בלבד"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                icon={Pencil}
                                                onClick={() => openEditForm(share)}
                                            >
                                                עריכה
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                icon={Trash2}
                                                onClick={() => setPendingRemove(share)}
                                            >
                                                ביטול שיתוף
                                            </Button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <TrashSection
                        items={trashedShares}
                        renderLabel={(share) => share.providerEmail}
                        onRestore={handleRestoreShare}
                        onDeleteForever={handleDeleteShareForever}
                        className="mt-6"
                    />
                </div>
            </div>

            <ConfirmDialog
                open={!!pendingRemove}
                title="ביטול שיתוף"
                message={`האם לבטל את השיתוף עם "${pendingRemove?.providerEmail}"? הגישה שלו לתוכניות תבוטל באופן מיידי, והשיתוף יועבר לפח המחזור למשך 30 יום.`}
                confirmLabel="ביטול שיתוף"
                cancelLabel="חזרה"
                loading={removing}
                onConfirm={handleRemove}
                onCancel={() => setPendingRemove(null)}
            />
        </div>
    );
};

export default Providers;
