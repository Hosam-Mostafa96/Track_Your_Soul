
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  Sparkles, 
  Target,
  Disc,
  Plus,
  X,
  Check,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { DailyLog } from '../types';

interface DhikrType {
  id: string;
  label: string;
  key: string | null;
}

const DEFAULT_DHIKR_TYPES: DhikrType[] = [
  { id: 'istighfar', label: 'استغفار', key: 'istighfar' },
  { id: 'salawat', label: 'صلاة على النبي', key: 'salawat' },
  { id: 'hawqalah', label: 'حوقلة (لا حول ولا قوة)', key: 'hawqalah' },
  { id: 'tahlil', label: 'تهليل (لا إله إلا الله)', key: 'tahlil' },
  { id: 'baqiyat', label: 'الباقيات الصالحات', key: 'baqiyat' },
  { id: 'absolute', label: 'ذكر مطلق (غير محسوب)', key: null },
];

interface SubhaProps {
  log: DailyLog;
  onUpdateLog: (updated: DailyLog, label?: string, type?: string) => void;
}

const Subha: React.FC<SubhaProps> = ({ log, onUpdateLog }) => {
  const [customDhikrs, setCustomDhikrs] = useState<DhikrType[]>([]);
  const [selectedType, setSelectedType] = useState<DhikrType>(DEFAULT_DHIKR_TYPES[0]);
  const [absoluteCount, setAbsoluteCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDhikrName, setNewDhikrName] = useState('');
  
  const lastClickTimeRef = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('worship_custom_dhikrs');
    if (saved) setCustomDhikrs(JSON.parse(saved));
  }, []);

  const allDhikrTypes = useMemo(() => [...DEFAULT_DHIKR_TYPES, ...customDhikrs], [customDhikrs]);

  const safeCounters = log?.athkar?.counters || {
    salawat: 0, hawqalah: 0, tahlil: 0, baqiyat: 0, istighfar: 0
  };

  const currentCount = selectedType.key 
    ? (safeCounters as any)[selectedType.key] || 0
    : absoluteCount;

  const handleIncrement = (e: React.PointerEvent) => {
    if (e.cancelable) e.preventDefault();
    
    const now = Date.now();
    if (now - lastClickTimeRef.current < 50) return;
    lastClickTimeRef.current = now;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(20); } catch(err) {}
    }

    const nextCount = currentCount + 1;

    if (nextCount > 0 && nextCount % 100 === 0 && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([100, 50, 100]); } catch(err) {}
    }

    if (selectedType.key) {
      const newLog = { ...log };
      if (!newLog.athkar) newLog.athkar = { 
        counters: { salawat: 0, hawqalah: 0, tahlil: 0, baqiyat: 0, istighfar: 0 }, 
        checklists: { morning: false, evening: false, sleep: false, travel: false } 
      };
      
      newLog.athkar.counters = {
        ...newLog.athkar.counters,
        [selectedType.key]: nextCount
      };
      
      const activityLabel = nextCount % 33 === 0 ? `يسبّح الآن: ${selectedType.label}` : undefined;
      onUpdateLog(newLog, activityLabel, 'athkar');
    } else {
      setAbsoluteCount(nextCount);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل تريد تصفير العداد؟')) {
      if (selectedType.key) {
        const newLog = { ...log };
        newLog.athkar.counters = { ...newLog.athkar.counters, [selectedType.key]: 0 };
        onUpdateLog(newLog);
      } else {
        setAbsoluteCount(0);
      }
    }
  };

  const handleAddNewDhikr = () => {
    if (!newDhikrName.trim()) return;
    const key = 'c_' + Date.now();
    const newDhikr = { id: key, label: newDhikrName.trim(), key };
    const newList = [...customDhikrs, newDhikr];
    setCustomDhikrs(newList);
    localStorage.setItem('worship_custom_dhikrs', JSON.stringify(newList));
    setNewDhikrName('');
    setIsAddingNew(false);
    setSelectedType(newDhikr);
  };

  const handleRemoveDhikr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newList = customDhikrs.filter(d => d.id !== id);
    setCustomDhikrs(newList);
    localStorage.setItem('worship_custom_dhikrs', JSON.stringify(newList));
    if (selectedType.id === id) {
      setSelectedType(DEFAULT_DHIKR_TYPES[0]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 max-w-md mx-auto text-right select-none" dir="rtl">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Disc className="w-6 h-6 text-emerald-600 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 header-font leading-tight">المسبحة الإلكترونية</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase header-font">وردك محفوظ تلقائياً</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddingNew(!isAddingNew)} className="p-3 bg-emerald-50 text-emerald-600 rounded-full active:scale-90 transition-all">
            {isAddingNew ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </button>
          <button onClick={handleReset} className="p-3 bg-rose-50 rounded-full text-rose-500 active:scale-90 transition-all shadow-sm">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isAddingNew && (
        <div className="p-5 bg-white rounded-2xl border border-emerald-100 shadow-xl space-y-4 animate-in zoom-in duration-200">
          <h3 className="text-sm font-black text-slate-800 header-font">إضافة ذكر جديد</h3>
          <input type="text" placeholder="اكتب الذكر هنا.." value={newDhikrName} onChange={(e) => setNewDhikrName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500" />
          <button onClick={handleAddNewDhikr} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-xs">حفظ وإضافة للمسبحة</button>
        </div>
      )}

      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-black text-slate-700 header-font active:bg-slate-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <span className="truncate">{selectedType.label}</span>
          </div>
          {isDropdownOpen ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 z-[100]">
            <div className="max-h-[40vh] overflow-y-auto no-scrollbar">
              {allDhikrTypes.map(type => (
                <div key={type.id} className={`flex items-center border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors ${selectedType.id === type.id ? 'bg-emerald-600' : ''}`}>
                  <button
                    onClick={() => { setSelectedType(type); setIsDropdownOpen(false); }}
                    className={`flex-1 text-right px-6 py-5 text-xs font-black header-font ${selectedType.id === type.id ? 'text-white' : 'text-slate-600'}`}
                  >
                    {type.label}
                  </button>
                  {customDhikrs.some(cd => cd.id === type.id) && (
                    <button onClick={(e) => handleRemoveDhikr(type.id, e)} className={`p-5 ${selectedType.id === type.id ? 'text-white/60 hover:text-white' : 'text-rose-300 hover:text-rose-500'}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div 
        onPointerDown={handleIncrement}
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
        className="w-full aspect-square bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-[3rem] border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center relative active:scale-95 transition-all duration-75 group cursor-pointer overflow-hidden shadow-inner no-zoom"
      >
        <div className="relative z-10 flex flex-col items-center pointer-events-none">
          <span className="text-[10rem] md:text-[12rem] font-black font-mono text-emerald-950 tracking-tighter tabular-nums drop-shadow-2xl leading-none">
            {currentCount.toLocaleString()}
          </span>
          <div className="mt-8 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            <span className="text-sm font-black text-emerald-400/80 uppercase tracking-[0.2em] header-font">المس للتسبيح</span>
            <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subha;
