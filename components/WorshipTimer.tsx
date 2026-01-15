
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, BookOpen, GraduationCap, Moon, Sun, Radio, Globe, Wifi, WifiOff } from 'lucide-react';

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzbkn4MVK27wrmAhkDvKjZdq01vOQWG7-SFDOltC4e616Grjp-uMsON4cVcr3OOVKqg/exec"; 

interface WorshipTimerProps {
  seconds: number;
  isRunning: boolean;
  selectedActivity: string;
  onToggle: () => void;
  onReset: () => void;
  onActivityChange: (id: string) => void;
  onApplyTime: (field: string, mins: number) => void;
  isSync: boolean;
}

const WorshipTimer: React.FC<WorshipTimerProps> = ({ 
  seconds, isRunning, selectedActivity, onToggle, onReset, onActivityChange, onApplyTime, isSync 
}) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const syncRef = useRef<number | null>(null);
  const anonId = useRef(localStorage.getItem('mizan_anon_id') || Math.random().toString(36).substring(7));

  const sendHeartbeat = async () => {
    if (!isSync || !isRunning || GOOGLE_STATS_API.includes("FIX_ME")) return;
    setSyncStatus('sending');
    try {
        await fetch(GOOGLE_STATS_API, { 
            method: 'POST', 
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'heartbeat', activity: selectedActivity, id: anonId.current }) 
        });
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 1000);
    } catch (e) { setSyncStatus('error'); }
  };

  const sendStopSignal = async () => {
    if (!isSync || GOOGLE_STATS_API.includes("FIX_ME")) return;
    try {
        await fetch(GOOGLE_STATS_API, { 
            method: 'POST', 
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'stop', id: anonId.current }) 
        });
    } catch (e) { console.error("Failed to send stop signal"); }
  };

  useEffect(() => {
    if (isRunning && isSync) {
      // إرسال النبض كل 3 ثوانٍ لضمان البقاء في القائمة النشطة (بناءً على طلب الـ 5 ثوانٍ)
      syncRef.current = window.setInterval(sendHeartbeat, 1000);
      sendHeartbeat();
    } else {
      if (syncRef.current) {
        clearInterval(syncRef.current);
        sendStopSignal(); 
      }
    }
    return () => { if (syncRef.current) clearInterval(syncRef.current); };
  }, [isRunning, isSync, selectedActivity]);

  const handleToggle = () => {
    if (isRunning) sendStopSignal();
    onToggle();
  };

  const handleReset = () => {
    sendStopSignal();
    onReset();
  };

  const handleApply = () => {
    sendStopSignal();
    onApplyTime(selectedActivity, Math.floor(seconds / 60));
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
            <span className="text-[10px] font-black text-rose-600 header-font tracking-tighter">Live Pulse</span>
          </div>
        )}
        <div className="absolute top-6 left-6">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold ${!isSync ? 'text-slate-400 bg-slate-50' : syncStatus === 'error' ? 'text-rose-500 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
            {isSync ? (syncStatus === 'sending' ? <Globe className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />) : <WifiOff className="w-3 h-3" />}
            {!isSync ? 'مزامنة معطلة' : syncStatus === 'sending' ? 'جاري الإرسال..' : 'متصل بالمحراب'}
          </div>
        </div>
        <div className="text-8xl font-black font-mono text-emerald-900 mb-4 mt-8 tabular-nums tracking-tighter">{formatTime(seconds)}</div>
        <p className="text-[11px] font-bold text-slate-400 header-font mb-10 uppercase tracking-widest">{isRunning ? 'العداد يعمل الآن في الخلفية' : 'المؤقت متوقف'}</p>
        <div className="grid grid-cols-2 gap-2 w-full mb-10">
          {activities.map(a => (
            <button key={a.id} onClick={() => !isRunning && onActivityChange(a.id)} className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all text-xs font-bold header-font ${selectedActivity === a.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}>
              {a.icon} <span className="truncate">{a.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-8">
          <button onClick={handleReset} className="p-4 bg-slate-100 text-slate-400 rounded-2xl transition-all"><RotateCcw className="w-5 h-5" /></button>
          <button onClick={handleToggle} className={`p-8 rounded-full shadow-2xl transition-all ${isRunning ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-600 shadow-emerald-200'}`}>{isRunning ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white ml-1" />}</button>
          <button onClick={handleApply} className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl transition-all"><CheckCircle2 className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default WorshipTimer;
