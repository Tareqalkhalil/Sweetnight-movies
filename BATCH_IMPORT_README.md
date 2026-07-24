# 🎬 TopCinema Batch Import - تحديث جديد

## ما الجديد؟ ✨

تم تطوير أداة الاستيراد من TopCinema لتدعم **استيراد قوائم متعددة من الأسماء** دفعة واحدة!

### المميزات:
✅ استيراد مئات الأفلام/المسلسلات من قائمة واحدة  
✅ دعم الأفلام والمسلسلات والأنمي  
✅ معالجة آمنة وموثوقة  
✅ تقارير تفصيلية عن كل عملية استيراد  

---

## 📁 الملفات المضافة

### 1. **تحديث API** 
📝 [`src/app/api/admin/import-topcinema/route.ts`](src/app/api/admin/import-topcinema/route.ts)

- إضافة معامل جديد `titles: string[]`
- دعم الاستيراد الفردي والجماعي معاً
- معالجة متتالية وآمنة

### 2. **مثال على الاستخدام**
📚 [`IMPORT_API_EXAMPLES.md`](IMPORT_API_EXAMPLES.md)

أمثلة عملية لكل الحالات الممكنة بـ curl و JavaScript

### 3. **أداة Utility**
🛠️ [`src/lib/topcinema-batch-import.ts`](src/lib/topcinema-batch-import.ts)

دوال مساعدة للاستخدام من Frontend:
- `importBatchFromTopCinema()` - استيراد أساسي
- `importWithProgress()` - استيراد مع متابعة التقدم
- `validateImportOptions()` - التحقق من البيانات
- `parseTextToTitles()` - تحويل النص إلى قائمة
- `formatImportResult()` - تنسيق النتائج

### 4. **اختبار سريع**
🧪 [`scripts/test-batch-import.js`](scripts/test-batch-import.js)

```bash
node scripts/test-batch-import.js
```

---

## 🚀 البدء السريع

### مثال 1: استيراد أفلام أكشن

```javascript
import { importBatchFromTopCinema } from '@/lib/topcinema-batch-import';

const result = await importBatchFromTopCinema({
  titles: [
    'The Matrix',
    'John Wick',
    'Mission Impossible',
    'Fast and Furious'
  ],
  contentType: 'movie',
  categorySlug: 'action',
  limit: 5
});

console.log(`✅ تم استيراد ${result.count} فيلم`);
```

### مثال 2: استيراد مع متابعة التقدم

```javascript
import { importWithProgress } from '@/lib/topcinema-batch-import';

await importWithProgress(
  {
    titles: ['Breaking Bad', 'Better Call Saul', 'The Crown'],
    contentType: 'series',
    categorySlug: 'drama-series'
  },
  (progress) => {
    console.log(`التقدم: ${progress.completed}/${progress.total}`);
    console.log(`الحالة: ${progress.status}`);
  }
);
```

### مثال 3: التحقق من البيانات

```javascript
import { validateImportOptions } from '@/lib/topcinema-batch-import';

const validation = validateImportOptions({
  titles: ['Movie 1', 'Movie 2'],
  contentType: 'movie',
  categorySlug: 'action'
});

if (validation.valid) {
  console.log('✅ البيانات صحيحة');
} else {
  console.error('❌ أخطاء:', validation.errors);
}
```

---

## 📊 مثال على الاستجابة

```json
{
  "success": true,
  "count": 3,
  "items": [
    {
      "id": "movie_123",
      "title": "The Matrix",
      "type": "movie",
      "seasons": 0,
      "episodes": 0
    },
    {
      "id": "series_456",
      "title": "Breaking Bad",
      "type": "series",
      "seasons": 5,
      "episodes": 62
    }
  ],
  "log": [...]
}
```

---

## 🔧 معاملات API

```typescript
{
  // ⭐ الجديد: قائمة الأسماء
  "titles": string[],
  
  // نوع المحتوى
  "contentType": "movie" | "series" | "anime",
  
  // معرّف الفئة
  "categorySlug": string,
  
  // عدد النتائج لكل اسم (اختياري)
  "limit": number,
  
  // الطرق القديمة لا تزال مدعومة
  "query": string,         // بحث واحد
  "url": string,           // رابط مباشر
  "mode": "query|catalog"  // نمط البحث
}
```

---

## ⚙️ كيفية المعالجة

1. **التحقق**: التأكد من أن البيانات صحيحة
2. **البحث**: البحث عن كل اسم على TopCinema
3. **الاستخراج**: استخراج المعلومات (صورة، وصف، إلخ)
4. **الحفظ**: حفظ البيانات في قاعدة البيانات
5. **التقرير**: إرسال نتيجة شاملة

⏱️ **الوقت**: معالجة متتالية وآمنة

---

## 💡 حالات الاستخدام

✅ استيراد مجموعات كبيرة من الأفلام  
✅ ملء فئة جديدة بسرعة  
✅ تحديث المحتوى دورياً  
✅ نقل محتوى من مصادر أخرى  

---

## ⚠️ الملاحظات المهمة

- ✅ الطرق القديمة **لا تزال تعمل** بشكل طبيعي
- ✅ يمكن استخدام `titles` و`query` معاً (سيتم تجاهل `query`)
- ⚠️ كل عنوان سيتم البحث عنه بشكل منفصل
- ⚠️ سيتم استيراد **النتيجة الأولى** من كل بحث
- 🔒 تأكد من وجود `categorySlug` في النظام

---

## 🧪 الاختبار

```bash
# اختبار سريع
node scripts/test-batch-import.js

# مع curl
curl -X POST http://localhost:3000/api/admin/import-topcinema \
  -H "Content-Type: application/json" \
  -d '{
    "titles": ["The Matrix", "John Wick"],
    "contentType": "movie",
    "categorySlug": "action"
  }'
```

---

## 📖 المراجع

- [أمثلة الاستخدام الكاملة](IMPORT_API_EXAMPLES.md)
- [الملف الرئيسي للـ API](src/app/api/admin/import-topcinema/route.ts)
- [دوال المساعدة](src/lib/topcinema-batch-import.ts)

---

## 🎉 تم الإنجاز!

تم تطوير الأداة وإضافة:
- ✅ دعم الاستيراد الجماعي
- ✅ توثيق شامل
- ✅ أداة utility في TypeScript
- ✅ اختبارات جاهزة

**الآن يمكنك استيراد مئات العناصر بسهولة! 🚀**

---

*آخر تحديث: 2026-07-10*
