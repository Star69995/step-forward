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
- רישום והתחברות עם Google או Email+Password (Firebase Auth)
- יצוא ל-PDF מעוצב, כולל תמיכה מלאה ב-RTL ובעברית
- פרופיל משתמש לצפייה, מחיקה ועריכה של תכניות קודמות
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

---

## אבטחה

- כל גישה לנתונים ב-Firestore מוגבלת למשתמש המאומת שהנתונים שייכים לו בלבד — ראו `firestore.rules`.
- הגדרות Firebase נטענות ממשתני סביבה (`.env`, לא נשמר ב-git) — ראו `.env.example`.
- מדיניות אבטחה מלאה לפרויקט מתועדת ב-`CLAUDE.md`.

---

## חוקי פיתוח

חוקי העבודה על קוד הפרויקט (שימוש חוזר ברכיבים, עיצוב אחיד, אבטחה, נגישות ועוד) מתועדים במלואם בקובץ `CLAUDE.md` בשורש הפרויקט. יש לעדכן קובץ זה בהתאם לכל שינוי משמעותי במבנה או בטכנולוגיות הפרויקט.
