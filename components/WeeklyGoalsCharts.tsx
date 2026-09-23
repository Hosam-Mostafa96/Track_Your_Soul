import React, { useState, useMemo } from 'react';
import {
  Target,
  TrendingUp,
  BarChart2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Sliders,
  ChevronLeft,
  Flame,
  Award,
  Zap,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { WeeklyGoalsSummary, WeeklyGoalProgress, WorshipGoalCategory } from '../types';
import { renderGoalIcon } from './WeeklyGoalsSettingsModal';

interface WeeklyGoalsChartsProps {
  summary: WeeklyGoalsSummary;
  onOpenSettings: () => void;
  onNavigateTab?: (tab: string) => void;
  embedded?: boolean; // if rendered inside another modal or as standalone
}

export const WeeklyGoalsCharts: React.FC<WeeklyGoalsChartsProps> = ({
  summary,
  onOpenSettings,
  onNavigateTab,
  embedded = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeChartTab, setActiveChartTab] = useState<'comparison' | 'daily'>('comparison');

  const categories: Array<{ id: string; label: string; icon: string }> = [
    { id: 'all', label: 'كافة الأهداف', icon: '🎯' },
    { id: 'prayer', label: 'الصلوات والسنن', icon: '🕌' },
    { id: 'quran', label: 'القرآن', icon: '📖' },
    { id: 'athkar', label: 'الأذكار والسبحة', icon: '📿' },
    { id: 'nawafil', label: 'النوافل والصيام', icon: '🌙' },
    { id: 'knowledge', label: 'العلم والقراءة', icon: '📚' },
    { id: 'dua', label: 'ورد الدعاء', icon: '🤲' },
    { id: 'heart', label: 'التزكية والمجاهدة', icon: '🤍' },
    { id: 'custom', label: 'الأعمال المخصصة', icon: '🏷️' }
  ];

  const filteredGoals = useMemo(() => {
    if (selectedCategory === 'all') return summary.goalsProgress;
    return summary.goalsProgress.filter(g => g.goal.category === selectedCategory);
  }, [summary.goalsProgress, selectedCategory]);

  // تجهيز بيانات المخطط المقارن (المنجز vs المستهدف)
  const comparisonChartData = useMemo(() => {
    return filteredGoals.map(gp => {
      // اسم مختصر للرسم البياني
      const shortTitle = gp.goal.title.length > 18
        ? gp.goal.title.slice(0, 16) + '..'
        : gp.goal.title;

      return {
        id: gp.goal.id,
        name: shortTitle,
        fullName: gp.goal.title,
        achieved: gp.current,
        target: gp.target,
        unit: gp.goal.unit,
        percentage: gp.percentage,
        isCompleted: gp.isCompleted
      };
    });
  }, [filteredGoals]);

  // تجهيز بيانات النشاط اليومي التراكمي خلال الأسبوع (الأحد إلى السبت)
  const dailyActivityData = useMemo(() => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days.map((dayName, dayIndex) => {
      let activeGoalsThatDay = 0;
      let totalValueAcrossGoals = 0;

      for (const gp of summary.goalsProgress) {
        const dayVal = gp.dailyValues[dayIndex]?.value || 0;
        if (dayVal > 0) {
          activeGoalsThatDay++;
          totalValueAcrossGoals += Math.min(100, Math.round((dayVal / (gp.target / 7 || 1)) * 100));
        }
      }

      const avgDailyIntensity = activeGoalsThatDay > 0
        ? Math.round(totalValueAcrossGoals / summary.goalsProgress.length)
        : 0;

      const isPastOrToday = dayIndex < summary.daysElapsed;
      const isToday = dayIndex === summary.daysElapsed - 1;

      return {
        dayName,
        activeGoals: activeGoalsThatDay,
        intensity: avgDailyIntensity,
        isPastOrToday,
        isToday
      };
    });
  }, [summary]);

  const CustomComparisonTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-right text-xs z-50">
          <p className="font-black header-font text-amber-300 mb-1.5">{data.fullName}</p>
          <div className="space-y-1 font-mono">
            <p className="flex justify-between gap-4">
              <span className="text-emerald-300 font-bold">المنجز:</span>
              <span>{data.achieved.toLocaleString()} {data.unit}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-300 font-bold">المستهدف:</span>
              <span>{data.target.toLocaleString()} {data.unit}</span>
            </p>
            <p className="flex justify-between gap-4 pt-1 border-t border-slate-700/80">
              <span className="text-yellow-300 font-bold">نسبة التحقيق:</span>
              <span className="font-black text-amber-300">{data.percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDailyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-right text-xs z-50">
          <p className="font-black header-font text-amber-300 mb-1">يوم {data.dayName}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-300">أهداف تم التفاعل معها:</span>
              <span className="font-mono font-bold text-emerald-300">{data.activeGoals} عبادات</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-300">معدل وتيرة اليوم:</span>
              <span className="font-mono font-bold text-amber-300">{data.intensity}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. البطاقة الإحصائية الكلية العلوية */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-[2rem] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                <Target className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black header-font leading-tight">
                  حصاد الأهداف الأسبوعية المخصصة
                </h3>
                <span className="text-[10px] text-emerald-200/90 font-bold block mt-0.5">
                  {summary.weekRangeLabel}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-black text-xs header-font rounded-xl border border-white/20 transition-all shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span>تعديل الأهداف</span>
            </button>
          </div>

          {/* الإحصائيات السريعة */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <span className="text-[10px] text-emerald-200 font-bold block mb-1">نسبة الإنجاز</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 leading-none">
                {summary.overallCompletionPct}%
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <span className="text-[10px] text-emerald-200 font-bold block mb-1">أهداف محققة</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-300 leading-none">
                {summary.completedGoalsCount}
                <span className="text-xs text-white/70 font-sans mr-1">/ {summary.totalGoalsCount}</span>
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <span className="text-[10px] text-emerald-200 font-bold block mb-1">أيام منقضية</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-teal-200 leading-none">
                {summary.daysElapsed}
                <span className="text-xs text-white/70 font-sans mr-1">/ 7</span>
              </span>
            </div>
          </div>

          {/* شريط التقدم الكلي */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-bold text-emerald-100">
              <span>مسار تحقيق الأهداف الإجمالي</span>
              <span className="font-mono text-amber-300 font-black">{summary.overallCompletionPct}%</span>
            </div>
            <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  summary.overallCompletionPct >= 100
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                    : summary.overallCompletionPct >= 60
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                    : 'bg-gradient-to-r from-teal-400 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, summary.overallCompletionPct))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. أزرار التبديل ونوافذ الرسوم البيانية */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 header-font leading-none">
                الرسم البياني لإنجاز الأهداف
              </h4>
              <p className="text-[10px] text-slate-400 font-bold mt-1">
                مقارنة بصرية بين المستهدف والمنجز خلال هذا الأسبوع
              </p>
            </div>
          </div>

          {/* تبديل نوع الرسم */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveChartTab('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black header-font transition-all ${
                activeChartTab === 'comparison'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              المنجز vs المستهدف
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black header-font transition-all ${
                activeChartTab === 'daily'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              توزيع أيام الأسبوع
            </button>
          </div>
        </div>

        {/* فئات العبادات (Categories chips) عند عرض المنجز vs المستهدف */}
        {activeChartTab === 'comparison' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-black header-font shrink-0 transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* عرض الرسم البياني */}
        <div className="h-64 sm:h-72 w-full pt-2">
          {activeChartTab === 'comparison' ? (
            comparisonChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonChartData}
                  margin={{ top: 15, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomComparisonTooltip />} />
                  <Bar
                    dataKey="target"
                    name="المستهدف"
                    fill="#e2e8f0"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="achieved"
                    name="المنجز"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  >
                    {comparisonChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isCompleted ? '#059669' : entry.percentage >= 60 ? '#10b981' : '#34d399'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Target className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
                <p className="text-xs font-bold">لا توجد أهداف مفعلة في هذا التصنيف</p>
              </div>
            )
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyActivityData}
                margin={{ top: 15, right: 10, left: -10, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="dayName"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 'bold' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip content={<CustomDailyTooltip />} />
                <Bar
                  dataKey="activeGoals"
                  name="العبادات المنجزة"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={36}
                >
                  {dailyActivityData.map((entry, index) => (
                    <Cell
                      key={`day-${index}`}
                      fill={
                        entry.isToday
                          ? '#059669'
                          : entry.isPastOrToday
                          ? '#10b981'
                          : '#cbd5e1'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        {activeChartTab === 'comparison' && (
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-600"></span>
              <span>المنجز المحقق</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-slate-200"></span>
              <span>الهدف الأسبوعي</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>مكتمل (100%+)</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. قائمة البطاقات التفصيلية لكل هدف أسبوعي */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-slate-700 header-font flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            تفاصيل الأهداف ووتيرة الأيام ({filteredGoals.length} هدف)
          </span>
          <span className="text-[10px] text-slate-400 font-bold">
            انقر على أي هدف لمتابعته
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredGoals.map(gp => {
            const isCompleted = gp.isCompleted;
            const pct = Math.min(100, gp.percentage);

            return (
              <div
                key={gp.goal.id}
                className={`p-4 rounded-3xl border transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border-emerald-300 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-emerald-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {renderGoalIcon(gp.goal.iconName, 'w-5 h-5')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-black text-slate-800 header-font truncate">
                          {gp.goal.title}
                        </h5>
                        {isCompleted && (
                          <span className="shrink-0 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            مكتمل
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5 truncate">
                        {gp.goal.description}
                      </p>
                    </div>
                  </div>

                  {gp.goal.tabTarget && onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab(gp.goal.tabTarget!)}
                      className="p-1.5 hover:bg-emerald-100/60 text-emerald-700 rounded-xl transition-all shrink-0"
                      title="الانتقال لقسم العبادة"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* شريط التقدم والأرقام */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-slate-500">
                      تم إنجاز: <span className="font-mono font-black text-slate-800">{gp.current.toLocaleString()}</span> / {gp.target.toLocaleString()} {gp.goal.unit}
                    </span>
                    <span className={`font-mono font-black text-xs ${isCompleted ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {gp.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : gp.percentage >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* وتيرة الأيام السبعة (Sunday to Saturday Mini Dots) */}
                <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400">سجل الأيام:</span>
                  <div className="flex items-center gap-1.5">
                    {gp.dailyValues.map(dVal => {
                      const hasVal = dVal.value > 0;
                      return (
                        <div
                          key={dVal.dateStr}
                          className="flex flex-col items-center gap-0.5"
                          title={`${dVal.dayName}: ${dVal.value} ${gp.goal.unit}`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono font-bold transition-all ${
                              hasVal
                                ? 'bg-emerald-500 text-white shadow-2xs'
                                : dVal.isPastOrToday
                                ? 'bg-slate-200 text-slate-500'
                                : 'bg-slate-100 text-slate-300 border border-dashed border-slate-200'
                            } ${dVal.isToday ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}`}
                          >
                            {hasVal ? '✓' : '·'}
                          </span>
                          <span className="text-[7px] text-slate-400 font-bold leading-none">
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
      </div>
    </div>
  );
};
