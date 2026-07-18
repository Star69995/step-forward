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
} from "lucide-react";
import Button from "../components/ui/Button";

const FEATURES = [
    {
        icon: Target,
        title: "תוכנית אישית וברורה",
        description: "הגדרת מטרות לטווח קצר וארוך, יעדים מדידים ולוחות זמנים — הכל במקום אחד, בקצב שלכם.",
    },
    {
        icon: TrendingUp,
        title: "מעקב התקדמות אמיתי",
        description: "סימון יעדים שהושגו, תיעוד הצלחות ולמידה מהדרך — כדי לראות את השינוי ולא רק לדבר עליו.",
    },
    {
        icon: HeartHandshake,
        title: "שיתוף עם מי שמלווה אתכם",
        description: "אפשר לשתף את התוכנית — כולה או חלקים ממנה — עם אנשי מקצוע שמלווים אתכם, ולקבוע בעצמכם מה הם רואים ומה הם יכולים לערוך.",
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

const Landing = () => (
    <div dir="rtl">
        {/* Hero */}
        <div className="text-white bg-linear-to-br from-headerFrom to-headerTo">
            <div className="max-w-5xl mx-auto px-4 py-20 text-center">
                <h1 className="flex items-center justify-center gap-3 text-4xl sm:text-5xl font-bold mb-4">
                    <Footprints size={40} aria-hidden="true" />
                    צעד קדימה
                </h1>
                <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto mb-8">
                    כלי אישי לבניית תוכנית לקידום מטרות, מעקב אחר התקדמות, ושיתוף פעולה עם מי שמלווה אתכם בדרך —
                    בפרטיות ובשליטה מלאה על מה שמשותף.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
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
                </div>
            </div>
        </div>

        {/* How it helps */}
        <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-10">איך זה עוזר בחיים</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-section-gap)]">
                {FEATURES.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="bg-white rounded-2xl shadow-xs p-[var(--space-card-pad)]">
                        <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4">
                            <Icon size={22} aria-hidden="true" />
                        </span>
                        <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Closing CTA */}
        <div className="bg-white border-t border-gray-200 py-12">
            <div className="max-w-2xl mx-auto px-4 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">מוכנים לצעד הראשון?</h2>
                <Link to="/register">
                    <Button variant="primary" size="md" rounded="rounded-xl">
                        הרשמה בחינם
                    </Button>
                </Link>
            </div>
        </div>
    </div>
);

export default Landing;
