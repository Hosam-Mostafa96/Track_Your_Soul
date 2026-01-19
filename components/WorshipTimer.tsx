
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
  Timer as PomodoroIcon,
  CirclePlay
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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [customMinutes, setCustomMinutes] = useState('25');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const syncRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  // تحميل الجلسات من التخزين المحلي
  useEffect(() => {
    const savedSessions = localStorage.getItem('worship_timer_sessions');
    if (savedSessions) {
      const parsed: SessionRecord[] = JSON.parse(savedSessions);
      const thirtyDaysAgo = subDays(new Date(), 30).getTime();
      const validSessions = parsed.filter(s => s.timestamp > thirtyDaysAgo);
      setSessions(validSessions);
      if (validSessions.length !== parsed.length) {
        localStorage.setItem('worship_timer_sessions', JSON.stringify(validSessions));
      }
    }
  }, []);

  // حفظ الجلسات
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('worship_timer_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // منطق الإكمال التلقائي للبرومودورو
  useEffect(() => {
    if (timerMode === 'pomodoro' && isRunning && seconds >= pomodoroGoal) {
      handlePomodoroFinish();
    }
  }, [seconds, timerMode, isRunning, pomodoroGoal]);

  const handlePomodoroFinish = () => {
    const mins = Math.floor(pomodoroGoal / 60);
    
    // تسجيل الجلسة
    const newSession: SessionRecord = {
      id: Math.random().toString(36).substring(7),
      activity: selectedActivity,
      duration: mins,
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);

    // احتفال بسيط
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#fbbf24', '#3b82f6']
    });

    // تطبيق الوقت
    sendStopSignal();
    onApplyTime(selectedActivity, mins);
    
    // تنبيه صوتي بسيط (اختياري)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

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
            body: JSON.stringify({ action: 'heartbeat', activity: selectedActivity, email: userEmail }) 
        });
        if (response.ok) { setSyncStatus('success'); setTimeout(() => setSyncStatus('idle'), 500); } 
        else { setSyncStatus('error'); }
    } catch (e) { setSyncStatus('error'); }
  };

  const sendStopSignal = async () => {
    if (!isSync || !userEmail) return;
    try {
        await fetch(GOOGLE_STATS_API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'stop', email: userEmail }) });
    } catch (e) { console.error("Failed to send stop signal"); }
  };

  useEffect(() => {
    if (isRunning && isSync && userEmail) {
      syncRef.current = window.setInterval(sendHeartbeat, 2000);
      sendHeartbeat();
    } else {
      if (syncRef.current) { clearInterval(syncRef.current); syncRef.current = null; sendStopSignal(); }
    }
    return () => { if (syncRef.current) { clearInterval(syncRef.current); syncRef.current = null; } };
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
    if (mins < 1) { alert("يرجى قضاء دقيقة واحدة على الأقل قبل تسجيل الجلسة."); return; }
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

  const formatDisplayTime = () => {
    if (timerMode === 'stopwatch') {
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      const remaining = Math.max(0, pomodoroGoal - seconds);
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const handlePomodoroOption = (mins: number) => {
    if (isRunning) return;
    onPomodoroGoalChange(mins * 60);
    onReset();
    setShowCustomInput(false);
  };

  const handleCustomPomodoro = () => {
    const mins = parseInt(customMinutes);
    if (isNaN(mins) || mins <= 0) return;
    handlePomodoroOption(mins);
  };

  const activities = [
    { id: 'qiyamDuration', label: 'قيام الليل', icon: <Moon className="w-4 h-4" /> },
    { id: 'duhaDuration', label: 'صلاة الضحى', icon: <Sun className="w-4 h-4" /> },
    { id: 'shariDuration', label: 'طلب علم شرعي', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'readingDuration', label: 'قراءة عامة', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const getLabel = (id: string) => activities.find(a => a.id === id)?.label || "";

  const pomodoroOptions = [15, 25, 45, 60];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      {/* اختيار الوضع */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
        <button 
          onClick={() => { onTimerModeChange('stopwatch'); onReset(); }} 
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold header-font transition-all ${timerMode === 'stopwatch' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}
        >
          <Clock className="w-4 h-4" /> عداد مفتوح
        </button>
        <button 
          onClick={() => { onTimerModeChange('pomodoro'); onReset(); }} 
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold header-font transition-all ${timerMode === 'pomodoro' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}
        >
          <PomodoroIcon className="w-4 h-4" /> برومودورو
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
        {/* شريط التقدم للبرومودورو */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-50">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000" 
            style={{ 
              width: timerMode === 'pomodoro' 
                ? `${Math.min(100, (seconds / pomodoroGoal) * 100)}%` 
                : isRunning ? `${(seconds % 60) * 1.66}%` : '0%' 
            }} 
          />
        </div>
        
        {isRunning && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 animate-pulse">
            <Radio className="w-3 h-3 text-rose-500" />
            <span className="text-[10px] font-black text-rose-600 header-font tracking-tighter uppercase">Live Pulse</span>
          </div>
        )}

        <div className="absolute top-6 left-6">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold ${!isSync ? 'text-slate-400 bg-slate-50' : syncStatus === 'error' ? 'text-rose-500 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
            {isSync ? (syncStatus === 'sending' ? <Globe className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />) : <WifiOff className="w-3 h-3" />}
            {!isSync ? 'مزامنة معطلة' : syncStatus === 'sending' ? 'جاري الإرسال..' : 'متصل بالمحراب'}
          </div>
        </div>

        <div className={`text-8xl font-black font-mono text-emerald-900 mb-4 mt-8 tabular-nums tracking-tighter transition-all ${timerMode === 'pomodoro' && seconds >= pomodoroGoal ? 'text-rose-600' : ''}`}>
          {formatDisplayTime()}
        </div>
        
        <p className="text-[11px] font-bold text-slate-400 header-font mb-6 uppercase tracking-widest">
          {timerMode === 'pomodoro' 
            ? (isRunning ? 'وقت التركيز والعبادة' : 'اضبط الوقت ثم ابدأ وردك')
            : (isRunning ? 'العداد يسجل وردك الآن' : 'المؤقت متوقف')}
        </p>

        {/* خيارات البرومودورو */}
        {timerMode === 'pomodoro' && !isRunning && (
          <div className="flex flex-wrap justify-center gap-2 mb-8 animate-in slide-in-from-top-2">
            {pomodoroOptions.map(m => (
              <button 
                key={m} 
                onClick={() => handlePomodoroOption(m)} 
                className={`px-4 py-2 rounded-xl border text-[10px] font-black font-mono transition-all ${pomodoroGoal === m * 60 ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
              >
                {m}د
              </button>
            ))}
            <button 
              onClick={() => setShowCustomInput(!showCustomInput)} 
              className={`px-4 py-2 rounded-xl border text-[10px] font-black header-font transition-all ${showCustomInput ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              مخصص
            </button>
          </div>
        )}

        {showCustomInput && !isRunning && timerMode === 'pomodoro' && (
          <div className="flex gap-2 mb-8 animate-in zoom-in duration-200">
            <input 
              type="number" 
              value={customMinutes} 
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="w-20 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold text-xs outline-none focus:border-emerald-300"
            />
            <button onClick={handleCustomPomodoro} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold header-font">تطبيق</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 w-full mb-8">
          {activities.map(a => (
            <button 
              key={a.id} 
              disabled={isRunning}
              onClick={() => onActivityChange(a.id)} 
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all text-xs font-bold header-font ${selectedActivity === a.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
            >
              {a.icon} <span className="truncate">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <button onClick={handleReset} className="p-4 bg-slate-100 text-slate-400 rounded-2xl transition-all hover:bg-slate-200"><RotateCcw className="w-5 h-5" /></button>
          <button onClick={handleToggle} className={`p-8 rounded-full shadow-2xl transition-all ${isRunning ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-600 shadow-emerald-200'} active:scale-95`}>
            {isRunning ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white ml-1" />}
          </button>
          {timerMode === 'stopwatch' && (
            <button 
              onClick={handleApply} 
              className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl transition-all hover:bg-emerald-200 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
          {timerMode === 'pomodoro' && (
            <div className="p-4 text-emerald-600/20">
              <Zap className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* نصيحة البرومودورو */}
      {timerMode === 'pomodoro' && (
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex gap-3 animate-in fade-in slide-in-from-top-1">
          <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-[10px] text-emerald-800 font-bold leading-relaxed header-font">
            نظام البرومودورو يساعدك على حصر ذهنك في العبادة لفترة محددة. بمجرد انتهاء الوقت، سيقوم الميزان بتسجيل وردك تلقائياً دون الحاجة للضغط على أي زر.
          </p>
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-black text-slate-800 header-font">جلساتك في هذا المحراب</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase header-font">آخر ٣٠ يوماً</span>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all group animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 header-font">{getLabel(session.activity)}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {format(session.timestamp, 'dd MMM - hh:mm a', { locale: ar })}
                    </p>
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
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-100 rounded-3xl">
            <p className="text-xs text-slate-300 font-bold header-font">لم تسجل أي جلسة في هذا الشهر بعد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorshipTimer;
