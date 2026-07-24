export type Locale = "ar" | "en"

export const defaultLocale: Locale = "ar"

export function getLocaleFromCookie(cookieHeader?: string | null): Locale {
  const resolvedCookieHeader = cookieHeader ?? null

  if (!resolvedCookieHeader) return defaultLocale

  const match = resolvedCookieHeader.match(/(?:^|; )locale=(ar|en)(?:;|$)/)
  return match?.[1] === "en" ? "en" : "ar"
}

export function getClientLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale

  const match = document.cookie.match(/(?:^|; )locale=(ar|en)(?:;|$)/)
  return match?.[1] === "en" ? "en" : "ar"
}

export function getDirection(locale: Locale) {
  return locale === "en" ? "ltr" : "rtl"
}

export function getLocalizedText(locale: Locale, arabicText?: string | null, englishText?: string | null) {
  if (locale === "en") {
    return englishText || arabicText || ""
  }
  return arabicText || englishText || ""
}

export const dictionaries = {
  ar: {
    navbar: {
      home: "الرئيسية",
      movies: "أفلام",
      series: "مسلسلات",
      anime: "الأنمي",
      categories: "الأقسام",
      favorites: "المفضلة",
      login: "تسجيل الدخول",
      searchPlaceholder: "ابحث عن فيلم أو مسلسل أو أنمي...",
      mobileSearchPlaceholder: "ابحث عن أي محتوى...",
      language: "العربية",
      switchToEnglish: "Switch to English",
    },
    hero: {
      trending: "الأكثر مشاهدة",
      watchNow: "مشاهدة الآن",
      watchlist: "قائمة المشاهدة",
    },
    categories: {
      movies: "الأفلام",
      series: "المسلسلات",
      viewAll: "عرض الكل",
      all: "الكل",
      movieCategories: "أقسام الأفلام",
      seriesCategories: "أقسام المسلسلات",
    },
    cards: {
      seasons: (count: number) => (count === 1 ? "موسم" : "مواسم"),
      episodes: (count: number) => (count === 1 ? "حلقة" : "حلقة"),
      seasonLabel: "موسم",
      episodesLabel: "حلقة",
      watch: "مشاهدة",
      favorite: "المفضلة",
      share: "مشاركة",
      viewDetails: "عرض التفاصيل",
    },
    footer: {
      categoriesTitle: "الأقسام",
      supportTitle: "الدعم",
      contactTitle: "تواصل معنا",
      description: "وجهتك الأولى لمشاهدة الأفلام والمسلسلات بجودة عالية وترجمة احترافية. استمتع بتجربة سينمائية فريدة.",
      links: {
        actionMovies: "أفلام أكشن",
        dramaSeries: "مسلسلات دراما",
        comedyMovies: "أفلام كوميدية",
        horrorMovies: "أفلام رعب",
        anime: "أنمي",
        helpCenter: "مركز المساعدة",
        faq: "الأسئلة الشائعة",
        terms: "الشروط والأحكام",
        privacy: "سياسة الخصوصية",
      },
      rights: "جميع الحقوق محفوظة.",
    },
    pages: {
      anime: {
        title: "قسم الأنمي",
        subtitle: "اكتشف عالم الأنمي بأجمل الأنواع والقصص المميزة",
        categoriesTitle: "أقسام الأنمي",
        featuredTitle: "أبرز الأنمي",
        latestTitle: "أحدث الأنمي",
        bannerTitle: "انطلق مع أحدث الأنمي",
        bannerText: "اكتشف العناوين الحديثة والأكثر شعبية في عالم الأنمي بأقوى القصص والبطولات.",
        bannerCta: "شاهد الآن",
        viewAll: "عرض الكل",
      },
      categories: {
        title: "جميع الأقسام",
        subtitle: "تصفح الأفلام والمسلسلات حسب القسم المفضل لديك",
      },
      movies: {
        title: "جميع الأفلام",
        subtitle: "اكتشف مجموعتنا الواسعة من الأفلام بجميع الأقسام",
      },
      series: {
        title: "جميع المسلسلات",
        subtitle: "اكتشف مجموعتنا الواسعة من المسلسلات بجميع الأقسام",
      },
      favorites: {
        title: "قائمة المفضلة",
        subtitle: "الأفلام والمسلسلات التي أضفتها إلى مفضلتك",
        emptyTitle: "قائمة المفضلة فارغة",
        emptyText: "ابدأ بإضافة الأفلام والمسلسلات المفضلة لديك بالضغط على زر القلب في أي عمل",
      },
      login: {
        title: "تسجيل الدخول إلى حسابك",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        rememberMe: "تذكرني",
        forgotPassword: "نسيت كلمة المرور؟",
        submit: "تسجيل الدخول",
        noAccount: "ليس لديك حساب؟",
        createAccount: "إنشاء حساب جديد",
        demo: "بيانات تجريبية:",
        admin: "Admin:",
        user: "User:",
      },
      detail: {
        watchNow: "مشاهدة الآن",
        favorite: "المفضلة",
        share: "مشاركة",
        cast: "طاقم التمثيل",
        seasons: "المواسم والحلقات",
        noEpisodes: "لا توجد حلقات متاحة حالياً",
        noSeasons: "لا توجد مواسم متاحة حالياً",
        noContent: "لا توجد محتويات حالياً",
        noContentText: "سيتم إضافة محتويات جديدة قريباً في هذا القسم",
      },
      notFound: {
        title: "الصفحة غير موجودة",
        text: "يبدو أنك ضعت في عالم السينما! الصفحة التي تبحث عنها غير متوفرة.",
        home: "العودة للرئيسية",
        browseMovies: "تصفح الأفلام",
      },
    },
  },
  en: {
    navbar: {
      home: "Home",
      movies: "Movies",
      series: "Series",
      anime: "Anime",
      categories: "Categories",
      favorites: "Favorites",
      login: "Login",
      searchPlaceholder: "Search for a movie, series, or anime...",
      mobileSearchPlaceholder: "Search anything...",
      language: "English",
      switchToEnglish: "Switch to Arabic",
    },
    hero: {
      trending: "Trending Now",
      watchNow: "Watch Now",
      watchlist: "Watchlist",
    },
    categories: {
      movies: "Movies",
      series: "Series",
      viewAll: "View all",
      all: "All",
      movieCategories: "Movie Categories",
      seriesCategories: "Series Categories",
    },
    cards: {
      seasons: (count: number) => (count === 1 ? "season" : "seasons"),
      episodes: (count: number) => (count === 1 ? "episode" : "episodes"),
      seasonLabel: "Season",
      episodesLabel: "Episode",
      watch: "Watch",
      favorite: "Favorite",
      share: "Share",
      viewDetails: "View details",
    },
    footer: {
      categoriesTitle: "Categories",
      supportTitle: "Support",
      contactTitle: "Contact us",
      description: "Your first destination for watching movies and series in high quality with professional subtitles. Enjoy a unique cinematic experience.",
      links: {
        actionMovies: "Action Movies",
        dramaSeries: "Drama Series",
        comedyMovies: "Comedy Movies",
        horrorMovies: "Horror Movies",
        anime: "Anime",
        helpCenter: "Help Center",
        faq: "FAQ",
        terms: "Terms & Conditions",
        privacy: "Privacy Policy",
      },
      rights: "All rights reserved.",
    },
    pages: {
      anime: {
        title: "Anime Section",
        subtitle: "Discover the world of anime through its most exciting genres and stories",
        categoriesTitle: "Anime Categories",
        featuredTitle: "Featured Anime",
        latestTitle: "Latest Anime",
        bannerTitle: "Step into the newest anime",
        bannerText: "Discover the latest and most popular anime titles with unforgettable stories and bold characters.",
        bannerCta: "Watch now",
        viewAll: "View all",
      },
      categories: {
        title: "All Categories",
        subtitle: "Browse movies and series by your favorite category",
      },
      movies: {
        title: "All Movies",
        subtitle: "Discover our wide collection of movies across all categories",
      },
      series: {
        title: "All Series",
        subtitle: "Discover our wide collection of series across all categories",
      },
      favorites: {
        title: "Favorites",
        subtitle: "Movies and series you added to your favorites",
        emptyTitle: "Your favorites list is empty",
        emptyText: "Start adding your favorite movies and series by tapping the heart button on any title",
      },
      login: {
        title: "Sign in to your account",
        email: "Email",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        submit: "Login",
        noAccount: "Don't have an account?",
        createAccount: "Create an account",
        demo: "Demo credentials:",
        admin: "Admin:",
        user: "User:",
      },
      detail: {
        watchNow: "Watch now",
        favorite: "Favorite",
        share: "Share",
        cast: "Cast",
        seasons: "Seasons & Episodes",
        noEpisodes: "No episodes available yet",
        noSeasons: "No seasons available yet",
        noContent: "No content available yet",
        noContentText: "New content will be added soon in this section",
      },
      notFound: {
        title: "Page not found",
        text: "It looks like you wandered into the movie world! The page you are looking for is unavailable.",
        home: "Back to home",
        browseMovies: "Browse movies",
      },
    },
  },
} as const

export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}
