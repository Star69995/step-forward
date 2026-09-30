import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { usePlans, formatPlanLabel } from "../services/usePlans";
import {
    useShares,
    addOrUpdateShare,
    removeShare,
    restoreShare,
    deleteShareForever,
    usePendingShares,
    addOrUpdatePendingShare,
    removePendingShare,
    restorePendingShare,
    deletePendingShareForever,
} from "../services/useShares";
import { resolveEmailToUser } from "../services/resolveEmailToUser";
import { resolveUsernameToUser } from "../services/resolveUsernameToUser";
import { formatUserLabel } from "../services/userProfile";
import { isSyntheticEmail } from "../services/anonymousAccount";
import Button from "../components/ui/Button";
import TitleRow from "../components/ui/TitleRow";
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
    Clock,
    X,
    Check,
} from "lucide-react";

const emptyForm = { identifier: "", scope: "all", permission: "view", planIds: [] };

// editingId doubles as a discriminator: "new", an existing share's
// providerUid, or a pending invite's id prefixed this way — Firestore uids
// never contain a colon, so there's no ambiguity.
const PENDING_PREFIX = "pending:";

// A single-select pair of "chip" buttons — used for both the scope choice
// (all/selected) and the permission choice (view/edit) so the toggle look
// is defined once instead of twice.
const ToggleOption = ({ selected, icon: Icon, label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition ${
            selected ? "border-primary bg-primary/5 text-primary" : "border-border text-body hover:border-border"
        }`}
    >
        <Icon size={16} aria-hidden="true" />
        {label}
    </button>
);

const Providers = () => {
    const { currentUser, userProfile, role } = useAuth();
    const { shares, trashedShares, loading, refetch } = useShares(currentUser?.uid);
    const {
        pendingShares,
        trashedPendingShares,
        loading: loadingPending,
        refetch: refetchPending,
    } = usePendingShares(currentUser?.uid);
    const { plans } = usePlans(currentUser?.uid);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null); // providerUid, "pending:<email>", or "new"
    const [pendingRemove, setPendingRemove] = useState(null); // { kind: "share" | "pending", id, label }
    const [removing, setRemoving] = useState(false);

    const openNewForm = () => {
        setForm(emptyForm);
        setEditingId("new");
    };

    const openEditForm = (share) => {
        setForm({
            identifier: share.providerEmail || "",
            scope: share.scope,
            permission: share.permission,
            planIds: share.planIds || [],
        });
        setEditingId(share.id);
    };

    const openEditPendingForm = (pending) => {
        setForm({
            identifier: pending.email,
            scope: pending.scope,
            permission: pending.permission,
            planIds: pending.planIds || [],
        });
        setEditingId(`${PENDING_PREFIX}${pending.id}`);
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
        if (!form.identifier) {
            toast.error("יש להזין אימייל או שם משתמש");
            return;
        }
        if (form.scope === "selected" && form.planIds.length === 0) {
            toast.error("יש לבחור לפחות תוכנית אחת לשיתוף");
            return;
        }

        setSubmitting(true);
        try {
            const recipientFields = {
                recipientEmail: currentUser.email,
                recipientDisplayName: currentUser.displayName,
                recipientLabel: formatUserLabel({
                    displayName: userProfile?.displayName,
                    username: userProfile?.username,
                    email: currentUser.email,
                }),
                recipientIsAnonymous: !!userProfile?.isAnonymous,
            };

            const isEditingPending = typeof editingId === "string" && editingId.startsWith(PENDING_PREFIX);
            if (isEditingPending) {
                await addOrUpdatePendingShare(currentUser.uid, editingId.slice(PENDING_PREFIX.length), {
                    scope: form.scope,
                    planIds: form.planIds,
                    permission: form.permission,
                    ...recipientFields,
                });
                toast.success("הפרטים נשמרו בהצלחה");
                closeForm();
                refetchPending();
                return;
            }

            let providerUid = editingId !== "new" ? editingId : null;
            let resolved = null;

            if (!providerUid) {
                const isEmailIdentifier = form.identifier.includes("@");
                resolved = isEmailIdentifier
                    ? await resolveEmailToUser(form.identifier)
                    : await resolveUsernameToUser(form.identifier);
                if (!resolved) {
                    if (isEmailIdentifier) {
                        // Not registered yet — save as a pending invite
                        // instead of failing outright; it activates itself
                        // automatically once someone verifies this exact
                        // email as a provider account (see
                        // claimPendingSharesForEmail in useShares.js).
                        await addOrUpdatePendingShare(currentUser.uid, form.identifier, {
                            scope: form.scope,
                            planIds: form.planIds,
                            permission: form.permission,
                            ...recipientFields,
                        });
                        toast.success(
                            "הכתובת עדיין לא רשומה — השיתוף יופעל אוטומטית ברגע שיירשם עמה חשבון נותן שירות"
                        );
                        closeForm();
                        refetchPending();
                        return;
                    }
                    toast.error("לא נמצא משתמש רשום עם שם משתמש זה");
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
                // Left undefined (and so omitted — see firebase.js's
                // ignoreUndefinedProperties) when editing an existing share,
                // so these denormalized fields aren't blanked out just
                // because this submission didn't re-resolve an identifier.
                providerEmail: resolved
                    ? resolved.email && !isSyntheticEmail(resolved.email)
                        ? resolved.email.toLowerCase()
                        : ""
                    : undefined,
                providerLabel: resolved ? formatUserLabel(resolved) : undefined,
                scope: form.scope,
                planIds: form.planIds,
                permission: form.permission,
                ...recipientFields,
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
            if (pendingRemove.kind === "pending") {
                await removePendingShare(currentUser.uid, pendingRemove.id);
                toast.success("ההזמנה הועברה לפח המחזור");
                refetchPending();
            } else {
                await removeShare(currentUser.uid, pendingRemove.id);
                toast.success("השיתוף הועבר לפח המחזור");
                refetch();
            }
        } catch (error) {
            console.error(error);
            toast.error(pendingRemove.kind === "pending" ? "שגיאה בביטול ההזמנה" : "שגיאה בביטול השיתוף");
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

    const handleRestorePendingShare = async (pending) => {
        await restorePendingShare(currentUser.uid, pending.id);
        toast.success("ההזמנה שוחזרה בהצלחה");
        refetchPending();
    };

    const handleDeletePendingShareForever = async (pending) => {
        await deletePendingShareForever(currentUser.uid, pending.id);
        toast.success("ההזמנה נמחקה לצמיתות");
        refetchPending();
    };

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="bg-surface-muted rounded-xl p-5 mb-4 border-2 border-primary/20">
            {editingId === "new" && (
                <TextField
                    className="mb-4"
                    icon={Mail}
                    label="אימייל או שם משתמש של נותן השירות"
                    type="text"
                    placeholder="example@email.com או שם משתמש"
                    value={form.identifier}
                    onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                    disabled={submitting}
                    hint="אם מזינים אימייל שעדיין אין לו חשבון, השיתוף יישמר כהזמנה ויופעל אוטומטית ברגע שיירשם עם כתובת זו כנותן/ת שירות"
                />
            )}

            <div className="mb-4">
                <span className="block text-sm font-semibold text-heading mb-2">היקף השיתוף</span>
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
                <div className="mb-4 max-h-40 overflow-y-auto border-2 border-border rounded-lg p-3">
                    {plans.length === 0 ? (
                        <p className="text-sm text-muted">אין עדיין תוכניות לשיתוף</p>
                    ) : (
                        plans.map((plan) => (
                            <label key={plan.id} className="flex items-center gap-2 py-1 text-sm text-heading">
                                <input
                                    type="checkbox"
                                    checked={form.planIds.includes(plan.id)}
                                    onChange={() => togglePlan(plan.id)}
                                    className="accent-primary"
                                />
                                {formatPlanLabel(plan, plans)}
                            </label>
                        ))
                    )}
                </div>
            )}

            <div className="mb-5">
                <span className="block text-sm font-semibold text-heading mb-2">הרשאה</span>
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
                    <div className="bg-surface rounded-2xl shadow-xs p-12 text-center">
                        <Inbox size={40} className="mx-auto text-muted mb-3" aria-hidden="true" />
                        <p className="text-body">מקטע זה מיועד למקבלי שירות בלבד.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-surface/95 backdrop-blur-sm rounded-3xl shadow-lg p-[var(--space-hero-pad)]">
                    <TitleRow icon={HeartHandshake} title="נותני שירות" className="mb-[var(--space-section-gap)]">
                        {editingId === null && (
                            <Button variant="success" size="sm" icon={Plus} onClick={openNewForm}>
                                הוספת נותן שירות
                            </Button>
                        )}
                    </TitleRow>

                    {editingId === "new" && renderForm()}

                    {loading ? (
                        <div className="text-center text-body py-8">טוען...</div>
                    ) : shares.length === 0 ? (
                        <div className="text-center py-8">
                            <Inbox size={36} className="mx-auto text-muted mb-3" aria-hidden="true" />
                            <p className="text-muted">אין עדיין נותני שירות שמורים</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {shares.map((share) =>
                                editingId === share.id ? (
                                    <div key={share.id}>{renderForm()}</div>
                                ) : (
                                    <div
                                        key={share.id}
                                        className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:text-start gap-3 p-4 rounded-xl border-2 border-border sm:flex-wrap"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-semibold text-heading">
                                                {share.providerLabel || formatUserLabel({ email: share.providerEmail })}
                                            </p>
                                            <div className="flex justify-center sm:justify-start gap-2 mt-1 flex-wrap">
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
                                        <div className="flex gap-2 flex-wrap">
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
                                                onClick={() => setPendingRemove({ ...share, kind: "share" })}
                                            >
                                                ביטול שיתוף
                                            </Button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {!loadingPending && pendingShares.length > 0 && (
                        <div className="flex flex-col gap-3 mt-4">
                            <span className="block text-sm font-semibold text-heading text-center sm:text-start">הזמנות ממתינות להרשמה</span>
                            {pendingShares.map((pending) =>
                                editingId === `${PENDING_PREFIX}${pending.id}` ? (
                                    <div key={pending.id}>{renderForm()}</div>
                                ) : (
                                    <div
                                        key={pending.id}
                                        className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:text-start gap-3 p-4 rounded-xl border-2 border-dashed border-border sm:flex-wrap"
                                    >
                                        <div className="min-w-0 max-w-full">
                                            <p className="font-semibold text-heading wrap-break-word">{pending.email}</p>
                                            <div className="flex justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                                                <Badge variant="warning" icon={Clock}>
                                                    ממתין להרשמה
                                                </Badge>
                                                <Badge variant="gray" icon={pending.scope === "all" ? Globe : ListChecks}>
                                                    {pending.scope === "all"
                                                        ? "כל התוכניות"
                                                        : `${pending.planIds?.length || 0} תוכניות נבחרות`}
                                                </Badge>
                                                <Badge
                                                    variant={pending.permission === "edit" ? "success" : "info"}
                                                    icon={pending.permission === "edit" ? ShieldCheck : Eye}
                                                >
                                                    {pending.permission === "edit" ? "צפייה ועריכה" : "צפייה בלבד"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                icon={Pencil}
                                                onClick={() => openEditPendingForm(pending)}
                                            >
                                                עריכה
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                icon={Trash2}
                                                onClick={() => setPendingRemove({ ...pending, kind: "pending" })}
                                            >
                                                ביטול הזמנה
                                            </Button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <TrashSection
                        items={trashedShares}
                        renderLabel={(share) => share.providerLabel || formatUserLabel({ email: share.providerEmail })}
                        onRestore={handleRestoreShare}
                        onDeleteForever={handleDeleteShareForever}
                        className="mt-6"
                    />

                    <TrashSection
                        items={trashedPendingShares}
                        renderLabel={(pending) => pending.email}
                        onRestore={handleRestorePendingShare}
                        onDeleteForever={handleDeletePendingShareForever}
                        title="הזמנות בפח מחזור"
                        emptyMessage="אין הזמנות בפח"
                        className="mt-6"
                    />
                </div>
            </div>

            <ConfirmDialog
                open={!!pendingRemove}
                title={pendingRemove?.kind === "pending" ? "ביטול הזמנה" : "ביטול שיתוף"}
                message={
                    pendingRemove?.kind === "pending"
                        ? `האם לבטל את ההזמנה עבור "${pendingRemove.email}"? ההזמנה תועבר לפח המחזור למשך 30 יום, ולא תופעל אוטומטית אם הכתובת תירשם בינתיים.`
                        : `האם לבטל את השיתוף עם "${
                              pendingRemove ? pendingRemove.providerLabel || formatUserLabel({ email: pendingRemove.providerEmail }) : ""
                          }"? הגישה שלו לתוכניות תבוטל באופן מיידי, והשיתוף יועבר לפח המחזור למשך 30 יום.`
                }
                confirmLabel={pendingRemove?.kind === "pending" ? "ביטול הזמנה" : "ביטול שיתוף"}
                cancelLabel="חזרה"
                loading={removing}
                onConfirm={handleRemove}
                onCancel={() => setPendingRemove(null)}
            />
        </div>
    );
};

export default Providers;
