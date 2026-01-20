
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Crown, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Users, Medal, RefreshCw, Sparkles, Quote, ArrowUpRight } from 'lucide-react';
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

  const getRankStyle = (index: number, isMe: boolean) => {
    if (isMe) return 'bg-white/20 text-white shadow-none';
    switch(index) {
      case 0: return 'bg-[#FFB703] text-white shadow-[0_4px_15px_rgba(255,183,3,0.3)]';
      case 1: return 'bg-[#CBD5E1] text-slate-700 shadow-[0_4px_15px_rgba(203,213,225,0.3)]';
      case 2: return 'bg-[#FB8500] text-white shadow-[0_4px_15px_rgba(251,133,0,0.3)]';
      default: return 'bg-slate-50 text-slate-400 border border-slate-100';
    }
  };

  const getEncouragement = (index: number) => {
    if (index < 3) return "والسابقون السابقون";
    if (index < 10) return "فارس مجتهد";
    return "مرابط في المحراب";
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-28">
      
      {/* الهيدر العلوي كما في الصورة */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="bg-[#E7F7F2] text-[#065F46] px-4 py-2 rounded-2xl flex items-center gap-2 border border-[#D1EBE3]">
           <Users className="w-4 h-4" />
           <span className="text-[11px] font-black header-font">{liveStats.totalUsers || 26} نشط حالياً</span>
        </div>
        <div className="flex items-center gap-2">
           <h2 className="text-xl font-black header-font text-slate-800">المتصدرون اليوم</h2>
           <Trophy className="w-6 h-6 text-[#FFB703]" />
        </div>
      </div>

      {/* نبض المحراب المصغر */}
      <div className="bg-white rounded-[2rem] p-3 shadow-sm border border-slate-50 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar mx-1">
        {[
          { label: 'قيام', val: liveStats.qiyam, icon: <Moon className="w-3 h-3" />, color: 'text-indigo-500' },
          { label: 'ضحى', val: liveStats.duha, icon: <Sun className="w-3 h-3" />, color: 'text-amber-500' },
          { label: 'علم', val: liveStats.knowledge, icon: <GraduationCap className="w-3 h-3" />, color: 'text-emerald-500' },
          { label: 'ذكر', val: liveStats.athkar, icon: <Activity className="w-3 h-3" />, color: 'text-rose-500' }
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center bg-slate-50 min-w-[4rem] py-2 rounded-2xl">
            <span className={`p-1 rounded-lg bg-white shadow-xs ${s.color} mb-1`}>{s.icon}</span>
            <span className="text-xs font-black text-slate-800 font-mono">{s.val}</span>
            <span className="text-[7px] font-bold text-slate-400 header-font uppercase">{s.label}</span>
          </div>
        ))}
        <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-2 rounded-xl transition-all ${isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-200 hover:text-emerald-500'}`}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* قائمة الفرسان - تصميم الصورة المرفقة */}
      <div className="space-y-3 px-1">
        {globalTop.length > 0 ? (
          globalTop.map((player, index) => {
            const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
            const rankStyle = getRankStyle(index, isMe);

            return (
              <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-5 rounded-[2.5rem] transition-all duration-300 relative group ${isMe ? 'bg-[#065F46] text-white shadow-xl shadow-emerald-100 scale-[1.02]' : 'bg-white border border-slate-100 shadow-sm hover:border-emerald-100 hover:shadow-md'}`}>
                
                {/* اليسار: النقاط */}
                <div className="flex flex-col items-start min-w-[80px]">
                  <span className={`text-2xl font-black font-mono tracking-tighter tabular-nums leading-none ${isMe ? 'text-white' : 'text-[#065F46]'}`}>
                    {player.score.toLocaleString()}
                  </span>
                  <span className={`text-[9px] font-bold header-font mt-1 ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                    نقطة اليوم
                  </span>
                </div>

                {/* المنتصف: الاسم والعبارة التشجيعية */}
                <div className="flex-grow text-right px-4 overflow-hidden">
                  <div className="flex items-center justify-end gap-2">
                    {isMe && (
                      <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-lg header-font">أنت</span>
                    )}
                    <span className={`text-base md:text-lg font-black header-font truncate leading-tight ${isMe ? 'text-white' : 'text-slate-800'}`}>
                      {player.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold header-font truncate block mt-0.5 ${isMe ? 'text-emerald-300/60' : 'text-slate-400'}`}>
                    {getEncouragement(index)}
                  </span>
                </div>

                {/* اليمين: الترتيب */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-mono font-black text-lg ${rankStyle}`}>
                  {index + 1}
                </div>

              </div>
            )
          })
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-emerald-200 animate-spin" />
                <p className="text-[10px] font-bold text-slate-300 header-font">جاري استحضار الفرسان..</p>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-[2rem] text-slate-400 flex flex-col items-center gap-3 border-2 border-dashed border-slate-100">
                  <WifiOff className="w-10 h-10 opacity-20" />
                  <p className="text-[10px] font-bold header-font">بانتظار انطلاق أول فارس اليوم..</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* رسالة تشجيعية سفلية */}
      <div className="px-4 py-6 text-center">
        <p className="text-[10px] font-black header-font text-slate-300 uppercase tracking-widest leading-relaxed">
          "وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ"
        </p>
      </div>

    </div>
  );
};

export default Leaderboard;
