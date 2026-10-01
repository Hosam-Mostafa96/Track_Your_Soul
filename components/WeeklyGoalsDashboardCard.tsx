import React, { useState, useMemo } from 'react';
import {
  Target,
  Sliders,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart2,
  Flame,
  ArrowRight,
  Zap
} from 'lucide-react';
import { WeeklyGoalsSummary, WeeklyGoalProgress } from '../types';
import { renderGoalIcon } from './WeeklyGoalsSettingsModal';

interface WeeklyGoalsDashboardCardProps {
  summary: WeeklyGoalsSummary;
  onOpenCharts: () => void;
  onOpenSettings: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const WeeklyGoalsDashboardCard: React.FC<WeeklyGoalsDashboardCardProps> = ({
  summary,
  onOpenCharts,
  onOpenSettings,
  onNavigateTab
}) => {
  // فصل الأهداف المتبقية اليوم عن المنجزة اليوم لتسهيل الرؤية بمجرد النظر
  const remainingTodayGoals = useMemo(() => {
    return summary.goalsProgress.filter(g => !g.isTodayDone);
  }, [summary.goalsProgress]);

  const completedTodayGoals = useMemo(() => {
    return summary.goalsProgress.filter(g => g.isTodayDone);
  }, [summary.goalsProgress]);

  // التبويب النشط: الافتراضي هو "المتبقي اليوم" إذا كان هناك أهداف متبقية، وإلا "الكل"
  const [activeTab, setActiveTab] = useState<'remaining' | 'completed' | 'all'>(() => {
    return remainingTodayGoals.length > 0 ? 'remaining' : 'all';
  });

  const [showAllInList, setShowAllInList] = useState(false);

  // قائمة الأهداف المعروضة بناءً على التبويب المختار
  const currentList = useMemo(() => {
    if (activeTab === 'remaining') return remainingTodayGoals;
    if (activeTab === 'completed') return completedTodayGoals;
    // في حالة "الكل"، نرتب الأهداف بحيث تظهر المتبقية أولاً لتحفيز المستخدم
    return [...remainingTodayGoals, ...completedTodayGoals];
  }, [activeTab, remainingTodayGoals, completedTodayGoals]);

  const displayedGoals = showAllInList ? currentList : currentList.slice(0, 4);

  const formatStreakLabel = (days: number) => {
    if (days === 0) return 'ابدأ التتابع اليوم';
    if (days === 1) return 'يوم تتابع واحد';
    if (days === 2) return 'يومان متتاليان';
    if (days >= 3 && days <= 10) return `${days} أيام متتالية`;
    return `${days} يوماً متتالياً`;
  };

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:border-emerald-200 space-y-4">
      {/* 1. الترويسة الرئيسية */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 header-font text-sm sm:text-base leading-tight">
                أهدافك وتتابعك اليومي والأسبوعي
              </h3>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                أسبوع واحد (الأحد - السبت)
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

      {/* 2. بطاقة الحالة المباشرة لليوم (تخبرك بمجرد النظر بما تبقى عليك) */}
      {remainingTodayGoals.length > 0 ? (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Flame className="w-5 h-5 fill-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-amber-950 header-font">
                  متبقٍ عليك اليوم:
                </span>
                <span className="text-xs font-black font-mono text-orange-700 bg-white/95 px-2.5 py-0.5 rounded-full border border-orange-300 shadow-2xs">
                  {remainingTodayGoals.length} من أصل {summary.totalGoalsCount} أهداف
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-900/85 font-bold mt-0.5">
                أكملها اليوم لتحافظ على شعلة تتابعك المستمر دون انقطاع 🔥
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end shrink-0 text-left">
            <span className="text-[10px] text-amber-800 font-black">أعلى تتابع نشط</span>
            <span className="text-xs font-black text-orange-600 font-mono">
              🔥 {summary.maxActiveStreak} أيام
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-300/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-black text-emerald-950 header-font">
                ما شاء الله! أتممت جميع أهدافك المقررة لليوم 🎉
              </h4>
              <p className="text-[10px] sm:text-[11px] text-emerald-800/85 font-bold mt-0.5">
                سلسلة تتابعك الإيماني لجميع الأهداف مكتملة ومحفوظة بفضل الله اليوم.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black shrink-0">
            ١٠٠٪ لليوم
          </span>
        </div>
      )}

      {/* 3. تبويبات الفرز السريع (المتبقي لليوم / المنجز اليوم / الكل) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl text-xs font-bold w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('remaining');
              setShowAllInList(false);
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-black transition-all flex items-center justify-center gap-1.5 text-[11px] ${
              activeTab === 'remaining'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>المتبقي لليوم</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
              activeTab === 'remaining' ? 'bg-amber-700/50 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {remainingTodayGoals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('completed');
              setShowAllInList(false);
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-black transition-all flex items-center justify-center gap-1.5 text-[11px] ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>المنجز اليوم</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
              activeTab === 'completed' ? 'bg-emerald-800/50 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {completedTodayGoals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setShowAllInList(false);
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-black transition-all flex items-center justify-center gap-1.5 text-[11px] ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>كافة الأهداف</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
              activeTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {summary.goalsProgress.length}
            </span>
          </button>
        </div>
      </div>

      {/* 4. قائمة بطاقات الأهداف المفصلة (توضح ما تبقى بمجرد النظر) */}
      <div className="space-y-3">
        {displayedGoals.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            {activeTab === 'remaining' ? (
              <div className="space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-black text-slate-700 header-font">لا توجد أهداف متبقية عليك اليوم!</p>
                <p className="text-[10px] text-slate-400 font-bold">لقد أنجزت كل ما هو مقرر عليك لليوم، تقبل الله منك.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <Clock className="w-8 h-8 text-amber-500 mx-auto mb-1.5" />
                <p className="text-xs font-black text-slate-700 header-font">لم تسجل أي هدف بعد اليوم</p>
                <p className="text-[10px] text-slate-400 font-bold">ابدأ بإنجاز أول أهدافك وسجله لتبدأ تتابعك المبارك.</p>
              </div>
            )}
          </div>
        ) : (
          displayedGoals.map(gp => {
            const isDoneToday = gp.isTodayDone;
            const pct = Math.min(100, gp.percentage);

            return (
              <div
                key={gp.goal.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isDoneToday
                    ? 'bg-emerald-50/40 border-emerald-200/90'
                    : 'bg-gradient-to-r from-amber-50/40 via-white to-slate-50/50 border-amber-200/90 hover:border-amber-300'
                }`}
              >
                {/* السطر العلوي للهدف: الأيقونة + العنوان + شارة الحالة الفورية */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`p-2 rounded-xl shrink-0 shadow-2xs ${
                        isDoneToday
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {renderGoalIcon(gp.goal.iconName, 'w-4 h-4')}
                    </span>
                    <div className="min-w-0">
                      <h5 className="font-black text-slate-800 text-xs sm:text-sm header-font truncate">
                        {gp.goal.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                        المستهدف الأسبوعي: {gp.target} {gp.goal.unit}
                      </span>
                    </div>
                  </div>

                  {/* شارة توضح المتبقي بمجرد النظر */}
                  <div className="shrink-0 text-left">
                    {isDoneToday ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px] shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>تم اليوم ({gp.todayValue} {gp.goal.unit})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-black text-[11px] shadow-2xs animate-pulse">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>متبقٍ لليوم ({gp.dailyRecommendedTarget} {gp.goal.unit})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* السطر الأوسط: شارة الاستريك والتقدم الأسبوعي */}
                <div className="space-y-1.5 mb-2.5">
                  <div className="flex items-center justify-between text-xs">
                    {/* شارة التتابع المتتالي الخاصة بالهدف */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] transition-all ${
                          gp.streak > 0
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 border border-amber-300 shadow-2xs'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${gp.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
                        <span>{formatStreakLabel(gp.streak)}</span>
                      </span>

                      {!isDoneToday && gp.streak > 0 && (
                        <span className="text-[10px] text-amber-800 font-bold hidden sm:inline">
                          (أنجزه لتحافظ على السلسلة!)
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 text-[11px] font-bold text-slate-500">
                      <span>إجمالي الأسبوع:</span>
                      <span className="font-mono font-black text-slate-800">{gp.current}</span>
                      <span>/ {gp.target} {gp.goal.unit}</span>
                      <span className={`mr-1 font-mono font-black ${isDoneToday ? 'text-emerald-700' : 'text-slate-600'}`}>
                        ({pct}%)
                      </span>
                    </div>
                  </div>

                  {/* شريط الإنجاز */}
                  <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        gp.isCompleted
                          ? 'bg-emerald-500'
                          : isDoneToday
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* السطر السفلي: سجل وتيرة الأيام السبعة + زر الإنجاز السريع */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5" title="سجل الأيام السبعة لهذا الأسبوع (الأحد إلى السبت)">
                    <span className="text-[9px] font-bold text-slate-400 hidden xs:inline">وتيرة الأسبوع:</span>
                    <div className="flex items-center gap-1">
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

                  {/* زر الانتقال للعبادة لإنجازها فوراً والتشجيع على إكمالها */}
                  {gp.goal.tabTarget && onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab(gp.goal.tabTarget!)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-black header-font flex items-center gap-1 transition-all active:scale-95 shadow-2xs ${
                        isDoneToday
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <span>{isDoneToday ? 'عرض العبادة' : 'أنجزها الآن ⚡'}</span>
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* زر التوسيع في حال كان هناك أكثر من 4 أهداف في التبويب الحالي */}
      {currentList.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAllInList(!showAllInList)}
          className="w-full py-2 text-xs font-bold text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50/50 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-100"
        >
          {showAllInList ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>عرض أقل</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>عرض بقية الأهداف ({currentList.length - 4} أهداف أخرى)</span>
            </>
          )}
        </button>
      )}

      {/* 5. شريط الأزرار السفلية (عرض الرسوم والتقدم الكامل + التخصيص) */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenCharts}
          className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-black header-font text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>عرض الرسوم البيانية والتقرير الأسبوعي الكامل</span>
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
