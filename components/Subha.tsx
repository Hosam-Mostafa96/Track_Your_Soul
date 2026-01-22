
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
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCount = selectedType.key 
    ? (log.athkar.counters as any)[selectedType.key] 
    : absoluteCount;

  const handleIncrement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    // اهتزاز خفيف عند كل ضغطة
    if (navigator.vibrate) navigator.vibrate(10);

    const nextCount = currentCount + 1;

    // اهتزاز مميز كل 100 عدة
    if (nextCount > 0 && nextCount % 100 === 0 && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
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
    <div className="fixed inset-0 z-[999] flex items-end justify-center px-4 pb-6 pointer-events-auto">
      {/* Overlay لغلق السبحة عند الضغط خارجها */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* لوحة السبحة */}
      <div 
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.4)] border border-white/20 p-6 relative animate-in slide-in-from-bottom-full duration-500 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* شريط السحب/الإغلاق العلوي */}
        <button 
          onClick={onClose}
          className="w-12 h-1.5 bg-slate-200 rounded-full mb-6 opacity-80 active:bg-slate-300" 
        />

        <div className="w-full flex justify-between items-center mb-6">
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-full text-slate-500 active:bg-slate-200"><X className="w-5 h-5" /></button>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-xs font-bold header-font active:scale-95"
            >
              {selectedType.label}
              {isDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 z-[1000]">
                <div className="max-h-60 overflow-y-auto no-scrollbar">
                  {DHIKR_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type); setIsDropdownOpen(false); }}
                      className={`w-full text-right px-5 py-4 text-xs font-bold header-font transition-colors border-b border-slate-50 last:border-none ${selectedType.id === type.id ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-slate-600'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleReset} className="p-3 bg-rose-50 rounded-full text-rose-500 hover:bg-rose-100 transition-colors active:scale-95"><RotateCcw className="w-5 h-5" /></button>
        </div>

        {/* مساحة العداد والضغط - الثلث السفلي */}
        <div 
          onClick={handleIncrement}
          className="w-full aspect-[16/11] bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2.5rem] border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center relative active:scale-[0.97] transition-all group cursor-pointer overflow-hidden touch-none"
        >
          {/* تأثير نبضي عند الضغط */}
          <div className="absolute inset-0 bg-emerald-400/10 opacity-0 group-active:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center select-none pointer-events-none">
            <span className="text-8xl font-black font-mono text-emerald-900 tracking-tighter tabular-nums drop-shadow-md">
              {currentCount.toLocaleString()}
            </span>
            <div className="mt-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest header-font">المس الشاشة للتسبيح</span>
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* دوائر النبض عند كل 100 */}
          {currentCount > 0 && currentCount % 100 === 0 && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-40 h-40 border-4 border-emerald-400 rounded-full animate-ping opacity-30"></div>
             </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-6 text-slate-400 select-none">
           <div className="flex items-center gap-2">
             <Target className="w-4 h-4 text-rose-400" />
             <span className="text-[10px] font-bold header-font uppercase tracking-wider">اهتزاز كل ١٠٠</span>
           </div>
           <div className="w-1 h-1 bg-slate-200 rounded-full" />
           <div className="flex items-center gap-2">
             <Zap className="w-4 h-4 text-yellow-500" />
             <span className="text-[10px] font-bold header-font uppercase tracking-wider">مزامنة حية</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Subha;
