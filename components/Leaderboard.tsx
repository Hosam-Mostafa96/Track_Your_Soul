
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Users, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, RefreshCw, Sparkles } from 'lucide-react';
import { User } from '../types';
import { GOOGLE_STATS_API } from '../constants';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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
          includeYesterday: false 
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
            const record = { ...entry, score };
            if (!uniqueMap.has(emailKey) || score > uniqueMap.get(emailKey).score) {
              uniqueMap.set(emailKey, record);
            }
          });

          const sorted = Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score);
          setGlobalTop(sorted.slice(0, 100));
          const myEmail = user.email.toLowerCase().trim();
          const myIdx = sorted.findIndex(p => (p.email || "").toLowerCase().trim() === myEmail);
          setUserRank(myIdx !== -1 ? myIdx + 1 : null);
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
    const interval = setInterval(() => fetchGlobalData(true), 15000); 
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.email]);

  const getRankColor = (index: number, isMe: boolean) => {
    if (isMe) return 'bg-white/20 text-white';
    switch(index) {
      case 0: return 'bg-[#FFB703] text-white';
      case 1: return 'bg-[#CBD5E1] text-slate-700';
      case 2: return 'bg-[#FB8500] text-white';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-32">
      
      {/* 1. البطاقة العلوية (Header Card) */}
      <div className="bg-[#065F46] rounded-[2.5rem] p-7 text-white shadow-xl relative overflow-hidden border border-white/5">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex flex-col items-center border-l border-white/10 pl-6">
            <span className="text-[10px] opacity-60 font-bold header-font mb-1">{format(new Date(), 'eeee', { locale: ar })}</span>
            <span className="text-xl font-black header-font leading-none">{format(new Date(), 'dd MMMM', { locale: ar })}</span>
          </div>

          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] opacity-60 font-bold header-font mb-1">الرصيد الروحي</span>
            <span className="text-4xl font-black font-mono tracking-tighter tabular-nums leading-none">
              {currentScore.toLocaleString()}
            </span>
          </div>

          <div className="pr-6">
            <div className="bg-[#10B981]/20 p-4 rounded-[1.8rem] backdrop-blur-md">
              <Sparkles className="w-8 h-8 text-[#FFB703]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. هيدر القائمة وبطاقة النشاط */}
      <div className="flex items-center justify-between px-2">
         <div className="bg-[#E7F7F2] text-[#065F46] px-5 py-2.5 rounded-full flex items-center gap-2 border border-[#D1EBE3]">
           <Users className="w-4 h-4" />
           <span className="text-[11px] font-black header-font">{liveStats.totalUsers || 26} نشط حالياً</span>
         </div>
         <div className="flex items-center gap-2">
           <h2 className="text-xl font-black header-font text-[#065F46]">المتصدرون اليوم</h2>
           <Trophy className="w-6 h-6 text-[#FFB703]" />
         </div>
      </div>

      {/* 3. شبكة النشاط (Activity Grid) */}
      <div className="grid grid-cols-4 gap-3 px-1">
        {[
          { label: 'قيام', val: liveStats.qiyam, icon: <Moon className="w-4 h-4" />, color: 'text-indigo-500' },
          { label: 'ضحى', val: liveStats.duha, icon: <Sun className="w-4 h-4" />, color: 'text-amber-500' },
          { label: 'علم', val: liveStats.knowledge, icon: <GraduationCap className="w-4 h-4" />, color: 'text-emerald-500' },
          { label: 'ذكر', val: liveStats.athkar, icon: <Activity className="w-4 h-4" />, color: 'text-rose-500' }
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[1.8rem] p-3 shadow-sm border border-slate-50 flex flex-col items-center">
            <span className={`${s.color} mb-2`}>{s.icon}</span>
            <span className="text-base font-black text-slate-800 font-mono leading-none">{s.val}</span>
            <span className="text-[9px] font-bold text-slate-400 header-font mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {/* 4. قائمة الفرسان بالتصميم الجديد */}
      <div className="space-y-4 px-1">
        {globalTop.length > 0 ? (
          globalTop.map((player, index) => {
            const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
            const rankColor = getRankColor(index, isMe);

            return (
              <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-5 rounded-[2.2rem] transition-all duration-300 relative group ${isMe ? 'bg-[#065F46] text-white shadow-xl shadow-emerald-100' : 'bg-white border border-slate-100 shadow-sm'}`}>
                
                {/* اليسار: النقاط */}
                <div className="flex flex-col items-start min-w-[90px]">
                  <span className={`text-2xl font-black font-mono tracking-tighter leading-none ${isMe ? 'text-white' : 'text-slate-800'}`}>
                    {player.score.toLocaleString()}
                  </span>
                  <span className={`text-[9px] font-bold header-font mt-1 ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                    نقطة اليوم
                  </span>
                </div>

                {/* المنتصف: الاسم والعبارة */}
                <div className="flex-grow text-right px-4 overflow-hidden">
                  <div className="flex items-center justify-end gap-2">
                    {isMe && (
                      <span className="bg-white/20 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md header-font">أنت</span>
                    )}
                    <span className={`text-base font-black header-font truncate leading-tight ${isMe ? 'text-white' : 'text-slate-800'}`}>
                      {player.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold header-font truncate block mt-0.5 ${isMe ? 'text-emerald-300/50' : 'text-slate-400'}`}>
                    والسابقون السابقون
                  </span>
                </div>

                {/* اليمين: الترتيب (الدائرة الملونة) */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-mono font-black text-lg ${rankColor}`}>
                  {index + 1}
                </div>

              </div>
            )
          })
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            {isLoading ? (
              <Loader2 className="w-10 h-10 text-emerald-200 animate-spin" />
            ) : (
              <WifiOff className="w-10 h-10 text-slate-200" />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center p-4">
        <button onClick={() => fetchGlobalData()} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all">
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

    </div>
  );
};

export default Leaderboard;
