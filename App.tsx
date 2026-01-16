
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2,
  LayoutDashboard,
  PenLine,
  History,
  Trophy,
  Timer as TimerIcon,
  BarChart3,
  TrendingUp,
  NotebookPen,
  UserCircle,
  Mail,
  Info,
  Medal,
  Download
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
  type Tab = 'dashboard' | 'entry' | 'timer' | 'leaderboard' | 'notes' | 'stats' | 'patterns' | 'guide' | 'history' | 'profile' | 'contact';
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
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [timerActivity, setTimerActivity] = useState('qiyamDuration');
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerIsRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timerIsRunning]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const savedLogs = localStorage.getItem('mizan_logs');
    const savedTarget = localStorage.getItem('mizan_target');
    const savedUser = localStorage.getItem('mizan_user');
    const savedWeights = localStorage.getItem('mizan_weights');
    const savedSync = localStorage.getItem('mizan_global_sync');
    
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedTarget) setTargetScore(parseInt(savedTarget));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedSync) setIsGlobalSyncEnabled(JSON.parse(savedSync));
    if (savedWeights) setWeights(JSON.parse(savedWeights));
    
    setIsAppReady(true);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const currentLog = logs[currentDate] || INITIAL_LOG(currentDate);
  const todayScore = calculateTotalScore(currentLog, weights);
  const progressPercent = Math.min((todayScore / targetScore) * 100, 100);

  const updateLog = (updated: DailyLog) => {
    const newLogs = { ...logs, [updated.date]: updated };
    setLogs(newLogs);
    localStorage.setItem('mizan_logs', JSON.stringify(newLogs));
  };

  const handleUpdateWeights = (newWeights: AppWeights) => {
    setWeights(newWeights);
    localStorage.setItem('mizan_weights', JSON.stringify(newWeights));
  };

  const handleApplyTimer = (field: string, mins: number) => {
    const logToUpdate = logs[currentDate] || INITIAL_LOG(currentDate);
    const updatedNawafil = { ...logToUpdate.nawafil };
    const updatedKnowledge = { ...logToUpdate.knowledge };
    
    if (field === 'qiyamDuration' || field === 'duhaDuration' || field === 'witrDuration') {
      (updatedNawafil as any)[field] += mins;
    } else if (field === 'shariDuration' || field === 'readingDuration') {
      (updatedKnowledge as any)[field] += mins;
    }
    
    updateLog({
      ...logToUpdate,
      nawafil: updatedNawafil,
      knowledge: updatedKnowledge
    });
    
    setTimerSeconds(0);
    setTimerIsRunning(false);
    setActiveTab('entry');
  };

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={(userData) => {
      setUser(userData);
      localStorage.setItem('mizan_user', JSON.stringify(userData));
      setIsGlobalSyncEnabled(true);
      localStorage.setItem('mizan_global_sync', JSON.stringify(true));
    }} />;
  }

  return (
    <div className="min-h-screen pb-32">
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-background-dark/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold tracking-tight leading-none header-font">إدارة العبادات والأوراد</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1 font-bold">Spiritual Progress</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {deferredPrompt && (
            <button onClick={handleInstallApp} className="p-2 bg-amber-gold/20 rounded-full animate-bounce">
              <Download className="w-5 h-5 text-amber-gold" />
            </button>
          )}
          <button onClick={() => setActiveTab('profile')} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
            <UserCircle className="w-6 h-6 text-slate-400" />
          </button>
          <div className="relative size-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-white/10" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" stroke-width="3"></circle>
              <circle className="text-primary transition-all duration-700" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" 
                strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * progressPercent) / 100} strokeWidth="3" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{Math.round(progressPercent)}%</span>
            </div>
          </div>
        </div>
      </nav>

      <header className="px-6 py-8 text-center animate-in fade-in slide-in-from-top duration-700">
        <p className="text-[#9cbab3] text-sm font-bold tracking-wide header-font">
          {format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM yyyy', { locale: ar })}
        </p>
        <h2 className="mt-2 text-2xl font-light text-slate-200 header-font">
          كيف كان <span className="font-bold text-amber-gold">خشوعك</span> اليوم؟
        </h2>
      </header>

      <main className="px-6 max-w-2xl mx-auto space-y-6">
        {activeTab === 'dashboard' && <Dashboard log={currentLog} logs={logs} weights={weights} onDateChange={setCurrentDate} targetScore={targetScore} onTargetChange={(s) => { setTargetScore(s); localStorage.setItem('mizan_target', s.toString()); }} onOpenSettings={() => setActiveTab('profile')} />}
        {activeTab === 'entry' && (
          <DailyEntry 
            log={currentLog} 
            onUpdate={updateLog} 
            weights={weights}
            onUpdateWeights={handleUpdateWeights}
            currentDate={currentDate} 
            onDateChange={setCurrentDate} 
          />
        )}
        {activeTab === 'timer' && (
          <WorshipTimer 
            isSync={isGlobalSyncEnabled} 
            seconds={timerSeconds}
            isRunning={timerIsRunning}
            selectedActivity={timerActivity}
            onToggle={() => setTimerIsRunning(!timerIsRunning)}
            onReset={() => { setTimerSeconds(0); setTimerIsRunning(false); }}
            onActivityChange={(id) => setTimerActivity(id)}
            onApplyTime={handleApplyTimer} 
          />
        )}
        {activeTab === 'leaderboard' && <Leaderboard user={user} currentScore={todayScore} logs={logs} weights={weights} isSync={isGlobalSyncEnabled} />}
        {activeTab === 'notes' && <Reflections log={currentLog} onUpdate={updateLog} />}
        {activeTab === 'stats' && <Statistics user={user} logs={logs} weights={weights} />}
        {activeTab === 'patterns' && <WorshipPatterns logs={logs} weights={weights} />}
        {activeTab === 'guide' && <WorshipGuide />}
        {activeTab === 'history' && <WorshipHistory logs={logs} weights={weights} />}
        {activeTab === 'contact' && <ContactUs />}
        {activeTab === 'profile' && <UserProfile user={user} weights={weights} isGlobalSync={isGlobalSyncEnabled} onToggleSync={(e) => { setIsGlobalSyncEnabled(e); localStorage.setItem('mizan_global_sync', JSON.stringify(e)); }} onUpdateUser={(u) => { setUser(u); localStorage.setItem('mizan_user', JSON.stringify(u)); }} onUpdateWeights={handleUpdateWeights} />}
      </main>

      {(activeTab === 'dashboard' || activeTab === 'entry') && (
        <div className="fixed bottom-24 left-0 right-0 px-6 flex justify-center pointer-events-none z-40">
          <button 
            onClick={() => setActiveTab('entry')}
            className="pointer-events-auto w-full max-w-md bg-gradient-to-r from-primary to-[#044a3a] py-4 rounded-2xl shadow-[0_8px_30px_rgb(6,96,75,0.4)] text-white font-bold text-base tracking-widest uppercase flex items-center justify-center gap-2 transition-transform active:scale-95 header-font"
          >
            سجّل عباداتك الآن
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </button>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-xl border-t border-white/10 px-8 py-4 flex justify-between items-center z-50">
        {[
          {id: 'dashboard', icon: 'home', label: 'الرئيسية'},
          {id: 'entry', icon: 'edit_note', label: 'تسجيل'},
          {id: 'stats', icon: 'analytics', label: 'إحصائيات'},
          {id: 'leaderboard', icon: 'military_tech', label: 'الأبرار'},
          {id: 'contact', icon: 'mail', label: 'تواصل'}
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as Tab)} 
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === tab.id ? 'fill-[1]' : ''}`} style={activeTab === tab.id ? {fontVariationSettings: "'FILL' 1"} : {}}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-bold header-font">{tab.label}</span>
          </button>
        ))}
      </footer>
    </div>
  );
};

export default App;
