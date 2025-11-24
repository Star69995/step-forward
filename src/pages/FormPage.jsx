import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import FormSection from "../components/FormSection";
import PDFButton from "../components/PDFButton";
import CloudSaveButton from "../components/CloudSaveButton";
import { savePlan } from "../services/savePlan";
import { useLocation } from "react-router-dom";
import GoalSection from "../components/GoalSection";
import { loadPlan } from "../services/loadPlan";

const FormPage = () => {
    const { currentUser } = useAuth();
    const methods = useForm();
    const { watch, setValue } = methods;
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const planParamId = queryParams.get("planId");

    const [planId, setPlanId] = useState(planParamId || "defaultPlan");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load saved data
    useEffect(() => {
        const fetchSavedPlan = async () => {
            setIsLoading(true);
            if (currentUser && planId) {
                const data = await loadPlan(currentUser.uid, planId);
                if (data) {
                    Object.entries(data).forEach(([key, value]) => {
                        if (value !== undefined) {
                            setValue(key, value);
                        }
                    });
                    console.log("✅ Loaded saved plan:", planId);
                }
            }
            setIsLoading(false);
        };

        fetchSavedPlan();
    }, [currentUser, planId, setValue]);

    // Auto-save on input change
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (currentUser) {
                setIsSaving(true);
                await savePlan(currentUser.uid, watch(), planId);
                setIsSaving(false);
            }
        }, 2000);
        return () => clearTimeout(delay);
    }, [watch(), currentUser, planId]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div dir="rtl" id="formArea">
                {/* ======= HEADER ======= */}
                <div className="bg-gradient text-white py-5 mb-5 shadow-sm" style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                }}>
                    <div className="container">
                        <h1 className="mb-2 fw-bold display-5">
                            🌟 צעד קדימה
                        </h1>
                        <p className="lead mb-0 opacity-90">
                            תוכנית אישית לקידום מטרות לשישה חודשים הקרובים
                        </p>
                    </div>
                </div>

                <div className="container">
                    {/* ======= GENERAL INFO SECTION ======= */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-primary bg-opacity-10 border-bottom border-primary border-2">
                            <h5 className="mb-0 text-primary fw-bold">
                                📋 פרטי התוכנית
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6 col-lg-3">
                                    <label className="form-label fw-semibold text-dark">
                                        👤 שם מלא
                                    </label>
                                    <FormSection name="name" rows={1} showLabel={false} />
                                </div>
                                <div className="col-md-6 col-lg-3">
                                    <label className="form-label fw-semibold text-dark">
                                        📅 תאריך תחילת התהליך
                                    </label>
                                    <input
                                        type="date"
                                        {...methods.register("startDate")}
                                        className="form-control"
                                    />
                                </div>
                                <div className="col-md-6 col-lg-3">
                                    <label className="form-label fw-semibold text-dark">
                                        📝 תאריך כתיבת התוכנית
                                    </label>
                                    <input
                                        type="date"
                                        {...methods.register("endDate")}
                                        className="form-control"
                                    />
                                </div>
                                <div className="col-md-6 col-lg-3">
                                    <label className="form-label fw-semibold text-dark">
                                        👥 שותפים לכתיבה
                                    </label>
                                    <FormSection name="partners" rows={1} showLabel={false} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ======= PAGE 1: PREPARATION ======= */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-success bg-opacity-10 border-bottom border-success border-2">
                            <h5 className="mb-0 text-success fw-bold">
                                🚀 הכנה לתהליך
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-4">
                                <div className="col-md-6 col-lg-4">
                                    <div className="h-100">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="badge bg-success me-2">✅</span>
                                            <label className="form-label fw-semibold mb-0">
                                                מה הצלחתי עד עכשיו?
                                            </label>
                                        </div>
                                        <FormSection
                                            name="successUntilNow"
                                            showLabel={false}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <div className="h-100">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="badge bg-info me-2">🛠️</span>
                                            <label className="form-label fw-semibold mb-0">
                                                אילו כלים ותרגולים עשיתי?
                                            </label>
                                        </div>
                                        <FormSection
                                            name="toolsUsed"
                                            showLabel={false}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <div className="h-100">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="badge bg-warning me-2">💡</span>
                                            <label className="form-label fw-semibold mb-0">
                                                מה למדתי על עצמי?
                                            </label>
                                        </div>
                                        <FormSection
                                            name="whatILearned"
                                            showLabel={false}
                                            rows={4}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6 col-lg-4">
                                    <div className="h-100">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="badge bg-primary me-2">🎯</span>
                                            <label className="form-label fw-semibold mb-0">
                                                מה מסקרן אותי להמשיך?
                                            </label>
                                        </div>
                                        <FormSection
                                            name="motivatingFactors"
                                            showLabel={false}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <div className="h-100">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="badge bg-info me-2">🤝</span>
                                            <label className="form-label fw-semibold mb-0">
                                                מי/מה עוזר לי כרגע?
                                            </label>
                                        </div>
                                        <FormSection
                                            name="whoHelpsMe"
                                            showLabel={false}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <div className="h-100">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="badge bg-danger me-2">⭐</span>
                                            <label className="form-label fw-semibold mb-0">
                                                מה הכי חשוב לי עכשיו?
                                            </label>
                                        </div>
                                        <FormSection
                                            name="whatImportantNow"
                                            showLabel={false}
                                            rows={4}
                                        />
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="bg-light p-3 rounded-2 border border-secondary border-opacity-25">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="badge bg-secondary me-2">💪</span>
                                            <label className="form-label fw-semibold mb-0">
                                                עם אילו כוחות ומשאבים אני יוצא לדרך?
                                            </label>
                                        </div>
                                        <FormSection
                                            name="myStrengths"
                                            showLabel={false}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ======= PAGE 2: GOALS ======= */}
                    <div className="card border-0 shadow-sm mb-5">
                        <div className="card-header bg-warning bg-opacity-10 border-bottom border-warning border-2">
                            <h5 className="mb-0 text-warning fw-bold">
                                🎯 הגדרת המטרות
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* Long-term Goal */}
                            <div className="mb-4">
                                <div className="alert alert-info border-0 mb-3" role="alert">
                                    <strong>📍 מטרה לטווח ארוך</strong>
                                </div>
                                <FormSection
                                    name="longTermGoal"
                                    label="הגדר את המטרה שלך לטווח ארוך:"
                                    rows={3}
                                />
                            </div>

                            {/* Future Vision */}
                            <div className="mb-4">
                                <div className="alert alert-info border-0 mb-3" role="alert">
                                    <strong>🔮 מטרה-על (תמונת עתיד)</strong>
                                </div>
                                <FormSection
                                    name="futureVision"
                                    label="תאר את התמונה שלך בעתיד:"
                                    rows={3}
                                />
                            </div>

                            {/* Short-term Goals */}
                            <div className="mb-3">
                                <div className="alert alert-success border-0 mb-3" role="alert">
                                    <strong>⚡ מטרות לטווח קצר (6 חודשים)</strong>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6 col-lg-4">
                                    <GoalSection
                                        title="🥇 מטרה קצרת טווח #1"
                                        baseName="shortGoals.one"
                                        index={1}
                                        badgeColor="primary"
                                    />
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <GoalSection
                                        title="🥈 מטרה קצרת טווח #2"
                                        baseName="shortGoals.two"
                                        index={2}
                                        badgeColor="info"
                                    />
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <GoalSection
                                        title="🥉 מטרה קצרת טווח #3"
                                        baseName="shortGoals.three"
                                        index={3}
                                        badgeColor="success"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ======= ACTION BUTTONS ======= */}
                    <div className="text-center mb-5 pdf-hidden">
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            <CloudSaveButton
                                data={watch()}
                                planId={planId}
                                setPlanId={setPlanId}
                                isSaving={isSaving}
                            />
                            <PDFButton targetId="formArea" />
                        </div>
                        {isSaving && (
                            <div className="mt-2">
                                <small className="text-muted">
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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