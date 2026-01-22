
import React, { useState } from 'react';
import { 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  Sparkles, 
  Target,
  Disc
} from 'lucide-react';
import { DailyLog } from '../types';

interface SubhaProps {
  log: DailyLog;
  onUpdateLog: (updated: DailyLog) => void;
}

const DHIKR_TYPES = [
  { id: 'istighfar', label: 'استغفار', key: 'istighfar' },
  { id: 'salawat', label: 'صلاة على النبي', key: 'salawat' },
  { id: 'hawqalah', label: 'حوقلة (لا حول ولا قوة)', key: 'hawqalah' },
  { id: 'tahlil', label: 'تهليل (لا إله إلا الله)', key: 'tahlil' },
  { id: 'baqiyat', label: 'الباقيات الصالحات', key: 'baqiyat' },
  { id: 'absolute', label: 'ذكر مطلق (غير محسوب)', key: null },
];

const Subha: React.FC<SubhaProps> = ({ log, onUpdateLog }) => {
  const [selectedType, setSelectedType] = useState(DHIKR_TYPES[0]);
  const [absoluteCount, setAbsoluteCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentCount = selectedType.key 
    ? (log.athkar.counters as any)[selectedType.key] 
    : absoluteCount;

  const handleIncrement = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // اهتزاز خفيف عند كل ضغطة
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(15); } catch(e) {}
    }

    const nextCount = currentCount + 1;

    // اهتزاز مميز كل 100 عدة
    if (nextCount > 0 && nextCount % 100 === 0 && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([100, 50, 100]); } catch(e) {}
    }

    if (selectedType.key) {
      const newLog = { ...log };
      newLog.athkar.counters = {
        ...newLog.athkar.counters,
        [selectedType.key]: nextCount
      };
      onUpdateLog(newLog);
    } else {
      setAbsoluteCount(nextCount);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل تريد تصفير العداد؟')) {
      if (selectedType.key) {
        const newLog = { ...log };
        newLog.athkar.counters = {
          ...newLog.athkar.counters,
          [selectedType.key]: 0
        };
        onUpdateLog(newLog);
      } else {
        setAbsoluteCount(0);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* هيدر السبحة */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Disc className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 header-font">المسبحة الإلكترونية</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase header-font">تتبع أورادك بلمسة واحدة</p>
          </div>
        </div>
        <button onClick={handleReset} className="p-3 bg-rose-50 rounded-full text-rose-500 hover:bg-rose-100 transition-colors active:scale-90 shadow-sm">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* اختيار نوع الذكر */}
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-black text-slate-700 header-font active:bg-slate-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <span>نوع الذكر: {selectedType.label}</span>
          </div>
          {isDropdownOpen ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 z-[100]">
            <div className="max-h-[40vh] overflow-y-auto no-scrollbar">
              {DHIKR_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type); setIsDropdownOpen(false); }}
                  className={`w-full text-right px-6 py-5 text-xs font-black header-font transition-colors border-b border-slate-50 last:border-none ${selectedType.id === type.id ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-slate-600 active:bg-emerald-50'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* مساحة العداد والضغط العملاقة */}
      <div 
        onClick={handleIncrement}
        onTouchStart={handleIncrement}
        className="w-full aspect-square bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-[3rem] border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center relative active:scale-[0.98] transition-all group cursor-pointer overflow-hidden touch-none shadow-inner"
      >
        {/* تأثير نبضي عند الضغط */}
        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-active:opacity-100 transition-opacity" />
        
        <div className="relative z-10 flex flex-col items-center select-none pointer-events-none">
          <span className="text-[12rem] font-black font-mono text-emerald-950 tracking-tighter tabular-nums drop-shadow-2xl leading-none">
            {currentCount.toLocaleString()}
          </span>
          <div className="mt-8 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            <span className="text-sm font-black text-emerald-400/80 uppercase tracking-[0.2em] header-font">اضغط في أي مكان</span>
            <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* دوائر النبض عند كل 100 */}
        {currentCount > 0 && currentCount % 100 === 0 && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-64 h-64 border-8 border-emerald-400 rounded-full animate-ping opacity-20"></div>
           </div>
        )}
      </div>

      {/* معلومات إضافية */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-xl"><Target className="w-5 h-5 text-rose-500" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold header-font">اهتزاز المائة</p>
            <span className="text-xs font-black text-slate-700 header-font">مفعل</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-xl"><Zap className="w-5 h-5 text-yellow-600" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold header-font">حفظ تلقائي</p>
            <span className="text-xs font-black text-slate-700 header-font">فوري</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subha;
