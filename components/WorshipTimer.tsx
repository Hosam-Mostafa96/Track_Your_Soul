import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, BookOpen, GraduationCap, Moon, Sun, Stars, History, Clock, Trash2, Check, LayoutList, Zap, Radio, Users, Globe } from 'lucide-react';

// استبدل هذا الرابط بالرابط الذي حصلت عليه من Google Apps Script
const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzQ_FIX_ME_PLEASE/exec"; 

interface WorshipTimerProps {
  onApplyTime: (field: string, mins: number) => void;
  isSync: boolean;
}

const WorshipTimer: React.FC<WorshipTimerProps> = ({ onApplyTime, isSync }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('qiyamDuration');
  
  const timerRef = useRef<number | null>(null);
  const syncRef = useRef<number | null>(null);
  const anonId = useRef(localStorage.getItem('mizan_anon_id') || Math.random().toString(36).substring(7));

  useEffect(() => {
    localStorage.setItem('mizan_anon_id', anonId.current);
  }, []);

  const sendHeartbeat = async () => {
    if (!isSync || !isRunning || GOOGLE_STATS_API.includes("FIX_ME")) return;
    try {
        await fetch(GOOGLE_STATS_API, { 
            method: 'POST', 
            mode: 'no-cors',
            body: JSON.stringify({ 
                activity: selectedActivity, 
                id: anonId.current 
            }) 
        });
    } catch (e) {
        console.error("Pulse error");
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
      
      // نبضة كل دقيقة
      syncRef.current = window.setInterval(sendHeartbeat, 60000);
      sendHeartbeat();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (syncRef.current) clearInterval(syncRef.current);
    }
    return () => { 
        if (timerRef.current) clearInterval(timerRef.current);
        if (syncRef.current) clearInterval(syncRef.current);
    };
  }, [isRunning, isSync, selectedActivity]);

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

  const activities = [
    { id: 'qiyamDuration', label: 'قيام الليل', icon: <Moon className="w-4 h-4" /> },
    { id: 'duhaDuration', label: 'صلاة الضحى', icon: <Sun className="w-4 h-4" /> },
    { id: 'shariDuration', label: 'طلب علم شرعي', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'readingDuration', label: 'قراءة عامة', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-50">
          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: isRunning ? `${(seconds % 60) * 1.66}%` : '0%' }} />
        </div>

        {isRunning && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full animate-in fade-in zoom-in duration-300">
            <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
            <span className="text-[10px] font-black text-rose-600 header-font uppercase tracking-tighter">Live</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-10 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <Globe className={`w-3 h-3 ${isSync && isRunning ? 'text-emerald-600 animate-spin' : 'text-slate-300'}`} />
          <span className="text-[10px] font-bold text-emerald-700 header-font uppercase tracking-widest">
            {isSync ? 'محراب متصل عالمياً' : 'محراب محلي'}
          </span>
        </div>

        <div className="text-8xl font-black font-mono text-emerald-900 mb-4 tabular-nums tracking-tighter">
          {formatTime(seconds)}
        </div>

        {isRunning && isSync && (
          <div className="flex items-center gap-2 mb-10 text-slate-400 animate-in slide-in-from-bottom-2">
            <Users className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] font-bold header-font">يتم تسجيل نبضك الآن...</span>
          </div>
        )}
        {!isRunning && <div className="h-[21px] mb-10"></div>}

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
          <button onClick={() => { setSeconds(0); setIsRunning(false); }} className="p-4 bg-slate-100 text-slate-400 rounded-2xl transition-all active:scale-90"><RotateCcw className="w-5 h-5" /></button>
          <button onClick={() => setIsRunning(!isRunning)} className={`p-8 rounded-full shadow-2xl transition-all active:scale-95 ${isRunning ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
            {isRunning ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white ml-1" />}
          </button>
          <button onClick={handleApply} className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl transition-all active:scale-90"><CheckCircle2 className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default WorshipTimer;