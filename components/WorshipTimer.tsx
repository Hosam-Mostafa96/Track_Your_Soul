
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
  ArrowRight,
  Zap,
  Timer as PomodoroIcon
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { GOOGLE_STATS_API } from '../constants';
import confetti from 'canvas-confetti';

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
  timerMode: 'stopwatch' | 'pomodoro';
  onTimerModeChange: (mode: 'stopwatch' | 'pomodoro') => void;
  pomodoroGoal: number;
  onPomodoroGoalChange: (goal: number) => void;
}

interface SessionRecord {
  id: string;
  activity: string;
  duration: number;
  timestamp: number;
}

const WorshipTimer: React.FC<WorshipTimerProps> = ({ 
  seconds, isRunning, selectedActivity, onToggle, onReset, onActivityChange, onApplyTime, isSync, userEmail,
  timerMode, onTimerModeChange, pomodoroGoal, onPomodoroGoalChange
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [customMinutes, setCustomMinutes] = useState('25');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const heartbeatIntervalRef = useRef<number | null>(null);
  const lastHeartbeatTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const savedSessions = localStorage.getItem('worship_timer_sessions');
    if (savedSessions) {
      const parsed: SessionRecord[] = JSON.parse(savedSessions);
      const thirtyDaysAgo = subDays(new Date(), 30).getTime();
      const validSessions = parsed.filter(s => s.timestamp > thirtyDaysAgo);
      setSessions(validSessions);
    }
  }, []);

  useEffect(() => {
    if (timerMode === 'pomodoro' && isRunning && seconds >= pomodoroGoal) {
      handlePomodoroFinish();
    }
  }, [seconds, timerMode, isRunning, pomodoroGoal]);

  const handlePomodoroFinish = () => {
    const mins = Math.floor(pomodoroGoal / 60);
    const newSession: SessionRecord = {
      id: Math.random().toString(36).substring(7),
      activity: selectedActivity,
      duration: mins,
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    sendStopSignal();
    onApplyTime(selectedActivity, mins);
  };

  // نبضة المحراب - تم تحسينها لتكون أكثر صموداً
  const sendHeartbeat = async () => {
    if (!isSync || !isRunning || !userEmail || !navigator.onLine) return;
    
    // منع الطلبات المتداخلة جداً
    const now = Date.now();
    if (now - lastHeartbeatTimeRef.current < 1200) return; 
    lastHeartbeatTimeRef.current = now;

    try {
        // استخدام keepalive يضمن إكمال الطلب حتى لو حدث Render أو انتقل المستخدم لتبويب آخر
        await fetch(GOOGLE_STATS_API, { 
            method: 'POST', 
            mode: 'no-cors',
            keepalive: true,
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ 
              action: 'heartbeat', 
              activity: selectedActivity, 
              email: userEmail.toLowerCase().trim(),
              timestamp: now 
            }) 
        });
    } catch (e) {
        console.debug("Silent heartbeat skip");
    }
  };

  const sendStopSignal = async () => {
    if (!isSync || !userEmail) return;
    try {
        await fetch(GOOGLE_STATS_API, { 
          method: 'POST', 
          mode: 'no-cors',
          keepalive: true,
          headers: { 'Content-Type': 'text/plain' }, 
          body: JSON.stringify({ action: 'stop', email: userEmail.toLowerCase().trim() }) 
        });
    } catch (e) {}
  };

  // إدارة الإنترفال بشكل مستقل عن رندر المكون
  useEffect(() => {
    if (isRunning && isSync && userEmail) {
      // إرسال أول نبضة فوراً
      sendHeartbeat();
      // نبضة كل 1.5 ثانية لضمان الدقة العالية في المحراب العالمي
      heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, 1500);
    } else {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
        sendStopSignal();
      }
    }
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
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

  const formatDisplayTime = () => {
    const total = timerMode === 'stopwatch' ? seconds : Math.max(0, pomodoroGoal - seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activities = [
    { id: 'qiyamDuration', label: 'قيام الليل', icon: <Moon className="w-4 h-4" /> },
    { id: 'duhaDuration', label: 'صلاة الضحى', icon: <Sun className="w-4 h-4" /> },
    { id: 'shariDuration', label: 'طلب علم شرعي', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'readingDuration', label: 'قراءة عامة', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      {/* اختيار الوضع */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
        <button onClick={() => { onTimerModeChange('stopwatch'); onReset(); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold header-font transition-all ${timerMode === 'stopwatch' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}><Clock className="w-4 h-4" /> عداد مفتوح</button>
        <button onClick={() => { onTimerModeChange('pomodoro'); onReset(); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold header-font transition-all ${timerMode === 'pomodoro' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}><PomodoroIcon className="w-4 h-4" /> برومودورو</button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
        {/* شريط التقدم */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-50">
          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: timerMode === 'pomodoro' ? `${Math.min(100, (seconds / pomodoroGoal) * 100)}%` : isRunning ? `${(seconds % 60) * 1.66}%` : '0%' }} />
        </div>
        
        {/* مؤشر Live Pulse البصري - مستمر ما دام العداد يعمل */}
        {isRunning && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[9px] font-black text-emerald-700 header-font uppercase tracking-tighter">Live Pulse</span>
          </div>
        )}

        <div className="absolute top-6 left-6">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold ${!isSync ? 'text-slate-400 bg-slate-50' : isOnline ? 'text-emerald-600 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
            {isSync ? (isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />) : <WifiOff className="w-3 h-3" />}
            {!isSync ? 'مزامنة معطلة' : isOnline ? 'متصل بالمحراب' : 'أنت غير متصل'}
          </div>
        </div>

        <div className={`text-8xl font-black font-mono text-emerald-900 mb-4 mt-8 tabular-nums tracking-tighter transition-all ${timerMode === 'pomodoro' && seconds >= pomodoroGoal ? 'text-rose-600' : ''}`}>
          {formatDisplayTime()}
        </div>
        
        <p className="text-[11px] font-bold text-slate-400 header-font mb-6 uppercase tracking-widest">
          {timerMode === 'pomodoro' ? (isRunning ? 'وقت التركيز والعبادة' : 'اضبط الوقت ثم ابدأ وردك') : (isRunning ? 'العداد يسجل وردك الآن' : 'المؤقت متوقف')}
        </p>

        {/* خيارات البرومودورو */}
        {timerMode === 'pomodoro' && !isRunning && (
          <div className="flex flex-wrap justify-center gap-2 mb-8 animate-in slide-in-from-top-2">
            {[15, 25, 45, 60].map(m => (
              <button key={m} onClick={() => { onPomodoroGoalChange(m * 60); onReset(); }} className={`px-4 py-2 rounded-xl border text-[10px] font-black font-mono transition-all ${pomodoroGoal === m * 60 ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{m}د</button>
            ))}
            <button onClick={() => setShowCustomInput(!showCustomInput)} className={`px-4 py-2 rounded-xl border text-[10px] font-black header-font transition-all ${showCustomInput ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}>مخصص</button>
          </div>
        )}

        {showCustomInput && !isRunning && timerMode === 'pomodoro' && (
          <div className="flex gap-2 mb-8 animate-in zoom-in duration-200">
            <input type="number" value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} className="w-20 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold text-xs outline-none" />
            <button onClick={() => { const m = parseInt(customMinutes); if (m > 0) { onPomodoroGoalChange(m * 60); onReset(); setShowCustomInput(false); } }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold header-font">تطبيق</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 w-full mb-8">
          {activities.map(a => (
            <button key={a.id} disabled={isRunning} onClick={() => onActivityChange(a.id)} className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all text-xs font-bold header-font ${selectedActivity === a.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}>{a.icon} <span className="truncate">{a.label}</span></button>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <button onClick={handleReset} className="p-4 bg-slate-100 text-slate-400 rounded-2xl transition-all hover:bg-slate-200"><RotateCcw className="w-5 h-5" /></button>
          <button onClick={handleToggle} className={`p-8 rounded-full shadow-2xl transition-all ${isRunning ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-600 shadow-emerald-200'} active:scale-95`}>{isRunning ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white ml-1" />}</button>
          {timerMode === 'stopwatch' && (
            <button onClick={() => { const mins = Math.floor(seconds/60); if(mins < 1) return alert("دقيقة واحدة على الأقل"); onApplyTime(selectedActivity, mins); setSessions(prev => [{id: Math.random().toString(36).substr(7), activity: selectedActivity, duration: mins, timestamp: Date.now()}, ...prev]); }} className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl transition-all hover:bg-emerald-200 disabled:opacity-50"><CheckCircle2 className="w-5 h-5" /></button>
          )}
          {timerMode === 'pomodoro' && <div className="p-4 text-emerald-600/20"><Zap className="w-5 h-5" /></div>}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><History className="w-5 h-5 text-slate-400" /><h3 className="text-sm font-black text-slate-800 header-font">جلساتك في هذا المحراب</h3></div><span className="text-[10px] text-slate-400 font-bold uppercase header-font">آخر ٣٠ يوماً</span></div>
        {sessions.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all group animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl"><Clock className="w-4 h-4 text-emerald-600" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 header-font">{activities.find(a => a.id === session.activity)?.label || "عبادة"}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{format(session.timestamp, 'dd MMM - hh:mm a', { locale: ar })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-700 font-mono">+{session.duration}</span>
                  <span className="text-[9px] text-slate-400 font-bold block header-font">دقيقة</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-100 rounded-3xl"><p className="text-xs text-slate-300 font-bold header-font">لم تسجل أي جلسة في هذا الشهر بعد</p></div>
        )}
      </div>
    </div>
  );
};

export default WorshipTimer;
