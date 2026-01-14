
import React, { useState } from 'react';
import { 
  Star, Users, Clock, Book, GraduationCap, Plus, Minus, Heart, ShieldAlert,
  Moon, Sun, Zap, Coffee, ScrollText, Sparkle, MessageSquare, 
  MapPin, CheckCircle2, Droplets, Flame, Tags, ToggleRight, ToggleLeft
} from 'lucide-react';
import { DailyLog, PrayerName, TranquilityLevel, CustomSunnah } from './types';
import { SURROUNDING_SUNNAH_LIST } from './constants';

interface DailyEntryProps {
  log: DailyLog;
  onUpdate: (log: DailyLog) => void;
  customSunnahs?: CustomSunnah[];
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

const DailyEntry: React.FC<DailyEntryProps> = ({ log, onUpdate, customSunnahs = [] }) => {
  const [activePrayer, setActivePrayer] = useState<PrayerName>(PrayerName.FAJR);

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
    <div className="space-y-6 pb-12">
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

        <div className="flex justify-between gap-1 mb-8 bg-slate-50 p-1.5 rounded-2xl">
          {Object.values(PrayerName).map((p) => (
            <button
              key={p}
              onClick={() => setActivePrayer(p)}
              className={`flex-1 py-3 rounded-xl transition-all flex flex-col items-center gap-1 ${
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
              <div><h4 className="font-bold text-slate-800 text-sm header-font">صلاة الجماعة</h4></div>
            </div>
            <button onClick={() => updatePrayer(activePrayer, { inCongregation: !log.prayers[activePrayer].inCongregation })} className={`w-12 h-6 rounded-full transition-all relative ${log.prayers[activePrayer].inCongregation ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${log.prayers[activePrayer].inCongregation ? 'left-1' : 'left-7'}`}></div></button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1"><Sparkle className="w-4 h-4 text-amber-500" /><h4 className="font-bold text-slate-700 text-[11px] header-font uppercase tracking-wider">السنن الرواتب</h4></div>
            <div className="grid grid-cols-1 gap-2">
              {PRAYER_SUNNAHS[activePrayer].map((sunnah) => (
                <button key={sunnah.id} onClick={() => toggleSunnah(activePrayer, sunnah.id)} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${log.prayers[activePrayer].surroundingSunnahIds?.includes(sunnah.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}>
                  <span className="text-xs font-bold header-font">{sunnah.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyEntry;
