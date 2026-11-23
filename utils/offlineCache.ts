import { MushafEdition, getTotalPagesForEdition, convertPageBetweenEditions } from './quranData';

export const MUSHAF_CACHE_NAME = 'awrad-mushaf-offline-v2';
export const QURAN_API_CACHE_NAME = 'awrad-quran-text-offline-v1';
const OFFLINE_INDEX_KEY = 'awrad_offline_cached_pages_v2';
const LEGACY_OFFLINE_INDEX_KEY = 'awrad_offline_cached_pages_v1';

interface CachedPagesIndex {
  madani: number[];
  shamarly: number[];
}

export interface OfflineCacheProgress {
  done: number;
  total: number;
  currentPage: number;
  failedPages: number[];
}

export interface OfflineCacheStats {
  madaniCount: number;
  shamarlyCount: number;
  madaniPages: number[];
  shamarlyPages: number[];
  estimatedMB: string;
}

let legacyCleanupPromise: Promise<void> | null = null;

/**
 * تنظيف الكاش القديم الذي قد يحتوي على روابط Git LFS التالفة (131 بايت)
 */
export function ensureLegacyCacheCleaned(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!legacyCleanupPromise) {
    legacyCleanupPromise = (async () => {
      try {
        if (localStorage.getItem(LEGACY_OFFLINE_INDEX_KEY) !== null) {
          localStorage.removeItem(LEGACY_OFFLINE_INDEX_KEY);
        }
        if ('caches' in window) {
          await Promise.all([
            caches.delete('awrad-mushaf-offline-v1').catch(() => false),
            caches.delete('mushaf-shamarly-pages').catch(() => false),
            caches.delete('mushaf-madani-fallback').catch(() => false),
          ]);
        }
      } catch {
        // ignore cleanup errors
      }
    })();
  }
  return legacyCleanupPromise;
}

export const getPageImageUrls = (page: number, edition: MushafEdition): { primary: string; fallback: string } => {
  if (edition === 'shamarly') {
    return {
      // media.githubusercontent.com يقدّم ملفات Git LFS الفعلية ويدعم CORS كاملاً للتخزين أوفلاين
      primary: `https://media.githubusercontent.com/media/quran8vs/m-qpc-shamarly/main/imgs/${page}.png`,
      fallback: `https://tafsir.app/scans/m-qpc-shamarly/${page}.png`,
    };
  }
  const padded = String(page).padStart(3, '0');
  return {
    primary: `https://files.quran.app/hafs/madani/width_1024/page${padded}.png`,
    // يدعم CORS كاملاً ويعمل كبديل موثوق ومصدر للتخزين المحلي الموثّق
    fallback: `https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master/${padded}.png`,
  };
};

async function isValidImageBlob(blob: Blob): Promise<boolean> {
  // الصفحات الحقيقية للمصحف حجمها لا يقل عن 2 كيلوبايت؛ مؤشرات Git LFS أو صفحات الخطأ النصية أصغر أو غير PNG/JPG/WebP
  if (!blob || blob.size < 2048) return false;
  try {
    const header = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    const isPng =
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47;
    const isJpeg =
      header[0] === 0xff &&
      header[1] === 0xd8 &&
      header[2] === 0xff;
    const isWebp =
      header[0] === 0x52 &&
      header[1] === 0x49 &&
      header[2] === 0x46 &&
      header[3] === 0x46 &&
      header[8] === 0x57 &&
      header[9] === 0x45 &&
      header[10] === 0x42 &&
      header[11] === 0x50;
    return isPng || isJpeg || isWebp;
  } catch {
    return false;
  }
}

function loadIndex(): CachedPagesIndex {
  try {
    const raw = localStorage.getItem(OFFLINE_INDEX_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        madani: Array.isArray(parsed.madani) ? parsed.madani : [],
        shamarly: Array.isArray(parsed.shamarly) ? parsed.shamarly : [],
      };
    }
  } catch {
    // ignore storage read errors
  }
  return { madani: [], shamarly: [] };
}

function saveIndex(index: CachedPagesIndex): void {
  try {
    localStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(index));
  } catch {
    // ignore quota errors
  }
}

function recordCachedPage(page: number, edition: MushafEdition): void {
  const index = loadIndex();
  const list = index[edition];
  if (!list.includes(page)) {
    index[edition] = [...list, page].sort((a, b) => a - b);
    saveIndex(index);
  }
}

function removeCachedPageFromIndex(page: number, edition: MushafEdition): void {
  const index = loadIndex();
  if (index[edition].includes(page)) {
    index[edition] = index[edition].filter((p) => p !== page);
    saveIndex(index);
  }
}

export function isPageCachedSync(page: number, edition: MushafEdition): boolean {
  const index = loadIndex();
  return index[edition].includes(page);
}

export function getOfflineCacheStats(): OfflineCacheStats {
  void ensureLegacyCacheCleaned();
  const index = loadIndex();
  const totalPages = index.madani.length + index.shamarly.length;
  // متوسط حجم الصفحة المخزنة محلياً ~ 150-220 كيلوبايت
  const estimatedMB = (totalPages * 0.18).toFixed(1);
  return {
    madaniCount: index.madani.length,
    shamarlyCount: index.shamarly.length,
    madaniPages: index.madani,
    shamarlyPages: index.shamarly,
    estimatedMB,
  };
}

async function fetchAndValidateCorsImage(
  url: string,
  cache: Cache,
  signal?: AbortSignal
): Promise<boolean> {
  try {
    const corsResponse = await fetch(url, { mode: 'cors', signal });
    if (!corsResponse.ok) return false;
    const blob = await corsResponse.clone().blob();
    if (!(await isValidImageBlob(blob))) {
      return false;
    }
    await cache.put(url, corsResponse);
    return true;
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    return false;
  }
}

export async function invalidateCachedPage(page: number, edition: MushafEdition): Promise<void> {
  removeCachedPageFromIndex(page, edition);
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open(MUSHAF_CACHE_NAME);
    const { primary, fallback } = getPageImageUrls(page, edition);
    await cache.delete(primary);
    await cache.delete(fallback);
  } catch {
    // ignore
  }
}

export async function cacheSinglePage(
  page: number,
  edition: MushafEdition,
  signal?: AbortSignal,
  alsoCacheAyahText = true
): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  await ensureLegacyCacheCleaned();

  const maxP = getTotalPagesForEdition(edition);
  if (page < 1 || page > maxP) return false;

  const cache = await caches.open(MUSHAF_CACHE_NAME);
  const { primary, fallback } = getPageImageUrls(page, edition);

  // تحقق من وجود نسخة صالحة مسبقاً في الكاش قبل التحميل
  for (const candidateUrl of [primary, fallback]) {
    const existing = await cache.match(candidateUrl);
    if (existing && existing.type !== 'opaque') {
      const blob = await existing.clone().blob();
      if (await isValidImageBlob(blob)) {
        recordCachedPage(page, edition);
        return true;
      } else {
        await cache.delete(candidateUrl);
      }
    }
  }

  // تحميل بصيغة CORS لضمان فحص بايتات الصورة (PNG/JPG) وحفظها كـ Blob صالح للعمل 100% أوفلاين
  let ok = await fetchAndValidateCorsImage(primary, cache, signal);
  if (!ok) {
    ok = await fetchAndValidateCorsImage(fallback, cache, signal);
  }

  if (ok) {
    recordCachedPage(page, edition);
  }

  if (alsoCacheAyahText && navigator.onLine) {
    const madaniPage = edition === 'shamarly' ? convertPageBetweenEditions(page, 'shamarly', 'madani') : page;
    try {
      const apiCache = await caches.open(QURAN_API_CACHE_NAME);
      const apiUrl = `https://api.alquran.cloud/v1/page/${madaniPage}/quran-uthmani`;
      const cachedApi = await apiCache.match(apiUrl);
      if (!cachedApi) {
        const res = await fetch(apiUrl, { signal });
        if (res.ok) {
          await apiCache.put(apiUrl, res.clone());
        }
      }
    } catch {
      // ignore non-critical text prefetch error
    }
  }

  return ok;
}

export async function getCachedPageObjectUrl(page: number, edition: MushafEdition): Promise<string | null> {
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  await ensureLegacyCacheCleaned();
  try {
    const cache = await caches.open(MUSHAF_CACHE_NAME);
    const { primary, fallback } = getPageImageUrls(page, edition);

    for (const candidateUrl of [primary, fallback]) {
      const match = await cache.match(candidateUrl);
      if (!match || match.type === 'opaque') continue;
      const blob = await match.blob();
      if (await isValidImageBlob(blob)) {
        return URL.createObjectURL(blob);
      } else {
        // إزالة الملف التالف فوراً حتى لا يظهر أيقونة صورة معطوبة
        await cache.delete(candidateUrl);
        removeCachedPageFromIndex(page, edition);
      }
    }
  } catch {
    // fallback to normal img src
  }
  return null;
}

export async function downloadPageRange(
  pages: number[],
  edition: MushafEdition,
  onProgress?: (progress: OfflineCacheProgress) => void,
  signal?: AbortSignal
): Promise<OfflineCacheProgress> {
  await ensureLegacyCacheCleaned();
  const uniquePages = Array.from(new Set(pages)).filter((p) => p >= 1 && p <= getTotalPagesForEdition(edition));
  const total = uniquePages.length;
  let done = 0;
  const failedPages: number[] = [];

  const concurrency = 4;
  for (let i = 0; i < uniquePages.length; i += concurrency) {
    if (signal?.aborted) break;
    const batch = uniquePages.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (pageNum) => {
        if (signal?.aborted) return;
        try {
          const ok = await cacheSinglePage(pageNum, edition, signal, true);
          if (!ok) failedPages.push(pageNum);
        } catch (err) {
          if ((err as Error)?.name === 'AbortError') return;
          failedPages.push(pageNum);
        } finally {
          done += 1;
          onProgress?.({
            done,
            total,
            currentPage: pageNum,
            failedPages: [...failedPages],
          });
        }
      })
    );
  }

  return {
    done,
    total,
    currentPage: uniquePages[uniquePages.length - 1] || 1,
    failedPages,
  };
}

export async function clearOfflineCache(edition?: MushafEdition): Promise<void> {
  if (typeof window === 'undefined') return;
  await ensureLegacyCacheCleaned();
  const index = loadIndex();

  if (!edition) {
    if ('caches' in window) {
      await caches.delete(MUSHAF_CACHE_NAME);
      await caches.delete(QURAN_API_CACHE_NAME);
    }
    saveIndex({ madani: [], shamarly: [] });
    return;
  }

  if ('caches' in window) {
    const cache = await caches.open(MUSHAF_CACHE_NAME);
    const pagesToRemove = index[edition];
    await Promise.all(
      pagesToRemove.map(async (p) => {
        const { primary, fallback } = getPageImageUrls(p, edition);
        await cache.delete(primary);
        await cache.delete(fallback);
      })
    );
  }
  index[edition] = [];
  saveIndex(index);
}

export async function fetchPageAyahsWithCache(madaniPage: number): Promise<any[] | null> {
  const apiUrl = `https://api.alquran.cloud/v1/page/${madaniPage}/quran-uthmani`;
  try {
    if ('caches' in window) {
      const cache = await caches.open(QURAN_API_CACHE_NAME);
      const cached = await cache.match(apiUrl);
      if (cached) {
        const json = await cached.json();
        if (json?.code === 200 && json?.data?.ayahs) {
          return json.data.ayahs;
        }
      }
      if (navigator.onLine) {
        const res = await fetch(apiUrl);
        if (res.ok) {
          await cache.put(apiUrl, res.clone());
          const json = await res.json();
          if (json?.code === 200 && json?.data?.ayahs) {
            return json.data.ayahs;
          }
        }
      }
    } else if (navigator.onLine) {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json?.code === 200 && json?.data?.ayahs) {
        return json.data.ayahs;
      }
    }
  } catch {
    // ignore fetch error
  }
  return null;
}

export async function fetchAyahTafsirWithCache(surahNumber: number, numberInSurah: number): Promise<string | null> {
  const apiUrl = `https://api.alquran.cloud/v1/ayah/${surahNumber}:${numberInSurah}/ar.muyassar`;
  try {
    if ('caches' in window) {
      const cache = await caches.open(QURAN_API_CACHE_NAME);
      const cached = await cache.match(apiUrl);
      if (cached) {
        const json = await cached.json();
        if (json?.code === 200 && json?.data?.text) {
          return json.data.text;
        }
      }
      if (navigator.onLine) {
        const res = await fetch(apiUrl);
        if (res.ok) {
          await cache.put(apiUrl, res.clone());
          const json = await res.json();
          if (json?.code === 200 && json?.data?.text) {
            return json.data.text;
          }
        }
      }
    } else if (navigator.onLine) {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json?.code === 200 && json?.data?.text) {
        return json.data.text;
      }
    }
  } catch {
    // ignore
  }
  return null;
}
