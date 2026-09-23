import React from 'react';
import {
  Target,
  Sliders,
  ChevronLeft,
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
  // Top 3 goals to display preview for
  const topGoals = summary.goalsProgress.slice(0, 3);

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:border-emerald-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 header-font text-sm sm:text-base leading-tight">
                الأهداف الأسبوعية المخصصة
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                {summary.completedGoalsCount} من {summary.totalGoalsCount} محقق
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">
              {summary.weekRangeLabel}
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

      {/* معاينة أبرز الأهداف */}
      <div className="space-y-2.5 mb-4">
        {topGoals.map(gp => {
          const isDone = gp.isCompleted;
          const pct = Math.min(100, gp.percentage);

          return (
            <div
              key={gp.goal.id}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-emerald-700 shrink-0">
                  {renderGoalIcon(gp.goal.iconName, 'w-3.5 h-3.5')}
                </span>
                <span className="font-bold text-slate-700 truncate text-[11px]">
                  {gp.goal.title}
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? 'bg-emerald-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 w-14 text-left">
                  {gp.current} / {gp.target}
                </span>
              </div>
            </div>
          );
        })}
      </div>

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
