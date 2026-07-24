# TopCinema Import API - أمثلة الاستخدام

## المميزات الجديدة ✨

API تحديث يدعم الآن استيراد **قوائم متعددة من الأسماء** دفعة واحدة!

---

## 1️⃣ الاستيراد الفردي (الطريقة القديمة)

```bash
curl -X POST http://localhost:3000/api/admin/import-topcinema \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Avengers",
    "contentType": "movie",
    "categorySlug": "action",
    "limit": 6
  }'
```

---

## 2️⃣ الاستيراد الجماعي (الجديد) ⭐

استيراد **مجموعة أفلام أكشن** دفعة واحدة:

```bash
curl -X POST http://localhost:3000/api/admin/import-topcinema \
  -H "Content-Type: application/json" \
  -d '{
    "titles": [
      "The Matrix",
      "John Wick",
      "Mission Impossible",
      "Fast and Furious",
      "Inception",
      "Interstellar"
    ],
    "contentType": "movie",
    "categorySlug": "action",
    "limit": 6
  }'
```

---

### مثال: استيراد مسلسلات دراما

```bash
curl -X POST http://localhost:3000/api/admin/import-topcinema \
  -H "Content-Type: application/json" \
  -d '{
    "titles": [
      "Breaking Bad",
      "Better Call Saul",
      "The Crown",
      "Succession",
      "Chernobyl"
    ],
    "contentType": "series",
    "categorySlug": "drama-series",
    "limit": 6
  }'
```

---

### مثال: استيراد أنمي

```bash
curl -X POST http://localhost:3000/api/admin/import-topcinema \
  -H "Content-Type: application/json" \
  -d '{
    "titles": [
      "Attack on Titan",
      "Death Note",
      "Demon Slayer",
      "Jujutsu Kaisen",
      "Naruto"
    ],
    "contentType": "anime",
    "categorySlug": "anime",
    "limit": 6
  }'
```

---

## 📋 معاملات API

| المعامل | النوع | الإجباري | الوصف |
|--------|------|--------|-------|
| `titles` | `string[]` | ❌ | قائمة أسماء الأفلام/المسلسلات للاستيراد |
| `query` | `string` | ❌ | بحث واحد (للاستيراد الفردي) |
| `contentType` | `string` | ✅ | `movie`, `series`, أو `anime` |
| `categorySlug` | `string` | ✅ | معرّف الفئة (مثل: `action`, `drama-series`) |
| `limit` | `number` | ❌ | عدد النتائج لكل عنوان (افتراضي: 6) |
| `url` | `string` | ❌ | رابط مباشر من TopCinema |
| `mode` | `string` | ❌ | `query` أو `catalog` |

---

## ✅ الاستجابة

```json
{
  "success": true,
  "count": 3,
  "items": [
    {
      "id": "movie_1",
      "title": "The Matrix",
      "type": "movie",
      "seasons": 0,
      "episodes": 0
    },
    {
      "id": "series_1",
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

## 🔄 كيفية العمل

1. **تحديد القائمة**: أرسل array من الأسماء في `titles`
2. **البحث**: API يبحث عن كل اسم على TopCinema
3. **الاستيراد**: يتم إضافة النتائج الأولى لكل بحث
4. **الحفظ**: كل العناصر تُحفظ في قاعدة البيانات

⏱️ **الوقت**: العملية متتالية (آمنة وموثوقة)

---

## ⚠️ ملاحظات مهمة

- استخدم `contentType` صحيح لكل قائمة
- تأكد من وجود `categorySlug` في النظام
- كل عنوان سيتم البحث عنه بشكل منفصل
- النتيجة الأولى من كل بحث تُستورد

---

## 🚀 مثال عملي (JavaScript)

```javascript
async function importBatchMovies() {
  const response = await fetch('/api/admin/import-topcinema', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titles: [
        'Dune',
        'Avatar',
        'Blade Runner',
        'The Revenant',
        'Gladiator'
      ],
      contentType: 'movie',
      categorySlug: 'sci-fi',
      limit: 5
    })
  });

  const data = await response.json();
  console.log(`تم استيراد ${data.count} فيلم`);
  return data;
}
```

---

📌 **تم التحديث في**: 2026-07-10
