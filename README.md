# צעד קדימה – תוכנית לקידום מטרות

מערכת אינטראקטיבית למילוי, שמירה וייצוא תכנית אישית לקידום מטרות,
מבוססת על קובץ ה-PDF המקורי של "צעד קדימה" מטעם שירות לשיקום האסיר.

---

## תכולת הפרויקט

- טופס מלא למילוי כל שדות התכנית, כולל:
  - שאלות רפלקציה (הצלחות, למידה, משאבים)
  - הגדרת מטרות לטווח ארוך וקצר
  - יעדים ותאריכי סיום
- שמירה אוטומטית וידנית בענן (Firestore)
- רישום והתחברות עם Google או Email+Password (Firebase Auth), עם בחירת סוג משתמש בהרשמה — מקבל/ת שירות או נותן/ת שירות
- שיתוף תוכניות (כולן או נבחרות) עם נותני שירות שמורים לפי כתובת מייל מדויקת, עם קביעת הרשאת צפייה או צפייה+עריכה שניתן לבטל בכל רגע
- מעבר מהיר של נותן שירות בין מקבלי השירות ששיתפו איתו, וצפייה/עריכה בתוכניות שלהם לפי ההרשאה שהוגדרה
- יומן הערות ועדכוני התקדמות מתועד ומיוחס לכותב, על התוכנית כולה או על מטרה קצרת-טווח ספציפית
- יצוא ל-PDF מעוצב, כולל תמיכה מלאה ב-RTL ובעברית
- פרופיל משתמש לצפייה, מחיקה ועריכה של תכניות קודמות
- דף נחיתה שיווקי בעמוד הבית, המסביר את התועלת של הכלי
- תמיכה מלאה במסכי מובייל וטאבלט (רספונסיבי)
- אפליקציית PWA (ניתנת להתקנה, עובדת גם במצב לא מקוון חלקי)

---

## טכנולוגיות

| תחום           | כלים                                                          |
| -------------- | -------------------------------------------------------------- |
| Front-End      | [React + Vite](https://vitejs.dev/)                             |
| עיצוב          | [Tailwind CSS v4](https://tailwindcss.com/) — מקור עיצוב יחיד, ראו בלוק `@theme` ב-`src/index.css` |
| אייקונים       | [lucide-react](https://lucide.dev/) — ללא אמוג'ים בממשק         |
| State & Forms  | [react-hook-form](https://react-hook-form.com/)                |
| Routing        | [react-router-dom](https://reactrouter.com/)                    |
| Authentication | [Firebase Auth](https://firebase.google.com/docs/auth)          |
| Database       | [Firestore](https://firebase.google.com/docs/firestore)         |
| PDF Export     | [html2pdf.js](https://www.npmjs.com/package/html2pdf.js)         |
| Notifications  | [react-toastify](https://fkhadra.github.io/react-toastify/)     |
| PWA            | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — manifest + service worker; אייקוני האתר (favicon/PWA/maskable/apple-touch-icon) נוצרים מ-`public/favicon.svg` ע"י [@vite-pwa/assets-generator](https://www.npmjs.com/package/@vite-pwa/assets-generator) |

---

## התקנה והרצה מקומית

### דרישות מקדימות

- Node.js v22.12+ (מומלץ Node 24 LTS)
- חשבון Firebase עם פרויקט פעיל (חינם)

### שלבים

```bash
# 1. שכפול הפרויקט והתקנת ספריות
git clone <repo-url>
cd step-forward
npm install

# 2. הגדרת משתני סביבה
# יש להעתיק את .env.example ל-.env ולמלא את הערכים מהגדרות
# הפרויקט ב-Firebase Console (Project settings > General > Your apps)
cp .env.example .env

# 3. הפעלת סביבה מקומית
npm run dev
```

### פקודות זמינות

| פקודה             | תיאור                                  |
| ----------------- | ---------------------------------------- |
| `npm run dev`      | הרצת סביבת פיתוח מקומית                 |
| `npm run build`    | בנייה לפרודקשן (לתיקיית `dist`)          |
| `npm run preview`  | הרצת גרסת ה-build לצורך בדיקה מקומית     |
| `npm run lint`     | הרצת בדיקת lint על כל הקוד               |
| `npm run pwa:assets` | יצירה מחדש של כל אייקוני ה-PWA (favicon/PWA/maskable/apple-touch-icon) מתוך `public/favicon.svg` — יש להריץ אחרי כל שינוי בקובץ ה-SVG |
| `npm run deploy`   | בנייה ופריסה ל-Firebase Hosting (production) |
| `npm run deploy:preview` | בנייה ופריסה לערוץ preview זמני בשם `preview` ב-Firebase Hosting (להריץ עם שם ערוץ אחר: `npm run deploy:preview -- <שם-ערוץ>`) |
| `npm run emulators` | הרצת אמולטורים מקומיים ל-Auth+Firestore (ראו סעיף הבא) |
| `npm run dev:emulator` | הרצת סביבת הפיתוח מול האמולטורים המקומיים במקום פרויקט Firebase האמיתי |
| `npm run verify:rules` | הרצת בדיקה אוטומטית של `firestore.rules` מול האמולטורים (דורש שהאמולטורים כבר רצים) |
| `npm run emulators:recover` | שחזור נתוני אמולטור שנתקעו בתיקייה זמנית `firebase-export-*` בגלל כשל `EPERM` בסגירה (ראו סעיף הבא) |

---

## פיתוח ובדיקה מול אמולטורים מקומיים

כדי לבדוק שיתוף/הרשאות/הערות מקצה לקצה בלי לגעת בנתוני האמת ובלי לפרוס `firestore.rules` לפרויקט האמיתי, ניתן להריץ הכל מול ה-[Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite):

```bash
# טרמינל 1 — אמולטורי Auth+Firestore, על סמך firestore.rules/firestore.indexes.json המקומיים
npm run emulators

# טרמינל 2 — סביבת הפיתוח, מוגדרת לדבר עם האמולטורים דרך .env.emulator
npm run dev:emulator
```

- ממשק האמולטורים (יצירת/עריכת משתמשי בדיקה, צפייה בנתוני Firestore, אימות מייל ידני) זמין ב-`http://127.0.0.1:4000`.
- נתוני האמולטור (Firestore+Auth) נשמרים בין הרצות בתיקייה `./.firebase-emulator-data` (לא ב-git, ראו `.gitignore`) — `npm run emulators` מייבא/מייצא ממנה.
- **תקלה ידועה בווינדוס:** ל-`firebase-tools` יש באג פתוח וידוע ([#3092](https://github.com/firebase/firebase-tools/issues/3092)) שגורם לפעמים לכשל `EPERM: operation not permitted, rename ...` בסגירת האמולטור, לפני שהוא מספיק להחליף את `./.firebase-emulator-data` בייצוא העדכני — תקלה סביב וינדוס בלבד ב-`firebase-tools` עצמו, לא בהגדרות הפרויקט. במקרה כזה הנתונים לא אבודים: הם נשארים שלמים בתיקייה זמנית בשם `firebase-export-<מזהה>` בשורש הפרויקט. הרצת `npm run emulators:recover` (`scripts/recover-emulator-export.mjs`) מאתרת אותה ומעבירה את הנתונים בחזרה ל-`./.firebase-emulator-data` אוטומטית.
- ההרשמה דורשת מייל מאומת לפני שניתן לשתף (ראו CLAUDE.md) — באמולטור אפשר לאשר מייל ידנית דרך לשונית Authentication ב-`http://127.0.0.1:4000`, בלי לשלוח מייל אמיתי.
- `npm run verify:rules` (`scripts/verify-firestore-rules.mjs`) מריץ סוללת בדיקות אוטומטית מול האמולטורים: הרשמה, שיתוף לפי מייל, הרשאת צפייה/עריכה, הערות, וביטול שיתוף מיידי — כולל השאילתה שה-`ProviderSwitcher` תלוי בה. יש להריץ אותו אחרי כל שינוי ב-`firestore.rules`.
- אין להריץ סקריפט זה או `dev:emulator` מול פרויקט Firebase אמיתי — הוא יוצר ומוחק משתמשי בדיקה בחופשיות.

---

## אבטחה

- כל גישה לנתונים ב-Firestore מוגבלת למשתמש המאומת שהנתונים שייכים לו, ולנותני שירות עם שיתוף פעיל בהרשאה המתאימה — ראו `firestore.rules`.
- שיתוף בין משתמשים נעשה רק לפי כתובת מייל מדויקת (מאומתת), בלי אפשרות חיפוש/דירקטורי משתמשים.
- הגדרות Firebase נטענות ממשתני סביבה (`.env`, לא נשמר ב-git) — ראו `.env.example`.
- מדיניות אבטחה מלאה לפרויקט, כולל מודל השיתוף וההרשאות, מתועדת ב-`CLAUDE.md`.

---

## חוקי פיתוח

חוקי העבודה על קוד הפרויקט (שימוש חוזר ברכיבים, עיצוב אחיד, אבטחה, נגישות ועוד) מתועדים במלואם בקובץ `CLAUDE.md` בשורש הפרויקט. יש לעדכן קובץ זה בהתאם לכל שינוי משמעותי במבנה או בטכנולוגיות הפרויקט.
