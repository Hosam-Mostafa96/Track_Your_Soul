
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Target, 
  Sparkles, 
  Edit2, 
  Check, 
  X, 
  Activity, 
  History, 
  Award, 
  Sun, 
  Lock, 
  Home, 
  Key, 
  Coins, 
  Heart, 
  CloudMoon, 
  CheckCircle2,
  BookMarked,
  ChevronLeft,
  Smartphone,
  Download,
  Share,
  Info,
  Smile,
  Meh,
  Frown,
  Ghost,
  CloudSun,
  BookOpen,
  Shield,
  TrendingDown,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, ReferenceLine, YAxis } from 'recharts';
import { format, addDays } from 'date-fns';
// Fix: Use arSA instead of ar to avoid export errors in some date-fns environments
import { arSA as ar } from 'date-fns/locale';
import { DailyLog, AppWeights, PrayerName, PrayerEntry, Book, User } from '../types';
import { calculateTotalScore } from '../utils/scoring';
import confetti from 'canvas-confetti';
import { NextPrayerWidget } from './NextPrayerWidget';
import { WeeklyCardModal } from './WeeklyCardModal';
import { DAILY_TADABBUR_SEEDS } from '../utils/quranData';
import { WeeklyGoalsDashboardCard } from './WeeklyGoalsDashboardCard';
import { WeeklyGoalsSettingsModal } from './WeeklyGoalsSettingsModal';
import { loadWeeklyGoalsConfig, calculateWeeklyGoalsProgress } from '../utils/weeklyGoals';
import { WeeklyGoalsConfig } from '../types';

interface DashboardProps {
  log: DailyLog;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  onDateChange: (date: string) => void;
  targetScore: number;
  onTargetChange: (score: number) => void;
  onOpenSettings: () => void;
  books: Book[];
  onUpdateBook: (book: Book, pagesReadToday: number) => void;
  onSwitchTab: (tab: any) => void;
  installPrompt: any;
  onClearInstallPrompt: () => void;
  onUpdateLog: (log: DailyLog) => void;
  user?: User | null;
  onOpenWeeklyEvaluation?: (tab?: 'general' | 'custom_goals') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  log, logs, weights, onDateChange, targetScore, onTargetChange, onOpenSettings,
  books, onUpdateBook, onSwitchTab, installPrompt, onClearInstallPrompt, onUpdateLog, user,
  onOpenWeeklyEvaluation
}) => {
  const [showWeeklyCard, setShowWeeklyCard] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetScore.toString());
  const [readingInput, setReadingInput] = useState('');
  const [showiOSInstructions, setShowiOSInstructions] = useState(false);
  const [showWeeklyGoalsSettings, setShowWeeklyGoalsSettings] = useState(false);
  const [goalsConfig, setGoalsConfig] = useState<WeeklyGoalsConfig>(loadWeeklyGoalsConfig);

  const weeklyGoalsSummary = useMemo(() => {
    return calculateWeeklyGoalsProgress(logs, goalsConfig, log.date);
  }, [logs, goalsConfig, log.date]);
  
  // حفظ ومزامنة ساعات تسجيل العبادات لتقديم جراف إيماني ديناميكي معبر
  const [worshipHours, setWorshipHours] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const saved = localStorage.getItem('worship_log_times');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const activeFortyChallenge = useMemo(() => {
    try {
      const saved = localStorage.getItem('worship_forty_challenges_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.find((c: any) => !c.isCompleted) || parsed[0] || null;
      }
    } catch (e) {}
    return null;
  }, []);

  const todayTadabburSeed = useMemo(() => {
    const day = new Date().getDate();
    return DAILY_TADABBUR_SEEDS[day % DAILY_TADABBUR_SEEDS.length];
  }, []);

  const fortressOverview = useMemo(() => {
    const prayers = log?.prayers || {};
    const getPrayerDone = (arKey: string, enKey: string) => {
      return Boolean(prayers[arKey]?.performed || prayers[enKey]?.performed);
    };
    const fardCount = [
      getPrayerDone(PrayerName.FAJR, 'fajr'),
      getPrayerDone(PrayerName.DHUHR, 'dhuhr'),
      getPrayerDone(PrayerName.ASR, 'asr'),
      getPrayerDone(PrayerName.MAGHRIB, 'maghrib'),
      getPrayerDone(PrayerName.ISHA, 'isha'),
    ].filter(Boolean).length;
    
    const athkar = log?.athkar || { checklists: { morning: false, evening: false, sleep: false, travel: false }, counters: {} };
    let athkarScore = 0;
    if (athkar.checklists?.morning) athkarScore += 35;
    if (athkar.checklists?.evening) athkarScore += 35;
    if (athkar.checklists?.sleep) athkarScore += 20;
    if (athkar.checklists?.travel) athkarScore += 10;
    const counters = Object.values(athkar.counters || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const detailedCount = Object.values(log?.athkar?.completedDetailedAthkar || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    if (counters > 0 || detailedCount > 0) athkarScore += 10;
    const athkarPercent = Math.min(100, athkarScore);

    const nawafil = log?.nawafil || { duhaDuration: 0, qiyamDuration: 0, witrDuration: 0, fasting: false };
    const surroundingList = (Object.values(prayers) as PrayerEntry[]).flatMap(p => p?.surroundingSunnahIds || []);
    const hasNawafil = (nawafil.duhaDuration || 0) > 0 || (nawafil.qiyamDuration || 0) > 0 || (nawafil.witrDuration || 0) > 0 || (log?.customSunnahIds?.length || 0) > 0 || surroundingList.length > 0 || !!nawafil.fasting;

    const hasQuran = (log?.quran?.readPages?.length || 0) > 0 || (log?.quran?.hifzRub || 0) > 0 || (log?.quran?.revisionRub || 0) > 0 || (log?.tadabburNotes?.length || 0) > 0 || !!log?.quran?.surahName || (log?.quran?.todayPortion && log?.quran?.todayPortion.length > 0);

    let totalScore = Math.round((fardCount / 5) * 50 + (athkarPercent / 100) * 25 + (hasNawafil ? 15 : 0) + (hasQuran ? 10 : 0));
    totalScore = Math.min(100, totalScore);

    let rank = 'بنيان في طور التأسيس';
    if (totalScore >= 90) rank = 'حصن الصدّيقين المنيع 🏰';
    else if (totalScore >= 70) rank = 'قلعة الأبرار المحصّنة 🛡️';
    else if (totalScore >= 45) rank = 'صرح المجاهدة والارتقاء 🏛️';

    return { fardCount, athkarPercent, hasNawafil, hasQuran, totalScore, rank };
  }, [log]);

  // مراقبة وحفظ توقيت تسجيل العبادات التفاعلية المخصصة لرفع الايمان بدقة في ساعة التسجيل الفعلي
  useEffect(() => {
    if (!log) return;
    const dateStr = log.date;
    const now = new Date();
    const isToday = dateStr === format(now, 'yyyy-MM-dd');
    const currentHour = now.getHours();

    let updated = false;
    const times = { ...worshipHours };
    if (!times[dateStr]) {
      times[dateStr] = {};
    }

    const dayTimes = { ...times[dateStr] };

    // 1. ورد القرآن الكريم
    const hasQuranVal = (log.quran.revisionRub || 0) > 0 || (log.quran.hifzRub || 0) > 0;
    if (hasQuranVal && dayTimes['quran'] === undefined) {
      dayTimes['quran'] = isToday ? currentHour : 15;
      updated = true;
    } else if (!hasQuranVal && dayTimes['quran'] !== undefined) {
      delete dayTimes['quran'];
      updated = true;
    }

    // 2. الأذكار المطلقة العدادات
    const hasAbsoluteAthkarVal = Object.values(log.athkar.counters || {}).some(val => val > 0);
    if (hasAbsoluteAthkarVal && dayTimes['absolute_athkar'] === undefined) {
      dayTimes['absolute_athkar'] = isToday ? currentHour : 11;
      updated = true;
    } else if (!hasAbsoluteAthkarVal && dayTimes['absolute_athkar'] !== undefined) {
      delete dayTimes['absolute_athkar'];
      updated = true;
    }

    // 3. أوراد طلب العلم والقراءة
    const hasKnowledgeVal = (log.knowledge.shariDuration || 0) > 0 || (log.knowledge.readingDuration || 0) > 0;
    if (hasKnowledgeVal && dayTimes['knowledge'] === undefined) {
      dayTimes['knowledge'] = isToday ? currentHour : 16;
      updated = true;
    } else if (!hasKnowledgeVal && dayTimes['knowledge'] !== undefined) {
      delete dayTimes['knowledge'];
      updated = true;
    }

    // 4. الأعمال والسنن المخصصة
    const hasCustomActionsVal = (log.customSunnahIds || []).length > 0 || (log.nawafil.custom || []).some(c => c.value > 0);
    if (hasCustomActionsVal && dayTimes['custom'] === undefined) {
      dayTimes['custom'] = isToday ? currentHour : 10;
      updated = true;
    } else if (!hasCustomActionsVal && dayTimes['custom'] !== undefined) {
      delete dayTimes['custom'];
      updated = true;
    }

    if (updated) {
      times[dateStr] = dayTimes;
      setWorshipHours(times);
      localStorage.setItem('worship_log_times', JSON.stringify(times));
    }
  }, [log, worshipHours]);
  
  const isFirstRender = useRef(true);
  const prevBadgesActiveState = useRef<Record<string, boolean>>({});

  const currentTotalScore = calculateTotalScore(log, weights);
  const progressPercent = (currentTotalScore / targetScore) * 100;

  const activeBook = useMemo(() => books.find(b => !b.isFinished), [books]);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
  
  const handleUpdateReading = () => {
    if (!activeBook || !readingInput) return;
    const pages = parseInt(readingInput);
    if (isNaN(pages) || pages <= 0) return;
    onUpdateBook(activeBook, pages);
    setReadingInput('');
    confetti({ 
      particleCount: 100, 
      spread: 70, 
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399']
    });
  };

  const handleUpdateMood = (mood: number) => {
    onUpdateLog({ ...log, mood });
    if (mood >= 4) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.9 } });
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowiOSInstructions(true);
      return;
    }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      onClearInstallPrompt();
      confetti({ particleCount: 150, spread: 90 });
    }
  };

  const handleSaveTarget = () => {
    const val = parseInt(tempTarget);
    if (!isNaN(val) && val > 0) {
      onTargetChange(val);
      setIsEditingTarget(false);
    }
  };

  const badges = useMemo(() => {
    const rawatibIds = ['fajr_pre', 'dhuhr_pre', 'dhuhr_post', 'maghrib_post', 'isha_post'];
    const allUserSunnahs = (Object.values(log.prayers) as PrayerEntry[]).flatMap(p => p.surroundingSunnahIds || []);
    const fullRawatibDone = rawatibIds.every(id => allUserSunnahs.includes(id));
    
      const istighfarCount = log.athkar.counters.istighfar || 0;
      const hawqalahCount = log.athkar.counters.hawqalah || 0;
      const salawatCount = log.athkar.counters.salawat || 0;

      return [
        { id: 'rawatib', title: 'بيت في الجنة', desc: 'من صلى ثنتي عشرة ركعة..', icon: <Home className="w-6 h-6" />, active: fullRawatibDone, color: 'from-emerald-400 to-emerald-600' },
        { id: 'fajr', title: 'بشرى الرؤية', desc: 'تستحق رؤية الله في الآخرة', icon: <Sun className="w-6 h-6" />, active: log.prayers[PrayerName.FAJR]?.performed, color: 'from-orange-400 to-orange-500' },
        { 
          id: 'istighfar', 
          title: 'مفتاح الرزق', 
          desc: istighfarCount >= 500 ? 'فقلت استغفروا ربكم.. يرسل السماء (أنجزت ٥٠٠)' : `يتفعّل عند ٥٠٠ استغفار (${istighfarCount}/500)`, 
          icon: <Coins className="w-6 h-6" />, 
          active: istighfarCount >= 500, 
          color: 'from-blue-400 to-blue-600' 
        },
        { id: 'fasting', title: 'بعيد عن النار', desc: 'باعد الله وجهه عن النار ٧٠ خريفاً', icon: <Flame className="w-6 h-6" />, active: log.nawafil.fasting, color: 'from-rose-400 to-rose-600' },
        { 
          id: 'hawqalah', 
          title: 'مفتاح النجاح', 
          desc: hawqalahCount >= 500 ? 'لا حول ولا قوة إلا بالله كنز الجنة (أنجزت ٥٠٠)' : `يتفعّل عند ٥٠٠ حوقلة (${hawqalahCount}/500)`, 
          icon: <Key className="w-6 h-6" />, 
          active: hawqalahCount >= 500, 
          color: 'from-indigo-400 to-indigo-600' 
        },
        { 
          id: 'salawat', 
          title: 'مفتاح القرب من النبي', 
          desc: salawatCount >= 500 ? 'أقربكم مني مجلساً أكثركم صلاة علي (أنجزت ٥٠٠)' : `يتفعّل عند ٥٠٠ صلاة على النبي (${salawatCount}/500)`, 
          icon: <Heart className="w-6 h-6" />, 
          active: salawatCount >= 500, 
          color: 'from-pink-400 to-pink-600' 
        },
      ];
  }, [log]);

  useEffect(() => {
    if (isFirstRender.current) {
      badges.forEach(badge => { prevBadgesActiveState.current[badge.id] = !!badge.active; });
      isFirstRender.current = false;
      return;
    }
    let triggered = false;
    badges.forEach(badge => {
      if (badge.active && !prevBadgesActiveState.current[badge.id]) triggered = true;
      prevBadgesActiveState.current[badge.id] = !!badge.active;
    });
    if (triggered) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#fbbf24', '#3b82f6', '#f43f5e', '#a855f7'], zIndex: 9999 });
    }
  }, [badges]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = addDays(new Date(), -i);
      const d = format(dateObj, 'yyyy-MM-dd');
      const l = logs[d];
      return { 
        date: format(dateObj, 'EEE', { locale: ar }), 
        score: l ? calculateTotalScore(l, weights) : 0,
        target: targetScore
      };
    }).reverse();
  }, [logs, weights, targetScore]);

  // نطاق عرض نبض الإيمان (اليوم كاملاً 24 ساعة أو حتى اللحظة الحالية)
  const [faithChartScope, setFaithChartScope] = useState<'all' | 'untilNow'>('all');

  // دالة حساب منحنى نبض الإيمان والسكينة على مدار اليوم بنظام Line Chart
  // المحور الرأسي يمثل عدد النقاط، والأفقي يمثل الوقت
  // احتساب معامل الغفلة: إذا مضت ساعة من غير تسجيل لأي عبادة ينزل المؤشر تلقائياً 20%
  const intradayFaithData = useMemo(() => {
    const prayers = log.prayers || {};
    const athkar = log.athkar || { checklists: { morning: false, evening: false, sleep: false, travel: false }, counters: {} };
    const quran = log.quran || {};
    const nawafil = log.nawafil || {};
    const mood = log.mood || 3;

    // جلب أوقات التسجيل الفعلية لكل عبادة عبر سجل الساعات المسجلة محلياً
    const dayTimes = worshipHours[log.date] || {};
    const quranHour = dayTimes['quran'] !== undefined ? dayTimes['quran'] : (log.date === format(new Date(), 'yyyy-MM-dd') ? new Date().getHours() : 14);
    const athkarHour = dayTimes['absolute_athkar'] !== undefined ? dayTimes['absolute_athkar'] : (log.date === format(new Date(), 'yyyy-MM-dd') ? new Date().getHours() : 11);
    const knowledgeHour = dayTimes['knowledge'] !== undefined ? dayTimes['knowledge'] : (log.date === format(new Date(), 'yyyy-MM-dd') ? new Date().getHours() : 16);
    const customHour = dayTimes['custom'] !== undefined ? dayTimes['custom'] : (log.date === format(new Date(), 'yyyy-MM-dd') ? new Date().getHours() : 10);

    // تجهيز جدول العبادات المنجزة موزعة على ساعات اليوم (0-23)
    interface HourlyWorshipItem {
      name: string;
      points: number;
    }
    const hourlyWorshipMap: Record<number, HourlyWorshipItem[]> = {};
    for (let h = 0; h < 24; h++) {
      hourlyWorshipMap[h] = [];
    }

    const addWorship = (hour: number, name: string, points: number) => {
      const validHour = Math.max(0, Math.min(23, Math.floor(hour)));
      hourlyWorshipMap[validHour].push({ name, points: Math.max(1, Math.round(points)) });
    };

    // 1. صلاة الفجر (الساعة 5 ص)
    if (prayers[PrayerName.FAJR]?.performed) {
      const isCong = prayers[PrayerName.FAJR]?.inCongregation;
      const sunnahCount = (prayers[PrayerName.FAJR]?.surroundingSunnahIds || []).length;
      addWorship(5, `صلاة الفجر${isCong ? ' (جماعة)' : ''}`, (isCong ? 45 : 30) + sunnahCount * 10);
    }

    // 2. أذكار الصباح (الساعة 6 أو وقت تسجيلها)
    const detailedData = athkar.completedDetailedAthkar || {};
    const hasMorningAthkar = athkar.checklists?.morning || Object.keys(detailedData).some(k => k.startsWith('m_') && (detailedData[k] || 0) > 0);
    if (hasMorningAthkar) {
      const morningHour = dayTimes['morning_athkar'] !== undefined ? dayTimes['morning_athkar'] : 6;
      addWorship(morningHour, 'أذكار الصباح والتحصين', 30);
    }

    // 3. صلاة الضحى (الساعة 9 ص أو وقت تسجيلها)
    if ((nawafil.duhaDuration || 0) > 0) {
      const duhaHour = dayTimes['duha'] !== undefined ? dayTimes['duha'] : 9;
      addWorship(duhaHour, 'صلاة الضحى', 20 + Math.min(15, Math.floor((nawafil.duhaDuration || 0) / 2)));
    }

    // 4. صيام التطوع
    if (nawafil.fasting) {
      addWorship(5, 'نية صيام التطوع', 25);
      addWorship(18, 'أجر الصيام وإفطار الصائم', 30);
    }

    // 5. ورد الدعاء والابتهال والأعمال المخصصة (الساعة 10 ص أو وقت تسجيلها)
    const hasCustomActions = (log.customSunnahIds || []).length > 0 || (nawafil.custom || []).some(c => c.value > 0);
    const hasDua = (log.duaIdsCompleted || []).length > 0;
    if (hasCustomActions || hasDua) {
      const items: string[] = [];
      let pts = 0;
      if (hasCustomActions) {
        items.push('الأعمال والسنن المخصصة');
        pts += 20 + Math.min(20, (log.customSunnahIds || []).length * 5);
      }
      if (hasDua) {
        items.push('ورد الدعاء والابتهال');
        pts += 15 + Math.min(20, (log.duaIdsCompleted || []).length * 4);
      }
      addWorship(customHour, items.join(' و '), pts);
    }

    // 6. عدادات السبحة والأذكار المطلقة (الساعة 11 ص أو وقت تسجيلها)
    const counterTotal = Object.values(athkar.counters || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);
    if (counterTotal > 0) {
      addWorship(athkarHour, `أوراد التسبيح والسبحة (${counterTotal.toLocaleString()} تسبيحة)`, Math.min(50, 15 + Math.floor(counterTotal / 40)));
    }

    // 7. صلاة الظهر (الساعة 12 م)
    if (prayers[PrayerName.DHUHR]?.performed) {
      const isCong = prayers[PrayerName.DHUHR]?.inCongregation;
      const sunnahCount = (prayers[PrayerName.DHUHR]?.surroundingSunnahIds || []).length;
      addWorship(12, `صلاة الظهر${isCong ? ' (جماعة)' : ''}`, (isCong ? 40 : 25) + sunnahCount * 10);
    }

    // 8. ورد القرآن الكريم (الساعة 2 م أو وقت تسجيلها)
    const hasQuran = (quran.revisionRub || 0) > 0 || (quran.hifzRub || 0) > 0 || (quran.readPages || []).length > 0;
    if (hasQuran) {
      const quranPts = 25 + Math.min(40, ((quran.revisionRub || 0) + (quran.hifzRub || 0)) * 6 + (quran.readPages || []).length * 2);
      addWorship(quranHour, 'ورد القرآن الكريم (تلاوة وتدبر)', quranPts);
    }

    // 9. صلاة العصر (الساعة 3 م)
    if (prayers[PrayerName.ASR]?.performed) {
      const isCong = prayers[PrayerName.ASR]?.inCongregation;
      const sunnahCount = (prayers[PrayerName.ASR]?.surroundingSunnahIds || []).length;
      addWorship(15, `صلاة العصر${isCong ? ' (جماعة)' : ''}`, (isCong ? 40 : 25) + sunnahCount * 10);
    }

    // 10. طلب العلم والقراءة (الساعة 4 م أو وقت تسجيلها)
    const hasKnowledge = (log.knowledge?.shariDuration || 0) > 0 || (log.knowledge?.readingDuration || 0) > 0 || (log.knowledge?.readingPages || 0) > 0;
    if (hasKnowledge) {
      const duration = (log.knowledge?.shariDuration || 0) + (log.knowledge?.readingDuration || 0);
      addWorship(knowledgeHour, 'طلب العلم ومدارسة الكتب', 20 + Math.min(30, Math.floor(duration / 3)));
    }

    // 11. أذكار المساء والتحصين (الساعة 5 م)
    const hasEveningAthkar = athkar.checklists?.evening || Object.keys(detailedData).some(k => k.startsWith('e_') && (detailedData[k] || 0) > 0);
    if (hasEveningAthkar) {
      const eveningHour = dayTimes['evening_athkar'] !== undefined ? dayTimes['evening_athkar'] : 17;
      addWorship(eveningHour, 'أذكار المساء والتحصين', 30);
    }

    // 12. صلاة المغرب (الساعة 6 م)
    if (prayers[PrayerName.MAGHRIB]?.performed) {
      const isCong = prayers[PrayerName.MAGHRIB]?.inCongregation;
      const sunnahCount = (prayers[PrayerName.MAGHRIB]?.surroundingSunnahIds || []).length;
      addWorship(18, `صلاة المغرب${isCong ? ' (جماعة)' : ''}`, (isCong ? 40 : 25) + sunnahCount * 10);
    }

    // 13. صلاة العشاء (الساعة 8 م)
    if (prayers[PrayerName.ISHA]?.performed) {
      const isCong = prayers[PrayerName.ISHA]?.inCongregation;
      const sunnahCount = (prayers[PrayerName.ISHA]?.surroundingSunnahIds || []).length;
      addWorship(20, `صلاة العشاء${isCong ? ' (جماعة)' : ''}`, (isCong ? 40 : 25) + sunnahCount * 10);
    }

    // 14. صلاة الوتر والتزكية (الساعة 9 م)
    const hasWitr = (nawafil.witrDuration || 0) > 0;
    const hasHeartDeeds = (log.heartStates?.deeds && Object.values(log.heartStates.deeds).some(arr => Array.isArray(arr) && arr.length > 0));
    if (hasWitr || hasHeartDeeds) {
      const items: string[] = [];
      let pts = 0;
      if (hasWitr) {
        items.push('صلاة الوتر');
        pts += 20;
      }
      if (hasHeartDeeds) {
        items.push('أعمال القلوب والتزكية');
        pts += 20;
      }
      addWorship(21, items.join(' و '), pts);
    }

    // 15. قيام الليل والتهجد (الساعة 10 م أو الثلث الأخير)
    if ((nawafil.qiyamDuration || 0) > 0) {
      const qiyamHour = dayTimes['qiyam'] !== undefined ? dayTimes['qiyam'] : 22;
      addWorship(qiyamHour, 'قيام الليل والتهجد', 30 + Math.min(30, Math.floor((nawafil.qiyamDuration || 0) / 2)));
    }

    // 16. أذكار النوم وسورة الملك (الساعة 11 م)
    if (athkar.checklists?.sleep) {
      addWorship(23, 'أذكار النوم وسورة الملك', 25);
    }

    // ترتيب الساعات على مدار اليوم الإسلامي من الفجر (5:00 ص) حتى 4:00 ص
    const hoursOrder = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4];

    const formatHourLabel = (h: number) => {
      if (h === 0) return '12:00 ص';
      if (h === 12) return '12:00 م';
      return h > 12 ? `${h - 12}:00 م` : `${h}:00 ص`;
    };

    // احتساب معامل الغفلة وتراكم النقاط عبر الساعات:
    // كل ساعة من غير تسجيل لأي عبادة ينزل المؤشر تلقائياً بنسبة 20%
    let runningPoints = 0;
    const moodBonus = (mood - 3) * 4;

    return hoursOrder.map((hour) => {
      const events = hourlyWorshipMap[hour] || [];
      const hasWorship = events.length > 0;
      let pointsAdded = 0;
      let decayLost = 0;
      let isNeglected = false;

      if (hasWorship) {
        pointsAdded = events.reduce((sum, e) => sum + e.points, 0);
        runningPoints += pointsAdded;
      } else {
        // ساعة دون عبادة: تطبيق معامل الغفلة (-20%)
        if (runningPoints > 0) {
          decayLost = Math.round(runningPoints * 0.20 * 10) / 10;
          runningPoints = Math.max(0, Math.round((runningPoints - decayLost) * 10) / 10);
          isNeglected = true;
        } else {
          runningPoints = 0;
          decayLost = 0;
        }
      }

      const netPoints = Math.max(0, Math.round((runningPoints + (runningPoints > 0 ? moodBonus : 0)) * 10) / 10);

      // صياغة اللفظ الإرشادي للقلب
      let description = 'حالة قلبية في طور الاستعداد وشحذ الهمة للذكر والتعبد.';
      if (netPoints >= 150) {
        description = 'إيمان مشعّ غامر بالسكينة ورصيد مبارك من الطاعات والبركات 🌟';
      } else if (netPoints >= 100) {
        description = 'طاعة متواصلة ونور قلبي منشرح مع حراسة القلب من الفتور 🌿';
      } else if (netPoints >= 60) {
        description = 'سعي صالح ونشاط قلبي متوازن؛ حافظ على وردك لتمنع هبوط المؤشر ✨';
      } else if (netPoints >= 25) {
        description = 'بداية إشراق بوارق السلام؛ بادر بذكر أو ركعات لرفع رصيدك 💪';
      } else if (netPoints > 0) {
        description = 'رصيد إيماني قليل؛ تذكّر أن الغفلة تنقص 20% كل ساعة فانعش قلبك 🚀';
      } else {
        description = 'المؤشر في نقطة البداية، سجّل طاعتك ليبدأ رصيد السكينة بالصعود 🌱';
      }

      return {
        hour: formatHourLabel(hour),
        rawHour: hour,
        points: netPoints,
        hasWorship,
        isNeglected,
        pointsAdded,
        decayLost,
        events,
        description
      };
    });
  }, [log, worshipHours]);

  const nowTime = new Date();
  const isViewingToday = log.date === format(nowTime, 'yyyy-MM-dd');
  const currentRawHour = nowTime.getHours();

  const getHourOrder = (h: number) => (h - 5 + 24) % 24;

  // تصفية البيانات بحسب نطاق العرض المختار
  const displayFaithData = useMemo(() => {
    if (!isViewingToday || faithChartScope === 'all') {
      return intradayFaithData;
    }
    const currentOrder = getHourOrder(currentRawHour);
    return intradayFaithData.filter(d => getHourOrder(d.rawHour) <= currentOrder);
  }, [intradayFaithData, isViewingToday, faithChartScope, currentRawHour]);

  // إحصائيات نبض الإيمان السريعة
  const faithStats = useMemo(() => {
    const peakPoints = Math.max(...intradayFaithData.map(d => d.points), 0);
    const activeHours = intradayFaithData.filter(d => d.hasWorship).length;
    const neglectedHours = intradayFaithData.filter(d => d.isNeglected).length;
    const totalDecayPoints = Math.round(intradayFaithData.reduce((acc, d) => acc + (d.decayLost || 0), 0));

    let currentPoints = 0;
    if (isViewingToday) {
      const currentOrder = getHourOrder(currentRawHour);
      const passed = intradayFaithData.filter(d => getHourOrder(d.rawHour) <= currentOrder);
      if (passed.length > 0) {
        currentPoints = passed[passed.length - 1].points;
      }
    } else {
      currentPoints = intradayFaithData.length > 0 ? intradayFaithData[intradayFaithData.length - 1].points : 0;
    }

    return {
      peakPoints,
      activeHours,
      neglectedHours,
      totalDecayPoints,
      currentPoints
    };
  }, [intradayFaithData, isViewingToday, currentRawHour]);

  // نقطة مخصصة على خط المنحنى لتمييز ساعات العبادة وساعات الغفلة
  const CustomLineDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !payload) return null;

    if (payload.hasWorship) {
      return (
        <g key={`dot-${payload.rawHour}`}>
          <circle cx={cx} cy={cy} r={6} fill="#10b981" stroke="#ffffff" strokeWidth={2.5} />
          <circle cx={cx} cy={cy} r={2} fill="#ffffff" />
        </g>
      );
    }

    if (payload.isNeglected) {
      return (
        <circle 
          key={`dot-${payload.rawHour}`}
          cx={cx} 
          cy={cy} 
          r={3.5} 
          fill="#f43f5e" 
          stroke="#ffffff" 
          strokeWidth={1.5} 
          opacity={0.85}
        />
      );
    }

    return (
      <circle 
        key={`dot-${payload.rawHour}`}
        cx={cx} 
        cy={cy} 
        r={2.5} 
        fill="#cbd5e1" 
      />
    );
  };

  // مكوّن تفاعلي لعرض التفاصيل والنقاط ومعامل الغفلة عند الوقوف على أي ساعة
  const CustomFaithTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-white/10 shadow-2xl space-y-2.5 font-sans text-right max-w-xs" dir="rtl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-black text-emerald-400">الساعة {data.hour}</span>
            </div>
            <span className="text-xs font-black text-white font-mono bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
              {data.points} نقطة
            </span>
          </div>

          {data.hasWorship ? (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-emerald-300 text-[11px] font-black">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>طاعات مسجلة</span>
                </span>
                <span className="font-mono text-emerald-200">+{data.pointsAdded} نقطة</span>
              </div>
              <div className="space-y-1 text-[10px] text-emerald-100 font-bold pr-1">
                {data.events.map((ev: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>• {ev.name}</span>
                    <span className="font-mono text-[9px] text-emerald-300">+{ev.points}ن</span>
                  </div>
                ))}
              </div>
            </div>
          ) : data.isNeglected ? (
            <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center justify-between text-rose-300 text-[11px] font-black">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>معامل الغفلة (-20%)</span>
                </span>
                <span className="font-mono text-rose-200">-{data.decayLost} نقطة</span>
              </div>
              <p className="text-[10px] text-rose-100/90 font-bold leading-relaxed">
                مضت ساعة دون تسجيل عبادة فهبط المؤشر بنسبة 20% من الرصيد السابق.
              </p>
            </div>
          ) : (
            <div className="bg-slate-800/60 rounded-xl p-2 text-[10px] text-slate-300 font-bold">
              بداية اليوم والاستعداد للأوراد والصلوات.
            </div>
          )}

          <p className="text-[10px] font-bold text-slate-200 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  const moodConfig = [
    { value: 1, label: 'ضيق', icon: <Ghost className="w-5 h-5" />, color: 'text-slate-400', bg: 'bg-slate-50' },
    { value: 2, label: 'قلق', icon: <Frown className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-50' },
    { value: 3, label: 'عادي', icon: <Meh className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: 4, label: 'منشرح', icon: <Smile className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { value: 5, label: 'سكينة', icon: <CloudSun className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      
      {/* بطاقة تثبيت التطبيق */}
      {(installPrompt || (isIOS && !isStandalone)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-5 shadow-sm animate-bounce-slow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-200 rounded-2xl"><Smartphone className="w-6 h-6 text-amber-700" /></div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 header-font leading-tight">ثبّت التطبيق الآن</h4>
              <p className="text-[10px] text-amber-700 font-bold header-font">لسهولة الوصول وتجربة أسرع 🌙</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleInstallClick} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-black text-xs header-font shadow-md active:scale-95 transition-all">{isIOS ? 'كيفية التثبيت' : 'تثبيت'} <Download className="w-3.5 h-3.5" /></button>
            <button onClick={onClearInstallPrompt} className="p-1 text-amber-400 hover:text-amber-600"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* 1. مواقيت الصلاة القادمة والعد التنازلي */}
      <NextPrayerWidget />

      {/* قلعة الإيمان وبنيان اليوم الحي */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-amber-400 shadow-inner">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    بنيان الإيمان الحي
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 font-mono">
                    {fortressOverview.totalScore}% اكتمال
                  </span>
                </div>
                <h3 className="text-base font-black header-font leading-tight text-white mt-1">
                  {fortressOverview.rank}
                </h3>
              </div>
            </div>

            <button
              onClick={() => onSwitchTab('fortress')}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-black text-xs header-font shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>محراب القلعة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* شريط التحصين المصغر والعناصر الأربعة */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <p className="text-[9px] text-slate-300 font-bold">أبراج الفرائض</p>
              <p className="text-xs font-black text-amber-300 font-mono mt-0.5">
                {fortressOverview.fardCount} / 5
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <p className="text-[9px] text-slate-300 font-bold">درع الأذكار</p>
              <p className="text-xs font-black text-emerald-300 font-mono mt-0.5">
                {fortressOverview.athkarPercent}%
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <p className="text-[9px] text-slate-300 font-bold">شرفة النوافل</p>
              <p className="text-xs font-black text-sky-300 font-mono mt-0.5">
                {fortressOverview.hasNawafil ? 'مضاءة ✨' : 'بانتظارك'}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <p className="text-[9px] text-slate-300 font-bold">مشكاة القرآن</p>
              <p className="text-xs font-black text-purple-300 font-mono mt-0.5">
                {fortressOverview.hasQuran ? 'عامرة 📖' : 'بانتظارك'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1.1. بطاقة أذكار اليوم التفاعلية */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-[2rem] p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full opacity-30 translate-x-12 -translate-y-12 blur-2xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shrink-0">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black header-font leading-tight">الأذكار والتحصين التفاعلي 🌅 🌃 🛌</h3>
              <p className="text-[10px] text-emerald-200 mt-1 font-bold leading-relaxed">
                اضغط لقراءة أذكار الصباح والمساء والنوم. تحكّم بالعداد بلمسة مع تغذية ونقاط فوريّة للرصيد الروحي!
              </p>
            </div>
          </div>
          <button 
            onClick={() => onSwitchTab('athkar')} 
            className="w-full sm:w-auto px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 rounded-xl font-black text-xs header-font shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            ابدأ القراءة
          </button>
        </div>
      </div>

      {/* تحدي الأربعين يوماً */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-emerald-900 text-white rounded-[2rem] p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full opacity-30 -translate-x-12 -translate-y-12 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shrink-0">
              <Target className="w-6 h-6 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  تحدي الأربعين
                </span>
                {activeFortyChallenge && (
                  <span className="text-[10px] font-bold text-amber-200 font-mono">
                    {activeFortyChallenge.completedDays?.length || 0} / 40 يوماً
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black header-font leading-tight">
                {activeFortyChallenge ? activeFortyChallenge.habitTitle : 'التزم بعادة 40 يوماً متواصلة'}
              </h3>
              <p className="text-[10px] text-amber-100/80 font-bold leading-relaxed">
                {activeFortyChallenge 
                  ? `أنجزت ${Math.min(100, Math.round(((activeFortyChallenge.completedDays?.length || 0) / 40) * 100))}% من التحدي. اضغط لمتابعة الأيام وتسجيل إنجاز اليوم!`
                  : '«كتبت له براءتان: براءة من النار، وبراءة من النفاق» — رسخ طاعتك لتصبح سجية.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onSwitchTab('forty')} 
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs header-font shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            {activeFortyChallenge ? 'متابعة التحدي' : 'ابدأ التحدي الآن'}
          </button>
        </div>
      </div>

      {/* قبس وتدبر اليوم القرآني */}
      {todayTadabburSeed && (
        <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-[2rem] p-5 sm:p-6 shadow-md border border-emerald-500/20 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-black text-emerald-300 uppercase block tracking-wider">
                  Quran Tadabbur • قبس اليوم
                </span>
                <h4 className="text-xs font-black header-font text-white">
                  سورة {todayTadabburSeed.surahName} [الآية {todayTadabburSeed.ayahNumber}]
                </h4>
              </div>
            </div>

            <button 
              onClick={() => onSwitchTab('quran')}
              className="flex items-center gap-1.5 text-amber-300 hover:text-white font-bold text-xs header-font bg-white/10 hover:bg-emerald-600/60 px-3.5 py-1.5 rounded-xl border border-white/10 transition-all self-start sm:self-auto active:scale-95"
            >
              <span>محراب التدبر والتدوين</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/5 my-2">
            <p className="quran-font text-sm sm:text-base text-center leading-loose text-amber-100/95">
              ﴿ {todayTadabburSeed.ayahText} ﴾
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-emerald-200/80 pt-2 border-t border-white/10">
            <span className="font-bold text-slate-300 leading-relaxed">
              💡 {todayTadabburSeed.inspiration}
            </span>
            <span className="text-amber-300 font-bold shrink-0">
              🎯 {todayTadabburSeed.suggestedAction}
            </span>
          </div>
        </div>
      )}

      {/* 2. الهدف اليومي */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><Target className="w-5 h-5 text-emerald-500" /></div>
            <h3 className="font-bold text-slate-800 header-font text-sm">هدف اليوم</h3>
          </div>
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1">
                <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-20 px-2 py-1 bg-slate-50 border border-emerald-200 rounded-lg text-xs font-black text-center outline-none" autoFocus />
                <button onClick={handleSaveTarget} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => setIsEditingTarget(false)} className="p-1.5 bg-slate-100 text-slate-400 rounded-lg"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <button onClick={() => { setIsEditingTarget(true); setTempTarget(targetScore.toString()); }} className="flex items-center gap-1.5 hover:bg-slate-50 p-1 px-2 rounded-lg transition-colors">
                <span className={`text-xs font-black font-mono ${currentTotalScore < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {currentTotalScore.toLocaleString()} / {targetScore.toLocaleString()}
                </span>
                <Edit2 className="w-3 h-3 text-slate-300" />
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden mb-2">
          <div className={`${currentTotalScore < 0 ? 'bg-rose-400' : 'bg-emerald-500'} h-full transition-all duration-1000`} style={{ width: `${Math.max(0, Math.min(progressPercent, 100))}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 font-bold text-center">
          {currentTotalScore < 0 
            ? `عجز في الرصيد (${currentTotalScore.toLocaleString()} نقطة) - بادر بالتوبة والعمل الصالح لتعويضه`
            : `لقد أنجزت ${Math.round(progressPercent)}% من هدفك الروحي`}
        </p>
      </div>

      {/* 2.5 الأهداف الأسبوعية المخصصة */}
      <WeeklyGoalsDashboardCard
        summary={weeklyGoalsSummary}
        onOpenCharts={() => {
          if (onOpenWeeklyEvaluation) {
            onOpenWeeklyEvaluation('custom_goals');
          }
        }}
        onOpenSettings={() => setShowWeeklyGoalsSettings(true)}
      />

      {/* 3. متابعة القراءة اليومية (تم تصغير المربع) */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><BookMarked className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 header-font leading-tight">متابعة القراءة</h3>
              <p className="text-[9px] text-slate-400 font-bold header-font">دوّن صفحاتك المقروءة</p>
            </div>
          </div>
          <button onClick={() => onSwitchTab('library')} className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] header-font hover:underline">المكتبة <ChevronLeft className="w-3 h-3" /></button>
        </div>
        {activeBook ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <h4 className="text-[11px] font-bold text-slate-700 truncate max-w-[150px]">{activeBook.title}</h4>
                <span className="text-[10px] font-black text-emerald-600 header-font">{Math.round((activeBook.currentPages / activeBook.totalPages) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(activeBook.currentPages / activeBook.totalPages) * 100}%` }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 rounded-xl p-1 border border-transparent focus-within:bg-white focus-within:border-emerald-100 transition-all">
                <input 
                  type="number" 
                  value={readingInput} 
                  onChange={(e) => setReadingInput(e.target.value)} 
                  placeholder="عدد الصفحات" 
                  className="w-full bg-transparent px-3 py-2 text-xs font-bold header-font outline-none text-center placeholder:text-slate-300" 
                />
              </div>
              <button onClick={handleUpdateReading} className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"><Check className="w-5 h-5 stroke-[3]" /></button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-2xl"><p className="text-[10px] text-slate-400 font-bold header-font">أضف كتاباً من المكتبة للبدء</p></div>
        )}
      </div>

      {/* 4. أوسمة الأبرار اليوم */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6"><Award className="w-6 h-6 text-amber-500" /><h3 className="text-xl font-bold text-slate-800 header-font">أوسمة الأبرار اليوم</h3></div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className={`relative flex flex-col items-center text-center p-5 rounded-[1.8rem] transition-all duration-300 border ${badge.active ? `bg-gradient-to-br ${badge.color} text-white border-transparent shadow-md` : 'bg-white border-slate-50 grayscale opacity-40'}`}>
              {badge.active && <div className="absolute top-2 left-2 bg-white/20 p-1 rounded-full backdrop-blur-md"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
              <div className={`p-3 rounded-2xl mb-3 ${badge.active ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-300'}`}>{badge.active ? badge.icon : <Lock className="w-5 h-5" />}</div>
              <h4 className="text-[12px] font-bold header-font mb-1 leading-tight">{badge.title}</h4>
              <p className={`text-[8px] font-bold leading-relaxed px-1 opacity-80`}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. مؤشر الطمأنينة القلبية (Mood Tracker) */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 rounded-2xl"><CloudSun className="w-6 h-6 text-amber-600" /></div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 header-font">مؤشر الطمأنينة القلبية</h3>
            <p className="text-[10px] text-slate-400 font-bold header-font">كيف وجدت قلبك اليوم بعد أورادك؟</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          {moodConfig.map((m) => (
            <button
              key={m.value}
              onClick={() => handleUpdateMood(m.value)}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${log.mood === m.value ? `${m.bg} border-${m.color.split('-')[1]}-200 shadow-sm scale-110` : 'bg-white border-slate-50 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
            >
              <div className={`${m.color} transition-transform duration-300 ${log.mood === m.value ? 'scale-125' : ''}`}>
                {m.icon}
              </div>
              <span className={`text-[9px] font-black header-font ${log.mood === m.value ? m.color : 'text-slate-400'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* مخطط الحالة الإيمانية على مدار ساعات اليوم (Line Chart مع معامل الغفلة) */}
      <div className="bg-white rounded-[2.5rem] p-5 sm:p-7 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 header-font">نبض طمأنينة الإيمان والسكينة</h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Line Chart تفاعلي
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold header-font mt-0.5">
                المحور الرأسي يمثل <span className="text-emerald-700 font-black">عدد النقاط</span> والأفقي يمثل <span className="text-emerald-700 font-black">الوقت</span> (ينخفض المؤشر 20% تلقائياً كل ساعة دون عبادة)
              </p>
            </div>
          </div>

          {/* تبديل نطاق العرض لليوم */}
          {isViewingToday && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setFaithChartScope('all')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                  faithChartScope === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                اليوم كاملاً (24 ساعة)
              </button>
              <button
                type="button"
                onClick={() => setFaithChartScope('untilNow')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                  faithChartScope === 'untilNow'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                حتى الساعة الحالية
              </button>
            </div>
          )}
        </div>

        {/* بطاقات الإحصاءات السريعة لنبض اليوم */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="p-3 bg-gradient-to-br from-emerald-50/70 to-white rounded-2xl border border-emerald-100/70 text-right">
            <span className="text-[10px] font-black text-emerald-800 header-font flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              الرصيد اللحظي الحالي
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-emerald-700">{faithStats.currentPoints}</span>
              <span className="text-[10px] text-slate-400 font-bold">نقطة</span>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-amber-50/70 to-white rounded-2xl border border-amber-100/70 text-right">
            <span className="text-[10px] font-black text-amber-800 header-font flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              أعلى ذروة نقاط اليوم
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-amber-700">{faithStats.peakPoints}</span>
              <span className="text-[10px] text-slate-400 font-bold">نقطة</span>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-teal-50/70 to-white rounded-2xl border border-teal-100/70 text-right">
            <span className="text-[10px] font-black text-teal-800 header-font flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              ساعات الطاعة النشطة
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-teal-700">{faithStats.activeHours}</span>
              <span className="text-[10px] text-slate-400 font-bold">ساعات</span>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-rose-50/70 to-white rounded-2xl border border-rose-100/70 text-right">
            <span className="text-[10px] font-black text-rose-800 header-font flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              ساعات الغفلة (-20%)
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-rose-700">{faithStats.neglectedHours}</span>
              <span className="text-[10px] text-slate-400 font-bold">ساعات (-{faithStats.totalDecayPoints}ن)</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-emerald-700 bg-emerald-50/60 p-2.5 rounded-xl border border-dashed border-emerald-200/70 mb-3 font-bold leading-normal flex items-center justify-between gap-2 flex-wrap">
          <span>👈 مرّر المخطط أفقياً لمتابعة خط التطور والتذبذب ساعة بساعة على مدار اليوم!</span>
          <span className="text-slate-500 font-medium">النقاط الخضراء 🟢 تمثل عبادات مسجلة، والنقاط الحمراء 🔴 تمثل ساعات الغفلة (-20%)</span>
        </p>

        <div className="overflow-x-auto w-full pb-2 select-none" dir="rtl">
          <div className="h-64 min-w-[850px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayFaithData} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={{ stroke: '#cbd5e1' }} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700, fontFamily: 'Cairo' }} 
                />
                <YAxis 
                  domain={[0, (dataMax: number) => Math.max(100, Math.ceil((dataMax + 20) / 20) * 20)]}
                  axisLine={{ stroke: '#cbd5e1' }} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700, fontFamily: 'Cairo' }}
                  tickFormatter={(val) => `${val} ن`}
                  width={50}
                />
                <Tooltip content={<CustomFaithTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  name="عدد النقاط" 
                  stroke="#10b981" 
                  strokeWidth={3.5} 
                  dot={<CustomLineDot />}
                  activeDot={{ r: 8, stroke: '#059669', strokeWidth: 3, fill: '#ffffff' }} 
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* دليل سريع لشرح المؤشر ودفع الهمّة وتوضيح معامل الغفلة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 border-t border-slate-50 pt-4">
          <div className="flex gap-2.5 items-start p-3 bg-slate-50/60 rounded-2xl border border-slate-100">
            <span className="text-emerald-600 font-bold text-base shrink-0">📈</span>
            <p className="text-[11px] text-slate-600 leading-normal font-bold">
              <span className="text-emerald-700 font-black">المحور الرأسي (عدد النقاط):</span> يرتفع رصيدك مع كل فريضة وجماعة وسنن وأذكار وقرآن، والنقاط الخضراء 🟢 تمثل ساعات الطاعة والإنجاز.
            </p>
          </div>
          <div className="flex gap-2.5 items-start p-3 bg-amber-50/40 rounded-2xl border border-amber-100/60">
            <span className="text-amber-600 font-bold text-base shrink-0">⏳</span>
            <p className="text-[11px] text-slate-600 leading-normal font-bold">
              <span className="text-rose-700 font-black">معامل الغفلة (-20% كل ساعة):</span> إذا مرّت ساعة دون تسجيل طاعة، يهبط المؤشر تلقائياً بنسبة 20% لتذكيرك بتجديد صلتك بالله ودوام الذكر.
            </p>
          </div>
        </div>
      </div>

      {/* 6. مخطط التطور الأسبوعي (في النهاية) */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><History className="w-5 h-5" /></div>
             <div>
               <h3 className="text-sm font-bold text-slate-800 header-font leading-tight">مخطط التطور الأسبوعي</h3>
               <p className="text-[10px] text-slate-400 font-bold">تتبع رصيدك الإيماني على مدار الأسبوع</p>
             </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setShowWeeklyCard(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white rounded-xl text-xs font-black header-font shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <Share className="w-3.5 h-3.5 text-amber-300" />
              <span>بطاقة حصاد الأسبوع 🖼️</span>
            </button>
            <div className="text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-2 rounded-lg border border-amber-100 hidden sm:block">
              الخط يمثل هدفك اليومي
            </div>
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700, fontFamily: 'Cairo' }} 
              />
              <YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax, targetScore) + 2000]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo' }} 
                formatter={(value: any) => [value.toLocaleString(), 'النقاط']}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                fill="url(#scoreGradient)" 
                strokeWidth={3} 
                animationDuration={1500}
              />
              <ReferenceLine 
                y={targetScore} 
                stroke="#f59e0b" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={{ position: 'right', value: 'الهدف', fill: '#d97706', fontSize: 9, fontWeight: 'bold' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* مودال بطاقة الإنجاز الأسبوعي القابلة للمشاركة */}
      <WeeklyCardModal
        isOpen={showWeeklyCard}
        onClose={() => setShowWeeklyCard(false)}
        logs={logs}
        weights={weights}
        user={user || null}
        targetScore={targetScore}
      />

      {/* نافذة تحديد الأهداف الأسبوعية المخصصة */}
      <WeeklyGoalsSettingsModal
        isOpen={showWeeklyGoalsSettings}
        onClose={() => setShowWeeklyGoalsSettings(false)}
        config={goalsConfig}
        weights={weights}
        onSave={(newCfg) => setGoalsConfig(newCfg)}
      />

    </div>
  );
};

export default Dashboard;
