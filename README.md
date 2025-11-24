# 🌟 צעד קדימה – תוכנית לקידום מטרות

מערכת אינטראקטיבית למילוי, שמירה וייצוא תכנית אישית לקידום מטרות,  
מבוססת על קובץ ה‑PDF המקורי של "צעד קדימה" מטעם שירות לשיקום האסיר.

---

## 🚀 תכולת הפרויקט

- טופס מלא למילוי כל שדות התכנית, כולל:
  - שאלות רפלקציה (הצלחות, למידה, משאבים)
  - הגדרת מטרות לטווח ארוך וקצר
  - יעדים ותאריכי סיום
- שמירה אוטומטית וידנית בענן (Firestore)
- רישום והתחברות עם Google או Email+Password (Firebase Auth)
- יצוא ל‑PDF מעוצב, כולל תמיכה מלאה ב‑RTL ובעברית
- פרופיל משתמש לצפייה, מחיקה ועריכה של תכניות קודמות

---

## 🏗️ טכנולוגיות

| תחום           | כלים                                                        |
| -------------- | ----------------------------------------------------------- |
| Front‑End      | [React + Vite](https://vitejs.dev/)                         |
| UI Framework   | [Bootstrap 5](https://getbootstrap.com/)                    |
| State & Forms  | [react‑hook‑form](https://react-hook-form.com/)             |
| Routing        | [react‑router‑dom](https://reactrouter.com/)                |
| Authentication | [Firebase Auth](https://firebase.google.com/docs/auth)      |
| Database       | [Firestore](https://firebase.google.com/docs/firestore)     |
| PDF Export     | [html2pdf.js](https://www.npmjs.com/package/html2pdf.js)    |
| Notifications  | [react‑toastify](https://fkhadra.github.io/react-toastify/) |
| Icons          | [Bootstrap Icons](https://icons.getbootstrap.com/)          |

---

## ⚙️ התקנה והרצה מקומית

### דרישות מקדימות

- Node.js v16+
- חשבון Firebase עם פרויקט פעיל (חינם)

### שלבים

```bash
# 1️⃣  יצירת הפרויקט
npm create vite@latest beyond-borders -- --template react
cd beyond-borders

# 2️⃣  התקנת ספריות
npm install firebase react-hook-form react-router-dom bootstrap html2pdf.js uuid react-toastify bootstrap-icons

# 3️⃣  העתק את קבצי הקוד מהמאגר / מתיקיית src שלך

# 4️⃣  הפעלת סביבה מקומית
npm run dev
```
