import React, { useState } from 'react';
import { Moon, Sun, Clock, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { DailyLog } from '../types';

interface SleepHoursEntryProps {
  log: DailyLog;
  onUpdate: (updatedLog: DailyLog, activityLabel?: string, activityType?: string) => void;
}

const PRESET_HOURS = [5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export const SleepHoursEntry: React.FC<SleepHoursEntryProps> = ({ log, onUpdate }) => {
  const currentHours = log.sleep?.hours ?? (
    log.sleep?.sessions && log.sleep.sessions.length > 0
      ? log.sleep.sessions.reduce((acc, s) => {
          const [startH, startM] = s.start.split(':').map(Number);
          const [endH, endM] = s.end.split(':').map(Number);
          let mins = (endH * 60 + endM) - (startH * 60 + startM);
          if (mins < 0) mins += 24 * 60;
          return acc + (mins / 60);
        }, 0)
      : 0
  );

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bedtime, setBedtime] = useState(log.sleep?.bedtime || '23:00');
  const [wakeTime, setWakeTime] = useState(log.sleep?.wakeTime || '06:00');

  const handleSetHours = (hours: number) => {
    const validHours = Math.max(0, Math.min(24, Math.round(hours * 2) / 2));
    onUpdate({
      ...log,
      sleep: {
        ...(log.sleep || { sessions: [] }),
        hours: validHours,
        bedtime: log.sleep?.bedtime,
        wakeTime: log.sleep?.wakeTime
      }
    }, `تسجيل ${validHours} ساعة نوم`, 'sleep');
  };

  const calculateHoursFromTimes = (start: string, end: string) => {
    if (!start || !end) return;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let mins = (endH * 60 + endM) - (startH * 60 + startM);
    if (mins < 0) mins += 24 * 60;
    const hrs = parseFloat((mins / 60).toFixed(1));
    onUpdate({
      ...log,
      sleep: {
        ...(log.sleep || { sessions: [] }),
        hours: hrs,
        bedtime: start,
        wakeTime: end,
        sessions: [{ id: 'main_session', start, end }]
      }
    }, `تسجيل ${hrs} ساعة نوم (${start} - ${end})`, 'sleep');
  };

  const getSleepQualityFeedback = (hours: number) => {
    if (hours === 0) return { label: 'لم يُسجل بعد', color: 'text-slate-400 bg-slate-50 border-slate-200', desc: 'سجّل ساعات نومك لمتابعة توازن يومك' };
    if (hours < 5) return { label: 'قليل جداً ⚠️', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'قلة النوم قد تورث الفتور وضعف الخشوع في الفرائض' };
    if (hours < 6) return { label: 'خفيف 🌙', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', desc: 'مناسب إن كنت أخذت قيلولة نهارية معينة على العبادة' };
    if (hours <= 8) return { label: 'مثالي ومعتدل 🌿', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'نوم صحي يعين البدن والروح على النشاط لقيام الليل والفجر' };
    return { label: 'وفير 💤', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', desc: 'احرص على ألا يسرق النوم منك أوقات الطاعة الثمينة' };
  };

  const feedback = getSleepQualityFeedback(currentHours);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      {/* الرأس */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-xs">
            <Moon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 header-font text-base sm:text-lg leading-tight">
              ساعات النوم والراحة
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
              تتبع قسط نومك اليومي وأثره على الحيوية في الطاعة
            </p>
          </div>
        </div>

        {/* شارة التقييم */}
        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border header-font shadow-2xs ${feedback.color}`}>
          {feedback.label}
        </span>
      </div>

      {/* شاشة العرض والتحكم السريع */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 border border-indigo-800/40 shadow-inner">
        <div>
          <span className="text-[10px] text-indigo-300 font-bold block mb-1">
            إجمالي ساعات نوم اليوم
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300">
              {currentHours > 0 ? currentHours : '0'}
            </span>
            <span className="text-xs text-slate-300 font-bold">ساعة</span>
          </div>
          <p className="text-[10px] text-indigo-200/80 mt-1 font-bold">
            {feedback.desc}
          </p>
        </div>

        {/* أزرار الزيادة والنقصان */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
          <button
            type="button"
            onClick={() => handleSetHours(Math.max(0, currentHours - 0.5))}
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white font-black text-sm flex items-center justify-center"
            title="إنقاص نصف ساعة"
          >
            -
          </button>
          <span className="text-xs font-mono font-black px-2 min-w-[3rem] text-center">
            {currentHours} س
          </span>
          <button
            type="button"
            onClick={() => handleSetHours(Math.min(24, currentHours + 0.5))}
            className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white font-black text-sm flex items-center justify-center shadow-xs"
            title="زيادة نصف ساعة"
          >
            +
          </button>
        </div>
      </div>

      {/* خيارات سريعة بلمسة واحدة */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 font-bold block">
          اختيار سريع للمدة (بالساعات):
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {PRESET_HOURS.map(hrs => (
            <button
              key={hrs}
              type="button"
              onClick={() => handleSetHours(hrs)}
              className={`py-2 px-1 rounded-xl text-xs font-mono font-black transition-all border ${
                currentHours === hrs
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105'
                  : 'bg-slate-50 hover:bg-indigo-50/60 text-slate-700 border-slate-100 hover:border-indigo-200'
              }`}
            >
              {hrs} س
            </button>
          ))}
        </div>
      </div>

      {/* محدد وقت النوم والاستيقاظ الاختياري */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowTimePicker(!showTimePicker)}
          className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>تحديد أوقات النوم والاستيقاظ بالتفصيل</span>
          {showTimePicker ? <ChevronUp className="w-3.5 h-3.5 mr-auto" /> : <ChevronDown className="w-3.5 h-3.5 mr-auto" />}
        </button>

        {showTimePicker && (
          <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-indigo-100/70 space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Moon className="w-3 h-3 text-indigo-500" />
                  <span>وقت النوم:</span>
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => {
                    setBedtime(e.target.value);
                    calculateHoursFromTimes(e.target.value, wakeTime);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>وقت الاستيقاظ:</span>
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => {
                    setWakeTime(e.target.value);
                    calculateHoursFromTimes(bedtime, e.target.value);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
              💡 عند تحديد الوقتين، يقوم التطبيق باحتساب ساعات النوم الصافية تلقائياً وعرضها في صفحة الإحصائيات.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
