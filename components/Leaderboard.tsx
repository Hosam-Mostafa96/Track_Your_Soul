
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Hash } from 'lucide-react';
import { DailyLog, AppWeights, User } from '../types';

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzFA2kvdLqForyWidmHUYY5xu0ZSLV2DXkWUvi5JAweeqz_vyKnAZlhADBxARx5KFM/exec"; 

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
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const fetchGlobalData = async (isSilent = false) => {
    if (!user?.email || GOOGLE_STATS_API.includes("FIX_ME")) return;
    
    if (!isSilent) setIsLoading(true);
    try {
      const res = await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify({
          action: 'getStats',
          email: user.email.toLowerCase().trim(),
          name: user.name || "مصلٍ مجهول",
          score: currentScore,
          isSyncEnabled: isSync 
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.leaderboard) {
          const uniqueMap = new Map();
          data.leaderboard.forEach((entry: any) => {
            const emailKey = (entry.email || entry.name || "").toLowerCase().trim();
            if (!emailKey) return;
            const score = parseInt(entry.score) || 0;
            if (!uniqueMap.has(emailKey) || uniqueMap.get(emailKey).score < score) {
              uniqueMap.set(emailKey, { ...entry, score });
            }
          });

          const sortedUnique = Array.from(uniqueMap.values())
            .sort((a, b) => b.score - a.score);
          
          setGlobalTop(sortedUnique);
          if (data.stats) setLiveStats(data.stats);
          setHasError(false);
        }
      } else {
        setHasError(true);
      }
    } catch (e) {
      console.error("Leaderboard Error:", e);
      setHasError(true);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  const calculatedRank = useMemo(() => {
    if (!user?.email || globalTop.length === 0) return null;
    
    const myEmail = user.email.toLowerCase().trim();
    const myIndex = globalTop.findIndex(p => (p.email || "").toLowerCase().trim() === myEmail);
    
    if (myIndex !== -1) return myIndex + 1;

    const rank = globalTop.filter(p => p.score > currentScore).length + 1;
    return rank;
  }, [globalTop, currentScore, user?.email]);

  useEffect(() => {
    fetchGlobalData();
    // تم التعديل إلى 2500ms لجعل التحديثات فائقة السرعة
    const interval = setInterval(() => fetchGlobalData(true), 2500); 
    return () => clearInterval(interval);
  }, [user?.email, isSync]); 

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-4 bg-white/10 rounded-full mb-4 backdrop-blur-md">
            <Trophy className="w-10 h-10 text-yellow-400 fill-yellow-400" />
          </div>
          <h2 className="text-xl font-bold header-font">والسابقون السابقون</h2>
          
          <div className="mt-4 bg-white/10 rounded-3xl px-12 py-6 border border-white/20 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-center gap-2" dir="ltr">
                <span className="text-4xl font-black text-yellow-400/40">#</span>
                <span className="text-7xl font-black font-mono text-yellow-400 drop-shadow-xl leading-none">
                  {calculatedRank || (isLoading ? "..." : "---")}
                </span>
              </div>
              <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-[0.2em] opacity-80 mt-2">
                {isSync ? "ترتيبك العالمي حالياً" : "ترتيبك التوقعي (المزامنة معطلة)"}
              </p>
          </div>
          
          <div className="mt-6 flex items-center gap-4">
             <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-200/60 uppercase">
                <Star className="w-3 h-3 fill-current" /> تنافس في الخيرات <Star className="w-3 h-3 fill-current" />
             </div>
          </div>
        </div>
      </div>

      {hasError && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600">
          <WifiOff className="w-5 h-5" />
          <p className="text-xs font-bold header-font">جاري محاولة تحديث القائمة العامة..</p>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className={`w-5 h-5 ${isSync ? 'text-emerald-500' : 'text-slate-300'}`} />
            <h3 className="font-bold text-slate-800 header-font text-sm">إحصائيات الأمة الآن</h3>
          </div>
          {isSync && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> بث حي
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
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-transparent text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {s.icon} <span className="text-[10px] font-bold text-slate-500 header-font">{s.label}</span>
              </div>
              <span className="text-xl font-black text-slate-800 font-mono">{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-slate-800 header-font text-sm uppercase tracking-wider">صفوة المتسابقين</h3>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
        </div>

        <div className="space-y-3">
          {globalTop.length > 0 ? globalTop.slice(0, 50).map((player, index) => {
             const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
             return (
              <div key={player.email || index} className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${isMe ? 'bg-emerald-600 text-white shadow-xl scale-[1.02] border-none' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-yellow-400 text-white shadow-sm' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-amber-600 text-white' : 'bg-white/20 text-slate-400'}`}>
                      {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold header-font truncate max-w-[120px]">
                        {player.name} {isMe && "(أنت)"}
                    </span>
                    {isMe && <span className="text-[8px] opacity-70 header-font">تزامن حيّ ونشط</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black font-mono ${isMe ? 'text-white' : 'text-slate-800'}`}>{player.score.toLocaleString()}</span>
                </div>
              </div>
             )
          }) : (
            <div className="text-center py-12 flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-emerald-200 animate-spin mb-3" />
                <p className="text-[10px] text-slate-300 font-bold header-font animate-pulse">جاري جلب سجلات المتنافسين من السحاب..</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
