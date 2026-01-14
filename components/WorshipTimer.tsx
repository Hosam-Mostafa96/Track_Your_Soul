
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, BookOpen, GraduationCap, Moon, Sun, Stars, History, Clock, Trash2, Check, LayoutList, Zap } from 'lucide-react';

interface WorshipTimerProps {
  onApplyTime: (field: string, mins: number) => void;
}

const WorshipTimer: React.FC<WorshipTimerProps> = ({ onApplyTime }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('qiyamDuration');
  
  const timerRef = useRef<number | null>(null);

  const activities = [
    { id: 'qiyamDuration', label: 'قيام الليل', icon: <Moon className="w-4 h-4" /> },
    { id: 'duhaDuration', label: 'صلاة الضحى', icon: <Sun className="w-4 h-4" /> },
    { id: 'shariDuration', label: 'طلب علم شرعي', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'readingDuration', label: 'قراءة عامة', icon: <BookOpen className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApply = () => {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) {
      alert('دقيقة واحدة على الأقل للاعتماد');
      return;
    }
    onApplyTime(selectedActivity, mins);
    setSeconds(0);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-50">
          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: isRunning ? `${(seconds % 60) * 1.66}%` : '0%' }} />
        </div>

        <div className="flex items-center gap-2 mb-10 bg-emerald-50 px-4 py-2 rounded-full">
          <Zap className={`w-3 h-3 ${isRunning ? 'text-emerald-600 animate-pulse' : 'text-slate-300'}`} />
          <span className="text-[10px] font-bold text-emerald-700 header-font uppercase tracking-widest">المحراب الرقمي</span>
        </div>

        <div className="text-8xl font-black font-mono text-emerald-900 mb-10 tabular-nums tracking-tighter">
          {formatTime(seconds)}
        </div>

        <div className="grid grid-cols-2 gap-2 w-full mb-10">
          {activities.map(a => (
            <button
              key={a.id}
              onClick={() => !isRunning && setSelectedActivity(a.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all text-xs font-bold header-font ${selectedActivity === a.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'} ${isRunning && selectedActivity !== a.id ? 'opacity-30' : ''}`}
            >
              {a.icon}
              <span className="truncate">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <button onClick={() => { setSeconds(0); setIsRunning(false); }} className="p-4 bg-slate-100 text-slate-400 rounded-2xl"><RotateCcw className="w-5 h-5" /></button>
          <button onClick={() => setIsRunning(!isRunning)} className={`p-8 rounded-full shadow-2xl transition-all ${isRunning ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
            {isRunning ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white ml-1" />}
          </button>
          <button onClick={handleApply} className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl"><CheckCircle2 className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default WorshipTimer;
