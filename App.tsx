
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, PenLine, Medal, UserCircle, Sparkles, Loader2, BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';

import { DailyLog, PrayerName, TranquilityLevel, JihadFactor, AppWeights, User } from './types';
import { calculateTotalScore } from './utils/scoring';
import { DEFAULT_WEIGHTS } from './constants';
import Dashboard from './components/Dashboard';
import DailyEntry from './components/DailyEntry';
import UserProfile from './components/UserProfile';
import Leaderboard from './components/Leaderboard';
import Onboarding from './components/Onboarding';
import Statistics from './components/Statistics';

// إعداد عميل Supabase
const supabaseUrl = (process.env as any).SUPABASE_URL || 'https://ihtizttdlpkyvuvdbfhi.supabase.co';
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY || 'sb_publishable_aTxQsRADxaWV3pkvuP5QTg_XgQ-9omL_';

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
  nawafil: { duhaDuration: 0, witrDuration: 0, qiyamDuration: 0, fasting: false, custom: [] },
  customSunnahIds: [],
  jihadFactor: JihadFactor.NORMAL,
  hasBurden: false,
  isRepented: true,
  isSupplicatingAloud: false,
  notes: '',
  reflections: []
});

const App: React.FC = () => {
  type Tab = 'dashboard' | 'entry' | 'leaderboard' | 'stats' | 'profile';
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
      if (savedLogs) setLogs(JSON.parse(savedLogs));
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
      else { setUser(null); setIsAppReady(true); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setUser(data);
    await fetchUserLogs(userId);
  };

  const fetchUserLogs = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('worship_logs').select('*').eq('user_id', userId);
    if (data) {
      const logsMap: Record<string, DailyLog> = {};
      // تحديد نوع item بشكل صريح لتجنب خطأ TS7006
      data.forEach((item: any) => { 
        if (item.date && item.data) {
          logsMap[item.date] = item.data; 
        }
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
        await supabase.from('worship_logs').upsert({ 
          user_id: session.user.id, 
          date: updated.date, 
          data: updated 
        }, { onConflict: 'user_id,date' });
      } catch (e) { console.error(e); } finally { setIsSyncing(false); }
    }
  };

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
        <p className="text-emerald-100 font-bold header-font">جاري تحضير المحراب الخاص بك...</p>
      </div>
    );
  }

  if (!session && supabase) return <Onboarding supabase={supabase} onComplete={() => {}} />;

  const currentLog = logs[currentDate] || INITIAL_LOG(currentDate);
  const todayScore = calculateTotalScore(currentLog, weights);

  return (
    <div className="min-h-screen pb-32 bg-slate-50">
      <header className="bg-emerald-800 text-white p-6 pb-24 rounded-b-[3.5rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-start mb-4 gap-4">
            <button onClick={() => setActiveTab('profile')} className="p-2 hover:bg-white/10 rounded-full transition-all"><UserCircle className="w-7 h-7 text-white" /></button>
            <h1 className="text-xl md:text-2xl font-bold header-font">إدارة العبادات والأوراد</h1>
            <button onClick={() => setActiveTab('leaderboard')} className="p-2 hover:bg-white/10 rounded-full transition-all"><Medal className="w-7 h-7 text-yellow-400" /></button>
          </div>
          <p className="text-emerald-50 quran-font text-xl opacity-95">{user?.name || 'مرحباً بك'}</p>
          <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-3xl p-5 w-full max-w-md flex items-center justify-between border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <div className="text-right">
                <p className="text-[10px] text-emerald-200 font-bold uppercase header-font">الرصيد الروحي {isSyncing && "..."}</p>
                <span className="text-3xl font-bold font-mono">{todayScore.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-12 relative z-20 max-w-2xl mx-auto">
        {activeTab === 'dashboard' && <Dashboard log={currentLog} logs={logs} weights={weights} onDateChange={setCurrentDate} targetScore={targetScore} onTargetChange={setTargetScore} onOpenSettings={() => setActiveTab('profile')} />}
        {activeTab === 'entry' && <DailyEntry log={currentLog} onUpdate={updateLog} weights={weights} onUpdateWeights={setWeights} currentDate={currentDate} onDateChange={setCurrentDate} />}
        {activeTab === 'leaderboard' && <Leaderboard user={user} currentScore={todayScore} logs={logs} weights={weights} isSync={!!supabase} />}
        {activeTab === 'stats' && <Statistics user={user} logs={logs} weights={weights} />}
        {activeTab === 'profile' && <UserProfile user={user} weights={weights} isGlobalSync={!!supabase} onToggleSync={() => {}} onUpdateUser={setUser} onUpdateWeights={setWeights} />}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 shadow-2xl rounded-full px-4 py-3 flex items-center gap-2 border border-slate-200 backdrop-blur-lg z-50 overflow-x-auto max-w-[95vw] no-scrollbar">
        {[
          {id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية'},
          {id: 'entry', icon: PenLine, label: 'تسجيل'},
          {id: 'stats', icon: BarChart3, label: 'إحصائيات'},
          {id: 'leaderboard', icon: Medal, label: 'إنجازاتي'}
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex flex-col items-center min-w-[4rem] transition-all duration-300 ${activeTab === tab.id ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[8px] mt-1 font-bold header-font">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
