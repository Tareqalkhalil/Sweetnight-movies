/**
 * TopCinema Batch Import Utility
 * دوال مساعدة لاستيراد البيانات بكفاءة من TopCinema
 */

interface ImportOptions {
  titles: string[];
  contentType: 'movie' | 'series' | 'anime';
  categorySlug: string;
  limit?: number;
}

interface ImportResponse {
  success: boolean;
  count: number;
  items: Array<{
    id: string;
    title: string;
    type: string;
    seasons: number;
    episodes: number;
  }>;
}

interface ImportProgress {
  total: number;
  completed: number;
  current: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

/**
 * استيراد قائمة من الأسماء من TopCinema
 * @param options خيارات الاستيراد
 * @returns النتيجة أو الخطأ
 */
export async function importBatchFromTopCinema(options: ImportOptions): Promise<ImportResponse> {
  const { titles, contentType, categorySlug, limit = 6 } = options;

  if (!titles || titles.length === 0) {
    throw new Error('يجب توفير قائمة بالأسماء (titles)');
  }

  if (!contentType || !['movie', 'series', 'anime'].includes(contentType)) {
    throw new Error('نوع المحتوى غير صحيح (movie, series, anime)');
  }

  if (!categorySlug) {
    throw new Error('يجب تحديد فئة الوجهة (categorySlug)');
  }

  try {
    const response = await fetch('/api/admin/import-topcinema', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titles: titles.filter((t) => t && t.trim()),
        contentType,
        categorySlug,
        limit: Math.max(1, Math.min(limit, 24)),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل الاستيراد');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`خطأ الاستيراد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * استيراد مع متابعة التقدم
 * @param options خيارات الاستيراد
 * @param onProgress دالة للتحديث عن التقدم
 * @returns النتيجة النهائية
 */
export async function importWithProgress(
  options: ImportOptions,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResponse> {
  const { titles } = options;

  const progress: ImportProgress = {
    total: titles.length,
    completed: 0,
    current: '',
    status: 'pending',
  };

  try {
    progress.status = 'running';
    onProgress?.(progress);

    const result = await importBatchFromTopCinema(options);

    progress.status = 'completed';
    progress.completed = titles.length;
    onProgress?.(progress);

    return result;
  } catch (error) {
    progress.status = 'error';
    progress.error = error instanceof Error ? error.message : 'خطأ غير معروف';
    onProgress?.(progress);
    throw error;
  }
}

/**
 * التحقق من صحة خيارات الاستيراد
 */
export function validateImportOptions(options: Partial<ImportOptions>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.titles || !Array.isArray(options.titles) || options.titles.length === 0) {
    errors.push('قائمة الأسماء مفقودة أو فارغة');
  }

  if (!options.contentType || !['movie', 'series', 'anime'].includes(options.contentType)) {
    errors.push('نوع المحتوى غير صحيح');
  }

  if (!options.categorySlug) {
    errors.push('فئة الوجهة مفقودة');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * تحويل نص بسيط إلى قائمة أسماء
 * (كل سطر = اسم واحد)
 */
export function parseTextToTitles(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * تنسيق النتيجة لعرضها للمستخدم
 */
export function formatImportResult(result: ImportResponse): string {
  if (!result.success) {
    return '❌ فشل الاستيراد';
  }

  let formatted = `✅ تم الاستيراد بنجاح!\n`;
  formatted += `📊 عدد العناصر: ${result.count}\n\n`;

  result.items.forEach((item, idx) => {
    formatted += `${idx + 1}. ${item.title}\n`;
    formatted += `   نوع: ${item.type}\n`;

    if (item.seasons > 0) {
      formatted += `   مواسم: ${item.seasons}, حلقات: ${item.episodes}\n`;
    }
  });

  return formatted;
}

/**
 * مثال على الاستخدام من React Component
 */
export const ExampleReactComponent = `
import { importBatchFromTopCinema, ImportOptions } from '@/lib/topcinema-batch-import';
import { useState } from 'react';

export default function BatchImportForm() {
  const [titles, setTitles] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const options: ImportOptions = {
        titles: titles.split('\\n').filter(t => t.trim()),
        contentType: 'movie',
        categorySlug: 'action'
      };

      const result = await importBatchFromTopCinema(options);
      setResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleImport}>
      <textarea
        value={titles}
        onChange={(e) => setTitles(e.target.value)}
        placeholder="أدخل الأسماء (اسم واحد لكل سطر)"
      />
      <button disabled={loading}>
        {loading ? 'جاري...' : 'استيراد'}
      </button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  );
}
`;
