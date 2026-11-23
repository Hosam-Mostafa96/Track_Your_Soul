import { MushafEdition, getTotalPagesForEdition, convertPageBetweenEditions } from './quranData';

export const MUSHAF_CACHE_NAME = 'awrad-mushaf-offline-v1';
export const QURAN_API_CACHE_NAME = 'awrad-quran-text-offline-v1';
const OFFLINE_INDEX_KEY = 'awrad_offline_cached_pages_v1';

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

export const getPageImageUrls = (page: number, edition: MushafEdition): { primary: string; fallback: string } => {
  if (edition === 'shamarly') {
    return {
      primary: `https://cdn.jsdelivr.net/gh/quran8vs/m-qpc-shamarly@main/imgs/${page}.png`,
      fallback: `https://tafsir.app/scans/m-qpc-shamarly/${page}.png`,
    };
  }
  const padded = String(page).padStart(3, '0');
  return {
    primary: `https://files.quran.app/hafs/madani/width_1024/page${padded}.png`,
    fallback: `https://quran.ksu.edu.sa/ayat/safahat/${page}.png`,
  };
};

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

export function isPageCachedSync(page: number, edition: MushafEdition): boolean {
  const index = loadIndex();
  return index[edition].includes(page);
}

export function getOfflineCacheStats(): OfflineCacheStats {
  const index = loadIndex();
  const totalPages = index.madani.length + index.shamarly.length;
  // Average Mushaf PNG page ~ 150 KB
  const estimatedMB = ((totalPages * 0.15)).toFixed(1);
  return {
    madaniCount: index.madani.length,
    shamarlyCount: index.shamarly.length,
    madaniPages: index.madani,
    shamarlyPages: index.shamarly,
    estimatedMB,
  };
}

async function fetchAndStoreImage(url: string, cache: Cache, signal?: AbortSignal): Promise<boolean> {
  try {
    const corsResponse = await fetch(url, { mode: 'cors', signal });
    if (corsResponse.ok) {
      await cache.put(url, corsResponse.clone());
      return true;
    }
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
  }

  try {
    const noCorsResponse = await fetch(url, { mode: 'no-cors', signal });
    if (noCorsResponse && (noCorsResponse.ok || noCorsResponse.type === 'opaque')) {
      await cache.put(url, noCorsResponse.clone());
      return true;
    }
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
  }

  return false;
}

export async function cacheSinglePage(
  page: number,
  edition: MushafEdition,
  signal?: AbortSignal,
  alsoCacheAyahText = true
): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  const maxP = getTotalPagesForEdition(edition);
  if (page < 1 || page > maxP) return false;

  const cache = await caches.open(MUSHAF_CACHE_NAME);
  const { primary, fallback } = getPageImageUrls(page, edition);

  // Skip network fetch if already present in cache
  const existingPrimary = await cache.match(primary);
  const existingFallback = existingPrimary ? existingPrimary : await cache.match(fallback);

  let ok = Boolean(existingPrimary || existingFallback);

  if (!ok) {
    ok = await fetchAndStoreImage(primary, cache, signal);
    if (!ok) {
      ok = await fetchAndStoreImage(fallback, cache, signal);
    }
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
  try {
    const cache = await caches.open(MUSHAF_CACHE_NAME);
    const { primary, fallback } = getPageImageUrls(page, edition);
    const match = (await cache.match(primary)) || (await cache.match(fallback));
    if (!match || match.type === 'opaque') {
      return null;
    }
    const blob = await match.blob();
    if (blob.size > 0) {
      return URL.createObjectURL(blob);
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
