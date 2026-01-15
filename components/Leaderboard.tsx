
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2 } from 'lucide-react';
import { DailyLog, AppWeights, User } from '../types';

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzbkn4MVK27wrmAhkDvKjZdq01vOQWG7-SFDOltC4e616Grjp-uMsON4cVcr3OOVKqg/exec"; 

interface LeaderboardProps {
  user: User | null;
  currentScore: number;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  isSync: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, currentScore, isSync }) => {
  const [liveStats, setLiveStats] = useState({
    qiyam: 0, duha: 0, knowledge: 0, athkar: 0, totalUsers: 0
  });
  const [globalTop, setGlobalTop] = useState<any[]>([]);
  const [userGlobalRank, setUserGlobalRank] = useState<number | string>("---");
  const [isLoading, setIsLoading] = useState(false);
  const anonId = useRef(localStorage.getItem('mizan_anon_id') || Math.random().toString(36).substring(7));
  
  const fetchGlobalData = async () => {
    if (!isSync || GOOGLE_STATS_API.includes("FIX_ME")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          id: anonId.current,
          name: user?.name || "مصلٍ مجهول",
          score: currentScore
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.stats) setLiveStats(data.stats);
        if (data.leaderboard) setGlobalTop(data.leaderboard);
        if (data.userRank) setUserGlobalRank(data.userRank);
      }
    } catch (e) {
      console.error("Global Sync Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    // تحديث كل 5 ثوانٍ بناءً على طلب المستخدم لتجربة لحظية فائقة السرعة
    const interval = setInterval(fetchGlobalData, 5000); 
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.name]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-4 bg-white/10 rounded-full mb-4 backdrop-blur-md">
            <Trophy className="w-10 h-10 text-yellow-400 fill-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold header-font">مقامك العالمي</h2>
          {isSync ? (
            <div className="mt-2 flex flex-col items-center">
                <span className="text-4xl font-black font-mono text-yellow-400">
                  {userGlobalRank === "---" ? "..." : `#${userGlobalRank}`}
                </span>
                <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mt-1 opacity-80">ترتيبك بين جميع المتعبدين</p>
            </div>
          ) : (
            <p className="text-emerald-100 text-[11px] font-bold header-font opacity-80 mt-1 uppercase tracking-widest">المزامنة معطلة</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className={`w-5 h-5 ${isSync ? 'text-emerald-500' : 'text-slate-300'}`} />
            <h3 className="font-bold text-slate-800 header-font text-sm">نبض المحراب الآن</h3>
          </div>
          {isSync && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> بث مباشر
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
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-emerald-100 transition-all">
              <div className="flex items-center gap-2 mb-1">
                {s.icon} <span className="text-[10px] font-bold text-slate-500 header-font">{s.label}</span>
              </div>
              <span className="text-xl font-black text-slate-800 font-mono">{s.val}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[9px] text-center text-slate-400 font-bold header-font italic">إجمالي المتصلين بالمحراب حالياً: {liveStats.totalUsers} متعبد</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-slate-800 header-font text-sm uppercase tracking-wider">المتصدرون عالمياً</h3>
          </div>
          {isLoading && <Loader2 className="w-3 h-3 text-slate-300 animate-spin" />}
        </div>

        <div className="space-y-3">
          {globalTop.length > 0 ? globalTop.map((player, index) => (
            <div key={player.id} className={`flex items-center justify-between p-3 rounded-2xl ${player.id === anonId.current ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border-transparent'}`}>
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
            <p className="text-center text-[10px] text-slate-400 font-bold py-4 italic">قائمة المتصدرين فارغة حالياً</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
