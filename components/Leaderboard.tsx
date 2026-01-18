
import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Hash, Users, Medal } from 'lucide-react';
import { DailyLog, AppWeights, User } from '../types';
import { GOOGLE_STATS_API } from '../constants';

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
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const fetchGlobalData = async (isSilent = false) => {
    if (!isSync || !user?.email) return;
    
    if (!isSilent) setIsLoading(true);
    try {
      const res = await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify({
          action: 'getStats',
          email: user.email.toLowerCase().trim(),
          name: user.name || "مصلٍ مجهول",
          score: currentScore
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

          const myEmail = user.email.toLowerCase().trim();
          const myIdx = sortedUnique.findIndex(p => (p.email || "").toLowerCase().trim() === myEmail);
          
          setGlobalTop(sortedUnique.slice(0, 50));
          
          if (myIdx !== -1) {
            setUserRank(myIdx + 1);
          } else if (data.userRank && data.userRank !== "---") {
            setUserRank(parseInt(data.userRank));
          } else {
            setUserRank(null);
          }
          
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

  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(() => fetchGlobalData(true), 2500); 
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.email]);

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return {
        bg: 'bg-gradient-to-br from-yellow-400 to-amber-600',
        text: 'text-white',
        border: 'border-yellow-200',
        shadow: 'shadow-lg shadow-yellow-100',
        icon: <Trophy className="w-3 h-3 fill-current" />
      };
      case 1: return {
        bg: 'bg-gradient-to-br from-slate-200 to-slate-400',
        text: 'text-slate-700',
        border: 'border-slate-100',
        shadow: 'shadow-md shadow-slate-100',
        icon: <Medal className="w-3 h-3" />
      };
      case 2: return {
        bg: 'bg-gradient-to-br from-orange-300 to-orange-500',
        text: 'text-white',
        border: 'border-orange-200',
        shadow: 'shadow-md shadow-orange-100',
        icon: <Star className="w-3 h-3 fill-current" />
      };
      default: return {
        bg: 'bg-slate-50',
        text: 'text-slate-400',
        border: 'border-slate-100',
        shadow: '',
        icon: null
      };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* البطاقة العلوية للترتيب الشخصي */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-4 bg-white/10 rounded-full mb-4 backdrop-blur-md">
            <Crown className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
          </div>
          <h2 className="text-2xl font-bold header-font">والسابقون السابقون</h2>
          
          <div className="mt-4 bg-white/10 rounded-3xl px-10 py-5 border border-white/20 backdrop-blur-md shadow-inner flex flex-col items-center min-w-[180px]">
              <div className="flex items-center gap-1 justify-center dir-ltr">
                <span className="text-6xl font-black font-mono text-yellow-400 drop-shadow-md leading-none">
                  {userRank || "---"}
                </span>
                <span className="text-3xl font-black text-yellow-400/50 mt-2">#</span>
              </div>
              <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-[0.2em] opacity-80 mt-2 header-font">ترتيبك بين المتسابقين</p>
          </div>
        </div>
      </div>

      {hasError && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-pulse">
          <WifiOff className="w-5 h-5" />
          <p className="text-xs font-bold header-font">صعوبة في المزامنة.. جارِ المحاولة.</p>
        </div>
      )}

      {/* إحصائيات الأمة */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className={`w-5 h-5 ${isSync ? 'text-emerald-500' : 'text-slate-300'}`} />
            <h3 className="font-bold text-slate-800 header-font text-sm">نبض المحراب الآن</h3>
          </div>
          {isSync && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> مباشر
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
            <div key={i} className="bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all text-center group">
              <div className="flex items-center justify-center gap-2 mb-1">
                {s.icon} <span className="text-[10px] font-bold text-slate-400 header-font group-hover:text-slate-600 transition-colors">{s.label}</span>
              </div>
              <span className="text-2xl font-black text-slate-800 font-mono tracking-tighter">{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة المتصدرين المزينة */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-800 header-font text-sm uppercase tracking-wide">ترتيب المتسابقين في الخيرات</h3>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-slate-100">
              <Users className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-black text-slate-500">{globalTop.length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {globalTop.length > 0 ? globalTop.map((player, index) => {
             const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
             const rank = getRankStyle(index);
             
             return (
              <div 
                key={player.email || index} 
                className={`group flex items-center justify-between p-4 rounded-3xl transition-all duration-500 ${
                  isMe 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-100 scale-[1.02] border-none' 
                  : 'bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* تصميم أيقونة الترتيب */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black relative overflow-hidden ${rank.bg} ${rank.text} ${rank.shadow} border-2 ${rank.border}`}>
                      <span className="relative z-10">{index + 1}</span>
                      {rank.icon && <div className="absolute -bottom-1 -right-1 opacity-20 rotate-12">{rank.icon}</div>}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold header-font truncate max-w-[140px] ${isMe ? 'text-white' : 'text-slate-800'}`}>
                        {player.name} {isMe && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-lg mr-1">أنت</span>}
                    </span>
                    <span className={`text-[9px] font-bold header-font ${isMe ? 'text-emerald-100 opacity-70' : 'text-slate-400'}`}>
                       {index < 3 ? 'من الأبرار السابقين' : 'في طريق الارتقاء'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <span className={`text-base font-black font-mono tabular-nums ${isMe ? 'text-white' : 'text-emerald-700'}`}>
                      {player.score.toLocaleString()}
                    </span>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${isMe ? 'text-emerald-200' : 'text-slate-300'}`}>نقطة خير</span>
                </div>
              </div>
             )
          }) : (
            <div className="text-center py-20 flex flex-col items-center">
                <div className="relative mb-4">
                  <Loader2 className="w-12 h-12 text-emerald-100 animate-spin" />
                  <Globe className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-xs text-slate-400 font-bold header-font animate-pulse">يتم استدعاء السجلات من اللوح المحفوظ..</p>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-center text-[9px] text-slate-400 font-bold header-font opacity-60">
        "وفي ذلك فليتنافس المتنافسون"
      </p>
    </div>
  );
};

export default Leaderboard;
