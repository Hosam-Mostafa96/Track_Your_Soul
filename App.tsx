
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  PenLine, 
  Timer as TimerIcon,
  NotebookPen,
  UserCircle,
  Medal,
  Sparkles,
  Mail,
  Info,
  Loader2,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

import { DailyLog, PrayerName, TranquilityLevel, JihadFactor, AppWeights, User } from './types';
import { calculateTotalScore } from './utils/scoring';
import { DEFAULT_WEIGHTS } from './constants';
import Dashboard from './components/Dashboard';
import DailyEntry from './DailyEntry';
import WorshipHistory from './components/WorshipHistory';
import WorshipGuide from './components/WorshipGuide';
import WorshipTimer from './components/WorshipTimer';
import Reflections from './components/Reflections';
import UserProfile from './components/UserProfile';
import Leaderboard from './components/Leaderboard';
import ContactUs from './components/ContactUs';
import Onboarding from './components/Onboarding';
import Statistics from './components/Statistics';
import WorshipPatterns from './components/WorshipPatterns';

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzFA2kvdLqForyWidmHUYY5xu0ZSLV2DXkWUvi5JAweeqz_vyKnAZlhADBxARx5KFM/exec"; 

const INITIAL_LOG = (date: string): DailyLog => ({
  date,
  prayers: {
    [PrayerName.FAJR]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'basic', surroundingSunnahIds: [] },
    [PrayerName.DHUHR]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'basic', surroundingSunnahIds: [] },
    [PrayerName.ASR]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'basic', surroundingSunnahIds: [] },
    [PrayerName.MAGHRIB]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'basic', surroundingSunnahIds: [] },
    [PrayerName.ISHA]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'basic', surroundingSunnahIds: [] },
  },
  quran: { hifzRub: 0, revisionRub: 0 },
  knowledge: { shariDuration: 0, readingDuration: 0 },
  athkar: {
    checklists: { morning: false, evening: false, sleep: false, travel: false },
    counters: { salawat: 0, hawqalah: 0, tahlil: 0, baqiyat: 0, istighfar: 0 }
  },
  nawafil: {
    duhaDuration: 0, witrDuration: 0, qiyamDuration: 0, fasting: false, custom: []
  },
  customSunnahIds: [],
  jihadFactor: JihadFactor.NORMAL,
  hasBurden: false,
  isRepented: true,
  isSupplicatingAloud: false,
  notes: '',
  reflections: []
});

const App: React.FC = () => {
  type Tab = 'dashboard' | 'entry' | 'leaderboard' | 'timer' | 'stats' | 'patterns' | 'notes' | 'guide' | 'history' | 'profile' | 'contact';
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [targetScore, setTargetScore] = useState(5000);
  const [user, setUser] = useState<User | null>(null);
  const [weights, setWeights] = useState<AppWeights>(DEFAULT_WEIGHTS);
  const [isGlobalSyncEnabled, setIsGlobalSyncEnabled] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeActivity, setActiveActivity] = useState('qiyamDuration');
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isTimerRunning]);

  // مزامنة أبطأ (كل 30 ثانية أو عند تغيير البيانات بشكل ملحوظ) لضمان عدم تكرار البيانات في الشيت
  useEffect(() => {
    if (isGlobalSyncEnabled && user?.email && Object.keys(logs).length > 0) {
      const timeout = setTimeout(async () => {
        try {
          await fetch(GOOGLE_STATS_API, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'syncLogs',
              email: user.email.toLowerCase().trim(),
              logs: JSON.stringify(logs)
            })
          });
        } catch (e) {
          console.error("Cloud Sync Error:", e);
        }
      }, 30000); 
      return () => clearTimeout(timeout);
    }
  }, [logs, isGlobalSyncEnabled, user?.email]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('worship_logs');
    const savedTarget = localStorage.getItem('worship_target');
    const savedUser = localStorage.getItem('worship_user');
    const savedSync = localStorage.getItem('worship_global_sync');
    const savedWeights = localStorage.getItem('worship_weights');
    
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedTarget) setTargetScore(parseInt(savedTarget));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedSync) setIsGlobalSyncEnabled(JSON.parse(savedSync));
    if (savedWeights) setWeights(JSON.parse(savedWeights));
    
    setIsAppReady(true);
  }, []);

  const updateLog = (updated: DailyLog) => {
    const newLogs = { ...logs, [updated.date]: updated };
    setLogs(newLogs);
    localStorage.setItem('worship_logs', JSON.stringify(newLogs));
  };

  const handleUpdateWeights = (newWeights: AppWeights) => {
    setWeights(newWeights);
    localStorage.setItem('worship_weights', JSON.stringify(newWeights));
  };

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-emerald-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Onboarding 
        installPrompt={deferredPrompt}
        onComplete={(userData, restoredLogs) => {
          setUser(userData);
          localStorage.setItem('worship_user', JSON.stringify(userData));
          if (restoredLogs) {
            const parsedLogs = JSON.parse(restoredLogs);
            setLogs(parsedLogs);
            localStorage.setItem('worship_logs', restoredLogs);
          }
          setIsGlobalSyncEnabled(true);
          localStorage.setItem('worship_global_sync', JSON.stringify(true));
        }} 
      />
    );
  }

  const currentLog = logs[currentDate] || INITIAL_LOG(currentDate);
  const todayScore = calculateTotalScore(currentLog, weights);

  return (
    <div className="min-h-screen pb-32 bg-slate-50">
      <header className="bg-emerald-800 text-white p-6 pb-24 rounded-b-[3.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-700 rounded-full -translate-y-24 translate-x-24 opacity-30 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-start mb-4 gap-4">
            <button onClick={() => setActiveTab('profile')} className="p-2 hover:bg-white/10 rounded-full transition-all flex-shrink-0">
              <UserCircle className={`w-7 h-7 ${user ? 'text-yellow-400' : 'text-white/50'}`} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold header-font">إدارة العبادات والأوراد</h1>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('contact')} className="p-2 hover:bg-white/10 rounded-full transition-all flex-shrink-0">
                <Mail className="w-6 h-6 text-white/70" />
              </button>
              <button onClick={() => setActiveTab('guide')} className="p-2 hover:bg-white/10 rounded-full transition-all flex-shrink-0">
                <Info className="w-6 h-6 text-white/70" />
              </button>
            </div>
          </div>
          <p className="text-emerald-50 quran-font text-xl opacity-95 max-w-sm px-4">{user ? `مرحباً، ${user.name}` : '"حاسِبوا أنفسَكم قبل أن تُحاسَبوا"'}</p>
          <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-3xl p-5 w-full max-w-md flex items-center justify-between border border-white/20 shadow-2xl relative">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400/20 p-3 rounded-2xl"><Sparkles className="w-8 h-8 text-yellow-400" /></div>
              <div className="text-right">
                <p className="text-[10px] text-emerald-200 uppercase tracking-[0.2em] font-bold header-font">الرصيد الروحي</p>
                <span className="text-3xl font-bold font-mono tabular-nums leading-none">{todayScore.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10 mx-2"></div>
            <button onClick={() => setActiveTab('history')} className="text-right flex flex-col items-end hover:bg-white/20 p-2 px-3 rounded-2xl transition-all">
              <p className="text-[10px] text-emerald-200 uppercase font-bold header-font">{format(new Date(currentDate.replace(/-/g, '/')), 'eeee', { locale: ar })}</p>
              <p className="text-lg font-semibold header-font leading-tight">{format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM', { locale: ar })}</p>
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-12 relative z-20 max-w-2xl mx-auto">
        {activeTab === 'dashboard' && <Dashboard log={currentLog} logs={logs} weights={weights} onDateChange={setCurrentDate} targetScore={targetScore} onTargetChange={(s) => { setTargetScore(s); localStorage.setItem('worship_target', s.toString()); }} onOpenSettings={() => setActiveTab('profile')} />}
        {activeTab === 'entry' && <DailyEntry log={currentLog} onUpdate={updateLog} weights={weights} onUpdateWeights={handleUpdateWeights} currentDate={currentDate} onDateChange={setCurrentDate} />}
        {activeTab === 'leaderboard' && <Leaderboard user={user} currentScore={todayScore} logs={logs} weights={weights} isSync={isGlobalSyncEnabled} />}
        {activeTab === 'timer' && <WorshipTimer isSync={isGlobalSyncEnabled} seconds={timerSeconds} isRunning={isTimerRunning} selectedActivity={activeActivity} onToggle={() => setIsTimerRunning(!isTimerRunning)} onReset={() => { setTimerSeconds(0); setIsTimerRunning(false); }} onActivityChange={setActiveActivity} userEmail={user?.email} onApplyTime={(field, mins) => {
            const newLog = { ...currentLog };
            if (field === 'shariDuration' || field === 'readingDuration') { newLog.knowledge = { ...newLog.knowledge, [field]: (newLog.knowledge[field] || 0) + mins }; } 
            else if (field === 'duhaDuration' || field === 'witrDuration' || field === 'qiyamDuration') { newLog.nawafil = { ...newLog.nawafil, [field]: (newLog.nawafil[field] || 0) + mins }; }
            updateLog(newLog); setTimerSeconds(0); setIsTimerRunning(false); 
        }} />}
        {activeTab === 'stats' && <Statistics user={user} logs={logs} weights={weights} />}
        {activeTab === 'patterns' && <WorshipPatterns logs={logs} weights={weights} />}
        {activeTab === 'notes' && <Reflections log={currentLog} onUpdate={updateLog} />}
        {activeTab === 'guide' && <WorshipGuide />}
        {activeTab === 'history' && <WorshipHistory logs={logs} weights={weights} />}
        {activeTab === 'contact' && <ContactUs />}
        {activeTab === 'profile' && <UserProfile user={user} weights={weights} isGlobalSync={isGlobalSyncEnabled} onToggleSync={(enabled) => { setIsGlobalSyncEnabled(enabled); localStorage.setItem('worship_global_sync', JSON.stringify(enabled)); }} onUpdateUser={(u) => { setUser(u); localStorage.setItem('worship_user', JSON.stringify(u)); }} onUpdateWeights={handleUpdateWeights} />}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 shadow-2xl rounded-full px-4 py-3 flex items-center gap-2 border border-slate-200 backdrop-blur-lg z-50 overflow-x-auto max-w-[95vw] no-scrollbar">
        {[
          {id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية'},
          {id: 'entry', icon: PenLine, label: 'تسجيل'},
          {id: 'leaderboard', icon: Medal, label: 'إنجازاتي'},
          {id: 'timer', icon: TimerIcon, label: 'مؤقت'},
          {id: 'stats', icon: BarChart3, label: 'إحصائيات'},
          {id: 'patterns', icon: TrendingUp, label: 'الأنماط'},
          {id: 'notes', icon: NotebookPen, label: 'يوميات'}
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex flex-col items-center min-w-[3.2rem] transition-all duration-300 ${activeTab === tab.id ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {tab.id === 'timer' && isTimerRunning && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}
            </div>
            <span className="text-[7px] mt-1 font-bold header-font">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
