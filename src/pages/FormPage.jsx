import React, { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useAuth } from "../context/useAuth";
import FormSection from "../components/FormSection";
import PDFButton from "../components/PDFButton";
import { savePlan } from "../services/savePlan";
import { useLocation, useNavigate } from "react-router-dom";
import GoalSection from "../components/GoalSection";
import TextField from "../components/ui/TextField";
import useMediaQuery from "../services/useMediaQuery";
import { loadPlan } from "../services/loadPlan";
import { fetchShare } from "../services/useShares";
import { useComments } from "../services/useComments";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Spinner from "../components/ui/Spinner";
import CollapsibleSection from "../components/ui/CollapsibleSection";
import InfoHint from "../components/ui/InfoHint";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import PromptDialog from "../components/ui/PromptDialog";
import CommentThread from "../components/CommentThread";
import VersionHistory from "../components/VersionHistory";
import { formatUserLabel } from "../services/userProfile";
import {
    Footprints,
    ClipboardList,
    User,
    Calendar,
    Users,
    Rocket,
    CheckCircle2,
    Wrench,
    Lightbulb,
    Target,
    Handshake,
    Star,
    Dumbbell,
    MapPin,
    Telescope,
    Zap,
    Medal,
    Eye,
    Pencil,
    MessageSquare,
    HeartHandshake,
    AlertCircle,
} from "lucide-react";

const FormPage = () => {
    const { currentUser, userProfile, role } = useAuth();
    const methods = useForm();
    const { setValue, getValues } = methods;
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const planParamId = queryParams.get("planId");
    const isNewPlan = !planParamId || planParamId === "new";
    const passedPlanData = location.state?.planData;
    const autoExport = location.state?.autoExport;

    // A provider opening a recipient's plan (via RecipientPlans) carries the
    // recipient's uid in ownerUid — everything below reads/writes that
    // owner's document, not the signed-in user's own.
    const ownerUid = queryParams.get("ownerUid") || currentUser.uid;
    const isOwner = ownerUid === currentUser.uid;
    const ownerName = location.state?.ownerName;
    // An anonymous account's plan never stores a real name (see the "name"
    // field below) — for the owner themself this comes straight from their
    // own profile; for a provider viewing a shared plan it's carried via
    // navigation state (see RecipientPlans.jsx), since providers don't have
    // a read path to the recipient's own users/{uid} profile document.
    const ownerIsAnonymous = isOwner ? !!userProfile?.isAnonymous : !!location.state?.ownerIsAnonymous;
    const nameFieldRef = useRef(null);
    const [pdfNamePromptOpen, setPdfNamePromptOpen] = useState(false);
    const [pdfNameValue, setPdfNameValue] = useState("");
    const pdfNameResolveRef = useRef(null);

    const [planId] = useState(() => (isNewPlan ? uuidv4() : planParamId));
    const [isLoading, setIsLoading] = useState(!isNewPlan && !passedPlanData);
    // "idle" (nothing pending), "saving", "saved" (last save succeeded) or
    // "error" (last save failed) — driven entirely by our own savePlan calls
    // below, not by react-hook-form's formState.isDirty/dirtyFields, which
    // never actually update in this form (confirmed empirically: typing into
    // a field fires watch() with the new value every time, but isDirty and
    // dirtyFields stay stuck at false/{} regardless).
    const [saveStatus, setSaveStatus] = useState("idle");
    const saveTimeoutRef = useRef(null);
    // Clears a "saved" checkmark back to idle a few seconds after it shows,
    // so it doesn't just sit there forever once nothing is actually pending.
    const savedResetTimeoutRef = useRef(null);
    // Snapshot of the form's values right after they were loaded/defaulted,
    // used instead of isDirty to detect a real user edit (see above).
    const initialValuesRef = useRef(null);

    // The fixed action bar's content wraps onto more lines on a narrow phone
    // (more buttons than fit in one row), so its real height isn't a fixed
    // number — measure it and use that for the content's bottom padding
    // instead of guessing a static value that could still get overlapped.
    const actionBarRef = useRef(null);
    const [actionBarHeight, setActionBarHeight] = useState(0);
    useEffect(() => {
        const el = actionBarRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setActionBarHeight(entry.contentRect.height));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // A new plan opens ready to fill in; an existing plan opens locked for
    // review, with only the goal/target completion checkboxes live — see
    // GoalSection.jsx/Goal.jsx. "עריכה" unlocks the plan's content again.
    const [viewMode, setViewMode] = useState(!isNewPlan);

    // The owner always has full access; a provider's actual permission is
    // looked up fresh (not trusted from navigation state) so a revoked or
    // downgraded grant takes effect immediately rather than after a refresh.
    const [providerPermission, setProviderPermission] = useState(null);
    useEffect(() => {
        if (isOwner) return;
        let cancelled = false;
        fetchShare(ownerUid, currentUser.uid).then((share) => {
            if (!cancelled) setProviderPermission(share?.permission || null);
        });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerUid, isOwner]);

    const canEdit = isOwner || providerPermission === "edit";
    // A view-only provider always sees the locked/review layout — the
    // edit/view toggle itself only exists for someone allowed to edit.
    const effectiveViewMode = canEdit ? viewMode : true;

    // Whoever is actually saving right now — the recipient themself or a
    // provider with an edit grant — attributed on every version entry in
    // VersionHistory.jsx, same shape as CommentThread's authorUid/Name/Role.
    const editor = {
        uid: currentUser.uid,
        name: formatUserLabel({ displayName: currentUser.displayName, username: userProfile?.username, email: currentUser.email }),
        role,
    };

    // All of the plan's comments (whole-plan + every goal), active and
    // trashed, are fetched once here and filtered by targetGoal for each
    // CommentThread instance below.
    const {
        comments,
        trashedComments,
        loading: commentsLoading,
        setComments,
        setTrashedComments,
    } = useComments(ownerUid, planId);
    const commentsFor = (goalKey) => comments.filter((c) => (c.targetGoal || null) === (goalKey || null));
    const trashedCommentsFor = (goalKey) =>
        trashedComments.filter((c) => (c.targetGoal || null) === (goalKey || null));
    const handleCommentAdded = (comment) => setComments((prev) => [...prev, comment]);
    const handleCommentTrashed = (comment) => {
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
        setTrashedComments((prev) => [...prev, { ...comment, deletedAt: { toDate: () => new Date() } }]);
    };
    const handleCommentRestored = (comment) => {
        setTrashedComments((prev) => prev.filter((c) => c.id !== comment.id));
        setComments((prev) => [...prev, { ...comment, deletedAt: null }]);
    };
    const handleCommentDeletedForever = (commentId) =>
        setTrashedComments((prev) => prev.filter((c) => c.id !== commentId));

    // After VersionHistory.jsx reverts the form's values and saves directly
    // (bypassing the debounce, same as an explicit action), the ambient
    // watch-based autosave above must not treat the reverted values as a new
    // pending change and write them again — so its comparison snapshot is
    // refreshed here, exactly like it is right after the initial load.
    // For an anonymous-owned plan, offers a one-time, never-persisted name
    // to bake into this specific PDF export only — resolved via the plain
    // (unregistered, so never saved/autosaved) "name" input rendered above.
    // Both buttons proceed with the export; skipping just leaves it blank.
    const handleBeforeAnonymousExport = () =>
        new Promise((resolve) => {
            setPdfNameValue("");
            pdfNameResolveRef.current = resolve;
            setPdfNamePromptOpen(true);
        });

    const resolvePdfNamePrompt = (useName) => {
        setPdfNamePromptOpen(false);
        if (useName && nameFieldRef.current) {
            nameFieldRef.current.value = pdfNameValue.trim();
        }
        pdfNameResolveRef.current?.(true);
        pdfNameResolveRef.current = null;
    };

    const handleReverted = (newValues) => {
        initialValuesRef.current = JSON.stringify(newValues);
        setSaveStatus("saved");
        savedResetTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
    };

    // Matches the "lg" breakpoint used below for the short-goals grid — only
    // at that width do all three cards sit in one row, which is when a single
    // shared collapse control (instead of one per card) makes sense.
    const isShortGoalsRow = useMediaQuery("(min-width: 1024px)");

    // Phone-width screens (Tailwind's "sm" breakpoint) default every card to
    // collapsed so the page reads as a compact list of section headers
    // instead of one long scroll — tablets/desktop keep everything open as
    // before, since there's enough width for it not to matter.
    const isMobile = !useMediaQuery("(min-width: 640px)");

    // A freshly-created plan gets its own URL right away so a page refresh
    // keeps pointing at the same document instead of minting another id.
    useEffect(() => {
        if (isNewPlan) {
            navigate(`/form?planId=${planId}`, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // history.state (and so location.state) survives a page refresh, so
    // without this a refresh right after landing here would still see
    // autoExport: true and re-trigger the PDF download. Strip the flag from
    // the history entry once it's been read, before it can be replayed.
    useEffect(() => {
        if (!autoExport) return;
        const { autoExport: _drop, ...rest } = location.state || {};
        navigate(location.pathname + location.search, { replace: true, state: rest });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const applyData = (data) => {
            Object.entries(data).forEach(([key, value]) => {
                // A "name" value saved before this account went anonymous
                // (or before this feature existed) must not be silently
                // resurrected into an unregistered field's would-be value —
                // see the "name" field above, which anonymous owners never
                // register with react-hook-form in the first place.
                if (value !== undefined && key !== "id" && !(ownerIsAnonymous && key === "name")) {
                    setValue(key, value);
                }
            });
        };

        if (passedPlanData) {
            // Already fetched once for the profile list — reuse it instead of a second read.
            applyData(passedPlanData);
            initialValuesRef.current = JSON.stringify(getValues());
            setSaveStatus("idle");
            setIsLoading(false);
            return;
        }

        if (isNewPlan) {
            // Give a new plan a head start: today's date, left fully editable
            // in case it doesn't fit. The account name is only a sensible
            // guess for the recipient themselves — a provider's own name is
            // never the plan owner's name, so it's left blank for them. An
            // anonymous account never gets this prefill at all — see the
            // "name" field below, which isn't even registered for them.
            if (role === "recipient" && !ownerIsAnonymous) {
                setValue("name", formatUserLabel({ displayName: currentUser.displayName, username: userProfile?.username, email: currentUser.email }));
            }
            setValue("endDate", new Date().toISOString().split("T")[0]);
            initialValuesRef.current = JSON.stringify(getValues());
            setSaveStatus("idle");
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        const fetchSavedPlan = async () => {
            setIsLoading(true);
            try {
                const data = await loadPlan(ownerUid, planId);
                if (cancelled) return;
                if (data) applyData(data);
                initialValuesRef.current = JSON.stringify(getValues());
                setSaveStatus("idle");
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                if (cancelled) return;
                toast.error("אין (או שאין יותר) הרשאה לצפייה בתוכנית זו");
                navigate(isOwner ? "/profile" : "/form", { replace: true });
            }
        };
        fetchSavedPlan();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planId, ownerUid]);

    // The actual write to Firestore stays debounced (required — see
    // CLAUDE.md on minimizing writes), firing once the current values stop
    // matching the snapshot taken right after the plan was loaded/defaulted
    // above, so opening a plan just to look at it never triggers a write.
    // (Not driven by react-hook-form's formState.isDirty/dirtyFields —
    // confirmed empirically that they never update in this form even as
    // watch() reports real "change" events with the new values, so a plain
    // value comparison is used instead.) The status shown to the user,
    // though, updates on every keystroke (`pending`), not just once the
    // debounced write actually goes out — otherwise typing looks like
    // nothing is happening for the whole debounce window.
    useEffect(() => {
        const subscription = methods.watch((values) => {
            // Fields are disabled without edit rights, so this is a second,
            // defense-in-depth line against writing a plan the user can
            // only view — the write itself is also rejected by firestore.rules.
            if (!canEdit || JSON.stringify(values) === initialValuesRef.current) return;

            setSaveStatus("pending");
            clearTimeout(saveTimeoutRef.current);
            clearTimeout(savedResetTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(async () => {
                setSaveStatus("saving");
                try {
                    // getValues() never includes "name" for an anonymous
                    // owner (the field is never registered — see above), but
                    // a merge write alone would silently leave a real name
                    // saved before this account went anonymous sitting in
                    // Firestore forever. Overwrite it explicitly instead of
                    // just omitting it.
                    const values = ownerIsAnonymous ? { ...getValues(), name: "" } : getValues();
                    await savePlan(ownerUid, values, planId, editor);
                    setSaveStatus("saved");
                    savedResetTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
                } catch (error) {
                    console.error(error);
                    setSaveStatus("error");
                    toast.error(
                        !isOwner
                            ? "שגיאה בשמירה — ייתכן שההרשאה לעריכת תוכנית זו בוטלה"
                            : "שגיאה בשמירה האוטומטית, מומלץ לשמור ידנית"
                    );
                }
            }, 2000);
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(saveTimeoutRef.current);
            clearTimeout(savedResetTimeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size={48} className="text-primary" />
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div dir="rtl" id="formArea" className="min-h-screen pb-8">
                {/* HEADER */}
                <div className="text-white py-12 mb-8 shadow-xs bg-linear-to-br from-primary to-secondary">
                    <div className="max-w-6xl mx-auto px-4">
                        <h1 className="flex items-center gap-2 text-4xl font-bold mb-2">
                            <Footprints size={32} aria-hidden="true" />
                            צעד קדימה
                        </h1>
                        <p className="text-lg opacity-90">תוכנית אישית לקידום מטרות לשישה החודשים הקרובים</p>
                    </div>
                </div>

                <div
                    className="max-w-6xl mx-auto px-4 pb-24 sm:pb-20"
                    style={actionBarHeight ? { paddingBottom: `${actionBarHeight + 16}px` } : undefined}
                >
                    {!isOwner && (
                        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-info/10 border-r-4 border-info pdf-hidden">
                            <Users size={16} className="text-info shrink-0" aria-hidden="true" />
                            <span className="text-sm text-info">
                                {ownerName ? `צפייה בתוכנית של ${ownerName}` : "צפייה בתוכנית משותפת"}
                            </span>
                        </div>
                    )}

                    {/* VIEW/EDIT MODE INDICATOR — the actual controls (access
                     management, edit/view toggle) live in the fixed action bar
                     at the bottom so they're reachable from anywhere on the
                     page, not just when scrolled to the top. */}
                    <div className="flex items-center gap-2 mb-6 pdf-hidden text-sm font-semibold text-body">
                        {effectiveViewMode ? (
                            <Eye size={16} aria-hidden="true" />
                        ) : (
                            <Pencil size={16} aria-hidden="true" />
                        )}
                        {effectiveViewMode
                            ? "מצב תצוגה — תוכן התוכנית נעול, ניתן לסמן התקדמות"
                            : "מצב עריכה — ניתן לערוך את תוכן התוכנית"}
                    </div>

                    {/* GENERAL INFO SECTION */}
                    <CollapsibleSection title="פרטי התוכנית" icon={ClipboardList} accent="primary" defaultOpen={!isMobile}>
                        <fieldset disabled={effectiveViewMode} className="border-0 min-w-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-heading mb-2">
                                        <User size={16} aria-hidden="true" />
                                        שם מלא
                                    </label>
                                    {ownerIsAnonymous ? (
                                        <>
                                            <TextField
                                                as="input"
                                                type="text"
                                                dense
                                                ref={nameFieldRef}
                                                defaultValue=""
                                                disabled
                                                placeholder="לא נשמר בחשבון אנונימי"
                                            />
                                            <small className="block text-muted text-xs mt-1.5">
                                                בחשבון אנונימי השם לא נשמר — ניתן להוסיף אותו זמנית בעת ייצוא ל-PDF בלבד
                                            </small>
                                        </>
                                    ) : (
                                        <FormSection name="name" rows={1} showLabel={false} placeholder="השם המלא" />
                                    )}
                                </div>
                                <div>
                                    <TextField
                                        as="input"
                                        type="date"
                                        dense
                                        icon={Calendar}
                                        label="תחילת התהליך"
                                        {...methods.register("startDate")}
                                    />
                                </div>
                                <div>
                                    <TextField
                                        as="input"
                                        type="date"
                                        dense
                                        icon={Calendar}
                                        label="כתיבת התוכנית"
                                        {...methods.register("endDate")}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-heading mb-2">
                                        <Users size={16} aria-hidden="true" />
                                        שותפים
                                    </label>
                                    <FormSection name="partners" rows={1} showLabel={false} placeholder="ניתן לכתוב כאן" />
                                </div>
                            </div>
                        </fieldset>
                    </CollapsibleSection>

                    {/* PAGE 1: PREPARATION */}
                    <CollapsibleSection title="הכנה לתהליך" icon={Rocket} accent="success" defaultOpen={!isMobile}>
                        <fieldset disabled={effectiveViewMode} className="border-0 min-w-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-success text-white p-1.5 rounded-sm">
                                            <CheckCircle2 size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-heading">מה הצלחתי עד עכשיו?</label>
                                        <InfoHint text="הישגים, קטנים כגדולים, שכבר קרו בדרך עד כה." />
                                    </div>
                                    <FormSection name="successUntilNow" showLabel={false} rows={4} />
                                </div>
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-info text-white p-1.5 rounded-sm">
                                            <Wrench size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-heading">אילו כלים?</label>
                                        <InfoHint text="שיטות, טכניקות או משאבים שכבר נעשה בהם שימוש עד כה." />
                                    </div>
                                    <FormSection name="toolsUsed" showLabel={false} rows={4} />
                                </div>
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-warning text-white p-1.5 rounded-sm">
                                            <Lightbulb size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-heading">מה למדתי?</label>
                                        <InfoHint text="תובנות או ידע חדש שנרכשו במהלך התהליך עד כה." />
                                    </div>
                                    <FormSection name="whatILearned" showLabel={false} rows={4} />
                                </div>

                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-primary text-white p-1.5 rounded-sm">
                                            <Target size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-heading">מה מסקרן אותי?</label>
                                        <InfoHint text="תחומי עניין, נושאים שמושכים לבדוק או ללמוד עליהם, דברים שיוצרים סקרנות לגבי העתיד." />
                                    </div>
                                    <FormSection name="motivatingFactors" showLabel={false} rows={4} />
                                </div>
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-info text-white p-1.5 rounded-sm">
                                            <Handshake size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-heading">מי/מה עוזר?</label>
                                        <InfoHint text="אנשים, קבוצות או גורמים אחרים שתומכים או מסייעים בדרך." />
                                    </div>
                                    <FormSection name="whoHelpsMe" showLabel={false} rows={4} />
                                </div>
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-danger text-white p-1.5 rounded-sm">
                                            <Star size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-heading">מה חשוב לי עכשיו?</label>
                                        <InfoHint text="ערכים או עדיפויות שמנחים בשלב הנוכחי." />
                                    </div>
                                    <FormSection name="whatImportantNow" showLabel={false} rows={4} />
                                </div>

                                <div className="lg:col-span-3 bg-surface-muted p-4 rounded-lg">
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-secondary text-white p-1.5 rounded-sm">
                                            <Dumbbell size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-heading">כוחות ומשאבים?</label>
                                        <InfoHint text="תכונות אישיות, יכולות, אנשים או שירותים שיכולים לעזור בדרך." />
                                    </div>
                                    <FormSection name="myStrengths" showLabel={false} rows={3} />
                                </div>
                            </div>
                        </fieldset>

                        <CommentThread
                            ownerUid={ownerUid}
                            planId={planId}
                            targetGoal="preparation"
                            comments={commentsFor("preparation")}
                            trashedComments={trashedCommentsFor("preparation")}
                            loading={commentsLoading}
                            onAdded={handleCommentAdded}
                            onTrashed={handleCommentTrashed}
                            onRestored={handleCommentRestored}
                            onDeletedForever={handleCommentDeletedForever}
                            isOwner={isOwner}
                            title="הערות על ההכנה לתהליך"
                        />
                    </CollapsibleSection>

                    {/* PAGE 2: GOALS */}
                    <CollapsibleSection title="הגדרת המטרות" icon={Target} accent="warning" defaultOpen={!isMobile}>
                        <fieldset disabled={effectiveViewMode} className="border-0 min-w-0">
                            <div className="pdf-avoid-break mb-6 p-4 bg-info/10 rounded-lg border-l-4 border-info">
                                <strong className="flex items-center gap-2 text-info mb-2">
                                    <MapPin size={18} aria-hidden="true" />
                                    מטרה לטווח ארוך
                                    <InfoHint text="מטרה משמעותית שהתהליך של שישה החודשים הקרובים אמור לקדם." />
                                </strong>
                                <FormSection name="longTermGoal" label="הגדרת המטרה:" rows={3} />
                            </div>

                            <div className="pdf-avoid-break mb-6 p-4 bg-info/10 rounded-lg border-l-4 border-info">
                                <strong className="flex items-center gap-2 text-info mb-2">
                                    <Telescope size={18} aria-hidden="true" />
                                    מטרת-על (תמונת עתיד)
                                    <InfoHint text="כיצד ייראו החיים בעוד כמה שנים אם התהליך יצליח? מה ישתנה?" />
                                </strong>
                                <FormSection name="futureVision" label="תיאור התמונה:" rows={3} />
                            </div>
                        </fieldset>

                        {isShortGoalsRow ? (
                            <CollapsibleSection
                                title={
                                    <span className="flex items-center gap-2">
                                        <Zap size={18} aria-hidden="true" />
                                        מטרות לטווח קצר (6 חודשים)
                                    </span>
                                }
                                accent="success"
                                defaultOpen
                            >
                                <div className="pdf-stack-grid grid grid-cols-3 gap-4">
                                    <GoalSection
                                        title={
                                            <span className="flex items-center gap-1.5">
                                                <Medal size={18} aria-hidden="true" />
                                                מטרה קצרת טווח #1
                                            </span>
                                        }
                                        baseName="shortGoals.one"
                                        index={1}
                                        badgeColor="primary"
                                        viewMode={effectiveViewMode}
                                        canEdit={canEdit}
                                        collapsible={false}
                                        ownerUid={ownerUid}
                                        planId={planId}
                                        goalKey="one"
                                        comments={commentsFor("one")}
                                        trashedComments={trashedCommentsFor("one")}
                                        commentsLoading={commentsLoading}
                                        onCommentAdded={handleCommentAdded}
                                        onCommentTrashed={handleCommentTrashed}
                                        onCommentRestored={handleCommentRestored}
                                        onCommentDeletedForever={handleCommentDeletedForever}
                                        isOwner={isOwner}
                                    />
                                    <GoalSection
                                        title={
                                            <span className="flex items-center gap-1.5">
                                                <Medal size={18} aria-hidden="true" />
                                                מטרה קצרת טווח #2
                                            </span>
                                        }
                                        baseName="shortGoals.two"
                                        index={2}
                                        badgeColor="info"
                                        viewMode={effectiveViewMode}
                                        canEdit={canEdit}
                                        collapsible={false}
                                        ownerUid={ownerUid}
                                        planId={planId}
                                        goalKey="two"
                                        comments={commentsFor("two")}
                                        trashedComments={trashedCommentsFor("two")}
                                        commentsLoading={commentsLoading}
                                        onCommentAdded={handleCommentAdded}
                                        onCommentTrashed={handleCommentTrashed}
                                        onCommentRestored={handleCommentRestored}
                                        onCommentDeletedForever={handleCommentDeletedForever}
                                        isOwner={isOwner}
                                    />
                                    <GoalSection
                                        title={
                                            <span className="flex items-center gap-1.5">
                                                <Medal size={18} aria-hidden="true" />
                                                מטרה קצרת טווח #3
                                            </span>
                                        }
                                        baseName="shortGoals.three"
                                        index={3}
                                        badgeColor="success"
                                        viewMode={effectiveViewMode}
                                        canEdit={canEdit}
                                        collapsible={false}
                                        ownerUid={ownerUid}
                                        planId={planId}
                                        goalKey="three"
                                        comments={commentsFor("three")}
                                        trashedComments={trashedCommentsFor("three")}
                                        commentsLoading={commentsLoading}
                                        onCommentAdded={handleCommentAdded}
                                        onCommentTrashed={handleCommentTrashed}
                                        onCommentRestored={handleCommentRestored}
                                        onCommentDeletedForever={handleCommentDeletedForever}
                                        isOwner={isOwner}
                                    />
                                </div>
                            </CollapsibleSection>
                        ) : (
                            <>
                                <div className="pdf-avoid-break mb-4 p-4 bg-success/10 rounded-lg border-l-4 border-success">
                                    <strong className="flex items-center gap-2 text-success">
                                        <Zap size={18} aria-hidden="true" />
                                        מטרות לטווח קצר (6 חודשים)
                                    </strong>
                                </div>

                                <div className="pdf-stack-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GoalSection
                                        title={
                                            <span className="flex items-center gap-1.5">
                                                <Medal size={18} aria-hidden="true" />
                                                מטרה קצרת טווח #1
                                            </span>
                                        }
                                        baseName="shortGoals.one"
                                        index={1}
                                        badgeColor="primary"
                                        viewMode={effectiveViewMode}
                                        canEdit={canEdit}
                                        defaultOpen={!isMobile}
                                        ownerUid={ownerUid}
                                        planId={planId}
                                        goalKey="one"
                                        comments={commentsFor("one")}
                                        trashedComments={trashedCommentsFor("one")}
                                        commentsLoading={commentsLoading}
                                        onCommentAdded={handleCommentAdded}
                                        onCommentTrashed={handleCommentTrashed}
                                        onCommentRestored={handleCommentRestored}
                                        onCommentDeletedForever={handleCommentDeletedForever}
                                        isOwner={isOwner}
                                    />
                                    <GoalSection
                                        title={
                                            <span className="flex items-center gap-1.5">
                                                <Medal size={18} aria-hidden="true" />
                                                מטרה קצרת טווח #2
                                            </span>
                                        }
                                        baseName="shortGoals.two"
                                        index={2}
                                        badgeColor="info"
                                        viewMode={effectiveViewMode}
                                        canEdit={canEdit}
                                        defaultOpen={!isMobile}
                                        ownerUid={ownerUid}
                                        planId={planId}
                                        goalKey="two"
                                        comments={commentsFor("two")}
                                        trashedComments={trashedCommentsFor("two")}
                                        commentsLoading={commentsLoading}
                                        onCommentAdded={handleCommentAdded}
                                        onCommentTrashed={handleCommentTrashed}
                                        onCommentRestored={handleCommentRestored}
                                        onCommentDeletedForever={handleCommentDeletedForever}
                                        isOwner={isOwner}
                                    />
                                    <GoalSection
                                        title={
                                            <span className="flex items-center gap-1.5">
                                                <Medal size={18} aria-hidden="true" />
                                                מטרה קצרת טווח #3
                                            </span>
                                        }
                                        baseName="shortGoals.three"
                                        index={3}
                                        badgeColor="success"
                                        viewMode={effectiveViewMode}
                                        canEdit={canEdit}
                                        defaultOpen={!isMobile}
                                        ownerUid={ownerUid}
                                        planId={planId}
                                        goalKey="three"
                                        comments={commentsFor("three")}
                                        trashedComments={trashedCommentsFor("three")}
                                        commentsLoading={commentsLoading}
                                        onCommentAdded={handleCommentAdded}
                                        onCommentTrashed={handleCommentTrashed}
                                        onCommentRestored={handleCommentRestored}
                                        onCommentDeletedForever={handleCommentDeletedForever}
                                        isOwner={isOwner}
                                    />
                                </div>
                            </>
                        )}
                    </CollapsibleSection>

                    {/* PLAN-LEVEL COMMENTS */}
                    <CollapsibleSection
                        title="הערות ועדכוני התקדמות"
                        icon={MessageSquare}
                        accent="info"
                        defaultOpen={!isMobile}
                        className="pdf-hidden"
                    >
                        <CommentThread
                            ownerUid={ownerUid}
                            planId={planId}
                            targetGoal={null}
                            comments={commentsFor(null)}
                            trashedComments={trashedCommentsFor(null)}
                            loading={commentsLoading}
                            onAdded={handleCommentAdded}
                            onTrashed={handleCommentTrashed}
                            onRestored={handleCommentRestored}
                            onDeletedForever={handleCommentDeletedForever}
                            isOwner={isOwner}
                            title="הערות על התוכנית כולה"
                        />
                    </CollapsibleSection>

                    <VersionHistory
                        ownerUid={ownerUid}
                        planId={planId}
                        canEdit={canEdit}
                        editor={editor}
                        onReverted={handleReverted}
                    />

                </div>

                {/* ACTION BAR — fixed to the viewport so the plan's controls
                 (access management, edit/view toggle, PDF export) stay within
                 reach while filling a long form, instead of only appearing
                 once scrolled all the way to their spot. A page with a taller
                 Header (e.g. narrow phones, where it wraps to more than one
                 line) just pushes this bar's own content to wrap too — it
                 isn't anchored to the Header's height. */}
                <div
                    ref={actionBarRef}
                    className="fixed inset-x-0 bottom-0 z-30 pdf-hidden bg-surface/95 backdrop-blur-sm border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
                >
                    <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
                        {isOwner && role === "recipient" && (
                            <Button
                                variant="outline"
                                size="sm"
                                icon={HeartHandshake}
                                onClick={() => navigate("/providers")}
                            >
                                ניהול גישה לנותני השירות שלי
                            </Button>
                        )}
                        {canEdit ? (
                            <Button
                                variant={viewMode ? "primary" : "outline"}
                                size="sm"
                                icon={viewMode ? Pencil : Eye}
                                onClick={() => setViewMode((v) => !v)}
                            >
                                {viewMode ? "מעבר לעריכת התוכנית" : "סיום עריכה וחזרה לתצוגה"}
                            </Button>
                        ) : (
                            <Badge variant="info" icon={Eye}>
                                צפייה בלבד — אין הרשאת עריכה
                            </Badge>
                        )}
                        <PDFButton
                            targetId="formArea"
                            autoTrigger={autoExport}
                            size="sm"
                            onBeforeExport={ownerIsAnonymous ? handleBeforeAnonymousExport : undefined}
                        />
                        {saveStatus === "pending" && (
                            <small className="text-muted text-xs sm:text-sm">יש שינויים שטרם נשמרו</small>
                        )}
                        {saveStatus === "saving" && (
                            <small className="text-muted flex items-center gap-2 text-xs sm:text-sm">
                                <Spinner size={14} />
                                שומר...
                            </small>
                        )}
                        {saveStatus === "saved" && (
                            <small className="text-success flex items-center gap-1.5 text-xs sm:text-sm">
                                <CheckCircle2 size={14} aria-hidden="true" />
                                נשמר
                            </small>
                        )}
                        {saveStatus === "error" && (
                            <small className="text-danger flex items-center gap-1.5 text-xs sm:text-sm">
                                <AlertCircle size={14} aria-hidden="true" />
                                שגיאה בשמירה
                            </small>
                        )}
                    </div>
                </div>
            </div>

            <PromptDialog
                open={pdfNamePromptOpen}
                title="הוספת שם למסמך המיוצא"
                message="השם לא יישמר בחשבון או בתוכנית — הוא ישמש רק למסמך ה-PDF הזה."
                fields={[
                    {
                        label: "שם (רשות)",
                        value: pdfNameValue,
                        onChange: (e) => setPdfNameValue(e.target.value),
                        placeholder: "השם המלא",
                    },
                ]}
                confirmLabel="המשך לייצוא"
                cancelLabel="דילוג"
                onConfirm={() => resolvePdfNamePrompt(true)}
                onCancel={() => resolvePdfNamePrompt(false)}
            />
        </FormProvider>
    );
};

export default FormPage;
