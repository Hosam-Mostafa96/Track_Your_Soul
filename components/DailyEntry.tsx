import React, { useState } from 'react';
import { 
  Star, Users, Clock, Book, GraduationCap, Plus, Minus, Heart, ShieldAlert,
  Moon, Sun, Zap, Coffee, ScrollText, Sparkle, MessageSquare, 
  MapPin, CheckCircle2, Droplets, Flame, Tags, ToggleRight, ToggleLeft,
  CalendarDays, ChevronRight, ChevronLeft, Edit3, Trash2, X, Check
} from 'lucide-react';
import { DailyLog, PrayerName, TranquilityLevel, CustomSunnah, AppWeights } from '../types';
import { SURROUNDING_SUNNAH_LIST } from '../constants';
import { format, subDays, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// Define Props interface to match usage in App.tsx
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

const DailyEntry: React.FC<DailyEntryProps> = ({ log, onUpdate, weights, onUpdateWeights, currentDate, onDateChange }) => {
  const [activePrayer, setActivePrayer] = useState<PrayerName>(PrayerName.FAJR);
  const [isManagingSunnahs, setIsManagingSunnahs] = useState(false);
  const [newSunnahName, setNewSunnahName] = useState('');
  const [newSunnahPoints, setNewSunnahPoints] = useState(50);

  const updateSection = (section: keyof DailyLog, data: any) => {
    onUpdate({ ...log, [section]: { ...(log[section] as any), ...data } });
  };

  const updatePrayer = (name: string, data: any) => {
    onUpdate({ ...log, prayers: { ...log.prayers, [name]: { ...log.prayers[name], ...data } } });
  };

  const toggleSunnah = (prayerName: PrayerName, sunnahId: string) => {
    const currentSunnahs = log.prayers[prayerName].surroundingSunnahIds || [];
    const newSunnahs = currentSunnahs.includes(sunnahId)
      ? currentSunnahs.filter(id => id !== sunnahId)
      : [...currentSunnahs, sunnahId];
    updatePrayer(prayerName, { surroundingSunnahIds: newSunnahs });
  };

  const toggleCustomSunnah = (sunnahId: string) => {
    const current = log.customSunnahIds || [];
    const newIds = current.includes(sunnahId)
      ? current.filter(id => id !== sunnahId)
      : [...current, sunnahId];
    onUpdate({ ...log, customSunnahIds: newIds });
  };

  const addSunnah = () => {
    if (!newSunnahName.trim()) return;
    const newSunnah: CustomSunnah = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSunnahName,
      points: newSunnahPoints
    };
    onUpdateWeights({
      ...weights,
      customSunnahs: [...(weights.customSunnahs || []), newSunnah]
    });
    setNewSunnahName('');
    setNewSunnahPoints(50);
  };

  const removeSunnah = (id: string) => {
    onUpdateWeights({
      ...weights,
      customSunnahs: (weights.customSunnahs || []).filter(s => s.id !== id)
    });
    if (log.customSunnahIds.includes(id)) {
      onUpdate({ ...log, customSunnahIds: log.customSunnahIds.filter(cid => cid !== id) });
    }
  };

  const getTranquilityLabel = (level: number) => {
    const labels = ['غافل', 'شرود كثير', 'حضور أدنى', 'خاشع غالباً', 'خاشع جداً', 'إحسان (كأنك تراه)'];
    return labels[level] || 'مستوى الخشوع';
  };

  const getSunnahIcon = (id: string) => {
    switch(id) {
      case 'adhan': return <MessageSquare className="w-3 h-3" />;
      case 'dua_adhan': return <Clock className="w-3 h-3" />;
      case 'early': return <Zap className="w-3 h-3 text-amber-500" />;
      case 'first_row': return <MapPin className="w-3 h-3" />;
      case 'takbir': return <Flame className="w-3 h-3 text-orange-500" />;
      case 'adhkar_after': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case 'wudu': return <Droplets className="w-3 h-3 text-blue-400" />;
      default: return <Sparkle className="w-3 h-3" />;
    }
  };

  const counterItem = (label: string, field: keyof DailyLog['athkar']['counters'], icon: any) => (
    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
      <div className="flex items-center gap-2">
        <span className="text-emerald-600">{icon}</span>
        <span className="text-xs font-bold text-slate-700 header-font">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateSection('athkar', { counters: { ...log.athkar.counters, [field]: Math.max(0, log.athkar.counters[field] - 10) } })} 
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 active:scale-90 transition-all"
        >
          <Minus className="w-4 h-4 text-slate-500" />
        </button>
        <div className="bg-emerald-100/50 border border-emerald-200/50 rounded-xl px-3 py-1 min-w-[3.5rem] flex items-center justify-center">
          <span className="text-lg font-black text-emerald-800 header-font tabular-nums">
            {log.athkar.counters[field]}
          </span>
        </div>
        <button 
          onClick={() => updateSection('athkar', { counters: { ...log.athkar.counters, [field]: log.athkar.counters[field] + 10 } })} 
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 active:scale-90 transition-all"
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );

  const isPerformed = log.prayers[activePrayer].performed;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <button 
          onClick={() => onDateChange(format(subDays(new Date(currentDate.replace(/-/g, '/')), 1), 'yyyy-MM-dd'))}
          className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">تاريخ التسجيل</span>
          </div>
          <div className="relative w-full text-center">
            <input 
              type="date" 
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <span className="text-sm font-bold text-emerald-700 header-font bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-100 block">
              {format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM yyyy', { locale: ar })}
            </span>
          </div>
        </div>

        <button 
          onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), 1), 'yyyy-MM-dd'))}
          disabled={currentDate === format(new Date(), 'yyyy-MM-dd')}
          className={`p-2 rounded-xl transition-colors ${currentDate === format(new Date(), 'yyyy-MM-dd') ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-400'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 header-font text-lg">الصلوات والرواتب</h3>
          </div>
          <button 
            onClick={() => updatePrayer(activePrayer, { performed: !isPerformed })}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-bold header-font text-xs ${isPerformed ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-500'}`}
          >
            {isPerformed ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            {isPerformed ? 'تمت الصلاة' : 'لم تُسجل بعد'}
          </button>
        </div>

        <div className="flex justify-between gap-1 mb-8 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          {Object.values(PrayerName).map((p) => (
            <button
              key={p}
              onClick={() => setActivePrayer(p as PrayerName)}
              className={`flex-1 min-w-[3.5rem] py-3 rounded-xl transition-all flex flex-col items-center gap-1 ${
                activePrayer === p 
                ? 'bg-white shadow-md text-emerald-600' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="text-[10px] font-bold header-font">{p}</span>
              {log.prayers[p].performed && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className={`space-y-6 transition-all duration-300 ${isPerformed ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white shadow-sm">
                <Users className={`w-5 h-5 ${log.prayers[activePrayer].inCongregation ? 'text-emerald-600' : 'text-slate-300'}`} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm header-font">صلاة الجماعة</h4>
                <p className="text-[10px] text-slate-500 font-bold">في المسجد / جماعة أهل البيت</p>
              </div>
            </div>
            <button onClick={() => updatePrayer(activePrayer, { inCongregation: !log.prayers[activePrayer].inCongregation })} className={`w-12 h-6 rounded-full transition-all relative ${log.prayers[activePrayer].inCongregation ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${log.prayers[activePrayer].inCongregation ? 'left-1' : 'left-7'}`}></div></button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1"><Sparkle className="w-4 h-4 text-amber-500" /><h4 className="font-bold text-slate-700 text-[11px] header-font uppercase tracking-wider">السنن الرواتب</h4></div>
            <div className="grid grid-cols-1 gap-2">
              {(PRAYER_SUNNAHS[activePrayer] || []).map((sunnah) => (
                <button key={sunnah.id} onClick={() => toggleSunnah(activePrayer, sunnah.id)} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${log.prayers[activePrayer].surroundingSunnahIds?.includes(sunnah.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}>
                  <span className="text-xs font-bold header-font">{sunnah.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 px-1"><MapPin className="w-4 h-4 text-emerald-500" /><h4 className="font-bold text-slate-700 text-[11px] header-font uppercase tracking-wider">سنن ما حول الصلاة</h4></div>
            <div className="flex flex-wrap gap-2">
              {SURROUNDING_SUNNAH_LIST.map((sunnah) => (
                <button key={sunnah.id} onClick={() => toggleSunnah(activePrayer, sunnah.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-bold header-font ${log.prayers[activePrayer].surroundingSunnahIds?.includes(sunnah.id) ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}>
                  {getSunnahIcon(sunnah.id)} {sunnah.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 px-2 pt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /><span className="text-sm font-bold text-slate-700 header-font">مستوى الخشوع</span></div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{getTranquilityLabel(log.prayers[activePrayer].tranquility)}</span>
            </div>
            <input type="range" min="0" max="5" step="1" value={log.prayers[activePrayer].tranquility} onChange={(e) => updatePrayer(activePrayer, { tranquility: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tags className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 header-font text-lg">سنن مخصصة</h3>
          </div>
          <button 
            onClick={() => setIsManagingSunnahs(!isManagingSunnahs)}
            className={`p-2 rounded-xl transition-all ${isManagingSunnahs ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {isManagingSunnahs && (
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">إضافة سنة جديدة</span>
              <button onClick={() => setIsManagingSunnahs(false)} className="text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newSunnahName}
                onChange={(e) => setNewSunnahName(e.target.value)}
                placeholder="مثال: بر الوالدين، صلة رحم.."
                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold header-font focus:border-emerald-500 outline-none"
              />
              <input 
                type="number" 
                value={newSunnahPoints}
                onChange={(e) => setNewSunnahPoints(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-center outline-none focus:border-emerald-500"
              />
              <button 
                onClick={addSunnah}
                className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="h-px bg-slate-200 my-4" />
            <div className="space-y-2">
              {(weights.customSunnahs || []).map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-600 header-font">{s.name} ({s.points}ن)</span>
                  <button onClick={() => removeSunnah(s.id)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          {(weights.customSunnahs || []).length > 0 ? (
            (weights.customSunnahs || []).map((sunnah) => (
              <button
                key={sunnah.id}
                onClick={() => toggleCustomSunnah(sunnah.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  (log.customSunnahIds || []).includes(sunnah.id)
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-emerald-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${ (log.customSunnahIds || []).includes(sunnah.id) ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300' }`}>
                    {(log.customSunnahIds || []).includes(sunnah.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-bold header-font">{sunnah.name}</span>
                </div>
                <span className="text-xs font-black font-mono bg-white px-2 py-1 rounded-lg border border-slate-100">+{sunnah.points}</span>
              </button>
            ))
          ) : (
            <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-bold header-font">لا توجد سنن مخصصة مضافة حالياً</p>
              <button onClick={() => setIsManagingSunnahs(true)} className="text-[10px] text-emerald-600 font-bold underline mt-1">أضف سنتك الخاصة الآن</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold text-slate-500 header-font">معامل المجاهدة</span><Heart className={`w-4 h-4 ${log.jihadFactor > 1 ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`} /></div>
          <div className="flex gap-2">
            {[1.0, 1.05, 1.1].map(f => (
              <button key={f} onClick={() => onUpdate({ ...log, jihadFactor: f })} className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all header-font ${log.jihadFactor === f ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-400'}`}>{f === 1 ? 'عادي' : f === 1.05 ? 'مجاهدة' : 'شديدة'}</button>
            ))}
          </div>
        </div>
        <button onClick={() => onUpdate({ ...log, hasBurden: !log.hasBurden })} className={`flex-1 p-4 rounded-2xl shadow-sm border transition-all flex flex-col items-center justify-center ${log.hasBurden ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}><ShieldAlert className={`w-5 h-5 mb-1 ${log.hasBurden ? 'text-amber-500' : 'text-slate-300'}`} /><span className={`text-[10px] font-bold header-font ${log.hasBurden ? 'text-amber-700' : 'text-slate-400'}`}>عبء روحي</span></button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Book className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">ورد القرآن (بالأرباع)</h3></div>
        <div className="space-y-4">
          {[{ label: 'حفظ جديد', field: 'hifzRub' as const }, { label: 'مراجعة', field: 'revisionRub' as const }].map(q => (
            <div key={q.field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm font-bold text-slate-700 header-font">{q.label}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => updateSection('quran', { [q.field]: Math.max(0, log.quran[q.field] - 1) })} className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-1.5 min-w-[3.5rem] flex items-center justify-center"><span className="text-xl font-black text-slate-800 header-font tabular-nums">{log.quran[q.field]}</span></div>
                <button onClick={() => updateSection('quran', { [q.field]: log.quran[q.field] + 1 })} className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><ScrollText className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الأذكار والتحصين</h3></div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['morning', 'evening', 'sleep', 'travel'] as const).map(id => {
            const labels: Record<string, {label: string, icon: any}> = {
              morning: { label: 'صباح', icon: <Sun className="w-4 h-4" /> },
              evening: { label: 'مساء', icon: <Moon className="w-4 h-4" /> },
              sleep: { label: 'نوم', icon: <Coffee className="w-4 h-4" /> },
              travel: { label: 'سفر', icon: <MapPin className="w-4 h-4" /> }
            };
            return (
              <button key={id} onClick={() => updateSection('athkar', { checklists: { ...log.athkar.checklists, [id]: !log.athkar.checklists[id] } })} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${log.athkar.checklists[id] ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                {labels[id].icon} <span className="text-xs font-bold header-font">{labels[id].label}</span>
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {counterItem('الصلاة على النبي', 'salawat', <Zap className="w-4 h-4" />)}
          {counterItem('الحوقلة', 'hawqalah', <Zap className="w-4 h-4" />)}
          {counterItem('لا إله إلا الله', 'tahlil', <Zap className="w-4 h-4" />)}
          {counterItem('الباقيات الصالحات', 'baqiyat', <Zap className="w-4 h-4" />)}
          {counterItem('الاستغفار', 'istighfar', <Zap className="w-4 h-4" />)}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Clock className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">نوافل الصلاة والقيام</h3></div>
        <div className="space-y-4">
          {(['duhaDuration', 'witrDuration', 'qiyamDuration'] as const).map(field => {
            const labels: Record<string, string> = { duhaDuration: 'صلاة الضحى (دقيقة)', witrDuration: 'الوتر (دقيقة)', qiyamDuration: 'قيام الليل (دقيقة)' };
            return (
              <div key={field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 header-font">{labels[field]}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateSection('nawafil', { [field]: Math.max(0, log.nawafil[field] - 5) })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm"><Minus className="w-4 h-4 text-slate-400" /></button>
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] flex items-center justify-center"><span className="text-base font-black text-slate-800 header-font tabular-nums">{log.nawafil[field]}</span></div>
                  <button onClick={() => updateSection('nawafil', { [field]: log.nawafil[field] + 5 })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm"><Plus className="w-4 h-4 text-slate-400" /></button>
                </div>
              </div>
            );
          })}
          <button onClick={() => updateSection('nawafil', { fasting: !log.nawafil.fasting })} className={`w-full p-4 rounded-3xl border flex items-center justify-between mt-4 transition-all ${log.nawafil.fasting ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
            <div className="flex items-center gap-2"><Sun className="w-5 h-5" /><span className="font-bold text-sm header-font">صيام (نفل / قضاء)</span></div>
            {log.nawafil.fasting ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><GraduationCap className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">طلب العلم والقراءة</h3></div>
        <div className="space-y-4">
          {(['shariDuration', 'readingDuration'] as const).map(field => {
            const labels: Record<string, string> = { shariDuration: 'علم شرعي (دقيقة)', readingDuration: 'قراءة عامة (دقيقة)' };
            return (
              <div key={field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 header-font">{labels[field]}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateSection('knowledge', { [field]: Math.max(0, log.knowledge[field] - 5) })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm"><Minus className="w-4 h-4 text-slate-400" /></button>
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] flex items-center justify-center"><span className="text-base font-black text-slate-800 header-font tabular-nums">{log.knowledge[field]}</span></div>
                  <button onClick={() => updateSection('knowledge', { [field]: log.knowledge[field] + 5 })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm"><Plus className="w-4 h-4 text-slate-400" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyEntry;