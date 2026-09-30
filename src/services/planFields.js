// Single source for the plan's structured (list-driven) fields — the
// functional assessment, the previous-plan review table and the "next plan
// due" choice. Rendered by FunctionalAssessment.jsx/FormPage.jsx and labeled
// in the version-history diff by planVersions.js, so an item added here
// shows up in both places without a second copy of its label.

// Stored as `assessment.{domain}.{item}` = one of these values ("" = unset).
export const RATING_OPTIONS = [
    { value: "1", label: "1", description: "עצמאות" },
    { value: "2", label: "2", description: "צורך בעידוד" },
    { value: "3", label: "3", description: "צורך בהדרכה" },
    { value: "4", label: "4", description: "מוגבלות בביצוע" },
    { value: "na", label: "לא רלוונטי", description: "לא רלוונטי" },
];

export const ASSESSMENT_DOMAINS = [
    {
        key: "hygiene",
        label: "היגיינה אישית",
        items: [
            { key: "cosmetics", label: "שימוש בתכשירים קוסמטיים" },
            { key: "grooming", label: "רחצה, גילוח ותספורת" },
            { key: "appearance", label: "הקפדה על הופעה מסודרת ונקייה" },
            { key: "clothes", label: "החלפת בגדים לעיתים תכופות" },
        ],
    },
    {
        key: "household",
        label: "אחזקת משק בית",
        items: [
            { key: "cleaning", label: "דאגה לניקיון כללי" },
            { key: "shopping", label: "עריכת קניות" },
            { key: "cooking", label: "הכנת ארוחות" },
            { key: "appliances", label: "שימוש במוצרי חשמל ביתיים (מכונת כביסה וכדומה)" },
        ],
    },
    {
        key: "budget",
        label: "ניהול תקציב",
        items: [
            { key: "moneyMeaning", label: "הבנת המשמעות של כסף" },
            { key: "budgeting", label: "יכולת לנהל תקציב" },
            { key: "bills", label: "תשלום חשבונות" },
            { key: "purchasing", label: "רכישת מוצרים בכמות מתאימה" },
        ],
    },
    {
        key: "employment",
        label: "תפקוד תעסוקתי",
        items: [
            { key: "persistence", label: "התמדה לאורך זמן" },
            { key: "authority", label: "קבלת סמכות" },
            { key: "workHabits", label: "הרגלי עבודה: הגעה בזמן, הודעה על איחור או היעדרות" },
            { key: "motivation", label: "מוטיבציה להתקדם על הרצף התעסוקתי" },
        ],
    },
    {
        key: "social",
        label: "מיומנויות חברתיות",
        items: [
            { key: "initiating", label: "יזימת קשר עם אדם אחר" },
            { key: "maintaining", label: "יכולת לקיים קשר חברתי" },
            { key: "groupActivities", label: "מעורבות בפעילויות קבוצתיות" },
            { key: "mutualHelp", label: "יכולת לעזרה הדדית" },
        ],
    },
    {
        key: "community",
        label: "ניידות והתמצאות בקהילה",
        items: [
            { key: "orientation", label: "התמצאות בקהילה" },
            { key: "neighborhood", label: "התמצאות במקום המגורים" },
            { key: "publicTransport", label: "שימוש בתחבורה ציבורית" },
            { key: "services", label: "היכרות עם שירותי הקהילה" },
        ],
    },
    {
        key: "leisure",
        label: "שעות פנאי",
        items: [
            { key: "hobbies", label: "השתתפות בחוגים בקהילה" },
            { key: "entertainment", label: "בילוי במקומות בילוי (קולנוע, מסעדה)" },
            { key: "currentEvents", label: "התעניינות באקטואליה (טלוויזיה, עיתונים)" },
            { key: "trips", label: "יציאה לטיולים" },
        ],
    },
    {
        key: "medication",
        label: "טיפול תרופתי",
        items: [
            { key: "onTime", label: "נטילת הטיפול בזמן ובמינון הנדרש" },
            { key: "knowsTreatment", label: "היכרות עם הטיפול התרופתי" },
            { key: "awareness", label: "מודעות לחשיבות הטיפול" },
            { key: "sideEffects", label: "היכרות עם תופעות הלוואי של הטיפול" },
            { key: "followUp", label: "הקפדה על מעקב רפואי סדיר" },
        ],
    },
];

// Stored as `review.{row}.self` / `review.{row}.team`.
export const REVIEW_ROWS = [
    { key: "goalsAchieved", label: "האם היעדים הושגו או שהמטרות קודמו בפועל?" },
    { key: "strengths", label: "נקודות לחיזוק ושיפור בתחומי חיים שלא נזכרו בתוכנית" },
    { key: "improvements", label: "נקודות לשיפור" },
];

export const REVIEW_PERSPECTIVES = [
    { key: "self", label: "מנקודת המבט שלי" },
    { key: "team", label: "מנקודת המבט של הצוות" },
];

export const NEXT_PLAN_OPTIONS = [
    { value: "3m", label: "שלושה חודשים" },
    { value: "6m", label: "חצי שנה" },
];

// The plan's fixed short-term goals (`shortGoals.{key}`) and each goal's
// specific targets (`shortGoals.{key}.target{n}`) — read by the linked
// previous-plan summary (LinkedPlanSummary.jsx) to walk a plan's goals.
export const SHORT_GOAL_KEYS = ["one", "two", "three"];
export const TARGET_INDEXES = [1, 2];
