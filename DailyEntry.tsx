
import React, { useState, useEffect } from 'react';
import { 
  Star, Users, Clock, Book, GraduationCap, Plus, Minus, Heart, ShieldAlert,
  Moon, Sun, Zap, Coffee, ScrollText, Sparkle, MessageSquare, 
  MapPin, CheckCircle2, Droplets, Flame, Tags, ToggleRight, ToggleLeft,
  ChevronRight, ChevronLeft, FileText, Check, BookOpen
} from 'lucide-react';
import { DailyLog, PrayerName, TranquilityLevel, CustomSunnah, AppWeights } from './types';
import { SURROUNDING_SUNNAH_LIST } from './constants';
import { format, addDays } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';

interface DailyEntryProps {
  log: DailyLog;
  onUpdate: (log: DailyLog, label?: string, type?: string) => void;
  weights: AppWeights;
  onUpdateWeights: (weights: AppWeights) => void;
  currentDate: string;
  onDateChange: (date: string) => void;
}

const PRAYER_SUNNAHS: Record<string, {id: string, label: string}[]> = {
  [PrayerName.FAJR]: [{id: 'fajr_pre', label: 'سنة الفجر (ركعتان قبلية)'}],
  [PrayerName.DHUHR]: [
    {id: 'dhuhr_pre', label: 'سنة الظهر (4 ركعات قبلية)'},
    {id: 'dhuhr_post', label: 'سنة الظهر (ركعتان بعدية)'}
  ],
  [PrayerName.ASR]: [{id: 'asr_pre', label: 'سنة العصر (4 ركعات قبلية)'}],
  [PrayerName.MAGHRIB]: [{id: 'maghrib_post', label: 'سنة المغرب (ركعتان بعدية)'}],
  [PrayerName.ISHA]: [{id: 'isha_post', label: 'سنة العشاء (ركعتان بعدية)'}]
};

const DEFAULT_DHIKR_LIST = [
  { id: 'salawat', label: 'الصلاة على النبي' },
  { id: 'hawqalah', label: 'الحوقلة' },
  { id: 'tahlil', label: 'لا إله إلا الله' },
  { id: 'baqiyat', label: 'الباقيات الصالحات' },
  { id: 'istighfar', label: 'الاستغفار' }
];

const DailyEntry: React.FC<DailyEntryProps> = ({ log, onUpdate, weights, onUpdateWeights, currentDate, onDateChange }) => {
  const [activePrayer, setActivePrayer] = useState<PrayerName>(PrayerName.FAJR);

  const updateSection = (section: keyof DailyLog, data: any, label?: string, type?: string) => {
    onUpdate({ ...log, [section]: { ...(log[section] as any), ...data } }, label, type);
  };

  const updatePrayer = (name: PrayerName, data: any, label?: string) => {
    onUpdate({ ...log, prayers: { ...log.prayers, [name]: { ...log.prayers[name], ...data } } }, label, 'prayer');
  };

  const toggleSunnahInPrayer = (prayerName: PrayerName, sunnahId: string, sunnahLabel: string) => {
    const current = log.prayers[prayerName].surroundingSunnahIds || [];
    const isAdding = !current.includes(sunnahId);
    const newIds = isAdding ? [...current, sunnahId] : current.filter(id => id !== sunnahId);
    updatePrayer(prayerName, { surroundingSunnahIds: newIds }, isAdding ? `أتمَّ ${sunnahLabel}` : undefined);
  };

  const getTranquilityLabel = (level: number) => {
    const labels = ['غافل', 'شرود كثير', 'حضور أدنى', 'خاشع غالباً', 'خاشع جداً', 'إحسان'];
    return labels[level] || 'مستوى الخشوع';
  };

  const counterItem = (label: string, field: string, icon: any) => (
    <div key={field} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-emerald-600">{icon}</span>
        <span className="text-xs font-bold text-slate-700 header-font truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateSection('athkar', { counters: { ...log.athkar.counters, [field]: Math.max(0, (log.athkar.counters[field] || 0) - 10) } })} 
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm active:scale-90 transition-all"
        >
          <Minus className="w-4 h-4 text-slate-500" />
        </button>
        <div className="bg-emerald-100/50 border border-emerald-200/50 rounded-xl px-3 py-1 min-w-[3.5rem] flex items-center justify-center">
          <span className="text-lg font-black text-emerald-800 header-font tabular-nums">{log.athkar.counters[field] || 0}</span>
        </div>
        <button 
          onClick={() => updateSection('athkar', { counters: { ...log.athkar.counters, [field]: (log.athkar.counters[field] || 0) + 10 } }, `عطّر لسانه بـ ${label}`, 'athkar')} 
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm active:scale-90 transition-all"
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );

  const isPerformed = log.prayers[activePrayer].performed;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Date Switcher */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), -1), 'yyyy-MM-dd'))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight className="w-5 h-5" /></button>
        <div className="text-center">
          <span className="text-sm font-bold text-emerald-700 header-font bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-100 block">
            {format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM yyyy', { locale: ar })}
          </span>
        </div>
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), 1), 'yyyy-MM-dd'))} disabled={currentDate === format(new Date(), 'yyyy-MM-dd')} className="p-2 rounded-xl text-slate-400 disabled:opacity-20"><ChevronLeft className="w-5 h-5" /></button>
      </div>

      {/* Prayers Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 header-font text-lg">الصلوات</h3>
          </div>
          <button 
            onClick={() => updatePrayer(activePrayer, { performed: !isPerformed }, !isPerformed ? `أدى صلاة ${activePrayer}` : undefined)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-bold text-xs ${isPerformed ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
          >
            {isPerformed ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            {isPerformed ? 'تمت الصلاة' : 'تفعيل'}
          </button>
        </div>

        <div className="flex justify-between gap-1 mb-8 bg-slate-50 p-1.5 rounded-2xl">
          {Object.values(PrayerName).map((p) => (
            <button key={p} onClick={() => setActivePrayer(p)} className={`flex-1 py-3 rounded-xl transition-all flex flex-col items-center gap-1 ${activePrayer === p ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}>
              <span className="text-[10px] font-bold header-font">{p}</span>
              {log.prayers[p].performed && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className={`space-y-6 ${isPerformed ? '' : 'opacity-40 grayscale pointer-events-none'}`}>
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <Users className={`w-5 h-5 ${log.prayers[activePrayer].inCongregation ? 'text-emerald-600' : 'text-slate-300'}`} />
              <h4 className="font-bold text-slate-800 text-sm">صلاة الجماعة</h4>
            </div>
            <button
              onClick={() => updatePrayer(activePrayer, { inCongregation: !log.prayers[activePrayer].inCongregation }, !log.prayers[activePrayer].inCongregation ? `صلى ${activePrayer} جماعة` : undefined)}
              className={`w-12 h-6 rounded-full relative transition-all ${log.prayers[activePrayer].inCongregation ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${log.prayers[activePrayer].inCongregation ? 'left-1' : 'left-7'}`}></div>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {(PRAYER_SUNNAHS[activePrayer] || []).map((s) => (
              <button 
                key={s.id} 
                onClick={() => toggleSunnahInPrayer(activePrayer, s.id, s.label)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${log.prayers[activePrayer].surroundingSunnahIds?.includes(s.id) ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-500 border-slate-100'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">السنن المحيطة بالصلاة</h4>
            <div className="flex flex-wrap gap-2">
              {SURROUNDING_SUNNAH_LIST.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSunnahInPrayer(activePrayer, s.id, s.label)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${log.prayers[activePrayer].surroundingSunnahIds?.includes(s.id) ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-slate-50 text-slate-400'}`}
                >
                  <Sparkle className="w-3 h-3" /> {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700">مستوى الخشوع</span>
              <span className="text-emerald-600">{getTranquilityLabel(log.prayers[activePrayer].tranquility)}</span>
            </div>
            <input type="range" min="0" max="5" step="1" value={log.prayers[activePrayer].tranquility} onChange={(e) => updatePrayer(activePrayer, { tranquility: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
        </div>
      </div>

      {/* Quran Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Book className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">ورد القرآن (بالأرباع)</h3></div>
        <div className="space-y-4">
          {[
            { label: 'ورد السماع', field: 'hifzRub' as const },
            { label: 'ورد القراءة', field: 'revisionRub' as const }
          ].map(q => (
            <div key={q.field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm font-bold text-slate-700 header-font">{q.label}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => updateSection('quran', { [q.field]: Math.max(0, (log.quran as any)[q.field] - 1) })} className="p-2 bg-white border border-slate-200 rounded-xl"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-1.5 min-w-[3.5rem] flex items-center justify-center"><span className="text-xl font-black text-slate-800 tabular-nums">{(log.quran as any)[q.field]}</span></div>
                <button onClick={() => updateSection('quran', { [q.field]: (log.quran as any)[q.field] + 1 }, `أتمَّ ربعاً في ${q.label}`, 'quran')} className="p-2 bg-white border border-slate-200 rounded-xl"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Section (Restored) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><GraduationCap className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">طلب العلم والقراءة</h3></div>
        <div className="space-y-4">
          {[
            { label: 'علم شرعي (دقيقة)', field: 'shariDuration' as const },
            { label: 'قراءة عامة (دقيقة)', field: 'readingDuration' as const },
            { label: 'عدد الصفحات المقروءة', field: 'readingPages' as const }
          ].map(k => (
            <div key={k.field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 header-font">{k.label}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateSection('knowledge', { [k.field]: Math.max(0, (log.knowledge[k.field] || 0) - (k.field === 'readingPages' ? 1 : 5)) })} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] flex items-center justify-center">
                  <span className="text-base font-black text-slate-800 tabular-nums">{log.knowledge[k.field] || 0}</span>
                </div>
                <button onClick={() => updateSection('knowledge', { [k.field]: (log.knowledge[k.field] || 0) + (k.field === 'readingPages' ? 1 : 5) }, `اجتهد في ${k.label}`, 'knowledge')} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Athkar Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><ScrollText className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الأذكار</h3></div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['morning', 'evening', 'sleep', 'travel'] as const).map(id => {
            const label = id === 'morning' ? 'أذكار الصباح' : id === 'evening' ? 'أذكار المساء' : id === 'sleep' ? 'أذكار النوم' : 'أذكار السفر';
            return (
              <button key={id} onClick={() => updateSection('athkar', { checklists: { ...log.athkar.checklists, [id]: !log.athkar.checklists[id] } }, !log.athkar.checklists[id] ? `أتمَّ ${label}` : undefined, 'athkar')} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${log.athkar.checklists[id] ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                <span className="text-xs font-bold">{label.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {DEFAULT_DHIKR_LIST.map(d => counterItem(d.label, d.id, <Zap className="w-4 h-4" />))}
        </div>
      </div>

      {/* Nawafil Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Clock className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">نوافل الصلاة</h3></div>
        <div className="space-y-4">
          {[
            { label: 'صلاة الضحى (دقيقة)', field: 'duhaDuration' as const },
            { label: 'الوتر (دقيقة)', field: 'witrDuration' as const },
            { label: 'قيام الليل (دقيقة)', field: 'qiyamDuration' as const }
          ].map(field => (
            <div key={field.field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 header-font">{field.label}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateSection('nawafil', { [field.field]: Math.max(0, log.nawafil[field.field] - 5) })} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] flex items-center justify-center">
                  <span className="text-base font-black text-slate-800 tabular-nums">{log.nawafil[field.field]}</span>
                </div>
                <button onClick={() => updateSection('nawafil', { [field.field]: log.nawafil[field.field] + 5 }, `أطال في ${field.label.split(' ')[0]}`, 'prayer')} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
          <button 
            onClick={() => updateSection('nawafil', { fasting: !log.nawafil.fasting }, !log.nawafil.fasting ? 'صائم محتسب' : undefined, 'sunnah')}
            className={`w-full p-4 rounded-3xl border flex items-center justify-between transition-all ${log.nawafil.fasting ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
          >
            <span className="font-bold text-sm">صيام يوم كامل</span>
            {log.nawafil.fasting ? <span className="text-xs font-black">+1000 نقطة</span> : <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyEntry;
