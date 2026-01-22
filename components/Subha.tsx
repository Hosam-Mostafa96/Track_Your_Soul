
import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  Sparkles, 
  Target
} from 'lucide-react';
import { DailyLog } from '../types';

interface SubhaProps {
  isOpen: boolean;
  onClose: () => void;
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

const Subha: React.FC<SubhaProps> = ({ isOpen, onClose, log, onUpdateLog }) => {
  const [selectedType, setSelectedType] = useState(DHIKR_TYPES[0]);
  const [absoluteCount, setAbsoluteCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // منع التمرير في الخلفية عند فتح السبحة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // التأكد من أن التمرير معطل تماماً في الهواتف
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => { 
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div 
      className="fixed inset-0 z-[99999] flex items-end justify-center px-4 pb-0 pointer-events-auto"
      style={{ height: '100dvh' }}
    >
      {/* Overlay لغلق السبحة عند الضغط خارجها */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* لوحة السبحة */}
      <div 
        className="w-full max-w-lg bg-white rounded-t-[3rem] shadow-[0_-20px_100px_rgba(0,0,0,0.5)] border-x border-t border-white/20 p-8 relative animate-in slide-in-from-bottom-full duration-500 ease-out flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        {/* شريط السحب/الإغلاق العلوي */}
        <button 
          onClick={onClose}
          className="w-16 h-2 bg-slate-200 rounded-full mb-8 opacity-60 active:bg-slate-300" 
        />

        <div className="w-full flex justify-between items-center mb-8">
          <button onClick={onClose} className="p-4 bg-slate-100 rounded-full text-slate-500 active:bg-slate-200 active:scale-90 transition-all shadow-sm">
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-sm font-black header-font active:scale-95 transition-all shadow-sm"
            >
              {selectedType.label}
              {isDropdownOpen ? <ChevronUp className="w-5 h-5 text-emerald-400" /> : <ChevronDown className="w-5 h-5 text-emerald-400" />}
            </button>

            {isDropdownOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 z-[100000]">
                <div className="max-h-[50vh] overflow-y-auto no-scrollbar">
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

          <button onClick={handleReset} className="p-4 bg-rose-50 rounded-full text-rose-500 hover:bg-rose-100 transition-colors active:scale-90 shadow-sm">
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>

        {/* مساحة العداد والضغط - الثلث السفلي - كبيرة جداً للراحة */}
        <div 
          onClick={handleIncrement}
          onTouchStart={handleIncrement}
          className="w-full aspect-[4/3] bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-[3rem] border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center relative active:scale-[0.98] transition-all group cursor-pointer overflow-hidden touch-none shadow-inner"
        >
          {/* تأثير نبضي عند الضغط */}
          <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-active:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center select-none pointer-events-none">
            <span className="text-[10rem] font-black font-mono text-emerald-950 tracking-tighter tabular-nums drop-shadow-xl leading-none">
              {currentCount.toLocaleString()}
            </span>
            <div className="mt-8 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              <span className="text-sm font-black text-emerald-400/80 uppercase tracking-[0.2em] header-font">المس للتسبيح</span>
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

        <div className="mt-10 flex items-center gap-8 text-slate-400 select-none opacity-60">
           <div className="flex items-center gap-2">
             <Target className="w-5 h-5 text-rose-400" />
             <span className="text-xs font-black header-font uppercase tracking-widest">تنبيه المائة</span>
           </div>
           <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
           <div className="flex items-center gap-2">
             <Zap className="w-5 h-5 text-yellow-500" />
             <span className="text-xs font-black header-font uppercase tracking-widest">مزامنة فورية</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Subha;
