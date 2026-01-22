
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

  if (!isOpen) return null;

  const currentCount = selectedType.key 
    ? (log.athkar.counters as any)[selectedType.key] 
    : absoluteCount;

  const handleIncrement = () => {
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8 pointer-events-none">
      {/* Overlay لغلق السبحة عند الضغط خارجها */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      {/* لوحة السبحة */}
      <div 
        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.3)] border border-white/20 p-6 pointer-events-auto animate-in slide-in-from-bottom-full duration-500 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* شريط الإغلاق العلوي الصغير */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-6 opacity-50" />

        <div className="w-full flex justify-between items-center mb-6">
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-xs font-bold header-font"
            >
              {selectedType.label}
              {isDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 z-[110]">
                {DHIKR_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => { setSelectedType(type); setIsDropdownOpen(false); }}
                    className={`w-full text-right px-4 py-3 text-xs font-bold header-font transition-colors ${selectedType.id === type.id ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-slate-600'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleReset} className="p-2 bg-rose-50 rounded-full text-rose-400 hover:bg-rose-100 transition-colors"><RotateCcw className="w-5 h-5" /></button>
        </div>

        {/* مساحة العداد والضغط */}
        <div 
          onClick={handleIncrement}
          className="w-full aspect-[16/10] bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-[2rem] border-2 border-dashed border-emerald-200/50 flex flex-col items-center justify-center relative active:scale-[0.98] transition-all group cursor-pointer overflow-hidden"
        >
          {/* خلفية تفاعلية */}
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-active:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-7xl font-black font-mono text-emerald-900 tracking-tighter tabular-nums drop-shadow-sm">
              {currentCount.toLocaleString()}
            </span>
            <div className="mt-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">اضغط هنا للتسبيح</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* دوائر النبض عند كل 100 */}
          {currentCount > 0 && currentCount % 100 === 0 && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-32 h-32 border-4 border-emerald-400 rounded-full animate-ping opacity-20"></div>
             </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4 text-slate-400">
           <div className="flex items-center gap-1.5">
             <Target className="w-3 h-3" />
             <span className="text-[9px] font-bold header-font uppercase tracking-wider">اهتزاز عند المائة</span>
           </div>
           <div className="w-1 h-1 bg-slate-200 rounded-full" />
           <div className="flex items-center gap-1.5">
             <Zap className="w-3 h-3" />
             <span className="text-[9px] font-bold header-font uppercase tracking-wider">مزامنة حية للسجل</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Subha;
