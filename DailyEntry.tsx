
import React, { useState, useEffect } from 'react';
import { 
  Star, Users, Clock, Book, GraduationCap, Plus, Minus, Heart, ShieldAlert,
  Moon, Sun, Zap, Coffee, ScrollText, Sparkle, MessageSquare, 
  MapPin, CheckCircle2, Droplets, Flame, Tags, ToggleRight, ToggleLeft,
  CalendarDays, ChevronRight, ChevronLeft, Trash2, X, Check,
  Bed, BookOpen
} from 'lucide-react';
import { DailyLog, PrayerName, TranquilityLevel, CustomSunnah, AppWeights, SleepSession } from './types';
import { SURROUNDING_SUNNAH_LIST } from './constants';
import { format, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DailyEntryProps {
  log: DailyLog;
  onUpdate: (log: DailyLog) => void;
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
  const [sleepStart, setSleepStart] = useState('22:00');
  const [sleepEnd, setSleepEnd] = useState('04:30');
  
  const [isAddingSunnah, setIsAddingSunnah] = useState(false);
  const [newSunnahName, setNewSunnahName] = useState('');
  const [newSunnahPoints, setNewSunnahPoints] = useState('50');

  const [isAddingDhikr, setIsAddingDhikr] = useState(false);
  const [newDhikrName, setNewDhikrName] = useState('');
  const [customDhikrs, setCustomDhikrs] = useState<{id: string, label: string, key: string}[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('worship_custom_dhikrs');
    if (saved) setCustomDhikrs(JSON.parse(saved));
  }, []);

  const updateSection = (section: keyof DailyLog, data: any) => {
    onUpdate({ ...log, [section]: { ...(log[section] as any), ...data } });
  };

  const updatePrayer = (name: string, data: any) => {
    onUpdate({ ...log, prayers: { ...log.prayers, [name]: { ...log.prayers[name], ...data } } });
  };

  const handleAddCustomDhikr = () => {
    if (!newDhikrName.trim()) return;
    const id = 'custom_' + Math.random().toString(36).substr(2, 9);
    const newDhikr = { id, label: newDhikrName.trim(), key: id };
    const updated = [...customDhikrs, newDhikr];
    setCustomDhikrs(updated);
    localStorage.setItem('worship_custom_dhikrs', JSON.stringify(updated));
    setNewDhikrName('');
    setIsAddingDhikr(false);
  };

  const handleDeleteCustomDhikr = (id: string) => {
    if (window.confirm('هل تريد حذف هذا الذكر نهائياً؟')) {
      const updated = customDhikrs.filter(d => d.id !== id);
      setCustomDhikrs(updated);
      localStorage.setItem('worship_custom_dhikrs', JSON.stringify(updated));
    }
  };

  const counterItem = (label: string, field: string, icon: any, isCustom = false) => (
    <div key={field} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-emerald-600">{icon}</span>
        <span className="text-xs font-bold text-slate-700 header-font truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateSection('athkar', { counters: { ...log.athkar.counters, [field]: Math.max(0, (log.athkar.counters[field] || 0) - 10) } })} 
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 active:scale-90 transition-all"
        >
          <Minus className="w-4 h-4 text-slate-500" />
        </button>
        <div className="bg-emerald-100/50 border border-emerald-200/50 rounded-xl px-3 py-1 min-w-[3.5rem] flex items-center justify-center">
          <span className="text-lg font-black text-emerald-800 header-font tabular-nums">{log.athkar.counters[field] || 0}</span>
        </div>
        <button 
          onClick={() => updateSection('athkar', { counters: { ...log.athkar.counters, [field]: (log.athkar.counters[field] || 0) + 10 } })} 
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 active:scale-90 transition-all"
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </button>
        {isCustom && (
          <button onClick={() => handleDeleteCustomDhikr(field)} className="p-2 text-rose-300 hover:text-rose-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  const toggleSunnah = (prayerName: PrayerName, sunnahId: string) => {
    const currentSunnahs = log.prayers[prayerName].surroundingSunnahIds || [];
    const newSunnahs = currentSunnahs.includes(sunnahId) ? currentSunnahs.filter(id => id !== sunnahId) : [...currentSunnahs, sunnahId];
    updatePrayer(prayerName as PrayerName, { surroundingSunnahIds: newSunnahs });
  };

  const addSleepSession = () => {
    const newSession: SleepSession = { id: Math.random().toString(36).substr(2, 9), start: sleepStart, end: sleepEnd };
    onUpdate({ ...log, sleep: { sessions: [...(log.sleep?.sessions || []), newSession] } });
  };

  const isPerformed = log.prayers[activePrayer].performed;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* سطر التاريخ */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), -1), 'yyyy-MM-dd'))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1"><CalendarDays className="w-4 h-4 text-emerald-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">تاريخ التسجيل</span></div>
          <div className="relative w-full text-center">
            <input type="date" value={currentDate} onChange={(e) => onDateChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
            <span className="text-sm font-bold text-emerald-700 header-font bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-100 block">{format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM yyyy', { locale: ar })}</span>
          </div>
        </div>
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), 1), 'yyyy-MM-dd'))} disabled={currentDate === format(new Date(), 'yyyy-MM-dd')} className={`p-2 rounded-xl transition-colors ${currentDate === format(new Date(), 'yyyy-MM-dd') ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-400'}`}><ChevronLeft className="w-5 h-5" /></button>
      </div>

      {/* قسم الصلوات */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><Star className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الصلوات والرواتب</h3></div>
          <button onClick={() => updatePrayer(activePrayer as any, { performed: !isPerformed })} className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-bold header-font text-xs ${isPerformed ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-500'}`}>{isPerformed ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}{isPerformed ? 'تمت الصلاة' : 'لم تُسجل بعد'}</button>
        </div>
        <div className="flex justify-between gap-1 mb-8 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          {Object.values(PrayerName).map((p) => (
            <button key={p} onClick={() => setActivePrayer(p as PrayerName)} className={`flex-1 min-w-[3.5rem] py-3 rounded-xl transition-all flex flex-col items-center gap-1 ${activePrayer === p ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <span className="text-[10px] font-bold header-font">{p}</span>
              {log.prayers[p].performed && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
            </button>
          ))}
        </div>
        <div className={`space-y-6 transition-all duration-300 ${isPerformed ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-white shadow-sm"><Users className={`w-5 h-5 ${log.prayers[activePrayer].inCongregation ? 'text-emerald-600' : 'text-slate-300'}`} /></div><div><h4 className="font-bold text-slate-800 text-sm header-font">صلاة الجماعة</h4><p className="text-[10px] text-slate-500 font-bold">في المسجد / جماعة أهل البيت</p></div></div>
            <button onClick={() => updatePrayer(activePrayer as any, { inCongregation: !log.prayers[activePrayer].inCongregation })} className={`w-12 h-6 rounded-full transition-all relative ${log.prayers[activePrayer].inCongregation ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${log.prayers[activePrayer].inCongregation ? 'left-1' : 'left-7'}`}></div></button>
          </div>
          <div className="space-y-3"><div className="flex items-center gap-2 px-1"><Sparkle className="w-4 h-4 text-amber-500" /><h4 className="font-bold text-slate-700 text-[11px] header-font uppercase tracking-wider">السنن الرواتب</h4></div><div className="grid grid-cols-1 gap-2">{(PRAYER_SUNNAHS[activePrayer] || []).map((sunnah) => (<button key={sunnah.id} onClick={() => toggleSunnah(activePrayer as any, sunnah.id)} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${log.prayers[activePrayer].surroundingSunnahIds?.includes(sunnah.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}><span className="text-xs font-bold header-font">{sunnah.label}</span></button>))}</div></div>
          <div className="space-y-3 pt-2 border-t border-slate-100"><div className="flex items-center gap-2 px-1"><MapPin className="w-4 h-4 text-emerald-500" /><h4 className="font-bold text-slate-700 text-[11px] header-font uppercase tracking-wider">سنن ما حول الصلاة</h4></div><div className="flex flex-wrap gap-2">{SURROUNDING_SUNNAH_LIST.map((sunnah) => (<button key={sunnah.id} onClick={() => toggleSunnah(activePrayer as any, sunnah.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-bold header-font ${log.prayers[activePrayer].surroundingSunnahIds?.includes(sunnah.id) ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}>{sunnah.label}</button>))}</div></div>
        </div>
      </div>

      {/* قسم الأذكار والتحصين مع إدارة الأذكار المخصصة */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><ScrollText className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الأذكار والتحصين</h3></div>
          <button 
            onClick={() => setIsAddingDhikr(!isAddingDhikr)}
            className={`p-2 rounded-xl transition-all ${isAddingDhikr ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}
          >
            {isAddingDhikr ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {isAddingDhikr && (
          <div className="mb-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-in zoom-in duration-200">
            <p className="text-[10px] font-black text-emerald-700 mb-3 header-font uppercase tracking-widest">إضافة ذكر جديد (سيظهر في السبحة أيضاً)</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="اسم الذكر (مثلاً: سبحان الله وبحمده)" 
                value={newDhikrName}
                onChange={(e) => setNewDhikrName(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-emerald-100 rounded-xl text-xs font-bold outline-none"
              />
              <button onClick={handleAddCustomDhikr} className="p-3 bg-emerald-600 text-white rounded-xl active:scale-90 transition-all"><Check className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['morning', 'evening', 'sleep', 'travel'] as const).map(id => {
            const labels: Record<string, {label: string, icon: any}> = { morning: { label: 'صباح', icon: <Sun className="w-4 h-4" /> }, evening: { label: 'مساء', icon: <Moon className="w-4 h-4" /> }, sleep: { label: 'نوم', icon: <Coffee className="w-4 h-4" /> }, travel: { label: 'سفر', icon: <MapPin className="w-4 h-4" /> } };
            return (<button key={id} onClick={() => updateSection('athkar', { checklists: { ...log.athkar.checklists, [id]: !log.athkar.checklists[id] } })} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${log.athkar.checklists[id] ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{labels[id].icon} <span className="text-xs font-bold header-font">{labels[id].label}</span></button>);
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-[11px] font-black text-slate-400 uppercase header-font">العدادات الأساسية</h4>
          </div>
          {DEFAULT_DHIKR_LIST.map(d => counterItem(d.label, d.id, <Zap className="w-4 h-4" />))}
          
          {customDhikrs.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-1 mt-6 mb-2">
                <Sparkle className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[11px] font-black text-slate-400 uppercase header-font">أذكارك المخصوصة</h4>
              </div>
              {customDhikrs.map(d => counterItem(d.label, d.key, <Sparkle className="w-4 h-4" />, true))}
            </>
          )}
        </div>
      </div>

      {/* باقي الأقسام كما هي */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Clock className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">نوافل الصلاة والقيام</h3></div>
        <div className="space-y-4">{(['duhaDuration', 'witrDuration', 'qiyamDuration'] as const).map(field => {
            const labels: Record<string, string> = { duhaDuration: 'صلاة الضحى (دقيقة)', witrDuration: 'الوتر (دقيقة)', qiyamDuration: 'قيام الليل (دقيقة)' };
            return (<div key={field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl"><span className="text-xs font-bold text-slate-700 header-font">{labels[field]}</span><div className="flex items-center gap-3"><button onClick={() => updateSection('nawafil', { [field]: Math.max(0, log.nawafil[field] - 5) })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm"><Minus className="w-4 h-4 text-slate-400" /></button><div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] flex items-center justify-center"><span className="text-base font-black text-slate-800 header-font tabular-nums">{log.nawafil[field]}</span></div><button onClick={() => updateSection('nawafil', { [field]: log.nawafil[field] + 5 })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm"><Plus className="w-4 h-4 text-slate-400" /></button></div></div>);
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyEntry;
