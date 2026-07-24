import { ContentType, PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌙 Starting Sweet Night seed...')

  // ====== CATEGORIES ======
  const movieCategories = [
    { name: 'Foreign Movies', nameAr: 'أفلام أجنبية', slug: 'foreign-movies', icon: '🌍', color: '#0984e3', type: ContentType.MOVIE, sortOrder: 1 },
    { name: 'Asian Movies', nameAr: 'أفلام آسيوية', slug: 'asian-movies', icon: '🏯', color: '#e17055', type: ContentType.MOVIE, sortOrder: 2 },
    { name: 'Anime', nameAr: 'أنمي', slug: 'anime-movies', icon: '⛩️', color: '#a29bfe', type: ContentType.MOVIE, sortOrder: 3 },
    { name: 'Netflix', nameAr: 'نيتفليكس', slug: 'netflix-movies', icon: '📺', color: '#d63031', type: ContentType.MOVIE, sortOrder: 4 },
  ]

  const seriesCategories = [
    { name: 'Foreign Series', nameAr: 'مسلسلات أجنبية', slug: 'foreign-series', icon: '🌍', color: '#0984e3', type: ContentType.SERIES, sortOrder: 1 },
    { name: 'Netflix Series', nameAr: 'مسلسلات نيتفليكس', slug: 'netflix-series', icon: '📺', color: '#d63031', type: ContentType.SERIES, sortOrder: 2 },
    { name: 'Asian Series', nameAr: 'مسلسلات آسيوية', slug: 'asian-series', icon: '🏯', color: '#e17055', type: ContentType.SERIES, sortOrder: 3 },
  ]

  const animeCategories = [
    { name: 'Anime List', nameAr: 'قائمة الأنمي', slug: 'anime', icon: '⛩️', color: '#a29bfe', type: ContentType.SERIES, sortOrder: 4 },
    { name: 'Netflix Anime', nameAr: 'أنمي نيتفليكس', slug: 'netflix-anime', icon: '📺', color: '#d63031', type: ContentType.SERIES, sortOrder: 5 },
  ]

  const categoriesToSeed = [...movieCategories, ...seriesCategories, ...animeCategories]

  for (const cat of categoriesToSeed) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories seeded')

  // ====== DELETE OLD CATEGORIES ======
  const newSlugs = categoriesToSeed.map(c => c.slug)
  const oldCategories = await prisma.category.findMany()
  for (const cat of oldCategories) {
    if (!newSlugs.includes(cat.slug)) {
      await prisma.movieCategory.deleteMany({ where: { categoryId: cat.id } })
      await prisma.seriesCategory.deleteMany({ where: { categoryId: cat.id } })
      await prisma.category.delete({ where: { id: cat.id } })
    }
  }
  console.log('✅ Old categories deleted')

  // ====== USERS ======
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@sweetnight.com' },
    update: {},
    create: {
      email: 'admin@sweetnight.com',
      username: 'admin',
      name: 'مدير الموقع',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  await prisma.user.upsert({
    where: { email: 'user@sweetnight.com' },
    update: {},
    create: {
      email: 'user@sweetnight.com',
      username: 'user',
      name: 'مستخدم تجريبي',
      password: userPassword,
      role: UserRole.USER,
    },
  })
  console.log('✅ Users seeded')

  // ====== PERSONS (Cast & Directors) ======
  const persons = [
    { name: 'Christopher Nolan', nameAr: 'كريستوفر نولان', slug: 'christopher-nolan', bio: 'British-American film director, producer, and screenwriter', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    { name: 'Leonardo DiCaprio', nameAr: 'ليوناردو دي كابريو', slug: 'leonardo-dicaprio', bio: 'American actor and film producer', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
    { name: 'Cillian Murphy', nameAr: 'سيليان مورفي', slug: 'cillian-murphy', bio: 'Irish actor', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
    { name: 'Zendaya', nameAr: 'زيندايا', slug: 'zendaya', bio: 'American actress and singer', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    { name: 'Timothée Chalamet', nameAr: 'تيموثي شالاميه', slug: 'timothee-chalamet', bio: 'American-French actor', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
    { name: 'Florence Pugh', nameAr: 'فلورنسا بيو', slug: 'florence-pugh', bio: 'English actress', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
    { name: 'Robert Downey Jr.', nameAr: 'روبرت داوني جونيور', slug: 'robert-downey-jr', bio: 'American actor', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    { name: 'Scarlett Johansson', nameAr: 'سكارليت جوهانسون', slug: 'scarlett-johansson', bio: 'American actress', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
    { name: 'Denzel Washington', nameAr: 'دينزل واشنطن', slug: 'denzel-washington', bio: 'American actor', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
    { name: 'Margot Robbie', nameAr: 'مارغوت روبي', slug: 'margot-robbie', bio: 'Australian actress', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    { name: 'Bryan Cranston', nameAr: 'برايان كرانستون', slug: 'bryan-cranston', bio: 'American actor', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
    { name: 'Aaron Paul', nameAr: 'آرون بول', slug: 'aaron-paul', bio: 'American actor', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
    { name: 'Pedro Pascal', nameAr: 'بيدرو باسكال', slug: 'pedro-pascal', bio: 'Chilean-American actor', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    { name: 'Bella Ramsey', nameAr: 'بيلا رامزي', slug: 'bella-ramsey', bio: 'English actor', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
    { name: 'Adam Scott', nameAr: 'آدم سكوت', slug: 'adam-scott', bio: 'American actor', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
    { name: 'Britt Lower', nameAr: 'بريت لور', slug: 'britt-lower', bio: 'American actress', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
  ]

  for (const person of persons) {
    await prisma.person.upsert({
      where: { slug: person.slug },
      update: {},
      create: person,
    })
  }
  console.log('✅ Persons seeded')

  // ====== MOVIES ======
  const movies = [
    {
      title: 'The Dark Knight',
      titleAr: 'الفارس المظلم',
      slug: 'the-dark-knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      descriptionAr: 'عندما يُحدث الجوكر الفوضى والدمار في غوثام، يجب على باتمان أن يواجه أحد أعظم الاختبارات النفسية والجسدية.',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      duration: 152,
      releaseYear: 2008,
      rating: 9.0,
      ageRating: 'PG-13',
      language: 'en',
      quality: '4K',
      views: 1542000,
      isFeatured: true,
      isTrending: true,
      categories: ['action', 'crime', 'drama'],
      cast: [],
      directors: [],
    },
    {
      title: 'Inception',
      titleAr: 'الإبداع',
      slug: 'inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      descriptionAr: 'لص يسرق أسرار الشركات من خلال تقنية مشاركة الأحلام يُكلف بمهمة عكسية: زرع فكرة في عقل رئيس تنفيذي.',
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      duration: 148,
      releaseYear: 2010,
      rating: 8.8,
      ageRating: 'PG-13',
      language: 'en',
      quality: '4K',
      views: 1320000,
      isFeatured: true,
      isTrending: true,
      categories: ['sci-fi', 'action', 'thriller'],
      cast: [],
      directors: [],
    },
    {
      title: 'Interstellar',
      titleAr: ' بين النجوم',
      slug: 'interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      descriptionAr: 'فريق من المستكشفين يسافر عبر ثقب دودي في الفضاء في محاولة لضمان بقاء البشرية.',
      poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=500',
      backdrop: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
      duration: 169,
      releaseYear: 2014,
      rating: 8.7,
      ageRating: 'PG-13',
      language: 'en',
      quality: '4K',
      views: 1180000,
      isFeatured: true,
      isTrending: false,
      categories: ['sci-fi', 'drama', 'adventure'],
      cast: [],
      directors: [],
    },
    {
      title: 'Parasite',
      titleAr: 'طفيلي',
      slug: 'parasite',
      description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      descriptionAr: 'الجشع والتمييز الطبقي يهددان العلاقة التكافلية بين عائلة بارك الثرية وعشيرة كيم الفقيرة.',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      duration: 132,
      releaseYear: 2019,
      rating: 8.5,
      ageRating: 'R',
      language: 'ko',
      quality: '4K',
      views: 980000,
      isFeatured: false,
      isTrending: true,
      categories: ['drama', 'thriller', 'comedy'],
      cast: [],
      directors: [],
    },
    {
      title: 'The Godfather',
      titleAr: 'العراب',
      slug: 'the-godfather',
      description: 'The aging patriarch of an organized crime dynasty in postwar New York City transfers control of his clandestine empire to his reluctant youngest son.',
      descriptionAr: 'رئيس عائلة إجرام منظم في نيويورك بعد الحرب ينقل سيطرة إمبراطوريته السرية إلى ابنه الأصغر المتردد.',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      duration: 175,
      releaseYear: 1972,
      rating: 9.2,
      ageRating: 'R',
      language: 'en',
      quality: 'HD',
      views: 2100000,
      isFeatured: true,
      isTrending: false,
      categories: ['crime', 'drama'],
      cast: [],
      directors: [],
    },
    {
      title: 'Pulp Fiction',
      titleAr: 'الخيال المؤلم',
      slug: 'pulp-fiction',
      description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
      descriptionAr: 'حياة قاتلي مافيا، ملاكم، عصابة وزوجته، وزوج من لصوص مطعم تتشابك في أربع قصص عن العنف والخلاص.',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      duration: 154,
      releaseYear: 1994,
      rating: 8.9,
      ageRating: 'R',
      language: 'en',
      quality: 'HD',
      views: 1850000,
      isFeatured: false,
      isTrending: true,
      categories: ['crime', 'drama'],
      cast: [],
      directors: [],
    },
    {
      title: 'Dune: Part Two',
      titleAr: 'ديون: الجزء الثاني',
      slug: 'dune-part-two',
      description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
      descriptionAr: 'بول أتريديس يتحد مع شاني والفرمن في مسار حربي للانتقام من المتآمرين الذين دمروا عائلته.',
      poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500',
      backdrop: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
      duration: 166,
      releaseYear: 2024,
      rating: 8.5,
      ageRating: 'PG-13',
      language: 'en',
      quality: '4K',
      views: 890000,
      isFeatured: true,
      isTrending: true,
      categories: ['sci-fi', 'adventure', 'action'],
      cast: [
        { slug: 'timothee-chalamet', role: 'Paul Atreides' },
        { slug: 'zendaya', role: 'Chani' },
        { slug: 'florence-pugh', role: 'Princess Irulan' },
      ],
      directors: [],
    },
    {
      title: 'Oppenheimer',
      titleAr: 'أوبنهايمر',
      slug: 'oppenheimer',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      descriptionAr: 'قصة العالم الأمريكي ج. روبرت أوبنهايمر ودوره في تطوير القنبلة الذرية.',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      duration: 180,
      releaseYear: 2023,
      rating: 8.4,
      ageRating: 'R',
      language: 'en',
      quality: '4K',
      views: 1100000,
      isFeatured: true,
      isTrending: false,
      categories: ['biography', 'drama', 'historical'],
      cast: [
        { slug: 'cillian-murphy', role: 'J. Robert Oppenheimer' },
      ],
      directors: [],
    },
    {
      title: 'Superman',
      titleAr: 'سوبرمان',
      slug: 'superman-2025',
      description: 'Superman reconciles his Kryptonian heritage with his human upbringing as Clark Kent of Smallville, Kansas.',
      descriptionAr: 'سوبرمان يوازن بين إرثه الكريبتوني وتربيته البشرية ككلارك كنت.',
      poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cd4?w=500',
      backdrop: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
      duration: 129,
      releaseYear: 2025,
      rating: 7.0,
      ageRating: 'PG-13',
      language: 'en',
      quality: '4K',
      views: 750000,
      isFeatured: true,
      isTrending: true,
      categories: ['action', 'sci-fi', 'adventure'],
      cast: [],
      directors: [],
    },
    {
      title: 'Weapons',
      titleAr: 'أسلحة',
      slug: 'weapons-2025',
      description: 'A small town is thrown into chaos when students begin vanishing without a trace.',
      descriptionAr: 'بلدة صغيرة تُلقى في الفوضى عندما يبدأ الطلاب في الاختفاء دون أثر.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      duration: 128,
      releaseYear: 2025,
      rating: 7.5,
      ageRating: 'R',
      language: 'en',
      quality: 'HD',
      views: 620000,
      isFeatured: false,
      isTrending: true,
      categories: ['horror', 'mystery', 'thriller'],
      cast: [],
      directors: [],
    },
    {
      title: 'Jurassic World: Rebirth',
      titleAr: 'عالم جوراسي: ولادة جديدة',
      slug: 'jurassic-world-rebirth',
      description: 'A new chapter in the Jurassic saga with a fresh cast of characters.',
      descriptionAr: 'فصل جديد في ساغا جوراسي مع مجموعة جديدة من الشخصيات.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
      duration: 133,
      releaseYear: 2025,
      rating: 5.8,
      ageRating: 'PG-13',
      language: 'en',
      quality: '4K',
      views: 540000,
      isFeatured: false,
      isTrending: false,
      categories: ['sci-fi', 'adventure', 'action'],
      cast: [
        { slug: 'scarlett-johansson', role: 'Dr. Zora Bennett' },
      ],
      directors: [],
    },
    {
      title: 'The Shawshank Redemption',
      titleAr: 'الخلاص من شاوشانك',
      slug: 'the-shawshank-redemption',
      description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      descriptionAr: 'رجلان مسجونان يتقاربان على مدى سنوات، ويجدان العزاء والخلاص النهائي من خلال أعمال اللطف.',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      duration: 142,
      releaseYear: 1994,
      rating: 9.3,
      ageRating: 'R',
      language: 'en',
      quality: 'HD',
      views: 2300000,
      isFeatured: true,
      isTrending: false,
      categories: ['drama'],
      cast: [],
      directors: [],
    },
  ]

  for (const movie of movies) {
    const created = await prisma.movie.upsert({
      where: { slug: movie.slug },
      update: {},
      create: {
        title: movie.title,
        titleAr: movie.titleAr,
        slug: movie.slug,
        description: movie.description,
        descriptionAr: movie.descriptionAr,
        poster: movie.poster,
        backdrop: movie.backdrop,
        duration: movie.duration,
        releaseYear: movie.releaseYear,
        rating: movie.rating,
        ageRating: movie.ageRating,
        language: movie.language,
        quality: movie.quality,
        views: movie.views,
        isFeatured: movie.isFeatured,
        isTrending: movie.isTrending,
      },
    })

    // Link categories
    for (const catSlug of movie.categories) {
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } })
      if (cat) {
        await prisma.movieCategory.upsert({
          where: { movieId_categoryId: { movieId: created.id, categoryId: cat.id } },
          update: {},
          create: { movieId: created.id, categoryId: cat.id },
        })
      }
    }
  }
  console.log('✅ Movies seeded')

  // ====== SERIES ======
  const seriesList = [
    {
      title: 'Breaking Bad',
      titleAr: 'بريكينج باد',
      slug: 'breaking-bad',
      description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
      descriptionAr: 'معلم كيمياء في الثانوية مصاب بسرطان رئة لا يمكن علاجه يلجأ إلى تصنيع وبيع الميثامفيتامين لتأمين مستقبل عائلته.',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 5,
      totalEpisodes: 62,
      releaseYear: 2008,
      endYear: 2013,
      rating: 9.5,
      ageRating: 'TV-MA',
      language: 'en',
      quality: '4K',
      views: 2100000,
      isFeatured: true,
      isTrending: true,
      categories: ['drama-series', 'crime-investigation', 'thriller-series'],
      cast: [
        { slug: 'bryan-cranston', role: 'Walter White' },
        { slug: 'aaron-paul', role: 'Jesse Pinkman' },
      ],
      directors: [],
    },
    {
      title: 'Game of Thrones',
      titleAr: 'صراع العروش',
      slug: 'game-of-thrones',
      description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
      descriptionAr: 'تسع عائلات نبيلة تتقاتل للسيطرة على أراضي ويستروس، بينما يعود عدو قديم بعد سبات دام آلاف السنين.',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 8,
      totalEpisodes: 73,
      releaseYear: 2011,
      endYear: 2019,
      rating: 9.3,
      ageRating: 'TV-MA',
      language: 'en',
      quality: '4K',
      views: 2800000,
      isFeatured: true,
      isTrending: false,
      categories: ['fantasy-series', 'drama-series', 'action-series'],
      cast: [],
      directors: [],
    },
    {
      title: 'Stranger Things',
      titleAr: 'أشياء غريبة',
      slug: 'stranger-things',
      description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
      descriptionAr: 'عندما يختفي صبي صغير، يجب على أمه وشرطي وأصدقائه مواجهة قوى خارقة مرعبة لإعادته.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 4,
      totalEpisodes: 34,
      releaseYear: 2016,
      endYear: null,
      rating: 8.7,
      ageRating: 'TV-14',
      language: 'en',
      quality: '4K',
      views: 1950000,
      isFeatured: true,
      isTrending: true,
      categories: ['sci-fi-series', 'drama-series', 'supernatural'],
      cast: [],
      directors: [],
    },
    {
      title: 'The Last of Us',
      titleAr: 'الأخير منا',
      slug: 'the-last-of-us',
      description: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity\'s last hope.',
      descriptionAr: 'بعد جائحة عالمية تدمر الحضارة، يتولى ناجٍ متشدد مسؤولية فتاة تبلغ من العمر 14 عاماً قد تكون آمال البشرية الأخيرة.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 2,
      totalEpisodes: 16,
      releaseYear: 2023,
      endYear: null,
      rating: 8.7,
      ageRating: 'TV-MA',
      language: 'en',
      quality: '4K',
      views: 1200000,
      isFeatured: true,
      isTrending: true,
      categories: ['drama-series', 'sci-fi-series', 'action-series'],
      cast: [
        { slug: 'pedro-pascal', role: 'Joel Miller' },
        { slug: 'bella-ramsey', role: 'Ellie Williams' },
      ],
      directors: [],
    },
    {
      title: 'Severance',
      titleAr: 'الفصل',
      slug: 'severance',
      description: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
      descriptionAr: 'مارك يقود فريقاً من موظفي المكتب الذين تم تقسيم ذكرياتهم جراحياً بين حياتهم العملية والشخصية.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 2,
      totalEpisodes: 18,
      releaseYear: 2022,
      endYear: null,
      rating: 9.0,
      ageRating: 'TV-MA',
      language: 'en',
      quality: '4K',
      views: 980000,
      isFeatured: true,
      isTrending: true,
      categories: ['sci-fi-series', 'drama-series', 'mystery'],
      cast: [
        { slug: 'adam-scott', role: 'Mark Scout' },
        { slug: 'britt-lower', role: 'Helly Riggs' },
      ],
      directors: [],
    },
    {
      title: 'The Bear',
      titleAr: 'الدب',
      slug: 'the-bear',
      description: 'A young chef from the fine dining world returns to Chicago to run his family\'s sandwich shop.',
      descriptionAr: 'شيف شاب من عالم الطهي الراقي يعود إلى شيكاغو لإدارة متجر السندويشات العائلي.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 3,
      totalEpisodes: 28,
      releaseYear: 2022,
      endYear: null,
      rating: 8.8,
      ageRating: 'TV-MA',
      language: 'en',
      quality: '4K',
      views: 850000,
      isFeatured: false,
      isTrending: true,
      categories: ['drama-series', 'comedy-series'],
      cast: [],
      directors: [],
    },
    {
      title: 'Squid Game',
      titleAr: 'لعبة الحبار',
      slug: 'squid-game',
      description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games with deadly high stakes.',
      descriptionAr: 'مئات اللاعبين المحتاجين للمال يقبلون دعوة غريبة للمنافسة في ألعاب أطفال بمخاطر قاتلة.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 2,
      totalEpisodes: 13,
      releaseYear: 2021,
      endYear: null,
      rating: 8.0,
      ageRating: 'TV-MA',
      language: 'ko',
      quality: '4K',
      views: 3200000,
      isFeatured: true,
      isTrending: true,
      categories: ['drama-series', 'thriller-series', 'action-series'],
      cast: [],
      directors: [],
    },
    {
      title: 'Chernobyl',
      titleAr: 'تشيرنوبيل',
      slug: 'chernobyl',
      description: 'In April 1986, an explosion at the Chernobyl nuclear power plant in the Union of Soviet Socialist Republics becomes one of the world\'s worst man-made catastrophes.',
      descriptionAr: 'في أبريل 1986، انفجار في محطة تشيرنوبيل النووية يصبح واحداً من أسوأ الكوارث من صنع الإنسان.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 1,
      totalEpisodes: 5,
      releaseYear: 2019,
      endYear: 2019,
      rating: 9.4,
      ageRating: 'TV-MA',
      language: 'en',
      quality: '4K',
      views: 1500000,
      isFeatured: false,
      isTrending: false,
      categories: ['drama-series', 'historical-series'],
      cast: [],
      directors: [],
    },
    {
      title: 'The Office',
      titleAr: 'المكتب',
      slug: 'the-office',
      description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
      descriptionAr: 'وثائقي ساخر عن مجموعة من عمال المكتب النموذجيين، حيث يتكون يوم العمل من صدامات الأناوات والسلوك غير اللائق والملل.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 9,
      totalEpisodes: 201,
      releaseYear: 2005,
      endYear: 2013,
      rating: 9.0,
      ageRating: 'TV-14',
      language: 'en',
      quality: 'HD',
      views: 1800000,
      isFeatured: false,
      isTrending: true,
      categories: ['sitcom', 'comedy-series'],
      cast: [],
      directors: [],
    },
    {
      title: 'The Pitt',
      titleAr: 'المستشفى',
      slug: 'the-pitt',
      description: 'A realistic look at the challenges facing emergency room doctors in a Pittsburgh hospital.',
      descriptionAr: 'نظرة واقعية على التحديات التي يواجهها أطباء الطوارئ في مستشفى بيتسبرغ.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 1,
      totalEpisodes: 15,
      releaseYear: 2025,
      endYear: null,
      rating: 8.5,
      ageRating: 'TV-MA',
      language: 'en',
      quality: '4K',
      views: 720000,
      isFeatured: false,
      isTrending: true,
      categories: ['medical', 'drama-series'],
      cast: [],
      directors: [],
    },
    {
      title: 'Adolescence',
      titleAr: 'المراهقة',
      slug: 'adolescence',
      description: 'A four-part British limited series about a 13-year-old boy accused of murdering a classmate.',
      descriptionAr: 'مسلسل بريطاني محدود من أربع حلقات عن صبي يبلغ من العمر 13 عاماً متهم بقتل زميل له.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 1,
      totalEpisodes: 4,
      releaseYear: 2025,
      endYear: 2025,
      rating: 8.8,
      ageRating: 'TV-MA',
      language: 'en',
      quality: '4K',
      views: 650000,
      isFeatured: true,
      isTrending: true,
      categories: ['drama-series', 'crime-investigation', 'teen-drama'],
      cast: [],
      directors: [],
    },
    {
      title: 'Andor',
      titleAr: 'أندور',
      slug: 'andor',
      description: 'The story of Cassian Andor\'s journey to discover the difference he can make in the Rebellion.',
      descriptionAr: 'قصة رحلة كاسيان أندور لاكتشاف الفرق الذي يمكنه إحداثه في المتمردين.',
      poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      totalSeasons: 2,
      totalEpisodes: 24,
      releaseYear: 2022,
      endYear: 2025,
      rating: 8.8,
      ageRating: 'TV-MA',
      language: 'en',
      quality: '4K',
      views: 890000,
      isFeatured: false,
      isTrending: false,
      categories: ['sci-fi-series', 'drama-series', 'action-series'],
      cast: [],
      directors: [],
    },
    {
      title: 'Attack on Titan',
      titleAr: 'هجوم العمالقة',
      slug: 'attack-on-titan',
      description: 'Humanity fights for survival against giant humanoid creatures known as Titans.',
      descriptionAr: 'تقاتل البشرية من أجل البقاء ضد مخلوقات عملاقة تُعرف بالعمالقة.',
      poster: 'https://images.unsplash.com/photo-1578632749014-ca77efd052eb?w=500',
      backdrop: 'https://images.unsplash.com/photo-1601987077677-5346c0c57d3f?w=1200',
      totalSeasons: 4,
      totalEpisodes: 94,
      releaseYear: 2013,
      endYear: 2023,
      rating: 9.1,
      ageRating: 'TV-MA',
      language: 'ja',
      quality: '4K',
      views: 3200000,
      isFeatured: true,
      isTrending: true,
      categories: ['anime', 'anime-action', 'anime-drama', 'anime-fantasy'],
      cast: [],
      directors: [],
    },
    {
      title: 'One Piece',
      titleAr: 'وان بيس',
      slug: 'one-piece',
      description: 'A young pirate sets out on an adventure to find the legendary treasure known as One Piece.',
      descriptionAr: 'يبدأ شاب في رحلة بحث عن الكنز الأسطوري المعروف باسم وان بيس.',
      poster: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=500',
      backdrop: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=1200',
      totalSeasons: 11,
      totalEpisodes: 1100,
      releaseYear: 1999,
      endYear: null,
      rating: 8.9,
      ageRating: 'TV-14',
      language: 'ja',
      quality: '4K',
      views: 4100000,
      isFeatured: true,
      isTrending: true,
      categories: ['anime', 'anime-adventure', 'anime-action', 'anime-fantasy'],
      cast: [],
      directors: [],
    },
    {
      title: 'Demon Slayer',
      titleAr: 'قاتل الشياطين',
      slug: 'demon-slayer',
      description: 'A young boy joins the Demon Slayer Corps to avenge his family and cure his sister.',
      descriptionAr: 'ينضم شاب إلى وحدات قاتلي الشياطين لانتقام عائلته وعلاج أخته.',
      poster: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500',
      backdrop: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200',
      totalSeasons: 3,
      totalEpisodes: 44,
      releaseYear: 2019,
      endYear: null,
      rating: 8.8,
      ageRating: 'TV-MA',
      language: 'ja',
      quality: '4K',
      views: 2900000,
      isFeatured: true,
      isTrending: true,
      categories: ['anime', 'anime-action', 'anime-supernatural', 'anime-drama'],
      cast: [],
      directors: [],
    },
    {
      title: 'Spy x Family',
      titleAr: 'سباي إكس فاميلي',
      slug: 'spy-x-family',
      description: 'A spy creates a fake family while hiding his true identity and keeping his daughter safe.',
      descriptionAr: 'يخلق عميل سري عائلة وهمية بينما يخفي هويته الحقيقية ويحمي ابنته.',
      poster: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=500',
      backdrop: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200',
      totalSeasons: 2,
      totalEpisodes: 37,
      releaseYear: 2022,
      endYear: null,
      rating: 8.6,
      ageRating: 'TV-14',
      language: 'ja',
      quality: '4K',
      views: 1800000,
      isFeatured: false,
      isTrending: true,
      categories: ['anime', 'anime-comedy', 'anime-romance', 'anime-slice-of-life'],
      cast: [],
      directors: [],
    },
    {
      title: 'Haikyuu!!',
      titleAr: 'هايكييو!!',
      slug: 'haikyuu',
      description: 'A small boy joins a volleyball club and chases his dream of becoming a great player.',
      descriptionAr: 'يلتحق فتى صغير بنادي كرة طائرة ويطارد حلمه ليصبح لاعباً عظيماً.',
      poster: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500',
      backdrop: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200',
      totalSeasons: 4,
      totalEpisodes: 85,
      releaseYear: 2014,
      endYear: 2020,
      rating: 8.7,
      ageRating: 'TV-14',
      language: 'ja',
      quality: '4K',
      views: 1200000,
      isFeatured: false,
      isTrending: true,
      categories: ['anime', 'anime-sports', 'anime-drama'],
      cast: [],
      directors: [],
    },
  ]

  for (const series of seriesList) {
    const created = await prisma.series.upsert({
      where: { slug: series.slug },
      update: {},
      create: {
        title: series.title,
        titleAr: series.titleAr,
        slug: series.slug,
        description: series.description,
        descriptionAr: series.descriptionAr,
        poster: series.poster,
        backdrop: series.backdrop,
        totalSeasons: series.totalSeasons,
        totalEpisodes: series.totalEpisodes,
        releaseYear: series.releaseYear,
        endYear: series.endYear,
        rating: series.rating,
        ageRating: series.ageRating,
        language: series.language,
        quality: series.quality,
        views: series.views,
        isFeatured: series.isFeatured,
        isTrending: series.isTrending,
      },
    })

    // Link categories
    for (const catSlug of series.categories) {
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } })
      if (cat) {
        await prisma.seriesCategory.upsert({
          where: { seriesId_categoryId: { seriesId: created.id, categoryId: cat.id } },
          update: {},
          create: { seriesId: created.id, categoryId: cat.id },
        })
      }
    }
  }
  console.log('✅ Series seeded')

  // ====== BANNERS ======
  const banners = [
    {
      title: 'عالم السينما في ليلة حلوة',
      subtitle: 'Sweet Night',
      description: 'استمتع بآلاف الأفلام والمسلسلات بجودة عالية وترجمة احترافية',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920',
      sortOrder: 1,
    },
    {
      title: 'Dune: Part Two',
      subtitle: 'الجزء الثاني',
      description: 'مغامرة ملحمية في صحراء أراكيس',
      image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920',
      sortOrder: 2,
    },
    {
      title: 'Breaking Bad',
      subtitle: 'بريكينج باد',
      description: 'أفضل مسلسل درامي في التاريخ',
      image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=1920',
      sortOrder: 3,
    },
  ]

  for (const banner of banners) {
    const existingBanner = await prisma.banner.findFirst({
      where: { title: banner.title },
    })

    if (existingBanner) {
      await prisma.banner.update({
        where: { id: existingBanner.id },
        data: banner,
      })
    } else {
      await prisma.banner.create({
        data: banner,
      })
    }
  }
  console.log('✅ Banners seeded')

  // ====== SITE SETTINGS ======
  const settings = [
    { key: 'site_name', value: 'Sweet Night' },
    { key: 'site_description', value: 'منصة مشاهدة الأفلام والمسلسلات' },
    { key: 'site_logo', value: '/logo.png' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'registration_enabled', value: 'true' },
  ]

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Site settings seeded')

  console.log('\n🌙 Sweet Night seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   • ${movieCategories.length} categories`)
  console.log(`   • ${movies.length} movies`)
  console.log(`   • ${seriesList.length} series`)
  console.log(`   • ${persons.length} persons`)
  console.log(`   • ${banners.length} banners`)
  console.log(`   • 2 users (admin/user)`)
  console.log(`   • ${settings.length} site settings`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
