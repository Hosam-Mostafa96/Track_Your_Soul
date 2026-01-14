import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Trophy, Medal, Crown, Sparkles, Flame, Zap, Moon, Sun, Stars, GraduationCap, BookOpen, AlertCircle, User, TrendingUp, CalendarDays, ShieldCheck, Radio, Activity, Users, Globe, ArrowUp, History } from 'lucide-react';
import { DailyLog, AppWeights } from '../types';
import { calculateTotalScore } from '../utils/scoring';

// استبدل هذا الرابط بالرابط الذي حصلت عليه من Google Apps Script بعد النشر (Deploy)
const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzkeDYwB-XGbaDFOeQur9m_sLG6jtMU40eP7Y71GTOCY0m3bRzkDmY8dPjjxwY1fSvq/exec"; 

interface LeaderboardProps {
  user: { name: string, email: string } | null;
  currentScore: number;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  isSync: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, currentScore, logs, weights, isSync }) => {
  const [liveStats, setLiveStats] = useState({
    qiyam: 0, duha: 0, knowledge: 0, athkar: 0, totalUsers: 0
  });
  const [globalTop, setGlobalTop] = useState<any[]>([]);
  const [userGlobalRank, setUserGlobalRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const anonId = useRef(localStorage.getItem('mizan_anon_id') || Math.random().toString(36).substring(7));
  
  useEffect(() => {
    localStorage.setItem('mizan_anon_id', anonId.current);
  }, []);

  const fetchGlobalData = async () => {
    if (!isSync || GOOGLE_STATS_API.includes("FIX_ME")) return;
    
    setIsLoading(true);
    try {
      // 1. إرسال نقاط المستخدم الحالية ليتم تسجيله في القائمة
      await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          id: anonId.current,
          name: user?.name || "مصلٍ مجهول",
          score: currentScore
        })
      });

      // 2. جلب البيانات المحدثة
      const res = await fetch(`${GOOGLE_STATS_API}?userId=${anonId.current}`);
      if (res.ok) {
        const data = await res.json();
        setLiveStats(data.stats);
        setGlobalTop(data.leaderboard);
        setUserGlobalRank(data.userRank);
      }
    } catch (e) {
      console.error("Global Sync Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(fetchGlobalData, 60000); // تحديث كل دقيقة
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.name]);

  const personalTopScores = useMemo(() => {
    return (Object.entries(logs) as [string, DailyLog][])
      .map(([date, log]) => ({
        date,
        score: calculateTotalScore(log, weights)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [logs, weights]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* User Status Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-4 bg-white/10 rounded-full mb-4 backdrop-blur-md">
            <Trophy className="w-10 h-10 text-yellow-400 fill-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold header-font">مقامك العالمي</h2>
          {isSync && userGlobalRank ? (
            <div className="mt-2 flex flex-col items-center">
                <span className="text-4xl font-black font-mono text-yellow-400">#{userGlobalRank}</span>
                <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mt-1 opacity-80">ترتيبك بين جميع المتعبدين</p>
            </div>
          ) : (
            <p className="text-emerald-100 text-[11px] font-bold header-font opacity-80 mt-1 uppercase tracking-widest">
                {isSync ? "جاري جلب ترتيبك..." : "المزامنة معطلة"}
            </p>
          )}
        </div>
      </div>

      {/* Global Pulse (Live Now) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className={`w-5 h-5 ${isSync ? 'text-emerald-500' : 'text-slate-300'}`} />
            <h3 className="font-bold text-slate-800 header-font text-sm">نبض المحراب الآن</h3>
          </div>
          {isSync && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Data
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'يقيمون الليل', val: liveStats.qiyam, icon: <Moon className="w-3 h-3 text-indigo-500" /> },
            { label: 'يصلون الضحى', val: liveStats.duha, icon: <Sun className="w-3 h-3 text-amber-500" /> },
            { label: 'طلاب علم', val: liveStats.knowledge, icon: <GraduationCap className="w-3 h-3 text-emerald-500" /> },
            { label: 'ذاكرون', val: liveStats.athkar, icon: <Activity className="w-3 h-3 text-rose-500" /> }
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-transparent">
              <div className="flex items-center gap-2 mb-1">
                {s.icon}
                <span className="text-[10px] font-bold text-slate-500 header-font">{s.label}</span>
              </div>
              <span className="text-lg font-black text-slate-800 font-mono">{isLoading && liveStats.totalUsers === 0 ? '..' : s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Global Leaderboard (Top 10) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-slate-800 header-font text-sm uppercase tracking-wider">المتصدرون عالمياً</h3>
        </div>

        <div className="space-y-3">
          {globalTop.length > 0 ? globalTop.map((player, index) => (
            <div key={player.id} className={`flex items-center justify-between p-3 rounded-2xl ${player.id === anonId.current ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-transparent'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-slate-300 text-white' : index === 2 ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>
                    {index + 1}
                </span>
                <span className={`text-xs font-bold header-font ${player.id === anonId.current ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {player.name} {player.id === anonId.current && "(أنت)"}
                </span>
              </div>
              <span className="text-sm font-black text-slate-800 font-mono">{player.score.toLocaleString()}</span>
            </div>
          )) : (
            <p className="text-center text-[10px] text-slate-400 font-bold py-4">فعل المزامنة لتظهر هنا!</p>
          )}
        </div>
      </div>

      {/* Personal History */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          {/* Fix: Added History icon import from lucide-react to avoid conflict with browser window.History */}
          <History className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-slate-800 header-font text-sm uppercase tracking-wider">سجلك الشخصي (أفضل 5)</h3>
        </div>
        <div className="space-y-3">
          {personalTopScores.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-bold text-slate-600 header-font">{entry.date}</span>
              <span className="text-sm font-black text-emerald-600 font-mono">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
