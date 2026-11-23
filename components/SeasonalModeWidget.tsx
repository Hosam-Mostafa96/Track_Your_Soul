import React, { useMemo, useState } from 'react';
import {
  Moon,
  Sparkles,
  CheckCircle2,
  Circle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Flame,
  SlidersHorizontal,
  BellRing,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyLog, AppWeights } from '../types';
import {
  HijriOffset,
  detectActiveSeasons,
  getSavedHijriOffset,
  saveHijriOffset,
  getUpcomingSeasons,
  loadSeasonalCompletedTasks,
  toggleSeasonalTask,
} from '../utils/islamicSeasons';

interface SeasonalModeWidgetProps {
  log: DailyLog;
  weights: AppWeights;
  onUpdateLog: (log: DailyLog, activityLabel?: string, activityType?: string) => void;
  onSwitchTab: (tab: any) => void;
}

export const SeasonalModeWidget: React.FC<SeasonalModeWidgetProps> = ({
  log,
  weights,
  onUpdateLog,
  onSwitchTab,
}) => {
  const [hijriOffset, setHijriOffset] = useState<HijriOffset>(getSavedHijriOffset);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() =>
    loadSeasonalCompletedTasks(log.date)
  );

  // Sync seasonal checklist when selected log date changes
  React.useEffect(() => {
    setCompletedTaskIds(loadSeasonalCompletedTasks(log.date));
  }, [log.date]);

  const refDate = useMemo(() => {
    try {
      return new Date(log.date.replace(/-/g, '/'));
    } catch {
      return new Date();
    }
  }, [log.date]);

  const { hijri, seasons, prepAlerts } = useMemo(
    () => detectActiveSeasons(refDate, hijriOffset),
    [refDate, hijriOffset]
  );

  const upcomingSeasons = useMemo(
    () => getUpcomingSeasons(refDate, hijriOffset),
    [refDate, hijriOffset]
  );

  const primarySeason = seasons[0] || null;
  const secondarySeasons = seasons.slice(1);
  const anyFastingRecommended = seasons.some((s) => s.isFastingRecommended);
  const anyFastingForbidden = seasons.some((s) => s.isFastingForbidden);

  const handleOffsetChange = (nextOffset: HijriOffset) => {
    setHijriOffset(nextOffset);
    saveHijriOffset(nextOffset);
  };

  const handleToggleFastingToday = () => {
    const nextFasting = !log.nawafil?.fasting;
    onUpdateLog(
      {
        ...log,
        nawafil: {
          ...log.nawafil,
          fasting: nextFasting,
        },
      },
      nextFasting
        ? `نوى وصام ${primarySeason?.title || 'صيام التطوع'}`
        : undefined,
      nextFasting ? 'nawafil' : undefined
    );

    if (nextFasting) {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#10b981', '#fbbf24', '#38bdf8'],
      });
    }
  };

  const handleToggleTask = (seasonId: string, taskId: string) => {
    const key = `${seasonId}_${taskId}`;
    const updated = toggleSeasonalTask(log.date, key);
    setCompletedTaskIds(updated);
  };

  return (
    <div className="space-y-3">
      {/* تنبيهات التجهيز الليلية لصيام الغد (الأيام البيض أو الإثنين والخميس) */}
      {prepAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 shadow-xs flex items-start gap-3">
          <div className="p-2 bg-amber-400/25 text-amber-800 rounded-xl shrink-0">
            <BellRing className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            {prepAlerts.map((alertText, idx) => (
              <p key={idx} className="text-xs font-black text-amber-950 header-font leading-relaxed">
                {alertText}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* البطاقة الرئيسية لوضع المواسم الهجرية */}
      {primarySeason ? (
        <div
          className={`bg-gradient-to-br ${primarySeason.themeGradient} rounded-[2rem] p-5 sm:p-6 text-white shadow-xl border ${primarySeason.borderColor} relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 w-44 h-44 bg-white/5 rounded-full blur-3xl -translate-y-20 -translate-x-20 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* الترويسة والتاريخ الهجري + ضبط الرؤية */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2.5 rounded-2xl ${primarySeason.accentBg} ${primarySeason.accentText} border border-white/10 shrink-0`}>
                  <Moon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg ${primarySeason.accentBg} ${primarySeason.accentText} border border-white/10 header-font`}>
                      {primarySeason.badge}
                    </span>
                    <span className="text-[10px] font-bold text-white/75 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {hijri.formattedAr}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black header-font text-white mt-1 leading-snug">
                    {primarySeason.title}
                  </h3>
                  <p className="text-[11px] text-white/80 font-bold mt-0.5 leading-relaxed">
                    {primarySeason.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAdjuster((v) => !v)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/85 border border-white/10 transition-all"
                  title="تعديل فارق رؤية الهلال (±١ يوم)"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpcoming((v) => !v)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black header-font border border-white/10 flex items-center gap-1 transition-all"
                >
                  <span>المواسم</span>
                  {showUpcoming ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* ضبط فارق الهلال عند الحاجة */}
            {showAdjuster && (
              <div className="bg-black/25 rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-white/90">
                  تعديل التاريخ الهجري حسب رؤية الهلال في بلدك:
                </span>
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                  {([-1, 0, 1] as HijriOffset[]).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleOffsetChange(val)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                        hijriOffset === val
                          ? 'bg-amber-400 text-emerald-950 shadow-xs'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {val === 0 ? 'تقويم أم القرى' : val === 1 ? '+١ يوم' : '-١ يوم'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* فضل الموسم */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 text-[11px] font-bold text-amber-100/95 leading-relaxed">
              ✨ {primarySeason.virtue}
            </div>

            {/* شارات المواسم الإضافية المتزامنة (مثلاً جمعة في رمضان أو يوم عرفة في الإثنين) */}
            {secondarySeasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {secondarySeasons.map((sec) => (
                  <span
                    key={sec.id}
                    className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-white/95 header-font"
                  >
                    + {sec.title}
                  </span>
                ))}
              </div>
            )}

            {/* زر تسجيل الصيام السريع إذا كان اليوم مستحباً صيامه */}
            {anyFastingRecommended && !anyFastingForbidden && (
              <div className="flex items-center justify-between gap-3 bg-black/20 rounded-2xl p-3 border border-white/10 flex-wrap">
                <div className="flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${log.nawafil?.fasting ? 'text-amber-300' : 'text-white/60'}`} />
                  <div>
                    <span className="text-xs font-black text-white header-font block">
                      {primarySeason.fastingNote || 'صيام مستحب اليوم'}
                    </span>
                    <span className="text-[10px] text-white/70 font-bold">
                      تُسجَّل مباشرة في عباداتك (+{weights.fastingDay.toLocaleString()} نقطة)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFastingToday}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black header-font transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ${
                    log.nawafil?.fasting
                      ? 'bg-emerald-500 text-white border border-emerald-300/40'
                      : 'bg-amber-400 hover:bg-amber-300 text-emerald-950'
                  }`}
                >
                  {log.nawafil?.fasting ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم تسجيل الصيام ✓</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>تسجيل صيام اليوم</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* قائمة الأوراد الموسمية المخصصة */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black text-white/80 header-font">
                <span>أوراد وسنن هذا الموسم</span>
                <span className="font-mono">
                  {
                    seasons
                      .flatMap((s) => s.tasks.map((t) => `${s.id}_${t.id}`))
                      .filter((id) => completedTaskIds.includes(id)).length
                  }{' '}
                  /{' '}
                  {seasons.reduce((sum, s) => sum + s.tasks.length, 0)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {seasons.flatMap((season) =>
                  season.tasks.map((task) => {
                    const key = `${season.id}_${task.id}`;
                    const done = completedTaskIds.includes(key);
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-2 ${
                          done
                            ? 'bg-emerald-500/25 border-emerald-300/40'
                            : 'bg-white/10 hover:bg-white/15 border-white/10'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleTask(season.id, task.id)}
                          className="flex items-start gap-2.5 text-right flex-1 min-w-0"
                        >
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <span
                              className={`text-xs font-black header-font block ${
                                done ? 'line-through text-white/75' : 'text-white'
                              }`}
                            >
                              {task.label}
                            </span>
                            <span className="text-[10px] text-white/75 font-bold block mt-0.5 leading-snug">
                              {task.description}
                            </span>
                          </div>
                        </button>

                        {task.targetTab && (
                          <button
                            type="button"
                            onClick={() => onSwitchTab(task.targetTab)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 shrink-0"
                            title="الانتقال لتنفيذ الورد"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* جدول المواسم القادمة */}
            {showUpcoming && (
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in duration-200">
                {upcomingSeasons.map((item) => (
                  <div
                    key={item.id}
                    className="bg-black/25 rounded-2xl p-2.5 border border-white/10 text-center space-y-0.5"
                  >
                    <span className="text-base block">{item.badge}</span>
                    <span className="text-[10px] font-black text-white block header-font truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-black block">
                      {item.daysLeft === 0 ? 'اليوم' : `بعد ${item.daysLeft} يوم`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* بطاقة مختصرة في الأيام العادية تعرض التاريخ الهجري والموسم القادم */
        <div className="bg-white rounded-[2rem] p-4 sm:p-5 shadow-sm border border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-800 header-font">
                    التقويم والمواسم الإيمانية
                  </h4>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    {hijri.formattedAr}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  تتفعّل الأوراد الموسمية تلقائياً في الأيام البيض، الإثنين والخميس، رمضان، وذي الحجة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAdjuster((v) => !v)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 transition-all"
                title="تعديل رؤية الهلال"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowUpcoming((v) => !v)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black header-font flex items-center gap-1 transition-all"
              >
                <span>القادم</span>
                {showUpcoming ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showAdjuster && (
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-600">فارق الهلال:</span>
              <div className="flex items-center gap-1">
                {([-1, 0, 1] as HijriOffset[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleOffsetChange(val)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                      hijriOffset === val
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {val === 0 ? 'أم القرى' : val === 1 ? '+١ يوم' : '-١ يوم'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showUpcoming && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
              {upcomingSeasons.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 text-center space-y-0.5"
                >
                  <span className="text-base block">{item.badge}</span>
                  <span className="text-[10px] font-black text-slate-800 block header-font truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-black block">
                    {item.daysLeft === 0 ? 'اليوم' : `بعد ${item.daysLeft} يوم`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
