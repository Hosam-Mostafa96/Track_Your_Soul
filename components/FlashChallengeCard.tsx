import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import {
  Clock,
  Crown,
  Flame,
  Loader2,
  LogIn,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { DailyLog, User } from '../types';
import {
  auth,
  db,
  getQuotaUpgradeUrl,
  handleFirestoreError,
  isQuotaExceededError,
  OperationType,
  signInWithGoogle,
} from '../firebase';
import {
  FlashChallengeEntryDoc,
  FlashChallengeLiveDoc,
  FlashChallengeSpec,
  formatRemainingCountdown,
  sanitizePublicDisplayName,
  syncFlashChallengeProgress,
} from '../utils/flashChallenges';

interface FlashChallengeCardProps {
  challenge: FlashChallengeSpec;
  log: DailyLog;
  appUser?: User | null;
  nowMs: number;
  onUpdateLog: (log: DailyLog, activityLabel?: string, activityType?: string) => void;
  onSwitchTab: (tab: any) => void;
  onExpired: () => void;
}

export const FlashChallengeCard: React.FC<FlashChallengeCardProps> = ({
  challenge,
  log,
  appUser,
  nowMs,
  onUpdateLog,
  onSwitchTab,
  onExpired,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [liveChallenge, setLiveChallenge] = useState<FlashChallengeLiveDoc | null>(null);
  const [remoteEntryCount, setRemoteEntryCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [quotaErrorMsg, setQuotaErrorMsg] = useState<string | null>(null);
  const [formulaIdx, setFormulaIdx] = useState<number>(0);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);
  const [firestoreFatalError, setFirestoreFatalError] = useState<Error | null>(null);

  if (firestoreFatalError) {
    throw firestoreFatalError;
  }

  // Trigger auto-hide when 24h window ends
  const msRemaining = challenge.expiresAtMs - nowMs;
  useEffect(() => {
    if (msRemaining <= 0) {
      onExpired();
    }
  }, [msRemaining, onExpired]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const localCount = useMemo(() => {
    const counters = log?.athkar?.counters || {};
    return Number((counters as Record<string, number>)[challenge.dhikrKey] || 0);
  }, [log, challenge.dhikrKey]);

  const myDisplayName = useMemo(
    () => sanitizePublicDisplayName(appUser?.name, firebaseUser),
    [appUser?.name, firebaseUser]
  );

  // Refs for debounced sync without stale closures
  const latestCountRef = useRef<number>(localCount);
  latestCountRef.current = Math.max(localCount, remoteEntryCount);
  const latestChallengeRef = useRef<FlashChallengeSpec>(challenge);
  latestChallengeRef.current = challenge;
  const latestFirebaseUserRef = useRef<FirebaseUser | null>(firebaseUser);
  latestFirebaseUserRef.current = firebaseUser;
  const latestNameRef = useRef<string>(myDisplayName);
  latestNameRef.current = myDisplayName;
  const syncTimerRef = useRef<number | null>(null);
  const lastSyncedCountRef = useRef<number>(-1);
  const lastKnownTopRef = useRef<number>(0);

  // Subscribe to Firestore live challenge doc & personal entry ONLY when authenticated and verified
  useEffect(() => {
    if (!authReady || !firebaseUser || !firebaseUser.emailVerified) {
      setLiveChallenge(null);
      setRemoteEntryCount(0);
      lastSyncedCountRef.current = -1;
      return;
    }

    const challengePath = `flashChallenges/${challenge.id}`;
    const entryPath = `flashChallenges/${challenge.id}/entries/${firebaseUser.uid}`;

    const unsubChallenge = onSnapshot(
      doc(db, 'flashChallenges', challenge.id),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as FlashChallengeLiveDoc;
          setLiveChallenge(data);
          lastKnownTopRef.current = Number(data.topCount || 0);
        } else {
          setLiveChallenge(null);
          lastKnownTopRef.current = 0;
        }
        setQuotaErrorMsg(null);
      },
      (error) => {
        if (isQuotaExceededError(error)) {
          setQuotaErrorMsg(
            'تم بلوغ الحد اليومي المجاني لقراءة البيانات السحابية؛ يمكنك مواصلة العد محلياً وسيتم التحديث غداً.'
          );
          return;
        }
        try {
          handleFirestoreError(error, OperationType.GET, challengePath);
        } catch (wrapped) {
          setFirestoreFatalError(wrapped as Error);
        }
      }
    );

    const unsubEntry = onSnapshot(
      doc(db, 'flashChallenges', challenge.id, 'entries', firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as FlashChallengeEntryDoc;
          const rCount = Number(data.count || 0);
          setRemoteEntryCount(rCount);
          lastSyncedCountRef.current = rCount;
        } else {
          setRemoteEntryCount(0);
          lastSyncedCountRef.current = -1;
        }
      },
      (error) => {
        if (isQuotaExceededError(error)) return;
        try {
          handleFirestoreError(error, OperationType.GET, entryPath);
        } catch (wrapped) {
          setFirestoreFatalError(wrapped as Error);
        }
      }
    );

    return () => {
      unsubChallenge();
      unsubEntry();
    };
  }, [authReady, firebaseUser, challenge.id]);

  // Initial / catch-up sync once authenticated if user already has counts or hasn't joined today's doc yet
  useEffect(() => {
    if (!authReady || !firebaseUser || !firebaseUser.emailVerified) return;
    const effective = Math.max(localCount, remoteEntryCount);
    if (lastSyncedCountRef.current === -1 || effective > lastSyncedCountRef.current) {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = window.setTimeout(() => {
        void runSyncNow(effective);
      }, 650);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, firebaseUser?.uid, challenge.id, localCount, remoteEntryCount]);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  const runSyncNow = async (countToSync: number) => {
    const fUser = latestFirebaseUserRef.current;
    if (!fUser || !fUser.emailVerified) return;

    setIsSyncing(true);
    try {
      const result = await syncFlashChallengeProgress(
        latestChallengeRef.current,
        fUser,
        latestNameRef.current,
        countToSync
      );
      if (result) {
        if (result.quotaExceeded) {
          setQuotaErrorMsg('تم الوصول للحد اليومي المجاني لقاعدة البيانات؛ يستمر العدّ محلياً.');
        } else {
          lastSyncedCountRef.current = result.syncedCount;
          if (result.brokeRecord && countToSync > 0) {
            setCelebrationBanner(`تصدّرت التحدي الآن بأعلى رقم (${result.topCount.toLocaleString()})`);
            window.setTimeout(() => setCelebrationBanner(null), 5000);
          }
        }
      }
    } catch (error) {
      if (isQuotaExceededError(error)) {
        setQuotaErrorMsg('تم الوصول للحد اليومي المجاني لقاعدة البيانات.');
      } else {
        setFirestoreFatalError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTap = (incrementBy: number) => {
    const baseCount = Math.max(localCount, remoteEntryCount);
    const nextCount = baseCount + incrementBy;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(incrementBy > 1 ? [25, 25, 25] : 18);
      } catch {
        // ignore vibration error
      }
    }

    setFormulaIdx((prev) => (prev + 1) % challenge.formulas.length);

    const safeCounters = log?.athkar?.counters || {
      salawat: 0,
      hawqalah: 0,
      tahlil: 0,
      baqiyat: 0,
      istighfar: 0,
    };
    const updatedLog: DailyLog = {
      ...log,
      athkar: {
        ...log.athkar,
        checklists: log.athkar?.checklists || {
          morning: false,
          evening: false,
          sleep: false,
          travel: false,
        },
        counters: {
          ...safeCounters,
          [challenge.dhikrKey]: nextCount,
        },
      },
    };

    const hitMilestone = challenge.milestones.find(
      (m) => baseCount < m && nextCount >= m
    );
    const brokeLiveRecord =
      Boolean(firebaseUser?.emailVerified) &&
      lastKnownTopRef.current > 0 &&
      baseCount <= lastKnownTopRef.current &&
      nextCount > lastKnownTopRef.current;

    const activityLabel = hitMilestone
      ? `أتمَّ ${nextCount.toLocaleString()} في ${challenge.title}`
      : brokeLiveRecord
      ? `سجّل أعلى رقم (${nextCount.toLocaleString()}) في ${challenge.title}`
      : undefined;

    onUpdateLog(updatedLog, activityLabel, activityLabel ? 'athkar' : undefined);

    if (hitMilestone || brokeLiveRecord) {
      confetti({
        particleCount: 65,
        spread: 65,
        origin: { y: 0.72 },
        colors: ['#fbbf24', '#10b981', '#ffffff'],
      });
      setCelebrationBanner(
        brokeLiveRecord
          ? `ما شاء الله! كسرت أعلى رقم مسجّل وتصدرت التحدي (${nextCount.toLocaleString()})`
          : `أتممت محطة ${hitMilestone?.toLocaleString()} في تحدي اليوم!`
      );
      window.setTimeout(() => setCelebrationBanner(null), 5000);
    }

    if (firebaseUser?.emailVerified) {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
      const delayMs = brokeLiveRecord || hitMilestone ? 150 : 900;
      syncTimerRef.current = window.setTimeout(() => {
        void runSyncNow(nextCount);
      }, delayMs);
    }
  };

  const handleGoogleConnect = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser) {
        await runSyncNow(Math.max(localCount, remoteEntryCount));
      }
    } catch (err: any) {
      const code = String(err?.code || '');
      if (code.includes('popup-closed-by-user')) {
        setAuthError('تم إغلاق نافذة تسجيل الدخول قبل إتمام الربط.');
      } else if (code.includes('popup-blocked')) {
        setAuthError('المتصفح منع النافذة المنبثقة؛ يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى.');
      } else {
        setAuthError('تعذر تسجيل الدخول بحساب Google حالياً. يمكنك المواصلة محلياً وإعادة المحاولة.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const myCount = Math.max(localCount, remoteEntryCount);
  const hasLiveRecord = Boolean(liveChallenge && firebaseUser?.emailVerified);
  const topCount = hasLiveRecord
    ? Math.max(Number(liveChallenge?.topCount || 0), myCount)
    : myCount;
  const isUserLeader =
    hasLiveRecord &&
    myCount > 0 &&
    (liveChallenge?.topUserId === firebaseUser?.uid || myCount >= Number(liveChallenge?.topCount || 0));
  const topLeaderName = hasLiveRecord
    ? isUserLeader
      ? myDisplayName
      : liveChallenge?.topUserName || 'متسابق'
    : myDisplayName;

  const scaleMax = useMemo(() => {
    const rawMax = Math.max(challenge.targetGoal, topCount, 100);
    if (rawMax <= challenge.targetGoal) return challenge.targetGoal;
    return Math.ceil((rawMax + 50) / 100) * 100;
  }, [challenge.targetGoal, topCount]);

  const myPercent = Math.min(100, Math.round((myCount / scaleMax) * 100));
  const topPercent = Math.min(100, Math.round((topCount / scaleMax) * 100));
  const remainingToLead = Math.max(0, topCount - myCount + 1);
  const countdownText = formatRemainingCountdown(msRemaining);
  const participantsCount = liveChallenge?.participantsCount || (firebaseUser?.emailVerified ? 1 : 0);

  return (
    <div
      className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-[2rem] p-5 sm:p-6 text-white shadow-xl border border-amber-400/25 relative overflow-hidden space-y-5"
      dir="rtl"
    >
      {/* ترويسة التحدي الخاطف وعداد الـ ٢٤ ساعة */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300/95">
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{challenge.kicker}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black header-font text-white leading-snug [text-wrap:balance]">
            {challenge.title}
          </h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {challenge.subtitle}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5">
          <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>يختفي بعد</span>
          </span>
          <span className="font-mono tabular-nums text-base sm:text-lg font-black text-amber-300 tracking-wider">
            {countdownText}
          </span>
        </div>
      </div>

      {/* حديث / فضل التحدي */}
      <p className="text-xs font-medium text-emerald-100/90 leading-relaxed border-y border-white/10 py-3">
        {challenge.virtue}
      </p>

      {/* شريط التقدم التنافسي (تقدمك مقابل أعلى رقم حققه مستخدم آخر) */}
      <div className="space-y-3 bg-black/25 rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2 font-black header-font text-white">
            <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
            {hasLiveRecord ? (
              topCount > 0 ? (
                <span>
                  {isUserLeader ? (
                    <>أنت الأعلى الآن · <span className="tabular-nums text-amber-300">{topCount.toLocaleString()}</span></>
                  ) : (
                    <>أعلى رقم اليوم: <span className="tabular-nums text-amber-300">{topCount.toLocaleString()}</span> ({topLeaderName})</>
                  )}
                </span>
              ) : (
                <span>لم يسجّل أحد بعد — كن أول المتسابقين اليوم</span>
              )
            ) : (
              <span>
                عدّادك الحالي: <span className="tabular-nums text-amber-300">{myCount.toLocaleString()}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300 tabular-nums">
            {hasLiveRecord && (
              <>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-300" />
                  {participantsCount.toLocaleString()} مشارك
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>السقف: {scaleMax.toLocaleString()}</span>
            {isSyncing && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />}
          </div>
        </div>

        {/* المسار الأفقي الموحد + دبوس المتصدر */}
        <div className="pt-2 pb-1">
          <div className="relative h-4 w-full rounded-full bg-white/10 overflow-visible">
            {/* تعبئة تقدم المستخدم الحالي */}
            <div
              className="absolute top-0 right-0 h-full rounded-full bg-gradient-to-l from-emerald-400 via-teal-400 to-amber-300 transition-all duration-300"
              style={{ width: `${Math.max(myCount > 0 ? 3 : 0, myPercent)}%` }}
            />

            {/* علامة أعلى مستخدم دخل التحدي */}
            {hasLiveRecord && topCount > 0 && (
              <div
                className="absolute -top-1.5 w-1.5 h-7 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.85)] transition-all duration-300"
                style={{
                  right: `clamp(2px, calc(${topPercent}% - 3px), calc(100% - 8px))`,
                }}
                title={`أعلى رقم في التحدي: ${topCount.toLocaleString()} (${topLeaderName})`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-300 absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow" />
              </div>
            )}
          </div>
        </div>

        {/* تفاصيل الأرقام والتحفيز */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-3 text-slate-200 font-bold tabular-nums">
            <span>
              تقدمك: <strong className="text-white text-sm">{myCount.toLocaleString()}</strong>
            </span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span>
              المحطات: {challenge.milestones.map((m) => m.toLocaleString()).join(' / ')}
            </span>
          </div>

          {hasLiveRecord && (
            <span className="text-[11px] font-bold text-amber-200">
              {topCount === 0
                ? 'ابدأ الآن واكتب اسمك في صدارة التحدي'
                : isUserLeader
                ? 'أنت المتصدر حالياً — واصل الثبات!'
                : `تبقّى ${remainingToLead.toLocaleString()} لتتجاوز ${topLeaderName}`}
            </span>
          )}
        </div>

        {/* دعوة تسجيل الدخول بجوجل لتفعيل المنافسة اللحظية عبر Firebase */}
        {authReady && (!firebaseUser || !firebaseUser.emailVerified) && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] font-bold text-slate-300 leading-relaxed flex-1 min-w-[200px]">
              اربط حسابك بـ Google لترى أعلى رقم سجّله المشاركون اليوم على الشريط وتنافسهم لحظياً.
            </p>
            <button
              type="button"
              onClick={handleGoogleConnect}
              disabled={isSigningIn}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black header-font flex items-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isSigningIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>ربط المنافسة بـ Google</span>
            </button>
          </div>
        )}

        {authError && (
          <p className="text-[11px] font-bold text-rose-300 pt-1">{authError}</p>
        )}

        {quotaErrorMsg && (
          <div className="text-[11px] font-bold text-amber-200 pt-1 space-y-1">
            <p>{quotaErrorMsg}</p>
            <a
              href={getQuotaUpgradeUrl()}
              target="_blank"
              rel="noreferrer"
              className="underline text-amber-300 hover:text-white inline-block"
            >
              مراجعة سعة قاعدة البيانات
            </a>
          </div>
        )}
      </div>

      {/* رسالة احتفال عند كسر الرقم القياسي أو بلوغ محطة */}
      {celebrationBanner && (
        <div className="bg-emerald-500/20 border border-emerald-300/40 rounded-2xl px-4 py-2.5 text-xs font-black text-amber-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{celebrationBanner}</span>
        </div>
      )}

      {/* مسبحة التحدي المباشرة */}
      <div className="space-y-3">
        <div className="text-center px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10">
          <p className="quran-font text-sm sm:text-base text-amber-100 leading-relaxed">
            {challenge.formulas[formulaIdx % challenge.formulas.length]}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleTap(1)}
            className="sm:col-span-2 min-h-[48px] px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm header-font shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="font-mono text-base tabular-nums">+١</span>
            <span>{challenge.dhikrShortLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTap(10)}
            className="min-h-[48px] px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-black text-sm header-font active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span className="font-mono text-base text-amber-300 tabular-nums">+١٠</span>
            <span>تسجيل دفعة</span>
          </button>
        </div>
      </div>

      {/* شريط إجراءات سفلي مبسط */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-[11px] font-bold text-slate-300 flex-wrap">
        <span>مرتبط تلقائياً برصيد المسبحة واليوم الشرعي</span>
        <div className="flex items-center gap-3">
          {firebaseUser?.emailVerified && (
            <button
              type="button"
              onClick={() => void runSyncNow(myCount)}
              disabled={isSyncing}
              className="min-h-[40px] px-2 text-slate-200 hover:text-white flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onSwitchTab('subha')}
            className="min-h-[40px] px-2 text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <span>المسبحة الكاملة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
