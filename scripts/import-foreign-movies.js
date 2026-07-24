const movies = [
  "Obsession (2025)",
  "The Magic Faraway Tree (2026)",
  "Pitfall (2025)",
  "Dead Man's Wire (2026)",
  "The Invite (2026)",
  "California Schemin (2025)",
  "Black Box (2026)",
  "Supergirl (2026)",
  "Nothing to Lose (2026)",
  "The Death of Robin Hood (2026)",
  "The Furious (2025)",
  "Passenger (2026)",
  "Worth the Wait (2025)",
  "Jacked (2025)",
  "Bad Man (2025)",
  "Man of War (2026)",
  "Giant (2025)",
  "40 Dates and 40 Nights (2026)",
  "Kafir: The Spirit Gate (2026)",
  "A Different Man (2024)",
  "Enola Holmes 3 (2026)",
  "The Devil Wears Prada (2006)",
  "The Devil Wears Prada 2 (2026)",
  "The Get Out (2026)",
  "Bare Skin (2026)",
  "Killhouse (2026)",
  "Unconnected (2026)",
  "Homage (2026)",
  "Finding Emily (2026)",
  "Gangland (2025)",
  "This Tempting Madness (2025)",
  "Torrente for President (2026)",
  "Strung (2026)",
  "Scary Movie (2026)",
  "Masters of the Universe (2026)",
  "Hold the Fort (2025)",
  "Backrooms (2026)",
  "Savage House (2026)",
  "Beast (2026)",
  "Little Brother (2026)",
  "Flavia (2026)",
  "They Will Kill You (2026)",
  "How to Make a Killing (2026)",
  "Toy Story 5 (2026)",
  "Hungry (2026)",
  "The Sheep Detectives (2026)",
  "In the Hand of Dante (2025)",
  "Tuner (2025)",
  "The Love Heist (2026)",
  "Power Ballad (2026)",
  "I Love Boosters (2026)",
  "Hitman: The Slaughter (2025)",
  "Carolina Caroline (2025)",
  "Blue Heron (2025)",
  "Hair of the Bear (2025)",
  "Star Wars: The Mandalorian and Grogu (2026)",
  "The Voices of Our Mother (2026)",
  "Citizen Vigilante (2026)",
  "Voicemails for Isabelle (2026)",
  "The Super Mario Galaxy Movie (2026)",
  "Extreme Makeover: Homer Edition (2026)",
  "Disclosure Day (2026)",
  "Busboys (2026)",
  "Greenland 2: Migration (2026)",
  "The Rip (2026)",
  "Captain America: Brave New World (2025)",
  "Troll 2 (2025)",
  "The Family Plan 2 (2025)",
  "Nobody 2 (2025)",
  "The Fantastic Four: First Steps (2025)",
  "Venom: The Last Dance (2024)",
  "Superman (2025)",
  "Avatar: Fire and Ash (2025)",
  "The Housemaid (2025)",
  "Shelter (2026)",
  "Balls Up (2026)",
  "Peaky Blinders: The Immortal Man (2026)",
  "Anaconda (2025)",
  "The Strangers: Chapter 3 (2026)",
  "Mercy (2026)",
  "The Wrecking Crew (2026)",
  "IRaH (2024)",
  "She Said Maybe (2025)",
  "Dirty Hands (2026)"
];

async function importForeignMovies() {
  const baseUrl = process.env.API_URL || "http://localhost:3002";

  console.log("🎬 بدء استيراد الأفلام الأجنبية...");
  console.log(`📊 عدد الأفلام: ${movies.length}`);
  console.log(`🔗 الرابط: ${baseUrl}`);
  console.log("═".repeat(70));

  try {
    const payload = {
      titles: movies,
      contentType: "movie",
      categorySlug: "foreign-movies",
      isBatchImport: true,
      limit: 10,
    };

    console.log("\n📤 إرسال الطلب...");
    const response = await fetch(`${baseUrl}/api/admin/import-topcinema`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ خطأ في الاستيراد:");
      console.error("Status:", response.status);
      console.error("Response:", JSON.stringify(responseData, null, 2));
      return;
    }

    console.log("\n✅ تم الاستيراد بنجاح!\n");
    console.log("📊 النتائج:");
    console.log(`   • عدد الأفلام المستوردة: ${responseData.count}`);
    console.log(`   • الفئة: Foreign Movies`);
    console.log(`   • نوع المحتوى: أفلام فقط`);
    console.log(`   • الحالة: ${responseData.success ? '✅ نجح' : '❌ فشل'}`);

    if (responseData.items && responseData.items.length > 0) {
      console.log("\n📝 قائمة الأفلام المستوردة:");
      responseData.items.slice(0, 20).forEach((item, index) => {
        console.log(
          `   ${index + 1}. ${item.title || 'بدون اسم'} ${item.releaseYear ? `(${item.releaseYear})` : ""}`
        );
      });
      if (responseData.items.length > 20) {
        console.log(`   ... و ${responseData.items.length - 20} أفلام أخرى`);
      }
    }

    console.log("\n" + "═".repeat(70));
    console.log("🎉 اكتمل الاستيراد!");
  } catch (error) {
    console.error("❌ خطأ في الاتصال:");
    console.error(error.message);
    console.log("\n💡 تأكد من:");
    console.log("   1. أن الخادم يعمل (npm run dev)");
    console.log("   2. أن الرابط صحيح: http://localhost:3002");
  }
}

importForeignMovies();
