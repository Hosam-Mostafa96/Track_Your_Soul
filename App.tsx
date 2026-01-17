
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PenLine, 
  History as HistoryIcon, 
  Timer, 
  BookHeart, 
  Trophy, 
  BarChart3, 
  UserCircle, 
  Info, 
  Combine, 
  MessageCircle,
  Menu,
  X as CloseIcon
} from 'lucide-react';
import { User, DailyLog, AppWeights, PrayerName, TranquilityLevel } from './types';
import { DEFAULT_WEIGHTS } from './constants';
import { calculateTotalScore } from './utils/scoring';
import { format } from 'date-fns';

// Components
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import DailyEntry from './DailyEntry'; // Using the root version with date logic
import WorshipHistory from './components/WorshipHistory';
import WorshipTimer from './components/WorshipTimer';
import Reflections from './components/Reflections';
import Leaderboard from './components/Leaderboard';
import Statistics from './components/Statistics';
import UserProfile from './components/UserProfile';
import WorshipGuide from './components/WorshipGuide';
import WorshipPatterns from './components/WorshipPatterns';
import ContactUs from './components/ContactUs';

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzFA2kvdLqForyWidmHUYY5xu0ZSLV2DXkWUvi5JAweeqz_vyKnAZlhADBxARx5KFM/exec";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('worship_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [logs, setLogs] = useState<Record<string, DailyLog>>(() => {
    const saved = localStorage.getItem('worship_logs');
    return saved ? JSON.parse(saved) : {};
  });

  const [weights, setWeights] = useState<AppWeights>(() => {
    const saved = localStorage.getItem('worship_weights');
    return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
  });

  const [targetScore, setTargetScore] = useState<number>(() => {
    const saved = localStorage.getItem('worship_target');
    return saved ? parseInt(saved) : 5000;
  });

  const [isGlobalSyncEnabled, setIsGlobalSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('worship_sync');
    return saved ? JSON.parse(saved) : true;
  });

  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('qiyamDuration');

  // Persistence
  useEffect(() => {
    localStorage.setItem('worship_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('worship_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('worship_weights', JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    localStorage.setItem('worship_target', targetScore.toString());
  }, [targetScore]);

  useEffect(() => {
    localStorage.setItem('worship_sync', JSON.stringify(isGlobalSyncEnabled));
  }, [isGlobalSyncEnabled]);

  // Timer Tick
  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Cloud Sync Logic - Updated to 2.5 seconds
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
      }, 2500); 
      return () => clearTimeout(timeout);
    }
  }, [logs, isGlobalSyncEnabled, user?.email]);

  const handleOnboardingComplete = (newUser: User, restoredLogs?: string) => {
    setUser(newUser);
    if (restoredLogs) {
      try {
        const parsedLogs = JSON.parse(restoredLogs);
        setLogs(prev => ({ ...prev, ...parsedLogs }));
      } catch (e) {
        console.error("Restore logs error:", e);
      }
    }
  };

  const getLogForDate = (date: string): DailyLog => {
    if (logs[date]) return logs[date];
    
    const initialPrayers: Record<string, any> = {};
    Object.values(PrayerName).forEach(p => {
      initialPrayers[p] = {
        performed: false,
        inCongregation: false,
        tranquility: TranquilityLevel.MINIMUM,
        internalSunnahPackage: 'none',
        surroundingSunnahIds: []
      };
    });

    return {
      date,
      prayers: initialPrayers,
      quran: { hifzRub: 0, revisionRub: 0 },
      knowledge: { shariDuration: 0, readingDuration: 0 },
      athkar: {
        checklists: { morning: false, evening: false, sleep: false, travel: false },
        counters: { salawat: 0, hawqalah: 0, tahlil: 0, baqiyat: 0, istighfar: 0 }
      },
      nawafil: { duhaDuration: 0, witrDuration: 0, qiyamDuration: 0, fasting: false, custom: [] },
      customSunnahIds: [],
      jihadFactor: 1.0,
      hasBurden: false,
      isRepented: false,
      isSupplicatingAloud: false,
      reflections: []
    };
  };

  const updateLog = (newLog: DailyLog) => {
    setLogs(prev => ({ ...prev, [newLog.date]: newLog }));
  };

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} installPrompt={null} />;
  }

  const currentLog = getLogForDate(currentDate);

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'entry', label: 'التسجيل', icon: <PenLine className="w-5 h-5" /> },
    { id: 'history', label: 'السجلات', icon: <HistoryIcon className="w-5 h-5" /> },
    { id: 'timer', label: 'المحراب', icon: <Timer className="w-5 h-5" /> },
    { id: 'reflections', label: 'خواطر', icon: <BookHeart className="w-5 h-5" /> },
    { id: 'leaderboard', label: 'المتصدرين', icon: <Trophy className="w-5 h-5" /> },
    { id: 'statistics', label: 'إحصائيات', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'patterns', label: 'أنماط', icon: <Combine className="w-5 h-5" /> },
    { id: 'profile', label: 'حسابي', icon: <UserCircle className="w-5 h-5" /> },
    { id: 'guide', label: 'دليل', icon: <Info className="w-5 h-5" /> },
    { id: 'contact', label: 'تواصل', icon: <MessageCircle className="w-5 h-5" />, hasNotification: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-right pb-24" dir="rtl">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex items-center justify-between lg:hidden">
        <h1 className="font-black text-emerald-700 header-font text-xl">ميزان</h1>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-500 relative">
          {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : (
            <>
              <Menu className="w-6 h-6" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></div>
            </>
          )}
        </button>
      </header>

      {/* Navigation - Mobile Overlay Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6 lg:hidden animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-black text-emerald-700 header-font text-2xl">القائمة</h1>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-500">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all relative ${activeTab === item.id ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
              >
                {item.icon}
                {item.hasNotification && (
                  <div className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white animate-bounce">
                    1
                  </div>
                )}
                <span className="text-xs font-bold header-font">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-xl mx-auto p-4 lg:pt-10">
        {activeTab === 'dashboard' && (
          <Dashboard 
            log={currentLog} 
            logs={logs} 
            weights={weights} 
            onDateChange={setCurrentDate}
            targetScore={targetScore}
            onTargetChange={setTargetScore}
            onOpenSettings={() => setActiveTab('profile')}
          />
        )}
        {activeTab === 'entry' && (
          <DailyEntry 
            log={currentLog} 
            onUpdate={updateLog} 
            weights={weights} 
            onUpdateWeights={setWeights}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        )}
        {activeTab === 'history' && <WorshipHistory logs={logs} weights={weights} />}
        {activeTab === 'timer' && (
          <WorshipTimer 
            seconds={timerSeconds} 
            isRunning={isTimerRunning} 
            selectedActivity={selectedActivity} 
            onToggle={() => setIsTimerRunning(!isTimerRunning)} 
            onReset={() => { setIsTimerRunning(false); setTimerSeconds(0); }} 
            onActivityChange={setSelectedActivity} 
            onApplyTime={(field, mins) => {
              const updatedLog = { ...currentLog };
              const nawafil = { ...updatedLog.nawafil };
              (nawafil as any)[field] = ((nawafil as any)[field] || 0) + mins;
              updatedLog.nawafil = nawafil;
              updateLog(updatedLog);
              setIsTimerRunning(false);
              setTimerSeconds(0);
            }} 
            isSync={isGlobalSyncEnabled} 
            userEmail={user.email} 
          />
        )}
        {activeTab === 'reflections' && <Reflections log={currentLog} onUpdate={updateLog} />}
        {activeTab === 'leaderboard' && (
          <Leaderboard 
            user={user} 
            currentScore={calculateTotalScore(currentLog, weights)} 
            logs={logs} 
            weights={weights} 
            isSync={isGlobalSyncEnabled} 
          />
        )}
        {activeTab === 'statistics' && <Statistics user={user} logs={logs} weights={weights} />}
        {activeTab === 'patterns' && <WorshipPatterns logs={logs} weights={weights} />}
        {activeTab === 'profile' && (
          <UserProfile 
            user={user} 
            weights={weights} 
            isGlobalSync={isGlobalSyncEnabled} 
            onToggleSync={setIsGlobalSyncEnabled} 
            onUpdateUser={setUser} 
            onUpdateWeights={setWeights} 
          />
        )}
        {activeTab === 'guide' && <WorshipGuide />}
        {activeTab === 'contact' && <ContactUs />}
      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 z-40">
        <div className="max-w-xl mx-auto flex justify-around items-center">
          {navItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}
            >
              {item.icon}
              <span className="text-[10px] font-bold header-font">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400 relative"
          >
            <Menu className="w-5 h-5" />
            <div className="absolute top-[-2px] right-2 bg-rose-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
              1
            </div>
            <span className="text-[10px] font-bold header-font">المزيد</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
