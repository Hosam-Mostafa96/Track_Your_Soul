import React, { useState } from 'react';
import {
  Target,
  Sliders,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  BarChart2,
  Flame,
  Award
} from 'lucide-react';
import { WeeklyGoalsSummary } from '../types';
import { renderGoalIcon } from './WeeklyGoalsSettingsModal';

interface WeeklyGoalsDashboardCardProps {
  summary: WeeklyGoalsSummary;
  onOpenCharts: () => void;
  onOpenSettings: () => void;
}

export const WeeklyGoalsDashboardCard: React.FC<WeeklyGoalsDashboardCardProps> = ({
  summary,
  onOpenCharts,
  onOpenSettings
}) => {
  const [showAllGoals, setShowAllGoals] = useState(false);
  const displayedGoals = showAllGoals ? summary.goalsProgress : summary.goalsProgress.slice(0, 3);

  const formatStreakLabel = (days: number) => {
    if (days === 0) return 'ابدأ التتابع';
    if (days === 1) return 'يوم تتابع واحد';
    if (days === 2) return 'يومان متتاليان';
    if (days >= 3 && days <= 10) return `${days} أيام متتالية`;
    return `${days} يوماً متتالياً`;
  };

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:border-emerald-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 header-font text-sm sm:text-base leading-tight">
                الأهداف والتتابع الإيماني الأسبوعي
              </h3>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                أسبوع واحد (الأحد - السبت)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">
              {summary.weekRangeLabel} • يتجدد مع كل ليلة أحد
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all shrink-0"
          title="تخصيص الأهداف الأسبوعية"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* شريط شعلة التتابع الإيماني البارز (Hero Streak Showcase) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/90 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-sm shrink-0">
            <Flame className="w-5 h-5 fill-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-amber-950 header-font">سلسلة التتابع الإيماني:</span>
              <span className="text-xs font-black font-mono text-orange-700 bg-white/90 px-2.5 py-0.5 rounded-full border border-orange-200 shadow-2xs flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                <span>{summary.maxActiveStreak > 0 ? `${summary.maxActiveStreak} أيام متتالية` : 'ابدأ سلسلتك اليوم'}</span>
              </span>
            </div>
            <p className="text-[10px] text-amber-900/80 font-bold mt-0.5 truncate">
              {summary.activeStreakGoalsCount} أهداف بتتابع نشط • {summary.todayGoalsCompletedCount} أهداف أُنجزت اليوم • «أحبّ الأعمال إلى الله أدومها وإن قلّ»
            </p>
          </div>
        </div>
      </div>

      {/* شريط الإنجاز الكلي */}
      <div className="space-y-1.5 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            نسبة تحقيق المستهدفات الأسبوعية
          </span>
          <span className="font-mono font-black text-emerald-700 text-sm">
            {summary.overallCompletionPct}%
          </span>
        </div>
        <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              summary.overallCompletionPct >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : summary.overallCompletionPct >= 60
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, summary.overallCompletionPct))}%` }}
          />
        </div>
      </div>

      {/* بطاقات الأهداف مع الاستريك وسجل الأيام السبعة الظاهر تحت كل هدف */}
      <div className="space-y-3 mb-4">
        {displayedGoals.map(gp => {
          const isDone = gp.isCompleted;
          const pct = Math.min(100, gp.percentage);

          return (
            <div
              key={gp.goal.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-emerald-200'
              }`}
            >
              {/* السطر الأول: الأيقونة والعنوان ونسبة الإنجاز */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className={`p-1.5 rounded-xl shrink-0 ${isDone ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 shadow-2xs border border-slate-100'}`}>
                    {renderGoalIcon(gp.goal.iconName, 'w-4 h-4')}
                  </span>
                  <div className="min-w-0">
                    <span className="font-black text-slate-800 truncate text-xs block leading-tight">
                      {gp.goal.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      المستهدف: {gp.target} {gp.goal.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 text-left shrink-0">
                  <span className="font-mono font-black text-xs text-slate-800">
                    {gp.current}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    / {gp.target}
                  </span>
                  <span className={`text-[10px] font-black mr-1 ${isDone ? 'text-emerald-600' : 'text-slate-500'}`}>
                    ({pct}%)
                  </span>
                </div>
              </div>

              {/* شريط التقدم */}
              <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden mb-2.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDone
                      ? 'bg-emerald-500'
                      : pct >= 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* سطر الاستريك وسجل الأيام السبعة الظاهر جداً تحت كل هدف */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[10px]">
                {/* شارة الاستريك المتوهجة لهذا الهدف */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] transition-all shadow-2xs ${
                      gp.streak > 0
                        ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${gp.streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-300'}`} />
                    <span>{formatStreakLabel(gp.streak)}</span>
                  </span>

                  {gp.isTodayDone && (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      منجز اليوم
                    </span>
                  )}
                </div>

                {/* وتيرة الأيام السبعة الأسبوعية (الأحد إلى السبت) */}
                <div className="flex items-center gap-1" title="سجل الأيام السبعة لهذا الأسبوع">
                  {gp.dailyValues.map(dVal => {
                    const hasVal = dVal.value > 0;
                    return (
                      <div
                        key={dVal.dateStr}
                        className="flex flex-col items-center gap-0.5"
                        title={`${dVal.dayName}: ${dVal.value} ${gp.goal.unit}`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-mono font-black transition-all ${
                            hasVal
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : dVal.isPastOrToday
                              ? 'bg-slate-200 text-slate-400'
                              : 'bg-slate-100 text-slate-300'
                          } ${dVal.isToday ? 'ring-1.5 ring-emerald-500 ring-offset-1 font-bold' : ''}`}
                        >
                          {hasVal ? '✓' : '·'}
                        </span>
                        <span className="text-[6.5px] text-slate-400 font-bold leading-none">
                          {dVal.dayName.charAt(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* زر التبديل بين عرض 3 أهداف أو كافة الأهداف */}
      {summary.goalsProgress.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAllGoals(!showAllGoals)}
          className="w-full py-2 mb-3 text-xs font-bold text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50/50 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-100"
        >
          {showAllGoals ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>عرض أقل</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>عرض كافة الأهداف ({summary.goalsProgress.length} هدفاً) مع تتابعها</span>
            </>
          )}
        </button>
      )}

      {/* الأزرار السريعة */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenCharts}
          className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-black header-font text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>عرض الرسوم البيانية والتقدم الكامل</span>
          <ChevronLeft className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold header-font text-xs transition-colors shrink-0"
        >
          تخصيص
        </button>
      </div>
    </div>
  );
};
