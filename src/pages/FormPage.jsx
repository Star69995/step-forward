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
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin">
                    <span className="text-4xl">⏳</span>
                </div>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div dir="rtl" id="formArea" className="min-h-screen pt-8 pb-8">
                {/* HEADER */}
                <div
                    className="text-white py-12 mb-8 shadow-sm"
                    style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    }}
                >
                    <div className="max-w-6xl mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-2">🌟 צעד קדימה</h1>
                        <p className="text-lg opacity-90">
                            תוכנית אישית לקידום מטרות לשישה חודשים הקרובים
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4">
                    {/* GENERAL INFO SECTION */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <h5 className="text-lg font-bold text-blue-600 mb-4">📋 פרטי התוכנית</h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">👤 שם מלא</label>
                                <FormSection name="name" rows={1} showLabel={false} placeholder="השם שלך" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">📅 תחילת התהליך</label>
                                <input
                                    type="date"
                                    {...methods.register("startDate")}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">📝 כתיבת התוכנית</label>
                                <input
                                    type="date"
                                    {...methods.register("endDate")}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">👥 שותפים</label>
                                <FormSection name="partners" rows={1} showLabel={false} placeholder="כתוב את המחשבות שלך כאן..." />
                            </div>
                        </div>
                    </div>

                    {/* PAGE 1: PREPARATION */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <h5 className="text-lg font-bold text-green-600 mb-4">🚀 הכנה לתהליך</h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <div className="flex items-center mb-2 gap-2">
                                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">✅</span>
                                    <label className="font-semibold text-sm text-gray-800">מה הצלחתי עד עכשיו?</label>
                                </div>
                                <FormSection name="successUntilNow" showLabel={false} rows={4} />
                            </div>
                            <div>
                                <div className="flex items-center mb-2 gap-2">
                                    <span className="bg-cyan-500 text-white px-2 py-1 rounded text-xs">🛠️</span>
                                    <label className="font-semibold text-sm text-gray-800">אילו כלים?</label>
                                </div>
                                <FormSection name="toolsUsed" showLabel={false} rows={4} />
                            </div>
                            <div>
                                <div className="flex items-center mb-2 gap-2">
                                    <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">💡</span>
                                    <label className="font-semibold text-sm text-gray-800">מה למדתי?</label>
                                </div>
                                <FormSection name="whatILearned" showLabel={false} rows={4} />
                            </div>

                            <div>
                                <div className="flex items-center mb-2 gap-2">
                                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">🎯</span>
                                    <label className="font-semibold text-sm text-gray-800">מה מסקרן אותי?</label>
                                </div>
                                <FormSection name="motivatingFactors" showLabel={false} rows={4} />
                            </div>
                            <div>
                                <div className="flex items-center mb-2 gap-2">
                                    <span className="bg-cyan-500 text-white px-2 py-1 rounded text-xs">🤝</span>
                                    <label className="font-semibold text-sm text-gray-800">מי/מה עוזר?</label>
                                </div>
                                <FormSection name="whoHelpsMe" showLabel={false} rows={4} />
                            </div>
                            <div>
                                <div className="flex items-center mb-2 gap-2">
                                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">⭐</span>
                                    <label className="font-semibold text-sm text-gray-800">חשוב לי עכשיו?</label>
                                </div>
                                <FormSection name="whatImportantNow" showLabel={false} rows={4} />
                            </div>

                            <div className="lg:col-span-3 bg-gray-100 p-4 rounded-lg">
                                <div className="flex items-center mb-2 gap-2">
                                    <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs">💪</span>
                                    <label className="font-semibold text-sm text-gray-800">כוחות ומשאבים?</label>
                                </div>
                                <FormSection name="myStrengths" showLabel={false} rows={3} />
                            </div>
                        </div>
                    </div>

                    {/* PAGE 2: GOALS */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <h5 className="text-lg font-bold text-yellow-600 mb-4">🎯 הגדרת המטרות</h5>

                        {/* Long-term Goal */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <strong className="block text-blue-700 mb-2">📍 מטרה לטווח ארוך</strong>
                            <FormSection name="longTermGoal" label="הגדר את המטרה:" rows={3} />
                        </div>

                        {/* Future Vision */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <strong className="block text-blue-700 mb-2">🔮 מטרה-על (תמונת עתיד)</strong>
                            <FormSection name="futureVision" label="תאר את התמונה:" rows={3} />
                        </div>

                        {/* Short-term Goals */}
                        <div className="mb-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <strong className="block text-green-700">⚡ מטרות לטווח קצר (6 חודשים)</strong>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <GoalSection
                                title="🥇 מטרה קצרת טווח #1"
                                baseName="shortGoals.one"
                                index={1}
                                badgeColor="primary"
                            />
                            <GoalSection
                                title="🥈 מטרה קצרת טווח #2"
                                baseName="shortGoals.two"
                                index={2}
                                badgeColor="info"
                            />
                            <GoalSection
                                title="🥉 מטרה קצרת טווח #3"
                                baseName="shortGoals.three"
                                index={3}
                                badgeColor="success"
                            />
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="text-center mb-8 pdf-hidden">
                        <div className="flex flex-wrap gap-3 justify-center">
                            <CloudSaveButton
                                data={watch()}
                                planId={planId}
                                setPlanId={setPlanId}
                                isSaving={isSaving}
                            />
                            <PDFButton targetId="formArea" />
                        </div>
                        {isSaving && (
                            <div className="mt-3">
                                <small className="text-gray-500 flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
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