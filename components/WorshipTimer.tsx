
import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  BookOpen, 
  GraduationCap, 
  Moon, 
  Sun, 
  Radio, 
  Globe, 
  Wifi, 
  WifiOff,
  History,
  Clock,
  ArrowRight
} from 'lucide-react';
import { format, isAfter, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { GOOGLE_STATS_API } from '../constants';

interface WorshipTimerProps {
  seconds: number;
  isRunning: boolean;
  selectedActivity: string;
  onToggle: () => void;
  onReset: () => void;
  onActivityChange: (id: string) => void;
  onApplyTime: (field: string, mins: number) => void;
  isSync: boolean;
  userEmail?: string;
}

interface SessionRecord {
  id: string;
  activity: string;
  duration: number;
  timestamp: number;
}

const WorshipTimer: React.FC<WorshipTimerProps> = ({ 
  seconds, isRunning, selectedActivity, onToggle, onReset, onActivityChange, onApplyTime, isSync, userEmail 
}) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const syncRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  // تحميل الجلسات من التخزين المحلي عند التشغيل وتصفية ما زاد عن شهر
  useEffect(() => {
    const savedSessions = localStorage.getItem('worship_timer_sessions');
    if (savedSessions) {
      const parsed: SessionRecord[] = JSON.parse(savedSessions);
      const thirtyDaysAgo = subDays(new Date(), 30).getTime();
      // الاحتفاظ فقط بجلسات آخر 30 يوم
      const validSessions = parsed.filter(s => s.timestamp > thirtyDaysAgo);
      setSessions(validSessions);
      if (validSessions.length !== parsed.length) {
        localStorage.setItem('worship_timer_sessions', JSON.stringify(validSessions));
      }
    }
  }, []);

  // حفظ الجلسات في التخزين المحلي عند كل تغيير
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('worship_timer_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const sendHeartbeat = async () => {
    if (!isSync || !isRunning || !userEmail) return;
    
    const now = Date.now();
    if (now - lastSentRef.current < 1500) return; 
    lastSentRef.current = now;

    setSyncStatus('sending');
    try {
        const response = await fetch(GOOGLE_STATS_API, { 
            method: 'POST', 
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ 
              action: 'heartbeat', 
              activity: selectedActivity, 
              email: userEmail 
            }) 
        });
        if (response.ok) {
          setSyncStatus('success');
          setTimeout(() => setSyncStatus('idle'), 500);
        } else {
          setSyncStatus('error');
        }
    } catch (e) { 
      setSyncStatus('error'); 
    }
  };

  const sendStopSignal = async () => {
    if (!isSync || !userEmail) return;
    try {
        await fetch(GOOGLE_STATS_API, { 
            method: 'POST', 
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'stop', email: userEmail }) 
        });
    } catch (e) { console.error("Failed to send stop signal"); }
  };

  useEffect(() => {
    if (isRunning && isSync && userEmail) {
      syncRef.current = window.setInterval(sendHeartbeat, 2000);
      sendHeartbeat();
    } else {
      if (syncRef.current) {
        clearInterval(syncRef.current);
        syncRef.current = null;
        sendStopSignal(); 
      }
    }
    
    return () => { 
      if (syncRef.current) {
        clearInterval(syncRef.current);
        syncRef.current = null;
      }
    };
  }, [isRunning, isSync, selectedActivity, userEmail]);

  const handleToggle = () => {
    if (isRunning) sendStopSignal();
    onToggle();
  };

  const handleReset = () => {
    sendStopSignal();
    onReset();
  };

  const handleApply = () => {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) {
      alert("يرجى قضاء دقيقة واحدة على الأقل قبل تسجيل الجلسة.");
      return;
    }
    
    const newSession: SessionRecord = {
      id: Math.random().toString(36).substring(7),
      activity: selectedActivity,
      duration: mins,
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);

    sendStopSignal();
    onApplyTime(selectedActivity, mins);
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

  const getLabel = (id: string) => activities.find(a => a.id === id)?.label || "";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-50 dark:bg-slate-800">
          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: isRunning ? `${(seconds % 60) * 1.66}%` : '0%' }} />
        </div>
        
        {isRunning && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-900 animate-pulse">
            <Radio className="w-3 h-3 text-rose-500" />
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 header-font tracking-tighter uppercase">Live Pulse</span>
          </div>
        )}

        <div className="absolute top-6 left-6">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold ${!isSync ? 'text-slate-400 bg-slate-50 dark:bg-slate-800' : syncStatus === 'error' ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'}`}>
            {isSync ? (syncStatus === 'sending' ? <Globe className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />) : <WifiOff className="w-3 h-3" />}
            {!isSync ? 'مزامنة معطلة' : syncStatus === 'sending' ? 'جاري الإرسال..' : 'متصل بالمحراب'}
          </div>
        </div>

        <div className="text-8xl font-black font-mono text-emerald-900 dark:text-emerald-400 mb-4 mt-12 tabular-nums tracking-tighter">
          {formatTime(seconds)}
        </div>
        
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 header-font mb-10 uppercase tracking-widest">
          {isRunning ? 'العداد يسجل وردك الآن' : 'المؤقت متوقف'}
        </p>

        <div className="grid grid-cols-2 gap-2 w-full mb-10">
          {activities.map(a => (
            <button 
              key={a.id} 
              disabled={isRunning}
              onClick={() => onActivityChange(a.id)} 
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all text-xs font-bold header-font ${selectedActivity === a.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              {a.icon} <span className="truncate">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <button onClick={handleReset} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700"><RotateCcw className="w-5 h-5" /></button>
          <button onClick={handleToggle} className={`p-8 rounded-full shadow-2xl transition-all ${isRunning ? 'bg-amber-500 shadow-amber-200 dark:shadow-none' : 'bg-emerald-600 shadow-emerald-200 dark:shadow-none'} active:scale-95`}>
            {isRunning ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white ml-1" />}
          </button>
          <button 
            onClick={handleApply} 
            className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl transition-all hover:bg-emerald-200 dark:hover:bg-emerald-800/50 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-black text-slate-800 dark:text-white header-font">جلساتك في هذا المحراب</h3>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase header-font">آخر ٣٠ يوماً</span>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900 transition-all group animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 header-font">{getLabel(session.activity)}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                      {format(session.timestamp, 'dd MMM - hh:mm a', { locale: ar })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">+{session.duration}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block header-font">دقيقة</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            <p className="text-xs text-slate-300 dark:text-slate-700 font-bold header-font">لم تسجل أي جلسة في هذا الشهر بعد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorshipTimer;
