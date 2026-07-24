# 🚀 TopCinema Batch Import - نظام استيراد جماعي متكامل

## 📋 نظرة عامة

نظام متكامل يسمح باستيراد **قوائم كاملة** من الأفلام والمسلسلات والأنمي من TopCinema دفعة واحدة مع لوحة تحكم احترافية.

---

## 🎯 الميزات الرئيسية

### ✅ API قوية
- استيراد قوائم متعددة من الأسماء
- معالجة متتالية وآمنة
- دعم الأفلام والمسلسلات والأنمي
- توافقية تامة مع الطريقة القديمة

### ✅ واجهة Admin Panel
- صفحة استيراد كاملة
- لوحة تحكم متقدمة
- إحصائيات فورية
- سجل العمليات

### ✅ مكونات قابلة لإعادة الاستخدام
- مكون `BatchImportComponent`
- دوال Utility TypeScript
- سهل الدمج في أي صفحة

### ✅ سجلات وإحصائيات
- حفظ السجلات محليًا
- إحصائيات شاملة
- تتبع العمليات

---

## 📁 الملفات والمجلدات

```
sweet-night/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── admin/
│   │   │       └── import-topcinema/
│   │   │           └── route.ts           ← API الرئيسية (معدل)
│   │   └── admin/
│   │       └── batch-import/
│   │           ├── page.tsx               ← صفحة الاستيراد
│   │           └── dashboard/
│   │               └── page.tsx           ← لوحة التحكم
│   ├── components/
│   │   └── BatchImportComponent.tsx       ← مكون قابل لإعادة الاستخدام
│   └── lib/
│       └── topcinema-batch-import.ts      ← دوال Utility
├── scripts/
│   └── test-batch-import.js               ← اختبار من Terminal
├── BATCH_IMPORT_README.md                 ← شرح تفصيلي
├── IMPORT_API_EXAMPLES.md                 ← أمثلة الاستخدام
└── ADMIN_PANEL_FEATURES.md                ← ميزات Admin Panel
```

---

## 🚀 البدء السريع

### 1. الوصول إلى الصفحات

**صفحة الاستيراد:**
```
http://localhost:3000/admin/batch-import
```

**لوحة التحكم:**
```
http://localhost:3000/admin/batch-import/dashboard
```

### 2. استخدام سهل

```
1. اختر نوع المحتوى (أفلام، مسلسلات، أنمي)
2. اختر فئة الوجهة
3. أضف الأسماء (يدويًا أو لصق)
4. اضغط "استيراد الآن"
5. شاهد النتائج!
```

### 3. من الكود

```typescript
import { importBatchFromTopCinema } from '@/lib/topcinema-batch-import'

const result = await importBatchFromTopCinema({
  titles: ['فيلم 1', 'فيلم 2', 'فيلم 3'],
  contentType: 'movie',
  categorySlug: 'action',
  limit: 5
})

console.log(`تم استيراد ${result.count} فيلم`)
```

---

## 📊 أمثلة الاستخدام

### مثال 1: استيراد من React Component

```typescript
import { BatchImportComponent } from '@/components/BatchImportComponent'

export default function MyAdminPage() {
  return (
    <BatchImportComponent
      defaultContentType="movie"
      onImportSuccess={(result) => {
        console.log(`تم استيراد ${result.count} عنصر`)
      }}
    />
  )
}
```

### مثال 2: استيراد من API

```bash
curl -X POST http://localhost:3000/api/admin/import-topcinema \
  -H "Content-Type: application/json" \
  -d '{
    "titles": ["The Matrix", "John Wick", "Inception"],
    "contentType": "movie",
    "categorySlug": "sci-fi",
    "limit": 5
  }'
```

### مثال 3: استيراد مع متابعة التقدم

```typescript
import { importWithProgress } from '@/lib/topcinema-batch-import'

await importWithProgress(
  {
    titles: ['مسلسل 1', 'مسلسل 2'],
    contentType: 'series',
    categorySlug: 'drama-series'
  },
  (progress) => {
    console.log(`تقدم: ${progress.completed}/${progress.total}`)
  }
)
```

---

## 🎨 الواجهات

### صفحة الاستيراد
- ✅ ثلاث أزرار لاختيار النوع
- ✅ قائمة منسدلة للفئات
- ✅ حقل إدخال مع أزرار مساعدة
- ✅ عرض القائمة الحالية
- ✅ عرض النتائج الفورية

### لوحة التحكم
- 📊 4 بطاقات إحصائية
- 📝 جدول السجلات
- 💡 نصائح وإرشادات
- 🗑️ حذف السجلات

---

## 💻 API المعاملات

### Request

```json
{
  "titles": ["اسم 1", "اسم 2", "اسم 3"],
  "contentType": "movie|series|anime",
  "categorySlug": "category-slug",
  "limit": 6
}
```

### Response

```json
{
  "success": true,
  "count": 3,
  "items": [
    {
      "id": "movie_123",
      "title": "اسم الفيلم",
      "type": "movie",
      "seasons": 0,
      "episodes": 0
    }
  ]
}
```

---

## 🧪 الاختبار

### من Terminal

```bash
node scripts/test-batch-import.js
```

### من Postman

```
POST: http://localhost:3000/api/admin/import-topcinema
Headers: Content-Type: application/json
Body: {...}
```

### من المتصفح

```
1. افتح: http://localhost:3000/admin/batch-import
2. أضف الأسماء
3. اضغط "استيراد الآن"
4. شاهد النتائج
```

---

## 🔧 التكوين

### تخصيص الفئات

```typescript
// من صفحة الاستيراد
<select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
  {categories.map(cat => (
    <option key={cat.id} value={cat.slug}>{cat.name}</option>
  ))}
</select>
```

### تخصيص عدد النتائج

```typescript
setLimit(6) // 1-24 نتيجة لكل اسم
```

---

## 📈 الإحصائيات

تُحفظ تلقائيًا في `localStorage`:

```javascript
// الوصول إلى السجلات
const logs = JSON.parse(localStorage.getItem('batch_import_logs'))

// حذف السجلات
localStorage.removeItem('batch_import_logs')
```

---

## ⚠️ الملاحظات المهمة

✅ **التوافقية**: الطرق القديمة لا تزال تعمل  
✅ **الأمان**: معالجة متتالية وآمنة  
✅ **الأداء**: تحسينات في البحث  
⚠️ **الحد الأقصى**: 24 نتيجة لكل اسم  
⚠️ **الوقت**: معالجة قد تستغرق دقائق (حسب عدد الأسماء)  

---

## 🚀 الخطوات التالية

الممكن إضافته مستقبلًا:

- [ ] تصدير النتائج (CSV, PDF)
- [ ] رسوم بيانية متقدمة
- [ ] جدولة استيراد تلقائي
- [ ] إشعارات عند انتهاء الاستيراد
- [ ] نموذج تقدم العملية
- [ ] دعم مصادر استيراد متعددة

---

## 📚 الملفات الإضافية

| ملف | الوصف |
|-----|-------|
| [BATCH_IMPORT_README.md](BATCH_IMPORT_README.md) | شرح الميزة الأساسية |
| [IMPORT_API_EXAMPLES.md](IMPORT_API_EXAMPLES.md) | أمثلة استخدام الـ API |
| [ADMIN_PANEL_FEATURES.md](ADMIN_PANEL_FEATURES.md) | ميزات لوحة التحكم |

---

## ✅ الحالة الحالية

- ✅ API متكاملة
- ✅ صفحة استيراد كاملة
- ✅ لوحة تحكم متقدمة
- ✅ مكون قابل لإعادة الاستخدام
- ✅ دوال Utility
- ✅ توثيق شامل
- ✅ اختبارات جاهزة

**جاهز للإنتاج! 🎉**

---

## 💡 نصائح الاستخدام

1. **للقوائم الكبيرة**: اترك الحد الأقصى للنتائج (6)
2. **للقوائم الصغيرة**: قلل الحد الأقصى لتسريع البحث
3. **للدقة**: استخدم أسماء واضحة وصحيحة
4. **للسرعة**: جمع الأسماء واستيرد دفعة واحدة

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن خطأ:
1. تحقق من السجلات في لوحة التحكم
2. اقرأ الأمثلة في `IMPORT_API_EXAMPLES.md`
3. جرّب من Terminal باستخدام `test-batch-import.js`

---

**آخر تحديث: 2026-07-10** ✨
