
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

  const updateSection = (section: keyof DailyLog, data: any, label?: string, type?: string) => {
    onUpdate({ ...log, [section]: { ...(log[section] as any), ...data } }, label, type);
  };

  const updatePrayer = (name: string, data: any, label?: string) => {
    onUpdate({ ...log, prayers: { ...log.prayers, [name]: { ...log.prayers[name], ...data } } }, label, 'prayer');
  };

  const handleAddCustomSunnah = () => {
    const points = parseInt(newSunnahPoints);
    if (!newSunnahName.trim() || isNaN(points)) return;
    const newSunnah: CustomSunnah = {
      id: 'sunnah_' + Math.random().toString(36).substr(2, 9),
      name: newSunnahName.trim(),
      points: points
    };
    const updated = [...(weights.customSunnahs || []), newSunnah];
    onUpdateWeights({ ...weights, customSunnahs: updated });
    setNewSunnahName('');
    setIsAddingSunnah(false);
  };

  const toggleSunnahInLog = (id: string, name: string) => {
    const current = log.customSunnahIds || [];
    const isAdding = !current.includes(id);
    const newIds = isAdding ? [...current, id] : current.filter(cid => cid !== id);
    onUpdate({ ...log, customSunnahIds: newIds }, isAdding ? `أتم عمل مخصص: ${name}` : undefined, 'sunnah');
  };

  const handleAddCustomDhikr = () => {
    if (!newDhikrName.trim()) return;
    const id = 'custom_dhikr_' + Math.random().toString(36).substr(2, 9);
    const newDhikr = { id, label: newDhikrName.trim(), key: id };
    const updated = [...customDhikrs, newDhikr];
    setCustomDhikrs(updated);
    localStorage.setItem('worship_custom_dhikrs', JSON.stringify(updated));
    setNewDhikrName('');
    setIsAddingDhikr(false);
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
          onClick={() => updateSection('athkar', { counters: { ...log.athkar.counters, [field]: (log.athkar.counters[field] || 0) + 10 } }, `عطّر لسانه بـ ${label}`, 'athkar')} 
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 active:scale-90 transition-all"
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), -1), 'yyyy-MM-dd'))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        <div className="flex-1 text-center">
          <p className="text-[10px] font-black text-slate-400 header-font">تاريخ التسجيل</p>
          <span className="text-sm font-bold text-emerald-700 header-font bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-100 block">{format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM yyyy', { locale: ar })}</span>
        </div>
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), 1), 'yyyy-MM-dd'))} disabled={currentDate === format(new Date(), 'yyyy-MM-dd')} className="p-2 rounded-xl text-slate-400 disabled:text-slate-100"><ChevronLeft className="w-5 h-5" /></button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><Star className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الصلوات</h3></div>
          <button onClick={() => {
            const isPerformed = !log.prayers[activePrayer].performed;
            updatePrayer(activePrayer, { performed: isPerformed }, isPerformed ? `أدى صلاة ${activePrayer}` : undefined);
          }} className={`px-4 py-2 rounded-2xl text-xs font-bold header-font ${log.prayers[activePrayer].performed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{log.prayers[activePrayer].performed ? 'تمت' : 'سجل الآن'}</button>
        </div>
        <div className="flex gap-1 mb-8 bg-slate-50 p-1.5 rounded-2xl">
          {Object.values(PrayerName).map(p => (<button key={p} onClick={() => setActivePrayer(p)} className={`flex-1 py-3 rounded-xl transition-all flex flex-col items-center gap-1 ${activePrayer === p ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}><span className="text-[10px] font-bold header-font">{p}</span>{log.prayers[p].performed && <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>}</button>))}
        </div>
        <div className={`space-y-6 ${log.prayers[activePrayer].performed ? '' : 'opacity-40 grayscale pointer-events-none'}`}>
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
            <div className="flex items-center gap-3"><Users className={`w-5 h-5 ${log.prayers[activePrayer].inCongregation ? 'text-emerald-600' : 'text-slate-300'}`} /><div><h4 className="font-bold text-sm">صلاة الجماعة</h4></div></div>
            <button onClick={() => updatePrayer(activePrayer, { inCongregation: !log.prayers[activePrayer].inCongregation }, log.prayers[activePrayer].inCongregation ? undefined : `صلى ${activePrayer} جماعة`)} className={`w-12 h-6 rounded-full relative ${log.prayers[activePrayer].inCongregation ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${log.prayers[activePrayer].inCongregation ? 'left-1' : 'left-7'}`}></div></button>
          </div>
          <div className="grid grid-cols-1 gap-2">{(PRAYER_SUNNAHS[activePrayer] || []).map(s => (<button key={s.id} onClick={() => { const cur = log.prayers[activePrayer].surroundingSunnahIds || []; const isAdding = !cur.includes(s.id); const n = isAdding ? [...cur, s.id] : cur.filter(x => x !== s.id); updatePrayer(activePrayer, { surroundingSunnahIds: n }, isAdding ? `أتم ${s.label}` : undefined); }} className={`p-3 rounded-xl border text-xs font-bold header-font ${log.prayers[activePrayer].surroundingSunnahIds?.includes(s.id) ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500'}`}>{s.label}</button>))}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><Tags className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">سنن مخصصة</h3></div>
          <button onClick={() => setIsAddingSunnah(!isAddingSunnah)} className={`p-2 rounded-xl ${isAddingSunnah ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>{isAddingSunnah ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {weights.customSunnahs?.map(s => (
            <div key={s.id} className="flex gap-2 group">
              <button onClick={() => toggleSunnahInLog(s.id, s.name)} className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all ${log.customSunnahIds?.includes(s.id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                <div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${log.customSunnahIds?.includes(s.id) ? 'bg-white border-white text-emerald-600' : 'bg-white border-slate-300'}`}>{log.customSunnahIds?.includes(s.id) && <Check className="w-3 h-3" />}</div><span className="text-sm font-bold header-font">{s.name}</span></div>
                <span className="text-xs font-black font-mono">+{s.points}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Book className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">ورد القرآن (بالأرباع)</h3></div>
        <div className="space-y-4">
          {[{l:'ورد السماع',f:'hifzRub'},{l:'ورد القراءة',f:'revisionRub'}].map(q => (
            <div key={q.f} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm font-bold text-slate-700 header-font">{q.l}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => updateSection('quran', { [q.f]: Math.max(0, (log.quran as any)[q.f] - 1) })} className="p-2 bg-white border border-slate-200 rounded-xl"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-1.5 min-w-[3.5rem] flex items-center justify-center"><span className="text-xl font-black text-slate-800 tabular-nums">{(log.quran as any)[q.f] || 0}</span></div>
                <button onClick={() => updateSection('quran', { [q.f]: ((log.quran as any)[q.f] || 0) + 1 }, `أتمَّ ربعاً جديداً في ${q.l}`, 'quran')} className="p-2 bg-white border border-slate-200 rounded-xl"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><ScrollText className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الأذكار</h3></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['morning','evening','sleep','travel'] as const).map(id => {
            const label = id === 'morning' ? 'أذكار الصباح' : id === 'evening' ? 'أذكار المساء' : id === 'sleep' ? 'أذكار النوم' : 'أذكار السفر';
            return (
              <button key={id} onClick={() => {
                const isAdding = !log.athkar.checklists[id];
                updateSection('athkar', { checklists: { ...log.athkar.checklists, [id]: isAdding } }, isAdding ? `أتمَّ ${label}` : undefined, 'athkar');
              }} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${log.athkar.checklists[id] ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100'}`}><span className="text-xs font-bold">{id === 'morning' ? 'صباح' : id === 'evening' ? 'مساء' : id === 'sleep' ? 'نوم' : 'سفر'}</span></button>
            );
          })}
        </div>
        <div className="space-y-3">
          {DEFAULT_DHIKR_LIST.map(d => counterItem(d.label, d.id, <Zap className="w-4 h-4" />))}
        </div>
      </div>
    </div>
  );
};

export default DailyEntry;
