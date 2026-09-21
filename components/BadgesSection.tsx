import React, { useState, useMemo } from 'react';
import { 
  Award, Crown, Flame, Sparkles, ShieldCheck, CheckCircle, 
  Lock, ArrowRight, Share2, Copy, Check, Eye, EyeOff, RotateCcw,
  Trophy, Star, Calendar, ChevronRight, X, HeartHandshake, Info
} from 'lucide-react';
import { DailyLog, AppWeights, User } from '../types';
import { calculateTotalScore } from '../utils/scoring';
import { format, addDays, parseISO, differenceInCalendarDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import confetti from 'canvas-confetti';

interface BadgesSectionProps {
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  user: User | null;
}

export interface BadgeDefinition {
  id: string;
  daysRequired: number;
  title: string;
  subtitle: string;
  description: string;
  hadith: string;
  hadithSource: string;
  tier: 'silver' | 'bronze' | 'gold' | 'emerald' | 'amber' | 'royal';
  isMajor?: boolean; // Highlighted 30-day badge
}

const BADGES_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'streak_7',
    daysRequired: 7,
    title: 'وسام البداية المباركة',
    subtitle: '٧ أيام متتالية من الورد',
    description: 'إتمام أسبوع كامل من المداومة والاستقامة على الأوراد دون انقطاع.',
    hadith: '«سَدِّدُوا وَقَارِبُوا، وَاعْلَمُوا أَنْ لَنْ يُنَجِّيَ أَحَدًا مِنْكُمْ عَمَلُهُ»',
    hadithSource: 'صحيح البخاري',
    tier: 'bronze'
  },
  {
    id: 'streak_14',
    daysRequired: 14,
    title: 'وسام المجاهدة والمصابرة',
    subtitle: '١٤ يوماً متتالياً من الورد',
    description: 'تثبيت عادة العبادة لأسبوعين متصلين ومجاهدة النفس في ذات الله.',
    hadith: '«وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ»',
    hadithSource: 'سورة العنكبوت: ٦٩',
    tier: 'silver'
  },
  {
    id: 'streak_30',
    daysRequired: 30,
    title: 'وسام الثبات الراسخ (تاج الثلاثين يوماً)',
    subtitle: '٣٠ يوماً متتالياً من الالتزام التام بالورد',
    description: 'أتممت شهراً كاملاً متواصلاً من العبادة والذكر والقرآن، وهو أمارة الاستقامة ورسوخ الإيمان.',
    hadith: '«أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»',
    hadithSource: 'صحيح مسلم',
    tier: 'gold',
    isMajor: true
  },
  {
    id: 'streak_40',
    daysRequired: 40,
    title: 'وسام أربعينية الصالحين',
    subtitle: '٤٠ يوماً متتالياً من الورد',
    description: 'بلوغ أربعين يوماً من المداومة الإيمانية الخالصة اقتداءً بمنهج التزكية.',
    hadith: '«مَنْ صَلَّى لِلَّهِ أَرْبَعِينَ يَوْمًا فِي جَمَاعَةٍ يُدْرِكُ التَّكْبِيرَةَ الأُولَى كُتِبَتْ لَهُ بَرَاءَتَانِ»',
    hadithSource: 'سنن الترمذي',
    tier: 'emerald'
  },
  {
    id: 'streak_60',
    daysRequired: 60,
    title: 'وسام عابد الدهر',
    subtitle: '٦٠ يوماً متتالياً من الورد',
    description: 'شهران متصلان من الإقبال والخشوع وبناء الحصن الإيماني المتين.',
    hadith: '«إِنَّ لِكُلِّ عَمَلٍ شِرَّةً، وَلِكُلِّ شِرَّةٍ فَتْرَةً، فَمَنْ كَانَتْ فَتْرَتُهُ إِلَى سُنَّتِي فَقَدِ اهْتَدَى»',
    hadithSource: 'مسند أحمد',
    tier: 'amber'
  },
  {
    id: 'streak_100',
    daysRequired: 100,
    title: 'وسام المئة الذهبي',
    subtitle: '١٠٠ يوم متتالٍ من الورد',
    description: 'مائة يوم كاملة من رسوخ الطاعة ونور الذكر، نسأل الله حسن الخاتمة والقبول.',
    hadith: '«يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ»',
    hadithSource: 'سورة آل عمران: ٢٠٠',
    tier: 'royal'
  }
];

export const BadgesSection: React.FC<BadgesSectionProps> = ({ logs, weights, user }) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [copiedCertificate, setCopiedCertificate] = useState(false);
  const [preview30Days, setPreview30Days] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  // حساب التتابع المتتالي وأطول تتابع تاريخي وإجمالي الأيام
  const streakStats = useMemo(() => {
    const isCommittedDay = (log?: DailyLog): boolean => {
      if (!log) return false;
      const score = calculateTotalScore(log, weights);
      if (score > 0) return true;
      const prayersDone = Object.values(log.prayers || {}).some(p => p.performed);
      if (prayersDone) return true;
      const quranDone = (log.quran?.readPages?.length || 0) > 0 || (log.quran?.hifzRub || 0) > 0 || (log.quran?.revisionRub || 0) > 0 || !!log.quran?.todayPortion;
      if (quranDone) return true;
      const athkarDone = Object.values(log.athkar?.checklists || {}).some(Boolean);
      if (athkarDone) return true;
      const knowledgeDone = (log.knowledge?.shariDuration || 0) + (log.knowledge?.readingDuration || 0) > 0;
      return knowledgeDone;
    };

    const dates = Object.keys(logs).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
    if (dates.length === 0) {
      return { currentStreak: 0, bestStreak: 0, totalDays: 0, maxConsecutive: 0 };
    }

    const committedDates = new Set<string>();
    dates.forEach(d => {
      if (isCommittedDay(logs[d])) {
        committedDates.add(d);
      }
    });

    const totalDays = committedDates.size;

    // حساب التتابع الحالي backwards from today
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(addDays(today, -1), 'yyyy-MM-dd');

    let currentStreak = 0;
    const checkStart = committedDates.has(todayStr) ? today : (committedDates.has(yesterdayStr) ? addDays(today, -1) : null);

    if (checkStart) {
      let curr = checkStart;
      while (committedDates.has(format(curr, 'yyyy-MM-dd'))) {
        currentStreak++;
        curr = addDays(curr, -1);
      }
    }

    // حساب أطول تتابع تاريخي
    let bestStreak = 0;
    const sortedCommitted = Array.from(committedDates).sort();
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedCommitted) {
      const d = parseISO(dStr);
      if (prevDate) {
        const diff = differenceInCalendarDays(d, prevDate);
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = d;
      bestStreak = Math.max(bestStreak, tempStreak);
    }

    const maxConsecutive = Math.max(currentStreak, bestStreak);

    return {
      currentStreak,
      bestStreak,
      totalDays,
      maxConsecutive
    };
  }, [logs, weights]);

  // التتابع الفعلي المستخدم في تقييم الأوسمة مع دعم نمط المعاينة
  const effectiveStreak = preview30Days ? Math.max(streakStats.maxConsecutive, 30) : streakStats.maxConsecutive;

  // فحص وسام الثلاثين يوماً المستهدف
  const badge30 = useMemo(() => {
    return BADGES_DEFINITIONS.find(b => b.id === 'streak_30')!;
  }, []);

  const is30DaysUnlocked = effectiveStreak >= 30;

  // إطلاق الاحتفال
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#fbbf24']
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#10b981', '#f59e0b', '#fbbf24']
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#10b981', '#f59e0b', '#fbbf24']
      });
    }, 250);
  };

  const handleShareCertificate = (badge: BadgeDefinition) => {
    const text = `🌟 بفضل الله ومنّه، تم تحقيق:
🏆 ${badge.title}
✨ ${badge.subtitle}
📖 ${badge.hadith} (${badge.hadithSource})
🤲 نسأل الله الإخلاص والقبول والثبات حتى الممات.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCertificate(true);
      setTimeout(() => setCopiedCertificate(false), 3000);
    }
  };

  // قائمة الأوسمة مفلترة
  const filteredBadges = useMemo(() => {
    return BADGES_DEFINITIONS.filter(badge => {
      const isUnlocked = effectiveStreak >= badge.daysRequired;
      if (filterTab === 'unlocked') return isUnlocked;
      if (filterTab === 'locked') return !isUnlocked;
      return true;
    });
  }, [effectiveStreak, filterTab]);

  const unlockedCount = useMemo(() => {
    return BADGES_DEFINITIONS.filter(b => effectiveStreak >= b.daysRequired).length;
  }, [effectiveStreak]);

  return (
    <div className="space-y-5" dir="rtl">
      {/* بطاقة العنوان العلوية وملخص التتابع */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white shadow-md shadow-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 header-font text-base sm:text-lg">أوسمة الإنجاز والثبات الإيماني</h3>
                {preview30Days && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200 animate-pulse">
                    معاينة تجريبية
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-bold header-font">تكريم الاستقامة والمداومة المتصلة على الورد اليومي</p>
            </div>
          </div>

          {/* مفتاح المعاينة السريع لوسام الـ 30 يوماً */}
          <button
            onClick={() => {
              const next = !preview30Days;
              setPreview30Days(next);
              if (next) triggerConfetti();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-2 border ${
              preview30Days 
                ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {preview30Days ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-600" />}
            <span>{preview30Days ? 'إيقاف المعاينة' : 'معاينة وسام الـ 30 يوماً'}</span>
          </button>
        </div>

        {/* إحصائيات التتابع السريعة */}
        <div className="grid grid-cols-3 gap-2.5 pt-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-orange-500 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-[10px] font-bold text-slate-400">التتابع الحالي</span>
            </div>
            <p className="text-xl font-black text-slate-800 font-mono">{streakStats.currentStreak} <span className="text-[10px] font-normal text-slate-500">يوم</span></p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] font-bold text-slate-400">أطول تتابع</span>
            </div>
            <p className="text-xl font-black text-slate-800 font-mono">{effectiveStreak} <span className="text-[10px] font-normal text-slate-500">يوم</span></p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[10px] font-bold text-slate-400">الأوسمة</span>
            </div>
            <p className="text-xl font-black text-emerald-700 font-mono">{unlockedCount} <span className="text-[10px] font-normal text-slate-500">/ ٦</span></p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* الوسام الرئيسي المستهدف: وسام الثبات الراسخ (٣٠ يوماً متتالياً) */}
      {/* ========================================================================= */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8 transition-all border-2 ${
        is30DaysUnlocked 
          ? 'bg-gradient-to-br from-amber-50 via-amber-100/50 to-emerald-50 border-amber-300 shadow-xl shadow-amber-500/10' 
          : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        {/* خلفية جمالية مشعة عند الفتح */}
        {is30DaysUnlocked && (
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
          {/* أيقونة الوسام الكبير */}
          <div className="relative shrink-0">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center p-2 border-4 transition-all ${
              is30DaysUnlocked 
                ? 'bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 border-amber-200 shadow-2xl shadow-amber-500/40 animate-pulse' 
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}>
              {is30DaysUnlocked ? (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex flex-col items-center justify-center text-white relative shadow-inner">
                  <Crown className="w-10 h-10 text-amber-200 mb-0.5 filter drop-shadow" />
                  <span className="text-xs font-black font-mono tracking-widest text-amber-100">30 DAYS</span>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <Lock className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-bold font-mono">30 DAYS</span>
                </div>
              )}
            </div>
            {is30DaysUnlocked && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> مستحق!
              </span>
            )}
          </div>

          {/* تفاصيل الوسام */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black header-font bg-amber-100 text-amber-800 border border-amber-200">
                وسام الالتزام الأكبر
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-slate-100 text-slate-700">
                ٣٠ يوماً متتالياً
              </span>
              {is30DaysUnlocked && (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> تم الفتح بنجاح
                </span>
              )}
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-slate-900 header-font">
              {badge30.title}
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
              {badge30.description}
            </p>

            {/* الأثر النبوي الشريف */}
            <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/60 inline-flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-bold text-amber-900">
              <span className="text-amber-600 font-serif text-sm">«أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»</span>
              <span className="text-[10px] text-amber-700/70 font-normal">({badge30.hadithSource})</span>
            </div>

            {/* شريط التقدم للـ 30 يوماً */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>التقدم نحو وسام الثلاثين يوماً:</span>
                </span>
                <span className="font-mono text-slate-800 font-black">
                  {Math.min(effectiveStreak, 30)} / 30 يوم ({Math.round((Math.min(effectiveStreak, 30) / 30) * 100)}%)
                </span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    is30DaysUnlocked 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-sm' 
                      : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (effectiveStreak / 30) * 100)}%` }}
                />
              </div>

              {!is30DaysUnlocked && (
                <p className="text-[11px] text-slate-400 font-bold mt-1.5 text-right">
                  متبقٍ <b className="text-slate-700 font-mono font-black">{Math.max(0, 30 - effectiveStreak)}</b> يوماً متتالياً من المحافظة على الورد لفتح هذا الوسام المبارك.
                </p>
              )}
            </div>

            {/* أزرار التفاعل لوسام الـ 30 يوماً */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              {is30DaysUnlocked ? (
                <>
                  <button
                    onClick={triggerConfetti}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-black text-xs header-font shadow-md shadow-amber-500/30 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" /> احتفل بالإنجاز
                  </button>

                  <button
                    onClick={() => setSelectedBadge(badge30)}
                    className="px-5 py-2.5 bg-white text-slate-800 border border-slate-200 hover:border-amber-300 rounded-xl font-black text-xs header-font shadow-sm transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Award className="w-4 h-4 text-amber-600" /> عرض شهادة التكريم
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setPreview30Days(true);
                    triggerConfetti();
                  }}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs header-font transition-all flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" /> تجربة معاينة مظهر الوسام عند الفتح
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* شبكة الأوسمة والرتب الإيمانية (مصفوفة الأوسمة) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs sm:text-sm font-black text-slate-800 header-font">سلسلة رتب الاستقامة المتواصلة</h4>
          </div>

          {/* تبويبات الفرز */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              الكل ({BADGES_DEFINITIONS.length})
            </button>
            <button
              onClick={() => setFilterTab('unlocked')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'unlocked' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              المحققة ({unlockedCount})
            </button>
            <button
              onClick={() => setFilterTab('locked')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'locked' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              المتبقية ({BADGES_DEFINITIONS.length - unlockedCount})
            </button>
          </div>
        </div>

        {/* عرض شبكة الأوسمة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBadges.map((badge) => {
            const isUnlocked = effectiveStreak >= badge.daysRequired;
            const progress = Math.min(100, Math.round((effectiveStreak / badge.daysRequired) * 100));

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between ${
                  isUnlocked
                    ? badge.id === 'streak_30'
                      ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400 shadow-xs hover:shadow-md'
                      : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300 shadow-xs hover:shadow-md'
                    : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2 shadow-xs ${
                      isUnlocked
                        ? badge.id === 'streak_30'
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/20'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isUnlocked ? (
                        badge.id === 'streak_30' ? <Crown className="w-6 h-6" /> : <Award className="w-6 h-6" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="text-left">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> تم التحقيق
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 font-mono">
                          {effectiveStreak}/{badge.daysRequired} يوماً
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-black text-slate-800 header-font group-hover:text-emerald-700 transition-colors">
                      {badge.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>{isUnlocked ? 'مكتمل بالكامل' : `متبقٍ ${Math.max(0, badge.daysRequired - effectiveStreak)} يوماً`}</span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        isUnlocked 
                          ? badge.id === 'streak_30' ? 'bg-amber-500' : 'bg-emerald-500' 
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* نافذة شهادة التكريم وعرض تفاصيل الوسام المنبثقة */}
      {/* ========================================================================= */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto text-right" dir="rtl">
            <button 
              onClick={() => setSelectedBadge(null)} 
              className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* محتوى الشهادة الفخمة */}
            <div className="space-y-6 pt-2">
              {/* أيقونة الوسام في الشهادة */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center p-3 border-4 shadow-xl ${
                  effectiveStreak >= selectedBadge.daysRequired
                    ? selectedBadge.id === 'streak_30'
                      ? 'bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 border-amber-200 text-white shadow-amber-500/30'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-200 text-white shadow-emerald-500/30'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  {selectedBadge.id === 'streak_30' ? (
                    <Crown className="w-12 h-12" />
                  ) : (
                    <Award className="w-12 h-12" />
                  )}
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700">
                    {effectiveStreak >= selectedBadge.daysRequired ? 'وسام محقق ومستحق ✨' : 'وسام قيد التحقيق ⏳'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 header-font mt-2">
                    {selectedBadge.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 header-font">
                    {selectedBadge.subtitle}
                  </p>
                </div>
              </div>

              {/* بطاقة التكريم والشهادة الروحية */}
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/70 rounded-2xl p-5 border border-amber-200/80 space-y-4 shadow-xs">
                <div className="text-center space-y-1 border-b border-amber-100 pb-3">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest header-font">شهادة ثبات واستقامة</p>
                  <p className="text-sm font-black text-slate-800 header-font">
                    مُنحت للأخ المبارك: <span className="text-emerald-700 font-extrabold">{user?.name || 'صاحب الهمة'}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed text-center font-medium">
                  {selectedBadge.description}
                </p>

                {/* الحديث الشريف المؤصل */}
                <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200/60 text-center space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-amber-900 font-serif leading-relaxed">
                    {selectedBadge.hadith}
                  </p>
                  <p className="text-[10px] text-amber-700/80 font-bold">
                    {selectedBadge.hadithSource}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 pt-1">
                  <span>تاريخ المراجعة: {format(new Date(), 'yyyy/MM/dd', { locale: ar })}</span>
                  <span>التتابع: {Math.max(effectiveStreak, selectedBadge.daysRequired)} يوماً</span>
                </div>
              </div>

              {/* أزرار العمليات */}
              <div className="space-y-2.5">
                {effectiveStreak >= selectedBadge.daysRequired && (
                  <button
                    onClick={triggerConfetti}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-black text-xs header-font shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" /> إطلاق الاحتفال بالوسام 🎉
                  </button>
                )}

                <button
                  onClick={() => handleShareCertificate(selectedBadge)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs header-font hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {copiedCertificate ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCertificate ? 'تم نسخ نص الشهادة بنجاح' : 'نسخ نص الشهادة للمشاركة'}</span>
                </button>

                <button
                  onClick={() => setSelectedBadge(null)}
                  className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs header-font hover:bg-slate-200 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
