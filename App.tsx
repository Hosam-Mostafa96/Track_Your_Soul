
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
  Library,
  Orbit,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

import { DailyLog, PrayerName, TranquilityLevel, JihadFactor, AppWeights, User, Book } from './types';
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
import BookLibrary from './components/BookLibrary';
import Subha from './components/Subha';
import QuranPage from './components/QuranPage';

const INITIAL_LOG = (date: string): DailyLog => ({
  date,
  prayers: {
    [PrayerName.FAJR]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
    [PrayerName.DHUHR]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
    [PrayerName.ASR]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
    [PrayerName.MAGHRIB]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
    [PrayerName.ISHA]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
  },
  quran: { hifzRub: 0, revisionRub: 0, todayPortion: '', tasksCompleted: [] },
  knowledge: { shariDuration: 0, readingDuration: 0, readingPages: 0 },
  athkar: {
    checklists: { morning: false, evening: false, sleep: false, travel: false },
    counters: { salawat: 0, hawqalah: 0, tahlil: 0, baqiyat: 0, istighfar: 0 }
  },
  nawafil: {
    duhaDuration: 0, witrDuration: 0, qiyamDuration: 0, fasting: false, custom: []
  },
  sleep: { sessions: [] },
  customSunnahIds: [],
  jihadFactor: JihadFactor.NORMAL,
  hasBurden: false,
  isRepented: true,
  isSupplicatingAloud: false,
  notes: '',
  reflections: []
});

const App: React.FC = () => {
  type Tab = 'dashboard' | 'entry' | 'leaderboard' | 'timer' | 'subha' | 'quran' | 'library' | 'stats' | 'notes' | 'profile' | 'history' | 'contact' | 'guide';
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [books, setBooks] = useState<Book[]>([]);
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [targetScore, setTargetScore] = useState(5000);
  const [user, setUser] = useState<User | null>(null);
  const [weights, setWeights] = useState<AppWeights>(DEFAULT_WEIGHTS);
  const [isGlobalSyncEnabled, setIsGlobalSyncEnabled] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeActivity, setActiveActivity] = useState('qiyamDuration');
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [pomodoroGoal, setPomodoroGoal] = useState(25 * 60);

  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);

  // Quran Plan State
  const [quranPlan, setQuranPlan] = useState<'new_1' | 'new_2' | 'itqan_3' | 'itqan_4'>('new_1');

  useEffect(() => {
    const safeLoad = (key: string, fallback: any) => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return fallback;
        const parsed = JSON.parse(item);
        if (key === 'worship_logs') {
          Object.keys(parsed).forEach(date => {
            if (!parsed[date].quran) parsed[date].quran = INITIAL_LOG(date).quran;
            if (parsed[date].quran && !parsed[date].quran.tasksCompleted) parsed[date].quran.tasksCompleted = [];
            if (!parsed[date].athkar) parsed[date].athkar = INITIAL_LOG(date).athkar;
          });
        }
        return parsed;
      } catch (e) { return fallback; }
    };

    setLogs(safeLoad('worship_logs', {}));
    setBooks(safeLoad('worship_books', []));
    setTargetScore(safeLoad('worship_target', 5000));
    setUser(safeLoad('worship_user', null));
    setIsGlobalSyncEnabled(safeLoad('worship_global_sync', false));
    setWeights(safeLoad('worship_weights', DEFAULT_WEIGHTS));
    setQuranPlan(localStorage.getItem('worship_quran_plan') as any || 'new_1');
    setPomodoroGoal(safeLoad('worship_pomodoro_goal', 25 * 60));
    setIsAppReady(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as Tab;
    if (tabParam) {
      setActiveTab(tabParam);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      startTimeRef.current = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        if (startTimeRef.current !== null) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setTimerSeconds(accumulatedSecondsRef.current + elapsed);
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      accumulatedSecondsRef.current = timerSeconds;
      startTimeRef.current = null;
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isTimerRunning]);

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    accumulatedSecondsRef.current = 0;
    startTimeRef.current = null;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const currentLog = logs[currentDate] || INITIAL_LOG(currentDate);
  const todayScore = calculateTotalScore(currentLog, weights);

  useEffect(() => {
    if (isAppReady) {
      localStorage.setItem('today_score_cache', todayScore.toString());
    }
  }, [todayScore, isAppReady]);

  const updateLog = (updated: DailyLog) => {
    const newLogs = { ...logs, [updated.date]: updated };
    setLogs(newLogs);
    localStorage.setItem('worship_logs', JSON.stringify(newLogs));
  };

  const navItems = [
    {id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية'},
    {id: 'entry', icon: PenLine, label: 'تسجيل'},
    {id: 'leaderboard', icon: Medal, label: 'المنافسة'},
    {id: 'timer', icon: TimerIcon, label: 'المؤقت'},
    {id: 'subha', icon: Orbit, label: 'السبحة'},
    {id: 'quran', icon: BookOpen, label: 'القرآن'},
    {id: 'library', icon: Library, label: 'المكتبة'},
    {id: 'stats', icon: BarChart3, label: 'الإحصائيات'},
    {id: 'notes', icon: NotebookPen, label: 'اليوميات'},
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          log={currentLog} 
          logs={logs} 
          weights={weights} 
          onDateChange={setCurrentDate} 
          targetScore={targetScore} 
          onTargetChange={(s) => { setTargetScore(s); localStorage.setItem('worship_target', s.toString()); }} 
          onOpenSettings={() => setActiveTab('profile')}
          books={books}
          onUpdateBook={(b, p) => { 
            const newCurrent = Math.min(b.currentPages + p, b.totalPages);
            const isFinished = newCurrent >= b.totalPages;
            const updatedBooks = books.map(book => 
              book.id === b.id ? { ...book, currentPages: newCurrent, isFinished, finishDate: isFinished ? new Date().toISOString() : b.finishDate } : book
            );
            setBooks(updatedBooks);
            localStorage.setItem('worship_books', JSON.stringify(updatedBooks));
            const newLog = { ...currentLog };
            newLog.knowledge = { ...newLog.knowledge, readingPages: (newLog.knowledge.readingPages || 0) + p };
            updateLog(newLog);
          }}
          onSwitchTab={setActiveTab}
        />;
      case 'entry':
        return <DailyEntry log={currentLog} onUpdate={updateLog} weights={weights} onUpdateWeights={(w) => { setWeights(w); localStorage.setItem('worship_weights', JSON.stringify(w)); }} currentDate={currentDate} onDateChange={setCurrentDate} />;
      case 'leaderboard':
        return <Leaderboard user={user} currentScore={todayScore} isSync={isGlobalSyncEnabled} />;
      case 'timer':
        return <WorshipTimer isSync={isGlobalSyncEnabled} seconds={timerSeconds} isRunning={isTimerRunning} selectedActivity={activeActivity} onToggle={() => setIsTimerRunning(!isTimerRunning)} onReset={resetTimer} onActivityChange={setActiveActivity} userEmail={user?.email} timerMode={timerMode} onTimerModeChange={setTimerMode} pomodoroGoal={pomodoroGoal} onPomodoroGoalChange={(g) => { setPomodoroGoal(g); localStorage.setItem('worship_pomodoro_goal', g.toString()); }} onApplyTime={(field, mins) => { const newLog = { ...currentLog }; if (field === 'shariDuration' || field === 'readingDuration') { newLog.knowledge = { ...newLog.knowledge, [field]: (newLog.knowledge[field] || 0) + mins }; } else if (field === 'duhaDuration' || field === 'witrDuration' || field === 'qiyamDuration') { newLog.nawafil = { ...newLog.nawafil, [field]: (newLog.nawafil[field] || 0) + mins }; } updateLog(newLog); resetTimer(); }} />;
      case 'subha':
        return <Subha log={currentLog} onUpdateLog={updateLog} />;
      case 'quran':
        return <QuranPage log={currentLog} logs={logs} plan={quranPlan} onUpdatePlan={(p) => { setQuranPlan(p); localStorage.setItem('worship_quran_plan', p); }} onUpdateLog={updateLog} />;
      case 'library':
        return <BookLibrary books={books} onAddBook={(t, p) => { const nb = { id: Math.random().toString(36).substring(7), title: t, totalPages: p, currentPages: 0, startDate: new Date().toISOString(), isFinished: false }; setBooks([nb, ...books]); localStorage.setItem('worship_books', JSON.stringify([nb, ...books])); }} onDeleteBook={(id) => { if (window.confirm('حذف؟')) { const nb = books.filter(b => b.id !== id); setBooks(nb); localStorage.setItem('worship_books', JSON.stringify(nb)); } }} onUpdateProgress={() => {}} />;
      case 'stats':
        return <Statistics user={user} logs={logs} weights={weights} books={books} />;
      case 'notes':
        return <Reflections log={currentLog} onUpdate={updateLog} />;
      case 'profile':
        return <UserProfile user={user} weights={weights} isGlobalSync={isGlobalSyncEnabled} onToggleSync={setIsGlobalSyncEnabled} onUpdateUser={setUser} onUpdateWeights={setWeights} />;
      case 'history':
        return <WorshipHistory logs={logs} weights={weights} />;
      case 'guide':
        return <WorshipGuide />;
      case 'contact':
        return <ContactUs />;
      default:
        return <Dashboard log={currentLog} logs={logs} weights={weights} onDateChange={setCurrentDate} targetScore={targetScore} onTargetChange={() => {}} onOpenSettings={() => {}} books={[]} onUpdateBook={() => {}} onSwitchTab={() => {}} />;
    }
  };

  if (!isAppReady) return <div className="min-h-screen bg-emerald-900 flex items-center justify-center"><Loader2 className="w-10 h-10 text-emerald-400 animate-spin" /></div>;

  if (!user) return <Onboarding installPrompt={null} onComplete={(u) => { setUser(u); localStorage.setItem('worship_user', JSON.stringify(u)); }} />;

  return (
    <div className="min-h-screen pb-32 bg-slate-50 text-right transition-colors duration-300" dir="rtl">
      <header className="bg-emerald-800 text-white p-6 pb-24 rounded-b-[3.5rem] shadow-xl relative overflow-hidden z-30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-700 rounded-full -translate-y-24 translate-x-24 opacity-30 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-start mb-4 gap-2">
            <button onClick={() => setActiveTab('profile')} className="p-3 hover:bg-white/10 rounded-full transition-all flex-shrink-0 active:scale-95">
              <UserCircle className={`w-7 h-7 ${user ? 'text-yellow-400' : 'text-white/50'}`} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold header-font self-center truncate">إدارة العبادات والأوراد</h1>
            <div className="flex gap-1 items-center">
              <button onClick={() => setActiveTab('contact')} className="p-3 hover:bg-white/10 rounded-full transition-all flex-shrink-0 relative active:scale-95">
                <Mail className={`w-6 h-6 ${activeTab === 'contact' ? 'text-yellow-400' : 'text-white/70'}`} />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-emerald-800"></div>
              </button>
              <button onClick={() => setActiveTab('guide')} className="p-3 hover:bg-white/10 rounded-full transition-all flex-shrink-0 active:scale-95">
                <Info className={`w-6 h-6 ${activeTab === 'guide' ? 'text-yellow-400' : 'text-white/70'}`} />
              </button>
            </div>
          </div>
          <p className="text-emerald-50 quran-font text-xl opacity-95 max-w-sm px-4">{user ? `مرحباً، ${user.name}` : '"حاسِبوا أنفسَكم قبل أن تُحاسَبوا"'}</p>
          <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-3xl p-5 w-full max-md:max-w-md flex items-center justify-between border border-white/20 shadow-2xl relative">
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
        {renderContent()}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 shadow-2xl rounded-full px-4 py-3 flex items-center gap-1 border border-slate-200 backdrop-blur-lg z-50 overflow-x-auto max-w-[98vw] no-scrollbar">
        {navItems.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as Tab)} 
            className={`flex flex-col items-center min-w-[3.6rem] px-1 transition-all duration-300 ${activeTab === tab.id ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {tab.id === 'timer' && isTimerRunning && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}
            </div>
            <span className="text-[7px] mt-1 font-bold header-font whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
