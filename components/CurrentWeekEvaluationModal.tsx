import React, { useMemo } from 'react';
import {
  X,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
  Share2,
  ChevronRight,
  Flame,
  BarChart2,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';
import { DailyLog, AppWeights } from '../types';
import { calculateTotalScore } from '../utils/scoring';

interface CurrentWeekEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  targetScore: number;
  currentDate: string;
  onOpenShareCard?: () => void;
  onSelectDate?: (dateStr: string) => void;
}

const ARABIC_WEEKDAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export const CurrentWeekEvaluationModal: React.FC<CurrentWeekEvaluationModalProps> = ({
  isOpen,
  onClose,
  logs,
  weights,
  targetScore,
  currentDate,
  onOpenShareCard,
  onSelectDate
}) => {
  // حساب تفاصيل الأسبوع الحالي بدقة (يبدأ الأحد وينتهي السبت)
  const weekData = useMemo(() => {
    // التاريخ المرجعي (تاريخ اليوم المحدد)
    const refDate = new Date(currentDate.replace(/-/g, '/'));
    const dayOfWeek = refDate.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday

    // بداية الأسبوع (يوم الأحد - Day 0)
    const sunday = new Date(refDate);
    sunday.setDate(refDate.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    // نهاية الأسبوع (يوم السبت - Day 6)
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    const daysInfo = [];
    let cumulativeScoreElapsed = 0;
    let daysElapsedCount = 0;
    let daysTargetMetCount = 0;
    let bestDayScore = 0;
    let bestDayName = '';

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dStr = format(d, 'yyyy-MM-dd');
      const dayLog = logs[dStr];
      const score = dayLog ? calculateTotalScore(dayLog, weights) : 0;
      const isToday = dStr === currentDate;
      const isPastOrToday = i <= dayOfWeek;
      const isFuture = i > dayOfWeek;
      const pctOfDailyTarget = Math.round((score / (targetScore || 1)) * 100);

      if (isPastOrToday) {
        cumulativeScoreElapsed += score;
        daysElapsedCount++;
        if (score >= targetScore) {
          daysTargetMetCount++;
        }
        if (score > bestDayScore) {
          bestDayScore = score;
          bestDayName = ARABIC_WEEKDAYS[i];
        }
      }

      daysInfo.push({
        index: i,
        dayName: ARABIC_WEEKDAYS[i],
        date: d,
        dateStr: dStr,
        displayDate: format(d, 'd MMMM', { locale: ar }),
        score,
        target: targetScore,
        pct: pctOfDailyTarget,
        isToday,
        isPastOrToday,
        isFuture,
        isTargetMet: score >= targetScore
      });
    }

    // الهدف اليومي التراكمي للأيام المنقضية حتى اليوم
    const cumulativeTargetElapsed = daysElapsedCount * targetScore;
    const cumulativePercentage = cumulativeTargetElapsed > 0
      ? Math.round((cumulativeScoreElapsed / cumulativeTargetElapsed) * 100)
      : 0;

    // الهدف الكلي للأسبوع كاملاً (7 أيام)
    const fullWeekTarget = targetScore * 7;
    const fullWeekPercentage = Math.round((cumulativeScoreElapsed / fullWeekTarget) * 100);

    const weekRangeLabel = `من الأحد ${format(sunday, 'd MMMM', { locale: ar })} إلى السبت ${format(saturday, 'd MMMM', { locale: ar })}`;

    return {
      sunday,
      saturday,
      weekRangeLabel,
      daysInfo,
      daysElapsedCount,
      daysTargetMetCount,
      cumulativeScoreElapsed,
      cumulativeTargetElapsed,
      cumulativePercentage,
      fullWeekTarget,
      fullWeekPercentage,
      bestDayScore,
      bestDayName
    };
  }, [currentDate, logs, weights, targetScore]);

  if (!isOpen) return null;

  // تقييم وصفي مشجع حسب نسبة الإنجاز التراكمي
  const getFeedbackBadge = (pct: number) => {
    if (pct >= 110) {
      return {
        text: 'أداء استثنائي متألق 🌟 ما شاء الله',
        color: 'bg-emerald-500 text-white',
        border: 'border-emerald-400'
      };
    }
    if (pct >= 100) {
      return {
        text: 'مبارك! حققت الهدف التراكمي بامتياز 🌿',
        color: 'bg-teal-500 text-white',
        border: 'border-teal-400'
      };
    }
    if (pct >= 75) {
      return {
        text: 'أداء متميز وثابت.. واصل همتك العالية 💪',
        color: 'bg-amber-500 text-white',
        border: 'border-amber-400'
      };
    }
    if (pct >= 50) {
      return {
        text: 'إنجاز طيب.. بإمكانك تعويض ما فات في الأيام القادمة ⏳',
        color: 'bg-yellow-500 text-slate-900',
        border: 'border-yellow-400'
      };
    }
    return {
      text: 'بداية مباركة.. جدد نيتك واشحذ همتك في هذا الأسبوع ☀️',
      color: 'bg-slate-700 text-white',
      border: 'border-slate-600'
    };
  };

  const feedback = getFeedbackBadge(weekData.cumulativePercentage);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200 text-right" dir="rtl">
        {/* رأس النافذة */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 header-font">
                  تقييم الأسبوع الحالي
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 header-font">
                  الأحد - السبت
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {weekData.weekRangeLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بطاقة النسبة التراكمية الكبرى */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl -translate-y-12 translate-x-12 pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-emerald-200 font-black header-font block mb-1">
                  نسبة إنجاز الهدف اليومي التراكمي
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-amber-300">
                    {weekData.cumulativePercentage}%
                  </span>
                  <span className="text-xs text-emerald-200 font-bold">
                    من هدف الأيام المنقضية ({weekData.daysElapsedCount} من ٧ أيام)
                  </span>
                </div>
              </div>

              {/* شارة التقييم الإيماني */}
              <div className="sm:text-left">
                <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black header-font shadow-sm ${feedback.color}`}>
                  {feedback.text}
                </span>
              </div>
            </div>

            {/* شريط التقدم التراكمي */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold text-emerald-200">
                <span>الرصيد المحقق: {weekData.cumulativeScoreElapsed.toLocaleString()} نقطة</span>
                <span>الهدف التراكمي: {weekData.cumulativeTargetElapsed.toLocaleString()} نقطة</span>
              </div>
              <div className="w-full h-3 bg-black/30 rounded-full p-0.5 overflow-hidden border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    weekData.cumulativePercentage >= 100
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-300'
                  }`}
                  style={{ width: `${Math.min(100, weekData.cumulativePercentage)}%` }}
                ></div>
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-[10px] text-emerald-200 block font-bold">أيام تحقيق الهدف</span>
                <span className="text-sm font-black font-mono text-white">
                  {weekData.daysTargetMetCount} / {weekData.daysElapsedCount}
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-[10px] text-emerald-200 block font-bold">أعلى إنجاز يومي</span>
                <span className="text-sm font-black font-mono text-amber-300">
                  {weekData.bestDayScore > 0 ? `${weekData.bestDayScore.toLocaleString()}` : '-'}
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-[10px] text-emerald-200 block font-bold">إجمالي هدف الأسبوع</span>
                <span className="text-sm font-black font-mono text-white">
                  {weekData.fullWeekPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* تفاصيل أيام الأسبوع السبعة (الأحد إلى السبت) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-black text-slate-800 header-font flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>متابعة أيام الأسبوع (الأحد - السبت)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">
              يتجدد تلقائياً كل أول أسبوع
            </span>
          </div>

          <div className="space-y-2">
            {weekData.daysInfo.map(day => (
              <div
                key={day.dateStr}
                onClick={() => {
                  if (onSelectDate) {
                    onSelectDate(day.dateStr);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  day.isToday
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-xs ring-2 ring-emerald-500/20'
                    : day.isFuture
                    ? 'bg-slate-50/40 border-slate-100 opacity-60'
                    : 'bg-white border-slate-200 hover:border-emerald-200'
                } ${onSelectDate ? 'cursor-pointer hover:shadow-xs' : ''}`}
              >
                {/* اسم اليوم وتاريخه */}
                <div className="flex items-center gap-2.5 min-w-[6.5rem]">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      day.isToday
                        ? 'bg-emerald-600 text-white'
                        : day.isTargetMet
                        ? 'bg-emerald-100 text-emerald-800'
                        : day.isFuture
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {day.isTargetMet ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span>{day.index + 1}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-slate-800 header-font">
                        {day.dayName}
                      </span>
                      {day.isToday && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-600 text-white font-black">
                          اليوم
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {day.displayDate}
                    </span>
                  </div>
                </div>

                {/* شريط الإنجاز لليوم */}
                <div className="flex-1 max-w-[12rem] hidden xs:block">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>{day.score.toLocaleString()}</span>
                    <span>{day.target.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        day.isTargetMet
                          ? 'bg-emerald-500'
                          : day.score > 0
                          ? 'bg-amber-400'
                          : 'bg-slate-200'
                      }`}
                      style={{ width: `${Math.min(100, day.pct)}%` }}
                    ></div>
                  </div>
                </div>

                {/* النسبة المئوية والحالة */}
                <div className="flex items-center gap-2 text-left">
                  <div>
                    <span
                      className={`text-xs sm:text-sm font-black font-mono block ${
                        day.isFuture
                          ? 'text-slate-300'
                          : day.isTargetMet
                          ? 'text-emerald-600'
                          : day.score > 0
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {day.isFuture ? '-' : `${day.pct}%`}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold block">
                      {day.isFuture
                        ? 'قادم'
                        : day.isTargetMet
                        ? 'محقق'
                        : day.score > 0
                        ? 'دون الهدف'
                        : 'لم يسجل'}
                    </span>
                  </div>
                  {onSelectDate && (
                    <ChevronRight className="w-4 h-4 text-slate-300 rotate-180" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* أزرار الإجراءات السفلية */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {onOpenShareCard && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShareCard();
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-black header-font transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>تصدير بطاقة حصاد الأسبوع 🖼️</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black header-font transition-all mr-auto"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
