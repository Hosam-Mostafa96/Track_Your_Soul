
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
  Check
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
  onUpdateLog: (updated: DailyLog) => void;
}

const Subha: React.FC<SubhaProps> = ({ log, onUpdateLog }) => {
  const [customDhikrs, setCustomDhikrs] = useState<DhikrType[]>([]);
  const [selectedType, setSelectedType] = useState<DhikrType>(DEFAULT_DHIKR_TYPES[0]);
  const [absoluteCount, setAbsoluteCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingDhikr, setIsAddingDhikr] = useState(false);
  const [newDhikrLabel, setNewDhikrLabel] = useState('');
  
  const lastClickTimeRef = useRef<number>(0);

  useEffect(() => {
    // جلب الأذكار المخصصة المضافة من صفحة التسجيل
    const saved = localStorage.getItem('worship_custom_dhikrs');
    if (saved) {
      setCustomDhikrs(JSON.parse(saved));
    }
  }, []);

  const allDhikrTypes = useMemo(() => {
    return [...DEFAULT_DHIKR_TYPES, ...customDhikrs];
  }, [customDhikrs]);

  const currentCount = selectedType.key 
    ? (log.athkar.counters[selectedType.key] || 0)
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

  const handleAddCustomDhikr = () => {
    if (!newDhikrLabel.trim()) return;
    const id = 'custom_' + Math.random().toString(36).substr(2, 9);
    const newDhikr: DhikrType = { id, label: newDhikrLabel.trim(), key: id };
    const updated = [...customDhikrs, newDhikr];
    setCustomDhikrs(updated);
    localStorage.setItem('worship_custom_dhikrs', JSON.stringify(updated));
    setNewDhikrLabel('');
    setIsAddingDhikr(false);
    setSelectedType(newDhikr);
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
        <button onClick={handleReset} className="p-3 bg-rose-50 rounded-full text-rose-500 active:scale-90 transition-all shadow-sm">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

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
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type); setIsDropdownOpen(false); }}
                  className={`w-full text-right px-6 py-5 text-xs font-black header-font transition-colors border-b border-slate-50 last:border-none ${selectedType.id === type.id ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-slate-600'}`}
                >
                  {type.label}
                </button>
              ))}
              <button 
                onClick={() => { setIsAddingDhikr(true); setIsDropdownOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-6 py-5 bg-emerald-50 text-emerald-700 text-xs font-black header-font"
              >
                <Plus className="w-4 h-4" /> إضافة ذكر جديد
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddingDhikr && (
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-emerald-100 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={newDhikrLabel}
              onChange={(e) => setNewDhikrLabel(e.target.value)}
              placeholder="اكتب الذكر الجديد هنا.."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
              autoFocus
            />
            <button onClick={handleAddCustomDhikr} className="p-3 bg-emerald-600 text-white rounded-xl"><Check className="w-4 h-4" /></button>
            <button onClick={() => setIsAddingDhikr(false)} className="p-3 bg-slate-100 text-slate-400 rounded-xl"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div 
        onPointerDown={handleIncrement}
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        className="w-full aspect-square bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-[3rem] border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center relative active:scale-95 transition-all duration-75 group cursor-pointer overflow-hidden shadow-inner"
      >
        <div className="relative z-10 flex flex-col items-center pointer-events-none">
          <span className="text-[10rem] md:text-[12rem] font-black font-mono text-emerald-950 tracking-tighter tabular-nums leading-none">
            {currentCount.toLocaleString()}
          </span>
          <div className="mt-8 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            <span className="text-sm font-black text-emerald-400/80 uppercase tracking-[0.2em] header-font">المس للتسبيح</span>
            <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-xl"><Target className="w-5 h-5 text-rose-500" /></div>
          <div><p className="text-[10px] text-slate-400 font-bold header-font">منع التكرار</p><span className="text-xs font-black text-slate-700 header-font">نشط</span></div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-xl"><Zap className="w-5 h-5 text-yellow-600" /></div>
          <div><p className="text-[10px] text-slate-400 font-bold header-font">مزامنة الورد</p><span className="text-xs font-black text-slate-700 header-font">تلقائي</span></div>
        </div>
      </div>
    </div>
  );
};

export default Subha;
