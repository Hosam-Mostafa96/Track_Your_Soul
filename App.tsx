
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, PenLine, Timer as TimerIcon, 
  NotebookPen, UserCircle, Medal, Mail, Info, 
  Sparkles, Loader2, BarChart3, TrendingUp, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';

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

// إعداد عميل Supabase باستخدام الرابط والمفتاح المقدمين من المستخدم
const supabaseUrl = 'https://ihtizttdlpkyvuvdbfhi.supabase.co';
const supabaseAnonKey = 'sb_publishable_aTxQsRADxaWV3pkvuP5QTg_XgQ-9omL_';

// استخدام any لتجنب مشاكل توافق الأنواع في بيئة المتصفح
const supabase: any = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

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
  const [session, setSession] = useState<any>(null);
  const [weights, setWeights] = useState<AppWeights>(DEFAULT_WEIGHTS);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!supabase) {
      const savedLogs = localStorage.getItem('worship_logs');
      const savedUser = localStorage.getItem('worship_user');
      const savedWeights = localStorage.getItem('worship_weights');
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedWeights) setWeights(JSON.parse(savedWeights));
      setIsAppReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setIsAppReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setUser(null);
        setIsAppReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setUser(data);
    else if (error) console.error("Profile error:", error);
    await fetchUserLogs(userId);
  };

  const fetchUserLogs = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('worship_logs')
      .select('*')
      .eq('user_id', userId);
    
    if (data) {
      const logsMap: Record<string, DailyLog> = {};
      data.forEach(item => {
        logsMap[item.date] = item.data;
      });
      setLogs(logsMap);
    }
    setIsAppReady(true);
  };

  const updateLog = async (updated: DailyLog) => {
    const newLogs = { ...logs, [updated.date]: updated };
    setLogs(newLogs);
    localStorage.setItem('worship_logs', JSON.stringify(newLogs));
    
    if (session && supabase) {
      setIsSyncing(true);
      try {
        const { error } = await supabase
          .from('worship_logs')
          .upsert({ 
            user_id: session.user.id, 
            date: updated.date, 
            data: updated 
          }, { onConflict: 'user_id,date' });
        if (error) throw error;
      } catch (e) {
        console.error("Sync error:", e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleUpdateWeights = (newWeights: AppWeights) => {
    setWeights(newWeights);
    localStorage.setItem('worship_weights', JSON.stringify(newWeights));
  };

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
        <p className="text-emerald-100 font-bold header-font">جاري تحضير المحراب الخاص بك...</p>
      </div>
    );
  }

  if (!session && supabase) {
    return <Onboarding supabase={supabase} onComplete={() => {}} />;
  }

  const isLocalMode = !supabase;
  const currentLog = logs[currentDate] || INITIAL_LOG(currentDate);
  const todayScore = calculateTotalScore(currentLog, weights);

  return (
    <div className="min-h-screen pb-32 bg-slate-50">
      {isLocalMode && (
        <div className="bg-amber-500 text-white text-[10px] py-1 px-4 text-center font-bold flex items-center justify-center gap-2">
          <AlertCircle className="w-3 h-3" />
          وضع العمل المحلي (Supabase غير مكون) - لن يتم حفظ البيانات سحابياً
        </div>
      )}
      
      <header className="bg-emerald-800 text-white p-6 pb-24 rounded-b-[3.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-700 rounded-full -translate-y-24 translate-x-24 opacity-30 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-start mb-4 gap-4">
            <button onClick={() => setActiveTab('profile')} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <UserCircle className={`w-7 h-7 ${user ? 'text-yellow-400' : 'text-white/50'}`} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold header-font flex items-center gap-2">
              إدارة العبادات والأوراد
              {isSyncing && <Loader2 className="w-3 h-3 animate-spin opacity-50" />}
            </h1>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('contact')} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <Mail className="w-6 h-6 text-white/70" />
              </button>
              <button onClick={() => setActiveTab('leaderboard')} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <Medal className="w-7 h-7 text-yellow-400" />
              </button>
            </div>
          </div>
          <p className="text-emerald-50 quran-font text-xl opacity-95 max-w-sm px-4">
            {user ? `مرحباً، ${user.name}` : isLocalMode ? 'زائر' : 'جاري التحميل...'}
          </p>
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
        {activeTab === 'dashboard' && <Dashboard log={currentLog} logs={logs} weights={weights} onDateChange={setCurrentDate} targetScore={targetScore} onTargetChange={setTargetScore} onOpenSettings={() => setActiveTab('profile')} />}
        {activeTab === 'entry' && <DailyEntry log={currentLog} onUpdate={updateLog} weights={weights} onUpdateWeights={handleUpdateWeights} currentDate={currentDate} onDateChange={setCurrentDate} />}
        {activeTab === 'timer' && <WorshipTimer isSync={!isLocalMode} seconds={0} isRunning={false} selectedActivity="qiyamDuration" onToggle={()=>{}} onReset={()=>{}} onActivityChange={()=>{}} onApplyTime={()=>{}} />}
        {activeTab === 'leaderboard' && <Leaderboard user={user} currentScore={todayScore} logs={logs} weights={weights} isSync={!isLocalMode} />}
        {activeTab === 'notes' && <Reflections log={currentLog} onUpdate={updateLog} />}
        {activeTab === 'stats' && <Statistics user={user} logs={logs} weights={weights} />}
        {activeTab === 'patterns' && <WorshipPatterns logs={logs} weights={weights} />}
        {activeTab === 'guide' && <WorshipGuide />}
        {activeTab === 'history' && <WorshipHistory logs={logs} weights={weights} />}
        {activeTab === 'contact' && <ContactUs />}
        {activeTab === 'profile' && (
          <UserProfile 
            user={user} 
            weights={weights} 
            isGlobalSync={!isLocalMode} 
            onToggleSync={()=>{}} 
            onUpdateUser={() => {
              if (supabase) (supabase as any).auth.signOut();
              else setUser(null);
            }} 
            onUpdateWeights={handleUpdateWeights} 
          />
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 shadow-2xl rounded-full px-4 py-3 flex items-center gap-2 border border-slate-200 backdrop-blur-lg z-50 overflow-x-auto max-w-[95vw] no-scrollbar">
        {[
          {id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية'},
          {id: 'entry', icon: PenLine, label: 'تسجيل'},
          {id: 'timer', icon: TimerIcon, label: 'مؤقت'},
          {id: 'stats', icon: BarChart3, label: 'إحصائيات'},
          {id: 'patterns', icon: TrendingUp, label: 'الأنماط'},
          {id: 'leaderboard', icon: Medal, label: 'إنجازاتي'},
          {id: 'notes', icon: NotebookPen, label: 'يوميات'}
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex flex-col items-center min-w-[3.2rem] transition-all duration-300 ${activeTab === tab.id ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[7px] mt-1 font-bold header-font">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
