import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, 
  PenLine, 
  History, 
  Trophy,
  Info,
  Timer,
  NotebookPen,
  UserCircle,
  Medal,
  Calendar,
  ChevronDown,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

import { DailyLog, PrayerName, TranquilityLevel, JihadFactor, AppWeights } from './types';
import { calculateTotalScore } from './utils/scoring';
import { DEFAULT_WEIGHTS } from './constants';
import Dashboard from './components/Dashboard';
import DailyEntry from './components/DailyEntry';
import WorshipHistory from './components/WorshipHistory';
import WorshipGuide from './components/WorshipGuide';
import WorshipTimer from './components/WorshipTimer';
import Reflections from './components/Reflections';
import UserProfile from './components/UserProfile';
import Leaderboard from './components/Leaderboard';
import ContactUs from './components/ContactUs';

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
  notes: ''
});

const App: React.FC = () => {
  type Tab = 'dashboard' | 'entry' | 'timer' | 'leaderboard' | 'notes' | 'guide' | 'history' | 'profile' | 'contact';
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [targetScore, setTargetScore] = useState(5000);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [weights, setWeights] = useState<AppWeights>(DEFAULT_WEIGHTS);
  
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedLogs = localStorage.getItem('mizan_logs');
    const savedTarget = localStorage.getItem('mizan_target');
    const savedUser = localStorage.getItem('mizan_user');
    const savedWeights = localStorage.getItem('mizan_weights');
    
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedTarget) setTargetScore(parseInt(savedTarget));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedWeights) {
      const parsedWeights = JSON.parse(savedWeights);
      if (!parsedWeights.customSunnahs) parsedWeights.customSunnahs = [];
      setWeights(parsedWeights);
    }
  }, []);

  const currentLog = logs[currentDate] || INITIAL_LOG(currentDate);
  const todayScore = calculateTotalScore(currentLog, weights);

  const saveLogs = useCallback((updatedLogs: Record<string, DailyLog>) => {
    setLogs(updatedLogs);
    localStorage.setItem('mizan_logs', JSON.stringify(updatedLogs));
  }, []);

  const saveWeights = (newWeights: AppWeights) => {
    setWeights(newWeights);
    localStorage.setItem('mizan_weights', JSON.stringify(newWeights));
  };

  const saveTarget = (newTarget: number) => {
    setTargetScore(newTarget);
    localStorage.setItem('mizan_target', newTarget.toString());
  };

  const updateLog = (updated: DailyLog) => {
    const newLogs = { ...logs, [updated.date]: updated };
    saveLogs(newLogs);
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
    if (activeTab === 'history') setActiveTab('dashboard');
  };

  const isToday = currentDate === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen pb-32 bg-slate-50">
      <header className="bg-emerald-800 text-white p-6 pb-24 rounded-b-[3.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-700 rounded-full -translate-y-24 translate-x-24 opacity-30 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-start mb-4 gap-4">
            <button onClick={() => setActiveTab('profile')} className="p-2 hover:bg-white/10 rounded-full transition-all flex-shrink-0">
              <UserCircle className={`w-7 h-7 ${user ? 'text-yellow-400' : 'text-white/50'}`} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold header-font tracking-tight drop-shadow-md leading-tight">إدارة العبادات والأوراد</h1>
            <button onClick={() => setActiveTab('leaderboard')} className="p-2 hover:bg-white/10 rounded-full transition-all relative flex-shrink-0">
              <Medal className="w-7 h-7 text-yellow-400" />
            </button>
          </div>
          <p className="text-emerald-50 quran-font text-xl opacity-95 max-w-sm px-4">{user ? `مرحباً، ${user.name}` : '"حاسِبوا أنفسَكم قبل أن تُحاسَبوا"'}</p>
          <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-3xl p-5 w-full max-w-md flex items-center justify-between border border-white/20 shadow-2xl relative">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400/20 p-3 rounded-2xl"><Trophy className="w-8 h-8 text-yellow-400" /></div>
              <div className="text-right">
                <p className="text-[10px] text-emerald-200 uppercase tracking-[0.2em] font-bold header-font">نقاط {isToday ? 'اليوم' : 'تاريخ الإدخال'}</p>
                <span className="text-3xl font-bold font-mono tabular-nums leading-none">{todayScore.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10 mx-2"></div>
            <button onClick={() => dateInputRef.current?.showPicker()} className="text-right flex flex-col items-end hover:bg-white/20 p-2 px-3 rounded-2xl transition-all group bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold header-font">{isToday ? 'اليوم' : format(new Date(currentDate.replace(/-/g, '/')), 'eeee', { locale: ar })}</p>
                <Calendar className="w-3 h-3 text-emerald-300" />
              </div>
              <div className="flex items-center gap-1">
                <p className="text-lg font-semibold header-font leading-tight">{format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM', { locale: ar })}</p>
                <ChevronDown className="w-3 h-3 text-white/50 group-hover:text-white" />
              </div>
              <input ref={dateInputRef} type="date" className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none" value={currentDate} onChange={(e) => handleDateChange(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-12 relative z-20 max-w-2xl mx-auto">
        {activeTab === 'dashboard' && <Dashboard log={currentLog} logs={logs} weights={weights} onDateChange={handleDateChange} targetScore={targetScore} onTargetChange={saveTarget} onOpenSettings={() => setActiveTab('profile')} />}
        {activeTab === 'entry' && <DailyEntry log={currentLog} onUpdate={updateLog} customSunnahs={weights.customSunnahs} />}
        {activeTab === 'timer' && <WorshipTimer onApplyTime={(field, mins) => {
          const newLog = { ...currentLog };
          if (field === 'shariDuration' || field === 'readingDuration') {
            const f = field as keyof typeof currentLog.knowledge;
            newLog.knowledge = { ...newLog.knowledge, [f]: newLog.knowledge[f] + mins };
          } else if (field === 'duhaDuration' || field === 'witrDuration' || field === 'qiyamDuration') {
            const f = field as keyof typeof currentLog.nawafil;
            newLog.nawafil = { ...newLog.nawafil, [f]: (newLog.nawafil[f] as number) + mins };
          }
          updateLog(newLog);
          setActiveTab('entry');
        }} />}
        {activeTab === 'leaderboard' && <Leaderboard user={user} currentScore={todayScore} logs={logs} weights={weights} />}
        {activeTab === 'notes' && <Reflections log={currentLog} onUpdate={updateLog} />}
        {activeTab === 'guide' && <WorshipGuide />}
        {activeTab === 'history' && <WorshipHistory logs={logs} weights={weights} />}
        {activeTab === 'contact' && <ContactUs />}
        {activeTab === 'profile' && <UserProfile user={user} weights={weights} onUpdateUser={(u) => { setUser(u); localStorage.setItem('mizan_user', JSON.stringify(u)); }} onUpdateWeights={saveWeights} />}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 shadow-2xl rounded-full px-4 py-3 flex items-center gap-4 md:gap-8 border border-slate-200 backdrop-blur-lg z-50 overflow-x-auto max-w-[95%]">
        {[
          {id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية'},
          {id: 'entry', icon: PenLine, label: 'تسجيل'},
          {id: 'timer', icon: Timer, label: 'مؤقت'},
          {id: 'leaderboard', icon: Medal, label: 'إنجازاتي'},
          {id: 'notes', icon: NotebookPen, label: 'يوميات'},
          {id: 'guide', icon: Info, label: 'دليل'},
          {id: 'history', icon: History, label: 'السجل'},
          {id: 'contact', icon: Mail, label: 'تواصل'}
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex flex-col items-center min-w-[3.5rem] transition-all duration-300 ${activeTab === tab.id ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[8px] mt-1 font-bold header-font">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;