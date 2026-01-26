
import React, { useState } from 'react';
import { 
  Star, Users, Clock, Book, GraduationCap, Plus, Minus, Heart, ShieldAlert,
  Moon, Sun, Zap, Coffee, ScrollText, Sparkle, MessageSquare, 
  MapPin, CheckCircle2, Droplets, Flame, Tags, ToggleRight, ToggleLeft
} from 'lucide-react';
import { DailyLog, PrayerName, TranquilityLevel, CustomSunnah } from '../types';
import { SURROUNDING_SUNNAH_LIST } from '../constants';

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

  const updatePrayer = (name: PrayerName, data: any) => {
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

  const counterItem = (label: string, field: keyof DailyLog['athkar']['counters'], icon: React.ReactNode) => (
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
            {isPerformed ? 'تمت الصلاة' :'اضغط للتفعيل'}
          </button>
        </div>

        <div className="flex justify-between gap-1 mb-8 bg-slate-50 p-1.5 rounded-2xl">
          {(Object.values(PrayerName) as PrayerName[]).map((p) => (
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
              {log.prayers[p].performed && (
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              )}
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
            <button
              onClick={() => updatePrayer(activePrayer, { inCongregation: !log.prayers[activePrayer].inCongregation })}
              className={`w-12 h-6 rounded-full transition-all relative ${log.prayers[activePrayer].inCongregation ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${log.prayers[activePrayer].inCongregation ? 'left-1' : 'left-7'}`}></div>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Sparkle className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h4 className="font-bold text-slate-700 text-[11px] header-font uppercase tracking-wider">السنن الرواتب</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {(PRAYER_SUNNAHS[activePrayer] || []).map((sunnah) => (
                <button
                  key={sunnah.id}
                  onClick={() => toggleSunnah(activePrayer, sunnah.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    log.prayers[activePrayer].surroundingSunnahIds?.includes(sunnah.id)
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'
                  }`}
                >
                  <span className="text-xs font-bold header-font">{sunnah.label}</span>
                  {log.prayers[activePrayer].surroundingSunnahIds?.includes(sunnah.id) && (
                    <Zap className="w-3 h-3 fill-current" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 px-1">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h4 className="font-bold text-slate-700 text-[11px] header-font uppercase tracking-wider">سنن ما حول الصلاة</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {SURROUNDING_SUNNAH_LIST.map((sunnah) => (
                <button
                  key={sunnah.id}
                  onClick={() => toggleSunnah(activePrayer, sunnah.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-bold header-font ${
                    log.prayers[activePrayer].surroundingSunnahIds?.includes(sunnah.id)
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm'
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {getSunnahIcon(sunnah.id)}
                  {sunnah.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 px-2 pt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-bold text-slate-700 header-font">مستوى الخشوع</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                {getTranquilityLabel(log.prayers[activePrayer].tranquility)}
              </span>
            </div>
            <input 
              type="range" min="0" max="5" step="1"
              value={log.prayers[activePrayer].tranquility}
              onChange={(e) => updatePrayer(activePrayer, { tranquility: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {(customSunnahs || []).length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Tags className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 header-font text-lg">سنن مخصصة</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {customSunnahs.map((sunnah: CustomSunnah) => (
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
                    {(log.customSunnahIds || []).includes(sunnah.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-bold header-font">{sunnah.name}</span>
                </div>
                <span className="text-xs font-black font-mono bg-white px-2 py-1 rounded-lg border border-slate-100">+{sunnah.points}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 header-font">معامل المجاهدة</span>
            <Heart className={`w-4 h-4 ${log.jihadFactor > 1 ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`} />
          </div>
          <div className="flex gap-2">
            {[1.0, 1.05, 1.1].map(f => (
              <button key={f} onClick={() => onUpdate({ ...log, jihadFactor: f })} className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all header-font ${log.jihadFactor === f ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                {f === 1 ? 'عادي' : f === 1.05 ? 'مجاهدة' : 'شديدة'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => onUpdate({ ...log, hasBurden: !log.hasBurden })} className={`flex-1 p-4 rounded-2xl shadow-sm border transition-all flex flex-col items-center justify-center ${log.hasBurden ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
          <ShieldAlert className={`w-5 h-5 mb-1 ${log.hasBurden ? 'text-amber-500' : 'text-slate-300'}`} />
          <span className={`text-[10px] font-bold header-font ${log.hasBurden ? 'text-amber-700' : 'text-slate-400'}`}>عبء روحي</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Book className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">ورد القرآن (بالأرباع)</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'ورد السماع', field: 'listeningRub' as const },
            { label: 'ورد القراءة', field: 'revisionRub' as const }
          ].map(q => (
            <div key={q.field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm font-bold text-slate-700 header-font">{q.label}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => updateSection('quran', { [q.field]: Math.max(0, (log.quran as any)[q.field] - 1) })} className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-1.5 min-w-[3.5rem] flex items-center justify-center">
                  <span className="text-xl font-black text-slate-800 header-font tabular-nums">{(log.quran as any)[q.field]}</span>
                </div>
                <button onClick={() => updateSection('quran', { [q.field]: (log.quran as any)[q.field] + 1 })} className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 font-bold text-center mt-4 leading-relaxed">
          * نقاط السماع = ضعف نقاط القراءة تقديراً لمجهود التدبر والاستماع.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <ScrollText className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">الأذكار والتحصين</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['morning', 'evening', 'sleep', 'travel'] as const).map(id => {
            const labels: Record<string, {label: string, icon: React.ReactNode}> = {
              morning: { label: 'صباح', icon: <Sun className="w-4 h-4" /> },
              evening: { label: 'مساء', icon: <Moon className="w-4 h-4" /> },
              sleep: { label: 'نوم', icon: <Coffee className="w-4 h-4" /> },
              travel: { label: 'سفر', icon: <MapPin className="w-4 h-4" /> }
            };
            const active = log.athkar.checklists[id];
            return (
              <button
                key={id}
                onClick={() => updateSection('athkar', { checklists: { ...log.athkar.checklists, [id]: !active } })}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${ active ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200' }`}
              >
                {labels[id].icon}
                <span className="text-xs font-bold header-font">{labels[id].label}</span>
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
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">نوافل الصلاة والقيام</h3>
        </div>
        <div className="space-y-4">
          {(['duhaDuration', 'witrDuration', 'qiyamDuration'] as const).map(field => {
            const labels: Record<string, string> = {
              duhaDuration: 'صلاة الضحى (دقيقة)',
              witrDuration: 'الوتر (دقيقة)',
              qiyamDuration: 'قيام الليل (دقيقة)'
            };
            return (
              <div key={field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 header-font">{labels[field]}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateSection('nawafil', { [field]: Math.max(0, log.nawafil[field] - 5) })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Minus className="w-4 h-4 text-slate-400" /></button>
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] flex items-center justify-center">
                    <span className="text-base font-black text-slate-800 header-font tabular-nums">{log.nawafil[field]}</span>
                  </div>
                  <button onClick={() => updateSection('nawafil', { [field]: log.nawafil[field] + 5 })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Plus className="w-4 h-4 text-slate-400" /></button>
                </div>
              </div>
            );
          })}
          <button 
            onClick={() => updateSection('nawafil', { fasting: !log.nawafil.fasting })}
            className={`w-full p-4 rounded-3xl border flex items-center justify-between mt-4 transition-all ${log.nawafil.fasting ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-orange-200'}`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm header-font">صيام (نفل / قضاء)</span>
            </div>
            {log.nawafil.fasting ? <span className="text-xs font-black header-font tracking-tight">+1000 نقطة</span> : <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">طلب العلم والقراءة</h3>
        </div>
        <div className="space-y-4">
          {(['shariDuration', 'readingDuration'] as const).map(field => {
            const labels: Record<string, string> = {
              shariDuration: 'علم شرعي (دقيقة)',
              readingDuration: 'قراءة عامة (دقيقة)'
            };
            return (
              <div key={field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 header-font">{labels[field]}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateSection('knowledge', { [field]: Math.max(0, log.knowledge[field] - 5) })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Minus className="w-4 h-4 text-slate-400" /></button>
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] flex items-center justify-center">
                    <span className="text-base font-black text-slate-800 header-font tabular-nums">{log.knowledge[field]}</span>
                  </div>
                  <button onClick={() => updateSection('knowledge', { [field]: log.knowledge[field] + 5 })} className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Plus className="w-4 h-4 text-slate-400" /></button>
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
