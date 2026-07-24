#!/usr/bin/env node

/**
 * TopCinema Batch Import Tester
 * اختبار سريع لميزة الاستيراد الجماعي
 * 
 * الاستخدام:
 * node test-batch-import.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testBatchImport() {
  console.log('🎬 TopCinema Batch Import Tester\n');

  // مثال 1: استيراد أفلام أكشن
  console.log('📌 Test 1: استيراد مجموعة أفلام أكشن');
  console.log('━'.repeat(50));

  try {
    const actionMovies = {
      titles: [
        'The Matrix',
        'John Wick',
        'Mission Impossible',
        'Fast and Furious',
        'Inception'
      ],
      contentType: 'movie',
      categorySlug: 'action',
      limit: 3
    };

    console.log('📤 الإرسال:', JSON.stringify(actionMovies, null, 2));
    console.log('\n⏳ جاري المعالجة...\n');

    const response = await fetch(`${API_URL}/api/admin/import-topcinema`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionMovies)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ النجاح! تم استيراد', result.count, 'عنصر');
      console.log('\n📊 التفاصيل:');
      result.items?.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.title} (${item.type})`);
      });
    } else {
      console.log('❌ خطأ:', result.error);
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
    console.log('\n💡 تأكد من أن الخادم يعمل على:', API_URL);
  }

  console.log('\n' + '━'.repeat(50) + '\n');

  // مثال 2: استيراد مسلسلات دراما
  console.log('📌 Test 2: استيراد مجموعة مسلسلات دراما');
  console.log('━'.repeat(50));

  try {
    const dramaSeries = {
      titles: [
        'Breaking Bad',
        'Better Call Saul',
        'The Crown'
      ],
      contentType: 'series',
      categorySlug: 'drama-series',
      limit: 3
    };

    console.log('📤 الإرسال:', JSON.stringify(dramaSeries, null, 2));
    console.log('\n⏳ جاري المعالجة...\n');

    const response = await fetch(`${API_URL}/api/admin/import-topcinema`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dramaSeries)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ النجاح! تم استيراد', result.count, 'عنصر');
      console.log('\n📊 التفاصيل:');
      result.items?.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.title} (${item.type}) - ${item.totalSeasons} موسم, ${item.totalEpisodes} حلقة`);
      });
    } else {
      console.log('❌ خطأ:', result.error);
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }

  console.log('\n' + '━'.repeat(50) + '\n');
  console.log('✨ انتهى الاختبار!');
}

// تشغيل الاختبارات
testBatchImport().catch(console.error);
