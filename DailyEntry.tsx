
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
  
  // حالات السنن المخصصة
  const [isAddingSunnah, setIsAddingSunnah] = useState(false);
  const [newSunnahName, setNewSunnahName] = useState('');
  const [newSunnahPoints, setNewSunnahPoints] = useState('50');

  // حالات الأذكار المخصصة
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

  const handleDeleteCustomSunnah = (id: string) => {
    if (window.confirm('حذف هذه السنة المخصصة نهائياً؟')) {
      const updated = (weights.customSunnahs || []).filter(s => s.id !== id);
      onUpdateWeights({ ...weights, customSunnahs: updated });
    }
  };

  const toggleSunnahInLog = (id: string) => {
    const current = log.customSunnahIds || [];
    const newIds = current.includes(id) ? current.filter(cid => cid !== id) : [...current, id];
    onUpdate({ ...log, customSunnahIds: newIds });
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

  const handleDeleteCustomDhikr = (id: string) => {
    if (window.confirm('حذف هذا الذكر نهائياً؟')) {
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

  const calculateSleepDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let totalMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMins < 0) totalMins += 24 * 60;
    return totalMins / 60;
  };

  const totalSleepHours = (log.sleep?.sessions || []).reduce((acc, s) => acc + calculateSleepDuration(s.start, s.end), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* التاريخ */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), -1), 'yyyy-MM-dd'))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        <div className="flex-1 text-center">
          <p className="text-[10px] font-black text-slate-400 header-font">تاريخ التسجيل</p>
          <span className="text-sm font-bold text-emerald-700 header-font bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-100 block">{format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM yyyy', { locale: ar })}</span>
        </div>
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), 1), 'yyyy-MM-dd'))} disabled={currentDate === format(new Date(), 'yyyy-MM-dd')} className="p-2 rounded-xl text-slate-400 disabled:text-slate-100"><ChevronLeft className="w-5 h-5" /></button>
      </div>

      {/* النوم */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><div className="p-2 bg-indigo-50 rounded-xl"><Bed className="w-5 h-5 text-indigo-600" /></div><h3 className="font-bold text-slate-800 header-font text-lg">سجل النوم</h3></div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl"><span className="text-xs font-black font-mono">{totalSleepHours.toFixed(1)} س</span></div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl">
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400 header-font">من</label><input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400 header-font">إلى</label><input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" /></div>
          </div>
          <button onClick={() => { const s = { id: Math.random().toString(36).substr(2,9), start: sleepStart, end: sleepEnd }; updateSection('sleep', { sessions: [...(log.sleep?.sessions || []), s] }); }} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs header-font flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> إضافة فترة نوم</button>
          <div className="space-y-2">{log.sleep?.sessions?.map(s => (<div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl animate-in slide-in-from-top-1"><span className="text-xs font-bold text-slate-600">من {s.start} لـ {s.end} ({calculateSleepDuration(s.start, s.end).toFixed(1)} س)</span><button onClick={() => updateSection('sleep', { sessions: log.sleep.sessions.filter(x => x.id !== s.id) })} className="p-1.5 text-rose-400"><Trash2 className="w-4 h-4" /></button></div>))}</div>
        </div>
      </div>

      {/* الصلوات */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><Star className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الصلوات</h3></div>
          <button onClick={() => updatePrayer(activePrayer, { performed: !log.prayers[activePrayer].performed })} className={`px-4 py-2 rounded-2xl text-xs font-bold header-font ${log.prayers[activePrayer].performed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{log.prayers[activePrayer].performed ? 'تمت' : 'سجل الآن'}</button>
        </div>
        <div className="flex gap-1 mb-8 bg-slate-50 p-1.5 rounded-2xl">
          {Object.values(PrayerName).map(p => (<button key={p} onClick={() => setActivePrayer(p)} className={`flex-1 py-3 rounded-xl transition-all flex flex-col items-center gap-1 ${activePrayer === p ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}><span className="text-[10px] font-bold header-font">{p}</span>{log.prayers[p].performed && <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>}</button>))}
        </div>
        <div className={`space-y-6 ${log.prayers[activePrayer].performed ? '' : 'opacity-40 grayscale pointer-events-none'}`}>
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
            <div className="flex items-center gap-3"><Users className={`w-5 h-5 ${log.prayers[activePrayer].inCongregation ? 'text-emerald-600' : 'text-slate-300'}`} /><div><h4 className="font-bold text-sm">صلاة الجماعة</h4></div></div>
            <button onClick={() => updatePrayer(activePrayer, { inCongregation: !log.prayers[activePrayer].inCongregation })} className={`w-12 h-6 rounded-full relative ${log.prayers[activePrayer].inCongregation ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${log.prayers[activePrayer].inCongregation ? 'left-1' : 'left-7'}`}></div></button>
          </div>
          <div className="grid grid-cols-1 gap-2">{(PRAYER_SUNNAHS[activePrayer] || []).map(s => (<button key={s.id} onClick={() => { const cur = log.prayers[activePrayer].surroundingSunnahIds || []; const n = cur.includes(s.id) ? cur.filter(x => x !== s.id) : [...cur, s.id]; updatePrayer(activePrayer, { surroundingSunnahIds: n }); }} className={`p-3 rounded-xl border text-xs font-bold header-font ${log.prayers[activePrayer].surroundingSunnahIds?.includes(s.id) ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500'}`}>{s.label}</button>))}</div>
          <div className="flex flex-wrap gap-2">{SURROUNDING_SUNNAH_LIST.map(s => (<button key={s.id} onClick={() => { const cur = log.prayers[activePrayer].surroundingSunnahIds || []; const n = cur.includes(s.id) ? cur.filter(x => x !== s.id) : [...cur, s.id]; updatePrayer(activePrayer, { surroundingSunnahIds: n }); }} className={`px-3 py-2 rounded-xl border text-[10px] font-bold ${log.prayers[activePrayer].surroundingSunnahIds?.includes(s.id) ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400'}`}>{s.label}</button>))}</div>
          <div className="space-y-3"><div className="flex justify-between text-xs font-bold text-slate-700"><span>مستوى الخشوع</span><span className="text-emerald-600 bg-emerald-50 px-2 rounded-md">{['غافل','شرود','حضور','خاشع','خاشع جداً','إحسان'][log.prayers[activePrayer].tranquility]}</span></div><input type="range" min="0" max="5" value={log.prayers[activePrayer].tranquility} onChange={(e) => updatePrayer(activePrayer, { tranquility: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none accent-emerald-500" /></div>
        </div>
      </div>

      {/* السنن المخصوصة - مضافة حسب الطلب */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><Tags className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">سنن مخصصة</h3></div>
          <button onClick={() => setIsAddingSunnah(!isAddingSunnah)} className={`p-2 rounded-xl ${isAddingSunnah ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>{isAddingSunnah ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</button>
        </div>
        {isAddingSunnah && (
          <div className="mb-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-in zoom-in duration-200">
            <p className="text-[10px] font-black text-emerald-700 mb-3 header-font uppercase">إضافة عمل صالح مخصص لقائمتك</p>
            <div className="space-y-3">
              <input type="text" placeholder="اسم العمل (مثلاً: بر الوالدين)" value={newSunnahName} onChange={(e) => setNewSunnahName(e.target.value)} className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl text-xs font-bold outline-none" />
              <div className="flex gap-2">
                <input type="number" placeholder="النقاط" value={newSunnahPoints} onChange={(e) => setNewSunnahPoints(e.target.value)} className="flex-1 px-4 py-3 bg-white border border-emerald-100 rounded-xl text-xs font-bold outline-none" />
                <button onClick={handleAddCustomSunnah} className="px-6 bg-emerald-600 text-white rounded-xl font-black text-xs header-font shadow-lg">إضافة</button>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-2">
          {weights.customSunnahs?.map(s => (
            <div key={s.id} className="flex gap-2 group">
              <button onClick={() => toggleSunnahInLog(s.id)} className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all ${log.customSunnahIds?.includes(s.id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                <div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${log.customSunnahIds?.includes(s.id) ? 'bg-white border-white text-emerald-600' : 'bg-white border-slate-300'}`}>{log.customSunnahIds?.includes(s.id) && <Check className="w-3 h-3" />}</div><span className="text-sm font-bold header-font">{s.name}</span></div>
                <span className="text-xs font-black font-mono">+{s.points}</span>
              </button>
              <button onClick={() => handleDeleteCustomSunnah(s.id)} className="p-3 bg-rose-50 text-rose-400 rounded-2xl opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* القرآن */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Book className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">ورد القرآن (بالأرباع)</h3></div>
        <div className="space-y-4">
          {[{l:'ورد السماع',f:'hifzRub'},{l:'ورد القراءة',f:'revisionRub'}].map(q => (
            <div key={q.f} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm font-bold text-slate-700 header-font">{q.l}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => updateSection('quran', { [q.f]: Math.max(0, (log.quran as any)[q.f] - 1) })} className="p-2 bg-white border border-slate-200 rounded-xl"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-1.5 min-w-[3.5rem] flex items-center justify-center"><span className="text-xl font-black text-slate-800 tabular-nums">{(log.quran as any)[q.f] || 0}</span></div>
                <button onClick={() => updateSection('quran', { [q.f]: ((log.quran as any)[q.f] || 0) + 1 })} className="p-2 bg-white border border-slate-200 rounded-xl"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* طلب العلم */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6"><GraduationCap className="w-6 h-6 text-purple-600" /><h3 className="font-bold text-slate-800 header-font text-lg">طلب العلم والقراءة</h3></div>
        <div className="space-y-4">
          {[{l:'علم شرعي',f:'shariDuration',c:'purple',p:10},{l:'قراءة عامة',f:'readingDuration',c:'blue',p:2}].map(k => (
            <div key={k.f} className={`bg-${k.c}-50 p-4 rounded-2xl border border-${k.c}-100`}>
              <div className="flex justify-between mb-3"><span className={`text-sm font-black text-${k.c}-900`}>{k.l}</span><span className={`text-[9px] font-black text-${k.c}-500 bg-white px-2 py-0.5 rounded-full`}>{k.p} نقاط / د</span></div>
              <div className="flex items-center justify-between"><span className="text-[11px] font-bold text-slate-500">بالدقائق:</span><div className="flex items-center gap-2">
                <button onClick={() => updateSection('knowledge', { [k.f]: Math.max(0, (log.knowledge as any)[k.f] - 10) })} className={`p-2 bg-white border border-${k.c}-200 rounded-xl text-${k.c}-600`}><Minus className="w-4 h-4" /></button>
                <div className="bg-white border-2 border-slate-100 rounded-xl px-4 py-1.5 min-w-[4rem] text-center"><span className="text-xl font-black font-mono">{(log.knowledge as any)[k.f] || 0}</span></div>
                <button onClick={() => updateSection('knowledge', { [k.f]: ((log.knowledge as any)[k.f] || 0) + 10 })} className={`p-2 bg-white border border-${k.c}-200 rounded-xl text-${k.c}-600`}><Plus className="w-4 h-4" /></button>
              </div></div>
            </div>
          ))}
        </div>
      </div>

      {/* الأذكار مع خيار الإضافة */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><ScrollText className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الأذكار</h3></div>
          <button onClick={() => setIsAddingDhikr(!isAddingDhikr)} className={`p-2 rounded-xl ${isAddingDhikr ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>{isAddingDhikr ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</button>
        </div>
        {isAddingDhikr && (
          <div className="mb-6 p-4 bg-emerald-50/50 rounded-2xl animate-in zoom-in duration-200">
            <p className="text-[10px] font-black text-emerald-700 mb-3 header-font uppercase">إضافة ذكر جديد (سيظهر في السبحة)</p>
            <div className="flex gap-2"><input type="text" placeholder="اسم الذكر.." value={newDhikrName} onChange={(e) => setNewDhikrName(e.target.value)} className="flex-1 px-4 py-3 bg-white border border-emerald-100 rounded-xl text-xs font-bold outline-none" /><button onClick={handleAddCustomDhikr} className="p-3 bg-emerald-600 text-white rounded-xl"><Check className="w-4 h-4" /></button></div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['morning','evening','sleep','travel'] as const).map(id => (<button key={id} onClick={() => updateSection('athkar', { checklists: { ...log.athkar.checklists, [id]: !log.athkar.checklists[id] } })} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${log.athkar.checklists[id] ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100'}`}><span className="text-xs font-bold">{id === 'morning' ? 'صباح' : id === 'evening' ? 'مساء' : id === 'sleep' ? 'نوم' : 'سفر'}</span></button>))}
        </div>
        <div className="space-y-3">
          {DEFAULT_DHIKR_LIST.map(d => counterItem(d.label, d.id, <Zap className="w-4 h-4" />))}
          {customDhikrs.map(d => counterItem(d.label, d.key, <Sparkle className="w-4 h-4" />, true))}
        </div>
      </div>
      
      {/* النوافل */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Clock className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">نوافل الصلاة والقيام</h3></div>
        <div className="space-y-4">
          {[{l:'الضحى (د)',f:'duhaDuration'},{l:'الوتر (د)',f:'witrDuration'},{l:'القيام (د)',f:'qiyamDuration'}].map(n => (<div key={n.f} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl"><span className="text-xs font-bold text-slate-700">{n.l}</span><div className="flex items-center gap-3"><button onClick={() => updateSection('nawafil', { [n.f]: Math.max(0, (log.nawafil as any)[n.f] - 5) })} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Minus className="w-4 h-4" /></button><div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] text-center"><span className="text-base font-black">{(log.nawafil as any)[n.f]}</span></div><button onClick={() => updateSection('nawafil', { [n.f]: ((log.nawafil as any)[n.f] || 0) + 5 })} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Plus className="w-4 h-4" /></button></div></div>))}
          <button onClick={() => updateSection('nawafil', { fasting: !log.nawafil.fasting })} className={`w-full p-4 rounded-3xl border flex items-center justify-between mt-4 ${log.nawafil.fasting ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-500 border-slate-100'}`}><div className="flex items-center gap-2"><Sun className="w-5 h-5" /><span className="font-bold text-sm">صيام</span></div>{log.nawafil.fasting && <CheckCircle2 className="w-5 h-5" />}</button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><span className="text-[10px] font-bold text-slate-500 mb-2 block">معامل المجاهدة</span><div className="flex gap-2">{[1.0, 1.05, 1.1].map(f => (<button key={f} onClick={() => onUpdate({ ...log, jihadFactor: f })} className={`flex-1 py-1 rounded-lg text-[10px] font-bold ${log.jihadFactor === f ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-400'}`}>{f === 1 ? 'عادي' : f === 1.05 ? 'مجاهدة' : 'شديدة'}</button>))}</div></div>
        <button onClick={() => onUpdate({ ...log, hasBurden: !log.hasBurden })} className={`flex-1 p-4 rounded-2xl shadow-sm border flex flex-col items-center justify-center ${log.hasBurden ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-100 text-slate-300'}`}><ShieldAlert className="w-5 h-5 mb-1" /><span className="text-[10px] font-bold">عبء روحي</span></button>
      </div>
    </div>
  );
};

export default DailyEntry;
