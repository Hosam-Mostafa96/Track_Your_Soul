
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
  Orbit 
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

import { DailyLog, PrayerName, TranquilityLevel, JihadFactor, AppWeights, User, Book } from './types';
import { calculateTotalScore } from './utils/scoring';
import { DEFAULT_WEIGHTS, GOOGLE_STATS_API } from './constants';
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
  type Tab = 'dashboard' | 'entry' | 'leaderboard' | 'timer' | 'library' | 'stats' | 'notes' | 'guide' | 'history' | 'profile' | 'contact';
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [books, setBooks] = useState<Book[]>([]);
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [targetScore, setTargetScore] = useState(5000);
  const [user, setUser] = useState<User | null>(null);
  const [weights, setWeights] = useState<AppWeights>(DEFAULT_WEIGHTS);
  const [isGlobalSyncEnabled, setIsGlobalSyncEnabled] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isSubhaOpen, setIsSubhaOpen] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeActivity, setActiveActivity] = useState('qiyamDuration');
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [pomodoroGoal, setPomodoroGoal] = useState(25 * 60);

  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as Tab;
    if (tabParam) {
      setActiveTab(tabParam);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    const scheduleMidnightUpdate = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();
      return setTimeout(() => {
        setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
        scheduleMidnightUpdate();
      }, msUntilMidnight);
    };
    const timerId = scheduleMidnightUpdate();
    return () => clearTimeout(timerId);
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

  useEffect(() => {
    const savedLogs = localStorage.getItem('worship_logs');
    const savedBooks = localStorage.getItem('worship_books');
    const savedTarget = localStorage.getItem('worship_target');
    const savedUser = localStorage.getItem('worship_user');
    const savedSync = localStorage.getItem('worship_global_sync');
    const savedWeights = localStorage.getItem('worship_weights');
    const savedPomodoro = localStorage.getItem('worship_pomodoro_goal');
    
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedBooks) setBooks(JSON.parse(savedBooks));
    if (savedTarget) setTargetScore(parseInt(savedTarget));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedSync) setIsGlobalSyncEnabled(JSON.parse(savedSync));
    if (savedWeights) setWeights(JSON.parse(savedWeights));
    if (savedPomodoro) setPomodoroGoal(parseInt(savedPomodoro));
    
    setIsAppReady(true);
  }, []);

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

  const addBook = (title: string, totalPages: number) => {
    const newBook: Book = {
      id: Math.random().toString(36).substring(7),
      title,
      totalPages,
      currentPages: 0,
      startDate: new Date().toISOString(),
      isFinished: false
    };
    const newBooks = [newBook, ...books];
    setBooks(newBooks);
    localStorage.setItem('worship_books', JSON.stringify(newBooks));
  };

  const deleteBook = (id: string) => {
    if (window.confirm('هل تريد حذف هذا الكتاب من سجلاتك؟')) {
      const newBooks = books.filter(b => b.id !== id);
      setBooks(newBooks);
      localStorage.setItem('worship_books', JSON.stringify(newBooks));
    }
  };

  const updateBookProgress = (book: Book, pagesReadToday: number) => {
    const newCurrent = Math.min(book.currentPages + pagesReadToday, book.totalPages);
    const isFinished = newCurrent >= book.totalPages;
    
    const updatedBooks = books.map(b => 
      b.id === book.id 
      ? { ...b, currentPages: newCurrent, isFinished, finishDate: isFinished ? new Date().toISOString() : b.finishDate } 
      : b
    );
    
    setBooks(updatedBooks);
    localStorage.setItem('worship_books', JSON.stringify(updatedBooks));

    const newLog = { ...currentLog };
    newLog.knowledge = { 
      ...newLog.knowledge, 
      readingPages: (newLog.knowledge.readingPages || 0) + pagesReadToday 
    };
    updateLog(newLog);
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
        installPrompt={null}
        onComplete={(userData, restoredLogs, restoredBooks) => {
          setUser(userData);
          localStorage.setItem('worship_user', JSON.stringify(userData));
          if (restoredLogs) {
            setLogs(JSON.parse(restoredLogs));
            localStorage.setItem('worship_logs', restoredLogs);
          }
          if (restoredBooks) {
            setBooks(JSON.parse(restoredBooks));
            localStorage.setItem('worship_books', restoredBooks);
          }
          setIsGlobalSyncEnabled(true);
          localStorage.setItem('worship_global_sync', JSON.stringify(true));
        }} 
      />
    );
  }

  const navItems = [
    {id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية'},
    {id: 'entry', icon: PenLine, label: 'تسجيل'},
    {id: 'leaderboard', icon: Medal, label: 'إنجازاتى'},
    {id: 'timer', icon: TimerIcon, label: 'المؤقت'},
    {id: 'library', icon: Library, label: 'المكتبة'},
    {id: 'stats', icon: BarChart3, label: 'إحصائيات'},
    {id: 'notes', icon: NotebookPen, label: 'يوميات'}
  ];

  return (
    <div className="min-h-screen pb-32 bg-slate-50 text-right transition-colors duration-300" dir="rtl">
      <header className="bg-emerald-800 text-white p-6 pb-24 rounded-b-[3.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-700 rounded-full -translate-y-24 translate-x-24 opacity-30 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-start mb-4 gap-4">
            <button onClick={() => setActiveTab('profile')} className="p-2 hover:bg-white/10 rounded-full transition-all flex-shrink-0">
              <UserCircle className={`w-7 h-7 ${user ? 'text-yellow-400' : 'text-white/50'}`} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold header-font">إدارة العبادات والأوراد</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsSubhaOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-all flex-shrink-0 relative"
              >
                <Orbit className="w-6 h-6 text-yellow-400 animate-spin-slow" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                </span>
              </button>
              <button onClick={() => setActiveTab('contact')} className="p-2 hover:bg-white/10 rounded-full transition-all flex-shrink-0 relative">
                <Mail className="w-6 h-6 text-white/70" />
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-emerald-800"></div>
              </button>
              <button onClick={() => setActiveTab('guide')} className="p-2 hover:bg-white/10 rounded-full transition-all flex-shrink-0">
                <Info className="w-6 h-6 text-white/70" />
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
        {activeTab === 'dashboard' && (
          <Dashboard 
            log={currentLog} 
            logs={logs} 
            weights={weights} 
            onDateChange={setCurrentDate} 
            targetScore={targetScore} 
            onTargetChange={(s) => { setTargetScore(s); localStorage.setItem('worship_target', s.toString()); }} 
            onOpenSettings={() => setActiveTab('profile')}
            books={books}
            onUpdateBook={updateBookProgress}
            onSwitchTab={setActiveTab}
          />
        )}
        {activeTab === 'entry' && <DailyEntry log={currentLog} onUpdate={updateLog} weights={weights} onUpdateWeights={handleUpdateWeights} currentDate={currentDate} onDateChange={setCurrentDate} />}
        {activeTab === 'library' && (
          <BookLibrary 
            books={books} 
            onAddBook={addBook} 
            onDeleteBook={deleteBook} 
            onUpdateProgress={(id, pages) => {
              const b = books.find(book => book.id === id);
              if (b) updateBookProgress(b, pages);
            }} 
          />
        )}
        {activeTab === 'leaderboard' && <Leaderboard user={user} currentScore={todayScore} isSync={isGlobalSyncEnabled} />}
        {activeTab === 'timer' && (
          <WorshipTimer 
            isSync={isGlobalSyncEnabled} 
            seconds={timerSeconds} 
            isRunning={isTimerRunning} 
            selectedActivity={activeActivity} 
            onToggle={() => setIsTimerRunning(!isTimerRunning)} 
            onReset={resetTimer} 
            onActivityChange={setActiveActivity} 
            userEmail={user?.email} 
            timerMode={timerMode}
            onTimerModeChange={setTimerMode}
            pomodoroGoal={pomodoroGoal}
            onPomodoroGoalChange={(g) => { setPomodoroGoal(g); localStorage.setItem('worship_pomodoro_goal', g.toString()); }}
            onApplyTime={(field, mins) => {
              const newLog = { ...currentLog };
              if (field === 'shariDuration' || field === 'readingDuration') { 
                newLog.knowledge = { ...newLog.knowledge, [field]: (newLog.knowledge[field] || 0) + mins }; 
              } 
              else if (field === 'duhaDuration' || field === 'witrDuration' || field === 'qiyamDuration') { 
                newLog.nawafil = { ...newLog.nawafil, [field]: (newLog.nawafil[field] || 0) + mins }; 
              }
              updateLog(newLog); 
              resetTimer();
          }} />
        )}
        {activeTab === 'stats' && <Statistics user={user} logs={logs} weights={weights} books={books} />}
        {activeTab === 'notes' && <Reflections log={currentLog} onUpdate={updateLog} />}
        {activeTab === 'guide' && <WorshipGuide />}
        {activeTab === 'history' && <WorshipHistory logs={logs} weights={weights} />}
        {activeTab === 'contact' && <ContactUs />}
        {activeTab === 'profile' && <UserProfile user={user} weights={weights} isGlobalSync={isGlobalSyncEnabled} onToggleSync={(enabled) => { setIsGlobalSyncEnabled(enabled); localStorage.setItem('worship_global_sync', JSON.stringify(enabled)); }} onUpdateUser={(u) => { setUser(u); localStorage.setItem('worship_user', JSON.stringify(u)); }} onUpdateWeights={handleUpdateWeights} />}
      </main>

      <Subha 
        isOpen={isSubhaOpen} 
        onClose={() => setIsSubhaOpen(false)} 
        log={currentLog} 
        onUpdateLog={updateLog} 
      />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 shadow-2xl rounded-full px-4 py-3 flex items-center gap-2 border border-slate-200 backdrop-blur-lg z-50 overflow-x-auto max-w-[95vw] no-scrollbar">
        {navItems.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex flex-col items-center min-w-[3.6rem] transition-all duration-300 ${activeTab === tab.id ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {tab.id === 'timer' && isTimerRunning && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}
            </div>
            <span className="text-[8px] mt-1 font-bold header-font whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
