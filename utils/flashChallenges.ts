import { addDays, format } from 'date-fns';
import { User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  isQuotaExceededError,
  OperationType,
} from '../firebase';
import { detectActiveSeasons, HijriOffset } from './islamicSeasons';
import {
  getIslamicDateString,
  getPrayerTimesForDate,
  getUserLocationAndMethod,
} from './prayerTimes';

export type FlashDhikrKey = 'salawat' | 'istighfar' | 'hawqalah' | 'tahlil' | 'baqiyat';

export interface FlashChallengeSpec {
  id: string;
  dateStr: string;
  title: string;
  kicker: string;
  subtitle: string;
  virtue: string;
  dhikrKey: FlashDhikrKey;
  dhikrShortLabel: string;
  formulas: string[];
  targetGoal: number;
  milestones: [number, number, number];
  startsAtMs: number;
  expiresAtMs: number;
}

export interface FlashChallengeLiveDoc {
  id: string;
  title: string;
  dhikrKey: FlashDhikrKey;
  targetGoal: number;
  topCount: number;
  topUserId: string;
  topUserName: string;
  participantsCount: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FlashChallengeEntryDoc {
  userId: string;
  challengeId: string;
  displayName: string;
  count: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const MAJOR_SEASON_IDS = new Set([
  'ramadan_last_ten',
  'ramadan_month',
  'arafah_day',
  'dhul_hijjah_ten',
  'eid_al_adha',
  'tashreeq_days',
  'eid_al_fitr',
  'ashura_season',
  'white_days',
]);

const CHALLENGE_DISMISSED_PREFIX = 'flash_challenge_dismissed_';

interface DailyTemplate {
  dhikrKey: FlashDhikrKey;
  dhikrShortLabel: string;
  title: string;
  kicker: string;
  subtitle: string;
  virtue: string;
  formulas: string[];
  targetGoal: number;
  milestones: [number, number, number];
}

const TEMPLATES_BY_WEEKDAY: Record<number, DailyTemplate> = {
  // Friday (starts Thursday Maghrib -> Friday Maghrib = 24 hours)
  5: {
    dhikrKey: 'salawat',
    dhikrShortLabel: 'صلاة على النبي ﷺ',
    title: 'تحدي ليلة ويوم الجمعة: الصلاة على النبي ﷺ',
    kicker: 'تحدي ٢٤ ساعة · ليلة ويوم الجمعة',
    subtitle: 'ينتهي تلقائياً مع أذان مغرب الجمعة — سابق بالصلاة على الحبيب ﷺ',
    virtue:
      'قال ﷺ: «إن من أفضل أيامكم يوم الجمعة، فأكثروا عليَّ من الصلاة فيه، فإن صلاتكم معروضة عليَّ».',
    formulas: [
      'اللهم صلِّ وسلم وبارك على نبينا محمد',
      'اللهم صلِّ على محمد وعلى آل محمد كما صليت على إبراهيم وعلى آل إبراهيم إنك حميد مجيد',
      'صلّى الله عليه وسلّم',
    ],
    targetGoal: 1000,
    milestones: [100, 300, 1000],
  },
  // Thursday (before Maghrib)
  4: {
    dhikrKey: 'istighfar',
    dhikrShortLabel: 'استغفار',
    title: 'تحدي الخميس: الاستغفار وعرض الأعمال',
    kicker: 'تحدي ٢٤ ساعة · يوم عرض الأعمال',
    subtitle: 'يمتد حتى أذان المغرب ليبدأ بعدها تحدي ليلة الجمعة المباركة',
    virtue:
      'قال ﷺ: «طوبى لمن وجد في صحيفته استغفاراً كثيراً»، وتُعرض الأعمال يوم الخميس على الله.',
    formulas: [
      'أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه',
      'رب اغفر لي وتب عليَّ إنك أنت التواب الرحيم',
      'أستغفر الله وأتوب إليه',
    ],
    targetGoal: 500,
    milestones: [100, 300, 500],
  },
  // Saturday
  6: {
    dhikrKey: 'hawqalah',
    dhikrShortLabel: 'حوقلة',
    title: 'تحدي كنوز الجنة: لا حول ولا قوة إلا بالله',
    kicker: 'تحدي ٢٤ ساعة · كنز تحت العرش',
    subtitle: 'فرصة يوم واحد للتسابق في كنوز الجنة والتفويض لله',
    virtue:
      'قال ﷺ: «ألا أدلك على كنز من كنوز الجنة؟ لا حول ولا قوة إلا بالله».',
    formulas: [
      'لا حول ولا قوة إلا بالله العلي العظيم',
      'لا حول ولا قوة إلا بالله',
    ],
    targetGoal: 500,
    milestones: [100, 300, 500],
  },
  // Sunday
  0: {
    dhikrKey: 'baqiyat',
    dhikrShortLabel: 'الباقيات الصالحات',
    title: 'تحدي الباقيات الصالحات: غراس الجنة',
    kicker: 'تحدي ٢٤ ساعة · غراس الجنة',
    subtitle: 'أحب الكلام إلى الله — تحدٍ ليوم واحد فقط يختفي عند المغرب',
    virtue:
      'قال ﷺ: «لأن أقول سبحان الله والحمد لله ولا إله إلا الله والله أكبر أحب إليَّ مما طلعت عليه الشمس».',
    formulas: [
      'سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر',
      'سبحان الله وبحمده، سبحان الله العظيم',
    ],
    targetGoal: 400,
    milestones: [100, 200, 400],
  },
  // Monday
  1: {
    dhikrKey: 'tahlil',
    dhikrShortLabel: 'تهليل',
    title: 'تحدي الإثنين: التهليل وتجديد الإيمان',
    kicker: 'تحدي ٢٤ ساعة · أفضل ما قيل',
    subtitle: 'تحدي التوحيد الخالص ليوم الإثنين المبارك',
    virtue:
      'قال ﷺ: «أفضل الذكر لا إله إلا الله» — من قالها مائة مرة كانت له عدل عشر رقاب.',
    formulas: [
      'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
      'لا إله إلا الله محمد رسول الله',
    ],
    targetGoal: 500,
    milestones: [100, 300, 500],
  },
  // Tuesday
  2: {
    dhikrKey: 'istighfar',
    dhikrShortLabel: 'استغفار',
    title: 'تحدي تفريج الهموم: سيد الاستغفار',
    kicker: 'تحدي ٢٤ ساعة · انشراح الصدر',
    subtitle: 'تحدي ٢٤ ساعة لتصفية القلب وجلب البركة والرزق',
    virtue:
      '«من لزم الاستغفار جعل الله له من كل هم فرجاً، ومن كل ضيق مخرجاً».',
    formulas: [
      'أستغفر الله العظيم وأتوب إليه',
      'اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك...',
    ],
    targetGoal: 500,
    milestones: [100, 300, 500],
  },
  // Wednesday
  3: {
    dhikrKey: 'salawat',
    dhikrShortLabel: 'صلاة على النبي ﷺ',
    title: 'تحدي وسط الأسبوع: الصلاة على النبي ﷺ',
    kicker: 'تحدي ٢٤ ساعة · كفاية الهم ومغفرة الذنب',
    subtitle: 'من صلى عليَّ صلاة صلى الله عليه بها عشراً — ٢٤ ساعة فقط',
    virtue:
      'قال أُبي: أجعل لك صلاتي كلها؟ قال ﷺ: «إذن تُكفى همك ويُغفر لك ذنبك».',
    formulas: [
      'اللهم صلِّ وسلم على نبينا محمد',
      'اللهم صلِّ على محمد وعلى آل محمد',
    ],
    targetGoal: 500,
    milestones: [100, 300, 500],
  },
};

function getMaghribTimestampForCalendarDate(dateObj: Date): number {
  const { lat, lng, tzOffset, isEgyptianMethod } = getUserLocationAndMethod();
  const { rawTimes } = getPrayerTimesForDate(dateObj, lat, lng, tzOffset, isEgyptianMethod);
  const maghribDecimal = rawTimes.maghrib;
  const hours = Math.floor(maghribDecimal);
  const minsFloat = (maghribDecimal - hours) * 60;
  const mins = Math.floor(minsFloat);
  const secs = Math.floor((minsFloat - mins) * 60);
  const res = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    hours,
    mins,
    secs,
    0
  );
  return res.getTime();
}

export function isMajorIslamicSeasonActive(
  refDate: Date,
  hijriOffset: HijriOffset
): boolean {
  const { seasons } = detectActiveSeasons(refDate, hijriOffset);
  return seasons.some((s) => MAJOR_SEASON_IDS.has(s.id));
}

export function isFlashChallengeDismissed(challengeId: string): boolean {
  try {
    return localStorage.getItem(`${CHALLENGE_DISMISSED_PREFIX}${challengeId}`) === '1';
  } catch {
    return false;
  }
}

export function dismissFlashChallenge(challengeId: string): void {
  try {
    localStorage.setItem(`${CHALLENGE_DISMISSED_PREFIX}${challengeId}`, '1');
  } catch {
    // ignore storage errors
  }
}

/**
 * Returns the active 24-hour flash challenge when outside major Islamic seasons
 * and within its strict 24-hour window (from Maghrib to next Maghrib).
 * Automatically returns null once expired or when browsing past/future dates.
 */
export function getActiveFlashChallenge(
  logDateStr: string,
  refDate: Date,
  hijriOffset: HijriOffset,
  nowMs: number = Date.now()
): FlashChallengeSpec | null {
  const liveIslamicToday = getIslamicDateString(new Date(nowMs));
  if (logDateStr !== liveIslamicToday) {
    return null;
  }

  if (isMajorIslamicSeasonActive(refDate, hijriOffset)) {
    return null;
  }

  const endDayDate = new Date(`${logDateStr}T12:00:00`);
  if (Number.isNaN(endDayDate.getTime())) {
    return null;
  }

  const prevDayDate = addDays(endDayDate, -1);
  const startsAtMs = getMaghribTimestampForCalendarDate(prevDayDate);
  const expiresAtMs = getMaghribTimestampForCalendarDate(endDayDate);

  if (nowMs >= expiresAtMs) {
    return null;
  }

  const weekday = endDayDate.getDay();
  const template = TEMPLATES_BY_WEEKDAY[weekday] || TEMPLATES_BY_WEEKDAY[5];
  const safeDateId = format(endDayDate, 'yyyy-MM-dd');
  const challengeId = `${safeDateId}_${template.dhikrKey}`;

  if (isFlashChallengeDismissed(challengeId)) {
    return null;
  }

  return {
    id: challengeId,
    dateStr: safeDateId,
    title: template.title,
    kicker: template.kicker,
    subtitle: template.subtitle,
    virtue: template.virtue,
    dhikrKey: template.dhikrKey,
    dhikrShortLabel: template.dhikrShortLabel,
    formulas: template.formulas,
    targetGoal: template.targetGoal,
    milestones: template.milestones,
    startsAtMs,
    expiresAtMs,
  };
}

export function formatRemainingCountdown(msRemaining: number): string {
  const safeMs = Math.max(0, msRemaining);
  const totalSecs = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

export function sanitizePublicDisplayName(
  preferredName?: string | null,
  firebaseUser?: FirebaseUser | null
): string {
  let candidate = (preferredName || firebaseUser?.displayName || '').trim();
  if (!candidate && firebaseUser?.email) {
    candidate = firebaseUser.email.split('@')[0];
  }
  if (candidate.includes('@')) {
    candidate = candidate.split('@')[0];
  }
  candidate = candidate.replace(/\s+/g, ' ').trim();
  if (candidate.length < 1) {
    candidate = 'متسابق في الخير';
  }
  return candidate.slice(0, 60);
}

export interface SyncChallengeResult {
  syncedCount: number;
  topCount: number;
  topUserName: string;
  participantsCount: number;
  brokeRecord: boolean;
  quotaExceeded?: boolean;
}

/**
 * Atomically syncs the user's progress inside the 24-hour flash challenge to Firestore.
 * Creates the shared challenge doc + user entry on first join, increments participantsCount,
 * and updates the global topCount/topUserName only when the user breaks the existing record.
 */
export async function syncFlashChallengeProgress(
  challenge: FlashChallengeSpec,
  firebaseUser: FirebaseUser,
  preferredName: string | undefined,
  rawCount: number
): Promise<SyncChallengeResult | null> {
  if (!firebaseUser?.uid || !firebaseUser.emailVerified) {
    return null;
  }

  const safeCount = Math.max(0, Math.min(1000000, Math.floor(rawCount)));
  const safeName = sanitizePublicDisplayName(preferredName, firebaseUser);
  const safeTitle = challenge.title.slice(0, 120);
  const safeTarget = Math.max(1, Math.min(1000000, Math.floor(challenge.targetGoal)));

  const challengePath = `flashChallenges/${challenge.id}`;
  const entryPath = `flashChallenges/${challenge.id}/entries/${firebaseUser.uid}`;
  const challengeRef = doc(db, 'flashChallenges', challenge.id);
  const entryRef = doc(db, 'flashChallenges', challenge.id, 'entries', firebaseUser.uid);

  try {
    return await runTransaction(db, async (tx) => {
      const challengeSnap = await tx.get(challengeRef);
      const entrySnap = await tx.get(entryRef);

      if (!challengeSnap.exists()) {
        tx.set(challengeRef, {
          id: challenge.id,
          title: safeTitle,
          dhikrKey: challenge.dhikrKey,
          targetGoal: safeTarget,
          topCount: safeCount,
          topUserId: firebaseUser.uid,
          topUserName: safeName,
          participantsCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        tx.set(entryRef, {
          userId: firebaseUser.uid,
          challengeId: challenge.id,
          displayName: safeName,
          count: safeCount,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return {
          syncedCount: safeCount,
          topCount: safeCount,
          topUserName: safeName,
          participantsCount: 1,
          brokeRecord: safeCount > 0,
        };
      }

      const currentChallenge = challengeSnap.data() as FlashChallengeLiveDoc;
      const currentTop = Number(currentChallenge.topCount || 0);
      const currentParticipants = Number(currentChallenge.participantsCount || 1);

      if (!entrySnap.exists()) {
        tx.set(entryRef, {
          userId: firebaseUser.uid,
          challengeId: challenge.id,
          displayName: safeName,
          count: safeCount,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const brokeRecord = safeCount > currentTop;
        if (brokeRecord) {
          tx.update(challengeRef, {
            participantsCount: currentParticipants + 1,
            topCount: safeCount,
            topUserId: firebaseUser.uid,
            topUserName: safeName,
            updatedAt: serverTimestamp(),
          });
        } else {
          tx.update(challengeRef, {
            participantsCount: currentParticipants + 1,
            updatedAt: serverTimestamp(),
          });
        }

        return {
          syncedCount: safeCount,
          topCount: brokeRecord ? safeCount : currentTop,
          topUserName: brokeRecord ? safeName : currentChallenge.topUserName,
          participantsCount: currentParticipants + 1,
          brokeRecord,
        };
      }

      const existingEntry = entrySnap.data() as FlashChallengeEntryDoc;
      const prevEntryCount = Number(existingEntry.count || 0);
      const nextCount = Math.max(prevEntryCount, safeCount);

      // Avoid redundant writes when nothing changed
      if (nextCount === prevEntryCount && safeName === existingEntry.displayName) {
        return {
          syncedCount: prevEntryCount,
          topCount: currentTop,
          topUserName: currentChallenge.topUserName,
          participantsCount: currentParticipants,
          brokeRecord: false,
        };
      }

      tx.update(entryRef, {
        count: nextCount,
        displayName: safeName,
        updatedAt: serverTimestamp(),
      });

      const brokeRecord = nextCount > currentTop;
      if (brokeRecord) {
        tx.update(challengeRef, {
          topCount: nextCount,
          topUserId: firebaseUser.uid,
          topUserName: safeName,
          updatedAt: serverTimestamp(),
        });
      }

      return {
        syncedCount: nextCount,
        topCount: brokeRecord ? nextCount : currentTop,
        topUserName: brokeRecord ? safeName : currentChallenge.topUserName,
        participantsCount: currentParticipants,
        brokeRecord,
      };
    });
  } catch (error) {
    if (isQuotaExceededError(error)) {
      return {
        syncedCount: safeCount,
        topCount: safeCount,
        topUserName: safeName,
        participantsCount: 1,
        brokeRecord: false,
        quotaExceeded: true,
      };
    }
    const op = entryPath ? OperationType.WRITE : OperationType.UPDATE;
    handleFirestoreError(error, op, `${challengePath} | ${entryPath}`);
  }
}
