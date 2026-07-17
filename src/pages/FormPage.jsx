import React, { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useAuth } from "../context/useAuth";
import FormSection from "../components/FormSection";
import PDFButton from "../components/PDFButton";
import CloudSaveButton from "../components/CloudSaveButton";
import { savePlan } from "../services/savePlan";
import { useLocation, useNavigate } from "react-router-dom";
import GoalSection from "../components/GoalSection";
import useMediaQuery from "../services/useMediaQuery";
import { loadPlan } from "../services/loadPlan";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Spinner from "../components/ui/Spinner";
import CollapsibleSection from "../components/ui/CollapsibleSection";
import InfoHint from "../components/ui/InfoHint";
import Button from "../components/ui/Button";
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
} from "lucide-react";

const FormPage = () => {
    const { currentUser } = useAuth();
    const methods = useForm();
    const { setValue, getValues, formState } = methods;
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const planParamId = queryParams.get("planId");
    const isNewPlan = !planParamId || planParamId === "new";
    const passedPlanData = location.state?.planData;
    const autoExport = location.state?.autoExport;

    const [planId] = useState(() => (isNewPlan ? uuidv4() : planParamId));
    const [isLoading, setIsLoading] = useState(!isNewPlan && !passedPlanData);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef(null);

    // A new plan opens ready to fill in; an existing plan opens locked for
    // review, with only the goal/target completion checkboxes live — see
    // GoalSection.jsx/Goal.jsx. "עריכה" unlocks the plan's content again.
    const [viewMode, setViewMode] = useState(!isNewPlan);

    // Matches the "lg" breakpoint used below for the short-goals grid — only
    // at that width do all three cards sit in one row, which is when a single
    // shared collapse control (instead of one per card) makes sense.
    const isShortGoalsRow = useMediaQuery("(min-width: 1024px)");

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
                if (value !== undefined && key !== "id") setValue(key, value);
            });
        };

        if (passedPlanData) {
            // Already fetched once for the profile list — reuse it instead of a second read.
            applyData(passedPlanData);
            setIsLoading(false);
            return;
        }

        if (isNewPlan) {
            // Give a new plan a head start: the account name and today's date,
            // both left fully editable in case they don't fit.
            setValue("name", currentUser.displayName || currentUser.email || "");
            setValue("endDate", new Date().toISOString().split("T")[0]);
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        const fetchSavedPlan = async () => {
            setIsLoading(true);
            const data = await loadPlan(currentUser.uid, planId);
            if (!cancelled) {
                if (data) applyData(data);
                setIsLoading(false);
            }
        };
        fetchSavedPlan();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planId]);

    // Autosave only fires once the user has actually changed something
    // (formState.isDirty), so opening a plan just to look at it never
    // triggers a write. Debounced, and errors surface to the user instead
    // of failing silently.
    useEffect(() => {
        const subscription = methods.watch(() => {
            if (!formState.isDirty) return;

            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(async () => {
                setIsSaving(true);
                try {
                    await savePlan(currentUser.uid, getValues(), planId);
                } catch (error) {
                    console.error(error);
                    toast.error("שגיאה בשמירה האוטומטית, מומלץ לשמור ידנית");
                } finally {
                    setIsSaving(false);
                }
            }, 2000);
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(saveTimeoutRef.current);
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

                <div className="max-w-6xl mx-auto px-4">
                    {/* VIEW/EDIT MODE TOGGLE */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pdf-hidden">
                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                            {viewMode ? <Eye size={16} aria-hidden="true" /> : <Pencil size={16} aria-hidden="true" />}
                            {viewMode ? "מצב תצוגה — תוכן התוכנית נעול, ניתן לסמן התקדמות" : "מצב עריכה — ניתן לערוך את תוכן התוכנית"}
                        </span>
                        <Button
                            variant={viewMode ? "primary" : "outline"}
                            icon={viewMode ? Pencil : Eye}
                            onClick={() => setViewMode((v) => !v)}
                        >
                            {viewMode ? "מעבר לעריכת התוכנית" : "סיום עריכה וחזרה לתצוגה"}
                        </Button>
                    </div>

                    {/* GENERAL INFO SECTION */}
                    <CollapsibleSection title="פרטי התוכנית" icon={ClipboardList} accent="primary">
                        <fieldset disabled={viewMode} className="border-0 min-w-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                                        <User size={16} aria-hidden="true" />
                                        שם מלא
                                    </label>
                                    <FormSection name="name" rows={1} showLabel={false} placeholder="השם המלא" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                                        <Calendar size={16} aria-hidden="true" />
                                        תחילת התהליך
                                    </label>
                                    <input
                                        type="date"
                                        {...methods.register("startDate")}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-hidden text-sm transition disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                                        <Calendar size={16} aria-hidden="true" />
                                        כתיבת התוכנית
                                    </label>
                                    <input
                                        type="date"
                                        {...methods.register("endDate")}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-hidden text-sm transition disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                                        <Users size={16} aria-hidden="true" />
                                        שותפים
                                    </label>
                                    <FormSection name="partners" rows={1} showLabel={false} placeholder="ניתן לכתוב כאן" />
                                </div>
                            </div>
                        </fieldset>
                    </CollapsibleSection>

                    {/* PAGE 1: PREPARATION */}
                    <CollapsibleSection title="הכנה לתהליך" icon={Rocket} accent="success">
                        <fieldset disabled={viewMode} className="border-0 min-w-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-success text-white p-1.5 rounded-sm">
                                            <CheckCircle2 size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-gray-800">מה הצלחתי עד עכשיו?</label>
                                        <InfoHint text="הישגים, קטנים כגדולים, שכבר קרו בדרך עד כה." />
                                    </div>
                                    <FormSection name="successUntilNow" showLabel={false} rows={4} />
                                </div>
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-info text-white p-1.5 rounded-sm">
                                            <Wrench size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-gray-800">אילו כלים?</label>
                                        <InfoHint text="שיטות, טכניקות או משאבים שכבר נעשה בהם שימוש עד כה." />
                                    </div>
                                    <FormSection name="toolsUsed" showLabel={false} rows={4} />
                                </div>
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-warning text-white p-1.5 rounded-sm">
                                            <Lightbulb size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-gray-800">מה למדתי?</label>
                                        <InfoHint text="תובנות או ידע חדש שנרכשו במהלך התהליך עד כה." />
                                    </div>
                                    <FormSection name="whatILearned" showLabel={false} rows={4} />
                                </div>

                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-primary text-white p-1.5 rounded-sm">
                                            <Target size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-gray-800">מה מסקרן אותי?</label>
                                        <InfoHint text="תחומי עניין, נושאים שמושכים לבדוק או ללמוד עליהם, דברים שיוצרים סקרנות לגבי העתיד." />
                                    </div>
                                    <FormSection name="motivatingFactors" showLabel={false} rows={4} />
                                </div>
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-info text-white p-1.5 rounded-sm">
                                            <Handshake size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-gray-800">מי/מה עוזר?</label>
                                        <InfoHint text="אנשים, קבוצות או גורמים אחרים שתומכים או מסייעים בדרך." />
                                    </div>
                                    <FormSection name="whoHelpsMe" showLabel={false} rows={4} />
                                </div>
                                <div>
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-danger text-white p-1.5 rounded-sm">
                                            <Star size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-gray-800">מה חשוב לי עכשיו?</label>
                                        <InfoHint text="ערכים או עדיפויות שמנחים בשלב הנוכחי." />
                                    </div>
                                    <FormSection name="whatImportantNow" showLabel={false} rows={4} />
                                </div>

                                <div className="lg:col-span-3 bg-gray-100 p-4 rounded-lg">
                                    <div className="flex items-center mb-2 gap-2">
                                        <span className="bg-gray-600 text-white p-1.5 rounded-sm">
                                            <Dumbbell size={14} aria-hidden="true" />
                                        </span>
                                        <label className="font-semibold text-sm text-gray-800">כוחות ומשאבים?</label>
                                        <InfoHint text="תכונות אישיות, יכולות, אנשים או שירותים שיכולים לעזור בדרך." />
                                    </div>
                                    <FormSection name="myStrengths" showLabel={false} rows={3} />
                                </div>
                            </div>
                        </fieldset>
                    </CollapsibleSection>

                    {/* PAGE 2: GOALS */}
                    <CollapsibleSection title="הגדרת המטרות" icon={Target} accent="warning">
                        <fieldset disabled={viewMode} className="border-0 min-w-0">
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <strong className="flex items-center gap-2 text-blue-700 mb-2">
                                    <MapPin size={18} aria-hidden="true" />
                                    מטרה לטווח ארוך
                                    <InfoHint text="מטרה משמעותית שהתהליך של שישה החודשים הקרובים אמור לקדם." />
                                </strong>
                                <FormSection name="longTermGoal" label="הגדרת המטרה:" rows={3} />
                            </div>

                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <strong className="flex items-center gap-2 text-blue-700 mb-2">
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
                                <div className="grid grid-cols-3 gap-4">
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
                                        viewMode={viewMode}
                                        collapsible={false}
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
                                        viewMode={viewMode}
                                        collapsible={false}
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
                                        viewMode={viewMode}
                                        collapsible={false}
                                    />
                                </div>
                            </CollapsibleSection>
                        ) : (
                            <>
                                <div className="mb-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                                    <strong className="flex items-center gap-2 text-green-700">
                                        <Zap size={18} aria-hidden="true" />
                                        מטרות לטווח קצר (6 חודשים)
                                    </strong>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        viewMode={viewMode}
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
                                        viewMode={viewMode}
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
                                        viewMode={viewMode}
                                    />
                                </div>
                            </>
                        )}
                    </CollapsibleSection>

                    {/* ACTION BUTTONS */}
                    <div className="text-center mb-8 pdf-hidden">
                        <div className="flex flex-wrap gap-3 justify-center">
                            <CloudSaveButton getData={getValues} planId={planId} isSaving={isSaving} />
                            <PDFButton targetId="formArea" autoTrigger={autoExport} />
                        </div>
                        {isSaving && (
                            <div className="mt-3">
                                <small className="text-gray-500 flex items-center justify-center gap-2">
                                    <Spinner size={14} />
                                    שמירה...
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};

export default FormPage;
