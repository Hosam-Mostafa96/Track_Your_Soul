import React, { useState, useMemo } from 'react';
import {
  ListChecks,
  CheckCircle2,
  Circle,
  Flame,
  ChevronLeft,
  Sparkles,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckSquare2,
  Square
} from 'lucide-react';
import { WeeklyGoalsSummary, WeeklyGoalProgress } from '../types';
import { renderGoalIcon } from './WeeklyGoalsSettingsModal';

interface TodayRemainingGoalsChecklistProps {
  summary: WeeklyGoalsSummary;
  onNavigateTab?: (tab: string) => void;
  onOpenWeeklyGoalsModal?: () => void;
}

export const TodayRemainingGoalsChecklist: React.FC<TodayRemainingGoalsChecklistProps> = ({
  summary,
  onNavigateTab,
  onOpenWeeklyGoalsModal
}) => {
  const [showCompleted, setShowCompleted] = useState(false);

  // تصنيف الأهداف إلى متبقية ومنجزة لليوم الحالي
  const remainingGoals = useMemo(() => {
    return summary.goalsProgress.filter(g => !g.isTodayDone);
  }, [summary.goalsProgress]);

  const completedGoals = useMemo(() => {
    return summary.goalsProgress.filter(g => g.isTodayDone);
  }, [summary.goalsProgress]);

  const totalGoals = summary.goalsProgress.length;
  const completedCount = completedGoals.length;
  const remainingCount = remainingGoals.length;
  const progressPercent = totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0;

  const formatStreakLabel = (days: number) => {
    if (days === 0) return 'ابدأ التتابع';
    if (days === 1) return 'يوم تتابع';
    if (days === 2) return 'يومان';
    if (days >= 3 && days <= 10) return `${days} أيام`;
    return `${days} يوماً`;
  };

  const getActionLabel = (tabTarget?: string) => {
    switch (tabTarget) {
      case 'quran':
        return 'اقرأ الورد';
      case 'athkar':
        return 'الأذكار والسبحة';
      case 'entry':
        return 'سجّل الآن';
      case 'library':
        return 'المكتبة';
      default:
        return 'إنجاز';
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:border-amber-200">
      {/* الترويسة العلوية */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2.5 rounded-2xl shrink-0 ${remainingCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <ListChecks className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 header-font text-sm sm:text-base leading-tight">
                قائمة مهام اليوم المتبقية
              </h3>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                  remainingCount > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {remainingCount > 0 ? `متبقٍ ${remainingCount} من ${totalGoals}` : 'اكتملت جميع المهام ✓'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">
              {remainingCount > 0
                ? 'أكمل مهامك قبل نهاية اليوم الشرعي للحفاظ على سلاسل التتابع 🔥'
                : 'ما شاء الله! حافظت على جميع سلاسل التتابع لليوم بنجاح'}
            </p>
          </div>
        </div>

        {onOpenWeeklyGoalsModal && (
          <button
            type="button"
            onClick={onOpenWeeklyGoalsModal}
            className="p-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all shrink-0 border border-slate-100"
            title="عرض وتعديل خطة الأهداف"
          >
            الخطة
          </button>
        )}
      </div>

      {/* شريط الإنجاز اليومي السريع */}
      <div className="space-y-1.5 mb-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600 font-bold flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            نسبة إنجاز مهام اليوم
          </span>
          <span className="font-mono font-black text-slate-800 text-xs">
            {completedCount} من {totalGoals} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              progressPercent >= 100
                ? 'bg-emerald-500'
                : progressPercent >= 50
                ? 'bg-amber-500'
                : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>

      {/* قائمة المهام المتبقية التي لم تكتمل بعد (Checklist) */}
      {remainingGoals.length > 0 ? (
        <div className="space-y-2 mb-3">
          {remainingGoals.map(gp => {
            return (
              <div
                key={gp.goal.id}
                onClick={() => gp.goal.tabTarget && onNavigateTab && onNavigateTab(gp.goal.tabTarget)}
                className="group p-3 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/50 via-white to-slate-50/40 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                {/* رمز الصندوق غير المكتمل + تفاصيل الهدف */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-5 h-5 rounded-lg border-2 border-amber-400/80 bg-white flex items-center justify-center shrink-0 group-hover:border-amber-500 group-hover:scale-105 transition-all shadow-2xs">
                    <span className="w-2 h-2 rounded-sm bg-transparent group-hover:bg-amber-300 transition-colors" />
                  </div>

                  <span className="p-1.5 rounded-xl bg-amber-100/80 text-amber-900 shrink-0">
                    {renderGoalIcon(gp.goal.iconName, 'w-3.5 h-3.5')}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-black text-slate-800 text-xs header-font truncate group-hover:text-amber-950 transition-colors">
                        {gp.goal.title}
                      </h4>
                      {gp.streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500 animate-pulse" />
                          <span>{formatStreakLabel(gp.streak)}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-amber-900/80 font-bold mt-0.5 truncate">
                      المتبقي لليوم: <span className="font-mono font-black">{gp.dailyRecommendedTarget}</span> {gp.goal.unit}
                    </p>
                  </div>
                </div>

                {/* زر الانتقال المباشر للإنجاز */}
                {gp.goal.tabTarget && onNavigateTab && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateTab(gp.goal.tabTarget!);
                    }}
                    className="py-1 px-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-black header-font flex items-center gap-1 transition-all active:scale-95 shadow-2xs shrink-0"
                  >
                    <span>{getActionLabel(gp.goal.tabTarget)}</span>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* في حالة اكتمال جميع مهام اليوم بنجاح */
        <div className="p-5 text-center bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200 mb-3 space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-emerald-950 header-font">
            ما شاء الله! أنجزت جميع مهامك المقررة لليوم 🎉
          </h4>
          <p className="text-[10px] sm:text-[11px] text-emerald-800/80 font-bold max-w-sm mx-auto">
            حافظت على استمرارية كافة أهدافك وسلاسل تتابعك الإيماني دون أي انقطاع اليوم.
          </p>
        </div>
      )}

      {/* قسم المهام المنجزة اليوم (قابل للطي) */}
      {completedGoals.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>المهام المنجزة اليوم ({completedGoals.length})</span>
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {showCompleted ? 'إخفاء' : 'عرض'}
            </span>
          </button>

          {showCompleted && (
            <div className="space-y-1.5 mt-2 animate-in fade-in duration-200">
              {completedGoals.map(gp => (
                <div
                  key={gp.goal.id}
                  className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-700 text-[11px] truncate line-through decoration-slate-300">
                      {gp.goal.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ✓ تم ({gp.todayValue} {gp.goal.unit})
                    </span>
                    {gp.streak > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                        {gp.streak}د
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
