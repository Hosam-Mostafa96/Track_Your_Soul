
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Users, Medal, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { User } from '../types';
import { GOOGLE_STATS_API } from '../constants';

interface LeaderboardProps {
  user: User | null;
  currentScore: number;
  isSync: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, currentScore, isSync }) => {
  const [liveStats, setLiveStats] = useState({
    qiyam: 0, duha: 0, knowledge: 0, athkar: 0, totalUsers: 0
  });
  const [globalTop, setGlobalTop] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkIfIsToday = (entry: any) => {
    if (entry.isToday === true || entry.isToday === "true") return true;
    if (!entry.date) return false;
    
    try {
      const entryDateStr = String(entry.date).trim();
      const now = new Date();
      const d = now.getDate();
      const m = now.getMonth() + 1;
      const dateParts = entryDateStr.split(/[-/.]/);
      return dateParts.some(p => parseInt(p) === d) && dateParts.some(p => parseInt(p) === m);
    } catch (e) {
      return false;
    }
  };

  const fetchGlobalData = async (isSilent = false) => {
    if (!isSync || !user?.email || !navigator.onLine) return;
    if (!isSilent) setIsRefreshing(true);
    if (!isSilent && globalTop.length === 0) setIsLoading(true);
    
    try {
      const res = await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify({
          action: 'getStats',
          email: user.email.toLowerCase().trim(),
          name: user.name || "مصلٍ مجهول",
          score: currentScore,
          includeYesterday: true 
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
            if (score <= 0) return;

            const isToday = checkIfIsToday(entry);
            const record = { ...entry, score, isToday };

            if (!uniqueMap.has(emailKey)) {
              uniqueMap.set(emailKey, record);
            } else {
              const existing = uniqueMap.get(emailKey);
              if (isToday && !existing.isToday) {
                uniqueMap.set(emailKey, record);
              } else if (isToday === existing.isToday && score > existing.score) {
                uniqueMap.set(emailKey, record);
              }
            }
          });

          const allPlayers = Array.from(uniqueMap.values());
          const sorted = allPlayers.sort((a, b) => {
            if (a.isToday !== b.isToday) return a.isToday ? -1 : 1;
            return b.score - a.score;
          });

          setGlobalTop(sorted.slice(0, 100));
          
          const myEmail = user.email.toLowerCase().trim();
          const myIdx = sorted.findIndex(p => (p.email || "").toLowerCase().trim() === myEmail);
          if (myIdx !== -1) setUserRank(myIdx + 1);
          
          if (data.stats) setLiveStats(data.stats);
        }
      }
    } catch (e) {
      console.error("Leaderboard error", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(() => fetchGlobalData(true), 12000); 
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.email]);

  const getRankBadge = (index: number, isToday: boolean) => {
    if (!isToday) return { bg: 'bg-slate-100', text: 'text-slate-400', border: 'border-slate-200', icon: null };
    switch(index) {
      case 0: return { bg: 'bg-amber-400 shadow-amber-200', text: 'text-amber-900', border: 'border-amber-300', icon: <Trophy className="w-3 h-3 fill-current" /> };
      case 1: return { bg: 'bg-slate-300 shadow-slate-100', text: 'text-slate-700', border: 'border-slate-400', icon: <Medal className="w-3 h-3" /> };
      case 2: return { bg: 'bg-orange-300 shadow-orange-100', text: 'text-orange-900', border: 'border-orange-400', icon: <Star className="w-3 h-3 fill-current" /> };
      default: return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: null };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* هيدر الترتيب الملكي */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-5 bg-white/10 rounded-[2rem] mb-6 backdrop-blur-xl border border-white/20 shadow-inner">
            <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </div>
          <h2 className="text-3xl font-black header-font mb-2 tracking-tight">سباق الأبرار اليوم</h2>
          <p className="text-emerald-100/70 text-[10px] font-bold header-font uppercase tracking-[0.3em] mb-8">المحراب العالمي الموحد</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-1 w-full max-w-[240px] border border-white/10 shadow-2xl">
            <div className="bg-emerald-950/50 rounded-[2.2rem] py-6 px-4 flex flex-col items-center">
               <div className="flex items-center gap-1 dir-ltr mb-1">
                 <span className="text-6xl font-black font-mono text-yellow-400 tracking-tighter">{userRank || "---"}</span>
                 <span className="text-2xl font-black text-yellow-400/40 mt-3">#</span>
               </div>
               <div className="flex items-center gap-2">
                 <Sparkles className="w-3 h-3 text-emerald-400" />
                 <span className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest header-font">ترتيبك العالمي الآن</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* نبض المحراب - إحصائيات حية */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Globe className={`w-6 h-6 ${isSync ? 'text-emerald-500' : 'text-slate-300'}`} />
              {isSync && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base">نبض المحراب الآن</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">نشاط الأمة في هذه اللحظة</p>
            </div>
          </div>
          <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'يقيمون الليل', val: liveStats.qiyam, icon: <Moon className="w-4 h-4" />, color: 'indigo' },
            { label: 'يصلون الضحى', val: liveStats.duha, icon: <Sun className="w-4 h-4" />, color: 'amber' },
            { label: 'طلاب علم', val: liveStats.knowledge, icon: <GraduationCap className="w-4 h-4" />, color: 'emerald' },
            { label: 'ذاكرون لله', val: liveStats.athkar, icon: <Activity className="w-4 h-4" />, color: 'rose' }
          ].map((s, i) => (
            <div key={i} className="group relative bg-slate-50/50 p-5 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300 text-center">
              <div className={`inline-flex p-2.5 rounded-xl bg-${s.color}-50 text-${s.color}-600 mb-3 group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800 font-mono leading-none mb-1">{s.val}</span>
                <span className="text-[9px] font-bold text-slate-400 header-font">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة الفرسان المتصدرين */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-2xl">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-black text-slate-800 header-font text-base uppercase tracking-wider">فرسان التنافس</h3>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 font-mono">{liveStats.totalUsers || globalTop.length} نشط</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {globalTop.length > 0 ? (
            <>
              {globalTop.map((player, index) => {
                const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
                const badge = getRankBadge(index, player.isToday);
                const isFirstYesterday = index > 0 && globalTop[index-1].isToday && !player.isToday;

                return (
                  <React.Fragment key={`${player.email || player.name}-${index}`}>
                    {isFirstYesterday && (
                      <div className="flex items-center gap-4 py-8">
                        <div className="h-px bg-slate-100 flex-1"></div>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                          <TrendingUp className="w-3 h-3 text-slate-300" />
                          <span className="text-[9px] font-black text-slate-400 header-font uppercase tracking-widest">المجاهدات السابقة</span>
                        </div>
                        <div className="h-px bg-slate-100 flex-1"></div>
                      </div>
                    )}
                    
                    <div className={`group flex items-center justify-between p-5 rounded-[2rem] transition-all duration-500 relative overflow-hidden ${isMe ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl scale-[1.03] z-10 border-none' : player.isToday ? 'bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-lg' : 'bg-slate-50/50 border border-transparent opacity-80'}`}>
                      {isMe && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>}
                      
                      <div className="flex items-center gap-5 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 transition-transform group-hover:rotate-6 ${badge.bg} ${badge.text} ${badge.border} shadow-sm`}>
                          {badge.icon ? badge.icon : index + 1}
                        </div>
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold header-font truncate max-w-[140px] ${isMe ? 'text-white' : 'text-slate-800'}`}>
                              {player.name}
                            </span>
                            {isMe && <span className="text-[8px] bg-white/20 px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">أنت</span>}
                          </div>
                          <span className={`text-[9px] font-bold header-font ${isMe ? 'text-emerald-100/70' : 'text-slate-400'}`}>
                            {player.isToday ? 'والسابقون السابقون' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end relative z-10">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xl font-black font-mono tracking-tighter tabular-nums ${isMe ? 'text-white' : player.isToday ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {player.score.toLocaleString()}
                          </span>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${isMe ? 'text-emerald-200' : player.isToday ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {player.isToday ? 'رصيد اليوم' : ''}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}
            </>
          ) : (
            <div className="text-center py-24 flex flex-col items-center">
              {isLoading ? (
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-emerald-100 animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500" />
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-[3rem] text-slate-400 flex flex-col items-center gap-4 border-2 border-dashed border-slate-100">
                    <WifiOff className="w-12 h-12 opacity-20" />
                    <p className="text-xs font-bold header-font">بانتظار التحاق الفرسان بالمحراب...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
