import React from "react";
import { Link } from "react-router-dom";
import {
    Footprints,
    Target,
    TrendingUp,
    HeartHandshake,
    ShieldCheck,
    MessageSquare,
    ArrowLeft,
    FileText,
    Sparkles,
    ClipboardList,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { usePlans } from "../services/usePlans";
import Button from "../components/ui/Button";

const BEFORE_AFTER = [
    {
        icon: FileText,
        tone: "bg-surface-muted text-muted",
        label: "המצב היום",
        title: "תוכנית שיקום שנכתבת על דף",
        description:
            "אחת לחצי שנה נכתבת תוכנית שיקום על דף. למי שפחות נוח עם נייר קשה לעקוב אחריה, ואי אפשר לעדכן אותה ישירות כשמשהו משתנה בדרך.",
    },
    {
        icon: Sparkles,
        tone: "bg-success/10 text-success",
        label: "עם צעד קדימה",
        title: "תוכנית חיה שמתעדכנת יחד איתכם",
        description:
            "אותה תוכנית הופכת לכלי דיגיטלי אחד, שמקבל/ת השירות ונותני השירות עורכים ומעדכנים יחד לאורך כל הדרך — לא רק פעם בחצי שנה.",
    },
];

const FEATURES = [
    {
        icon: Target,
        title: "תוכנית אישית וברורה",
        description: "הגדרת מטרות לטווח קצר וארוך, יעדים מדידים ולוחות זמנים — הכל במקום אחד, בקצב שלכם.",
    },
    {
        icon: TrendingUp,
        title: "מעקב התקדמות אמיתי",
        description: "סימון משימות שבוצעו, תיעוד הצלחות ולמידה מהדרך — כדי לראות את השינוי ולא רק לדבר עליו.",
    },
    {
        icon: HeartHandshake,
        title: "עריכה משותפת עם מי שמלווה אתכם",
        description: "התוכנית נערכת ומתעדכנת יחד עם אנשי המקצוע שמלווים אתכם, ולא רק על ידם — אפשר לשתף אותה, כולה או חלקים ממנה, ולקבוע בעצמכם מה הם רואים ומה הם יכולים לערוך.",
    },
    {
        icon: MessageSquare,
        title: "הערות ועדכונים לאורך הדרך",
        description: "גם אתם וגם מי שמלווה אתכם יכולים להוסיף הערות מתועדות על ההתקדמות — על התוכנית כולה או על מטרה ספציפית.",
    },
    {
        icon: ShieldCheck,
        title: "פרטיות ושליטה מלאה",
        description: "השיתוף נעשה רק לפי בחירתכם, לפי כתובת מייל מדויקת, וניתן לבטל אותו בכל רגע.",
    },
];

const Landing = () => {
    const { currentUser } = useAuth();
    const { plans } = usePlans(currentUser?.uid);
    // plans is sorted newest-created first (usePlans.js), so the head of the
    // list is exactly "the last plan" from the user's point of view.
    const lastPlan = plans[0];

    const authedCta = lastPlan
        ? { label: "לתוכנית האחרונה שלי", to: `/form?planId=${lastPlan.id}`, state: { planData: lastPlan } }
        : { label: "לתוכניות שלי", to: "/profile" };

    return (
        <div dir="rtl">
            {/* Hero */}
            <div className="text-white bg-linear-to-br from-headerFrom to-headerTo">
                <div className="max-w-5xl mx-auto px-4 py-20 text-center">
                    <h1 className="flex items-center justify-center gap-3 text-4xl sm:text-5xl font-bold mb-4">
                        <Footprints size={40} aria-hidden="true" />
                        צעד קדימה
                    </h1>
                    <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto mb-8">
                        במקום תוכנית שיקום שנכתבת על דף פעם בחצי שנה, צעד קדימה הופך אותה לכלי דיגיטלי חי — כדי לקחת
                        חלק פעיל בתהליך השיקום של עצמכם, יחד עם מי שמלווה אתכם בדרך, בפרטיות ובשליטה מלאה על מה
                        שמשותף.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {currentUser ? (
                            <>
                                <Link to={authedCta.to} state={authedCta.state}>
                                    <Button variant="success" size="md" rounded="rounded-xl" icon={ClipboardList}>
                                        {authedCta.label}
                                    </Button>
                                </Link>
                                {lastPlan && (
                                    <Link to="/profile">
                                        <Button variant="outline" size="md" rounded="rounded-xl" icon={ArrowLeft}>
                                            לכל התוכניות שלי
                                        </Button>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/register">
                                    <Button variant="success" size="md" rounded="rounded-xl">
                                        יצירת תוכנית עכשיו
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="md" rounded="rounded-xl" icon={ArrowLeft}>
                                        כניסה למשתמשים קיימים
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Problem → solution */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-heading text-center mb-10">מדף נייר לכלי חי</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-section-gap)] items-stretch">
                    {BEFORE_AFTER.map(({ icon: Icon, tone, label, title, description }) => (
                        <div key={title} className="bg-surface rounded-2xl shadow-xs p-[var(--space-card-pad)]">
                            <span
                                className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${tone}`}
                            >
                                <Icon size={22} aria-hidden="true" />
                            </span>
                            <p className="text-xs font-bold text-muted mb-1">{label}</p>
                            <h3 className="font-bold text-heading mb-2">{title}</h3>
                            <p className="text-sm text-body leading-relaxed">{description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How it helps */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-heading text-center mb-10">איך זה עוזר בחיים</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-section-gap)]">
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="bg-surface rounded-2xl shadow-xs p-[var(--space-card-pad)]">
                            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4">
                                <Icon size={22} aria-hidden="true" />
                            </span>
                            <h3 className="font-bold text-heading mb-2">{title}</h3>
                            <p className="text-sm text-body leading-relaxed">{description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Closing CTA */}
            <div className="bg-surface border-t border-border py-12">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-heading mb-4">
                        {currentUser ? "ממשיכים מאיפה שעצרתם?" : "מוכנים לצעד הראשון?"}
                    </h2>
                    <div className="flex justify-center">
                        {currentUser ? (
                            <Link to={authedCta.to} state={authedCta.state}>
                                <Button variant="primary" size="md" rounded="rounded-xl" icon={ClipboardList}>
                                    {authedCta.label}
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/register">
                                <Button variant="primary" size="md" rounded="rounded-xl">
                                    הרשמה בחינם
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
