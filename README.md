# 🌙 Sweet Night

منصة مشاهدة الأفلام والمسلسلات المبنية بـ Next.js + Prisma + SQLite

## 🚀 التشغيل السريع

```bash
# 1. تثبيت الحزم
npm install

# 2. توليد Prisma Client
npx prisma generate

# 3. إنشاء قاعدة البيانات
npx prisma migrate dev --name init

# 4. ملء البيانات التجريبية
npx tsx scripts/seed.ts

# 5. تشغيل المشروع
npm run dev
```

افتح المتصفح على: **http://localhost:3000**

## 📂 هيكل المشروع

```
sweet-night/
├── prisma/
│   └── schema.prisma       # قاعدة البيانات
├── scripts/
│   └── seed.ts             # بيانات تجريبية
├── src/
│   ├── app/                # صفحات Next.js
│   │   ├── page.tsx          # الصفحة الرئيسية
│   │   ├── layout.tsx        # التخطيط العام
│   │   ├── movies/           # صفحة الأفلام
│   │   ├── series/           # صفحة المسلسلات
│   │   ├── categories/       # صفحة الأقسام
│   │   ├── movie/[slug]/     # تفاصيل الفيلم
│   │   ├── serie/[slug]/     # تفاصيل المسلسل
│   │   ├── login/            # تسجيل الدخول
│   │   └── api/              # API Routes
│   ├── components/           # المكونات
│   ├── lib/                  # المكتبات
│   └── types/                # الأنواع
└── package.json
```

## 🎨 الأقسام المتاحة

### 🎬 أفلام (20 قسم)
أكشن، كوميدي، دراما، رعب، غموض وإثارة، خيال علمي، رومانسي، مغامرة، فانتازيا، حروب، جريمة، رسوم متحركة، تاريخي، موسيقي، وثائقي، عائلي، إثارة، غربي، رياضي، سيرة ذاتية

### 📺 مسلسلات (20 قسم)
دراما، كوميدي، جريمة وتحقيق، خيال علمي، إثارة وتشويق، رومانسي، تاريخي، خارق للطبيعة، سيت كوم، طبي، واقعي، أنمي، دراما كورية، دراما تركية، دراما عربية، أكشن، فانتازيا، وثائقي، حروب، دراما مراهقة

## 🔑 بيانات تسجيل الدخول

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| Admin | admin@sweetnight.com | admin123 |
| User | user@sweetnight.com | user123 |

## 📊 قاعدة البيانات

| الجدول | الوصف |
|--------|-------|
| User | المستخدمين |
| Category | الأقسام |
| Movie | الأفلام |
| Series | المسلسلات |
| Season | المواسم |
| Episode | الحلقات |
| Person | الممثلين والمخرجين |
| WatchlistItem | قائمة المشاهدة |
| Favorite | المفضلة |
| Review | المراجعات |
| Rating | التقييمات |
| WatchHistory | سجل المشاهدة |
| Banner | البانرات |

## 🛠️ الأوامر المتاحة

```bash
npm run dev              # تشغيل التطوير
npm run build            # بناء الإنتاج
npm run db:generate      # توليد Prisma Client
npm run db:migrate       # هجرة قاعدة البيانات
npm run db:seed          # ملء البيانات
npm run db:studio        # Prisma Studio
npm run db:reset         # إعادة تعيين كامل
```

## 📝 ملاحظات

- قاعدة البيانات SQLite محلية في `prisma/dev.db`
- التصميم يدعم RTL بالكامل
- يدعم الوضع الداكن
- متجاوب مع جميع الأحجام
