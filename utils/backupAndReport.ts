import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';
import { DailyLog, AppWeights, PrayerEntry, PrayerName } from '../types';
import { calculateTotalScore, calculateSinsDeduction } from './scoring';

export const FULL_BACKUP_STORAGE_KEYS = [
  'worship_logs',
  'worship_books',
  'worship_weights',
  'worship_target',
  'worship_user',
  'worship_global_sync',
  'awrad_athkar_reflections_archive',
  'worship_quran_ward_plan',
  'worship_mushaf_bookmarks',
  'worship_quran_page_ratings',
  'worship_mushaf_edition',
  'worship_mushaf_theme',
  'worship_mushaf_view_mode',
  'worship_mushaf_auto_track_ward',
  'worship_quran_last_read_page',
  'worship_quran_last_read_page_madani',
  'worship_quran_last_read_page_shamarly',
  'worship_quran_unit',
  'worship_quran_subtab',
  'worship_daily_tasks_v1',
  'worship_recurring_habits_v1',
  'worship_gratitude_entries_v1',
  'worship_custom_dhikrs',
  'worship_weekly_custom_goals_v1',
  'worship_scheduled_reminders_v1',
  'worship_kaffarah_system_v1',
  'worship_forty_challenges_v1',
  'worship_hifz_spaced_repetition_v1',
  'worship_quran_khatmat_history',
  'worship_group_challenges_v1',
  'worship_hijri_offset',
  'worship_seasonal_tasks_v1',
  'worship_log_times',
  'local_prayer_gps',
  'selected_prayer_city',
  'local_prayer_method',
  'worship_accent_color',
] as const;

export interface FullBackupPayload {
  version: 2;
  app: 'awrad';
  exportedAt: string;
  userName?: string;
  data: Record<string, string>;
}

export interface BackupInspectionResult {
  valid: boolean;
  format?: 'v2' | 'legacy_logs';
  exportedAt?: string;
  userName?: string;
  daysCount: number;
  keysCount: number;
  booksCount: number;
  khatmatCount: number;
  tadabburCount: number;
  bookmarksCount: number;
  error?: string;
}

export function createFullBackupPayload(): FullBackupPayload {
  const data: Record<string, string> = {};
  let userName: string | undefined;

  FULL_BACKUP_STORAGE_KEYS.forEach((key) => {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) {
        data[key] = val;
        if (key === 'worship_user') {
          const parsed = JSON.parse(val);
          if (parsed?.name) userName = parsed.name;
        }
      }
    } catch {
      // skip unreadable key
    }
  });

  return {
    version: 2,
    app: 'awrad',
    exportedAt: new Date().toISOString(),
    userName,
    data,
  };
}

export function downloadFullBackupJson(): { fileName: string; sizeKB: number } {
  const payload = createFullBackupPayload();
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const fileName = `awrad_full_backup_${format(new Date(), 'yyyy_MM_dd_HHmm')}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { fileName, sizeKB: Math.max(1, Math.round(blob.size / 1024)) };
}

function countTadabburFromLogs(logsObj: Record<string, DailyLog>): number {
  let total = 0;
  Object.values(logsObj || {}).forEach((l) => {
    total += (l?.tadabburNotes?.length || 0) + (l?.reflections?.length || 0);
  });
  return total;
}

export function inspectBackupJson(rawText: string): BackupInspectionResult {
  try {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, daysCount: 0, keysCount: 0, booksCount: 0, khatmatCount: 0, tadabburCount: 0, bookmarksCount: 0, error: 'الملف لا يحتوي على كائن JSON صالح.' };
    }

    // Check v2 full backup format
    if (parsed.version === 2 && parsed.app === 'awrad' && parsed.data && typeof parsed.data === 'object') {
      const dataMap = parsed.data as Record<string, string>;
      const keys = Object.keys(dataMap);
      let logsObj: Record<string, DailyLog> = {};
      let booksArr: unknown[] = [];
      let khatmatArr: unknown[] = [];
      let bookmarksArr: unknown[] = [];

      try {
        if (dataMap.worship_logs) logsObj = JSON.parse(dataMap.worship_logs);
      } catch {}
      try {
        if (dataMap.worship_books) booksArr = JSON.parse(dataMap.worship_books);
      } catch {}
      try {
        if (dataMap.worship_quran_khatmat_history) khatmatArr = JSON.parse(dataMap.worship_quran_khatmat_history);
      } catch {}
      try {
        if (dataMap.worship_mushaf_bookmarks) bookmarksArr = JSON.parse(dataMap.worship_mushaf_bookmarks);
      } catch {}

      return {
        valid: true,
        format: 'v2',
        exportedAt: parsed.exportedAt,
        userName: parsed.userName,
        daysCount: Object.keys(logsObj || {}).length,
        keysCount: keys.length,
        booksCount: Array.isArray(booksArr) ? booksArr.length : 0,
        khatmatCount: Array.isArray(khatmatArr) ? khatmatArr.length : 0,
        tadabburCount: countTadabburFromLogs(logsObj),
        bookmarksCount: Array.isArray(bookmarksArr) ? bookmarksArr.length : 0,
      };
    }

    // Check legacy logs-only format: { "YYYY-MM-DD": DailyLog }
    const firstKey = Object.keys(parsed)[0];
    if (firstKey && /^\d{4}-\d{2}-\d{2}$/.test(firstKey)) {
      const logsObj = parsed as Record<string, DailyLog>;
      return {
        valid: true,
        format: 'legacy_logs',
        daysCount: Object.keys(logsObj).length,
        keysCount: 1,
        booksCount: 0,
        khatmatCount: 0,
        tadabburCount: countTadabburFromLogs(logsObj),
        bookmarksCount: 0,
      };
    }

    return {
      valid: false,
      daysCount: 0,
      keysCount: 0,
      booksCount: 0,
      khatmatCount: 0,
      tadabburCount: 0,
      bookmarksCount: 0,
      error: 'تنسيق الملف غير معروف. تأكد من اختيار نسخة احتياطية صادرة من تطبيق أوراد.',
    };
  } catch {
    return {
      valid: false,
      daysCount: 0,
      keysCount: 0,
      booksCount: 0,
      khatmatCount: 0,
      tadabburCount: 0,
      bookmarksCount: 0,
      error: 'تعذر قراءة صيغة JSON — تأكد من سلامة النص أو الملف.',
    };
  }
}

function mergeArrayById(existingRaw: string | null, incomingRaw: string): string {
  try {
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const incoming = JSON.parse(incomingRaw);
    if (!Array.isArray(existing) || !Array.isArray(incoming)) return incomingRaw;

    const byId = new Map<string, any>();
    incoming.forEach((item: any, idx: number) => {
      const key = item?.id ? String(item.id) : `inc_${idx}`;
      byId.set(key, item);
    });
    existing.forEach((item: any, idx: number) => {
      const key = item?.id ? String(item.id) : `ext_${idx}`;
      if (!byId.has(key)) {
        byId.set(key, item);
      } else {
        byId.set(key, item);
      }
    });
    return JSON.stringify(Array.from(byId.values()));
  } catch {
    return incomingRaw;
  }
}

export function restoreBackupJson(rawText: string, mode: 'merge' | 'replace'): { success: boolean; error?: string } {
  const inspection = inspectBackupJson(rawText);
  if (!inspection.valid) {
    return { success: false, error: inspection.error || 'ملف غير صالح' };
  }

  try {
    const parsed = JSON.parse(rawText);

    if (inspection.format === 'legacy_logs') {
      if (mode === 'replace') {
        localStorage.setItem('worship_logs', JSON.stringify(parsed));
      } else {
        const existingLogs = JSON.parse(localStorage.getItem('worship_logs') || '{}');
        localStorage.setItem('worship_logs', JSON.stringify({ ...parsed, ...existingLogs }));
      }
      return { success: true };
    }

    const incomingData = parsed.data as Record<string, string>;

    if (mode === 'replace') {
      Object.entries(incomingData).forEach(([key, val]) => {
        if (typeof val === 'string') {
          localStorage.setItem(key, val);
        }
      });
      return { success: true };
    }

    // Merge mode
    Object.entries(incomingData).forEach(([key, val]) => {
      if (typeof val !== 'string') return;
      const existing = localStorage.getItem(key);

      if (key === 'worship_logs') {
        try {
          const extObj = existing ? JSON.parse(existing) : {};
          const incObj = JSON.parse(val);
          localStorage.setItem(key, JSON.stringify({ ...incObj, ...extObj }));
          return;
        } catch {}
      }

      if (
        [
          'worship_books',
          'worship_mushaf_bookmarks',
          'worship_quran_khatmat_history',
          'worship_forty_challenges_v1',
          'worship_scheduled_reminders_v1',
          'worship_custom_dhikrs',
          'worship_daily_tasks_v1',
          'worship_recurring_habits_v1',
          'worship_gratitude_entries_v1',
          'awrad_athkar_reflections_archive',
        ].includes(key)
      ) {
        localStorage.setItem(key, mergeArrayById(existing, val));
        return;
      }

      if (!existing) {
        localStorage.setItem(key, val);
      }
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: 'حدث خطأ أثناء استعادة البيانات.' };
  }
}

export interface MonthlyReportSummary {
  yearMonth: string; // e.g. '2026-11'
  monthLabel: string;
  daysInMonth: number;
  loggedDaysCount: number;
  targetHitDays: number;
  totalScore: number;
  avgScore: number;
  bestDay: { date: string; score: number } | null;
  prayersPerformed: number;
  prayersPossible: number;
  prayersInCongregation: number;
  fajrCount: number;
  rawatibDays: number;
  quranReadPages: number;
  quranHifzRub: number;
  quranRevisionRub: number;
  tadabburCount: number;
  morningAthkarDays: number;
  eveningAthkarDays: number;
  sleepAthkarDays: number;
  totalCountersDhikr: number;
  fastingDays: number;
  duhaDays: number;
  qiyamMinutes: number;
  knowledgeMinutes: number;
  booksPagesRead: number;
  sinsDeductionTotal: number;
  pureDaysCount: number;
  weeklyBreakdown: Array<{
    weekLabel: string;
    activeDays: number;
    avgScore: number;
    prayersCount: number;
    quranPages: number;
    dhikrTotal: number;
  }>;
  topTadabburSnippets: Array<{ date: string; surah: string; ayah: string; text: string }>;
}

export function computeMonthlyReport(
  logs: Record<string, DailyLog>,
  weights: AppWeights,
  yearMonth: string,
  targetScore: number
): MonthlyReportSummary {
  const [yStr, mStr] = yearMonth.split('-');
  const year = parseInt(yStr, 10) || new Date().getFullYear();
  const monthIdx = (parseInt(mStr, 10) || new Date().getMonth() + 1) - 1;

  const refDate = new Date(year, monthIdx, 1);
  const start = startOfMonth(refDate);
  const end = endOfMonth(refDate);
  const allDays = eachDayOfInterval({ start, end });
  const monthLabel = format(refDate, 'MMMM yyyy', { locale: ar });

  let loggedDaysCount = 0;
  let targetHitDays = 0;
  let totalScore = 0;
  let bestDay: { date: string; score: number } | null = null;

  let prayersPerformed = 0;
  let prayersInCongregation = 0;
  let fajrCount = 0;
  let rawatibDays = 0;

  let quranReadPages = 0;
  let quranHifzRub = 0;
  let quranRevisionRub = 0;
  let tadabburCount = 0;

  let morningAthkarDays = 0;
  let eveningAthkarDays = 0;
  let sleepAthkarDays = 0;
  let totalCountersDhikr = 0;

  let fastingDays = 0;
  let duhaDays = 0;
  let qiyamMinutes = 0;
  let knowledgeMinutes = 0;
  let booksPagesRead = 0;
  let sinsDeductionTotal = 0;
  let pureDaysCount = 0;

  const topTadabburSnippets: Array<{ date: string; surah: string; ayah: string; text: string }> = [];

  const weeksBuckets: Record<
    number,
    { activeDays: number; scoreSum: number; prayersCount: number; quranPages: number; dhikrTotal: number }
  > = {
    0: { activeDays: 0, scoreSum: 0, prayersCount: 0, quranPages: 0, dhikrTotal: 0 },
    1: { activeDays: 0, scoreSum: 0, prayersCount: 0, quranPages: 0, dhikrTotal: 0 },
    2: { activeDays: 0, scoreSum: 0, prayersCount: 0, quranPages: 0, dhikrTotal: 0 },
    3: { activeDays: 0, scoreSum: 0, prayersCount: 0, quranPages: 0, dhikrTotal: 0 },
    4: { activeDays: 0, scoreSum: 0, prayersCount: 0, quranPages: 0, dhikrTotal: 0 },
  };

  allDays.forEach((d, dayIdx) => {
    const dateKey = format(d, 'yyyy-MM-dd');
    const log = logs[dateKey];
    const weekIdx = Math.min(4, Math.floor(dayIdx / 7));

    if (!log) return;

    const score = calculateTotalScore(log, weights);
    const hasAnyActivity =
      score !== 0 ||
      (Object.values(log.prayers || {}) as PrayerEntry[]).some((p) => p.performed) ||
      (log.quran?.readPages?.length || 0) > 0;

    if (!hasAnyActivity) return;

    loggedDaysCount += 1;
    totalScore += score;
    if (score >= targetScore) targetHitDays += 1;
    if (!bestDay || score > bestDay.score) {
      bestDay = { date: dateKey, score };
    }

    const prayerValues = Object.values(log.prayers || {}) as PrayerEntry[];
    const dayPrayers = prayerValues.filter((p) => p.performed).length;
    const dayCong = prayerValues.filter((p) => p.performed && p.inCongregation).length;
    prayersPerformed += dayPrayers;
    prayersInCongregation += dayCong;
    if (log.prayers?.[PrayerName.FAJR]?.performed) fajrCount += 1;

    const allSurrounding = prayerValues.flatMap((p) => p.surroundingSunnahIds || []);
    const rawatibKeys = ['fajr_pre', 'dhuhr_pre', 'dhuhr_post', 'maghrib_post', 'isha_post'];
    if (rawatibKeys.every((k) => allSurrounding.includes(k))) {
      rawatibDays += 1;
    }

    const dayReadPages = Array.isArray(log.quran?.readPages) ? log.quran.readPages.length : 0;
    quranReadPages += dayReadPages;
    quranHifzRub += log.quran?.hifzRub || 0;
    quranRevisionRub += log.quran?.revisionRub || 0;

    const dayTadabbur = log.tadabburNotes || [];
    tadabburCount += dayTadabbur.length;
    dayTadabbur.forEach((note) => {
      if (topTadabburSnippets.length < 4 && note.reflection) {
        topTadabburSnippets.push({
          date: dateKey,
          surah: note.surahName,
          ayah: note.ayahNumber,
          text: note.reflection,
        });
      }
    });

    if (log.athkar?.checklists?.morning) morningAthkarDays += 1;
    if (log.athkar?.checklists?.evening) eveningAthkarDays += 1;
    if (log.athkar?.checklists?.sleep) sleepAthkarDays += 1;
    const dayDhikr = Object.values(log.athkar?.counters || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
    totalCountersDhikr += dayDhikr;

    if (log.nawafil?.fasting) fastingDays += 1;
    if ((log.nawafil?.duhaDuration || 0) > 0) duhaDays += 1;
    qiyamMinutes += (log.nawafil?.qiyamDuration || 0) + (log.nawafil?.witrDuration || 0);

    knowledgeMinutes +=
      (log.knowledge?.shariDuration || 0) +
      (log.knowledge?.readingDuration || 0) +
      (log.knowledge?.audioDuration || 0);
    booksPagesRead += log.knowledge?.readingPages || 0;

    const sinsDed = calculateSinsDeduction(log, weights);
    if (sinsDed > 0 || log.hasBurden) {
      sinsDeductionTotal += sinsDed || (log.hasBurden ? 300 : 0);
    } else {
      pureDaysCount += 1;
    }

    const b = weeksBuckets[weekIdx];
    b.activeDays += 1;
    b.scoreSum += score;
    b.prayersCount += dayPrayers;
    b.quranPages += dayReadPages;
    b.dhikrTotal += dayDhikr;
  });

  const weekNames = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع', 'الأيام الأخيرة'];
  const weeklyBreakdown = Object.entries(weeksBuckets)
    .filter(([idx, data]) => Number(idx) < 4 || data.activeDays > 0)
    .map(([idx, data]) => ({
      weekLabel: weekNames[Number(idx)],
      activeDays: data.activeDays,
      avgScore: data.activeDays > 0 ? Math.round(data.scoreSum / data.activeDays) : 0,
      prayersCount: data.prayersCount,
      quranPages: data.quranPages,
      dhikrTotal: data.dhikrTotal,
    }));

  return {
    yearMonth,
    monthLabel,
    daysInMonth: allDays.length,
    loggedDaysCount,
    targetHitDays,
    totalScore,
    avgScore: loggedDaysCount > 0 ? Math.round(totalScore / loggedDaysCount) : 0,
    bestDay,
    prayersPerformed,
    prayersPossible: loggedDaysCount * 5,
    prayersInCongregation,
    fajrCount,
    rawatibDays,
    quranReadPages,
    quranHifzRub,
    quranRevisionRub,
    tadabburCount,
    morningAthkarDays,
    eveningAthkarDays,
    sleepAthkarDays,
    totalCountersDhikr,
    fastingDays,
    duhaDays,
    qiyamMinutes,
    knowledgeMinutes,
    booksPagesRead,
    sinsDeductionTotal,
    pureDaysCount,
    weeklyBreakdown,
    topTadabburSnippets,
  };
}
