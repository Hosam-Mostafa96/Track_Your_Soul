
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, RefreshCw, Crown, Zap } from 'lucide-react';
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
    if (isMe) return 'bg-white/20 text-white border-white/30';
    switch(index) {
      case 0: return 'bg-[#FFB703]/10 text-[#FFB703] border-[#FFB703]/20';
      case 1: return 'bg-[#CBD5E1]/20 text-slate-400 border-slate-100';
      case 2: return 'bg-[#FB8500]/10 text-[#FB8500] border-[#FB8500]/20';
      default: return 'bg-slate-50 text-slate-300 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-32">
      
      {/* 1. قسم سباق الأبرار اليوم */}
      <div className="bg-gradient-to-br from-[#064e3b] to-[#043d2f] rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden text-center border border-white/5">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <Crown className="w-full h-full scale-150 rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
            <h2 className="text-3xl font-black header-font tracking-tight">سباق الأبرار اليوم</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 inline-block min-w-[180px] shadow-inner backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black font-mono text-yellow-400 drop-shadow-lg leading-none">
                  {userRank || "---"}
                </span>
                <span className="text-2xl font-black text-yellow-400/50">#</span>
              </div>
              <p className="text-[10px] font-bold text-emerald-200 mt-2 uppercase tracking-[0.2em] header-font">ترتيبك في سباق اللحظة</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. نبض المحراب الآن */}
      <div className="bg-white rounded-[2.8rem] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
             <div className="bg-emerald-50 p-2 rounded-xl">
               <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600 animate-pulse" />
             </div>
             <h3 className="font-black text-slate-800 header-font text-lg">نبض المحراب الآن</h3>
           </div>
           <button onClick={() => fetchGlobalData()} className={`p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:text-emerald-500 transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
             <RefreshCw className="w-5 h-5" />
           </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'يقيمون الليل', val: liveStats.qiyam, icon: <Moon className="w-4 h-4" />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'يصلون الضحى', val: liveStats.duha, icon: <Sun className="w-4 h-4" />, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'طلاب علم', val: liveStats.knowledge, icon: <GraduationCap className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'ذاكرون', val: liveStats.athkar, icon: <Activity className="w-4 h-4" />, color: 'text-rose-500', bg: 'bg-rose-50' }
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-100 p-5 rounded-[2rem] flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-2 mb-2">
                 <span className={`${s.color} text-[10px] font-bold header-font`}>{s.label}</span>
                 <span className={s.color}>{s.icon}</span>
              </div>
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tighter">{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. قائمة المتصدرون بالتعديل الجديد */}
      <div className="space-y-4 px-1">
        <div className="flex items-center justify-between px-3">
          <div className="bg-[#E7F7F2] text-[#065F46] px-5 py-2.5 rounded-full flex items-center gap-2 border border-[#D1EBE3]">
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-black header-font">{liveStats.totalUsers || 26} نشط حالياً</span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black header-font text-slate-800">فرسان اليوم</h2>
            <Trophy className="w-6 h-6 text-[#FFB703]" />
          </div>
        </div>

        {globalTop.length > 0 ? (
          globalTop.map((player, index) => {
            const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
            const rankStyle = getRankStyle(index, isMe);

            return (
              <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-5 rounded-[2.5rem] transition-all duration-300 relative group ${isMe ? 'bg-[#065F46] text-white shadow-xl shadow-emerald-200 scale-[1.02]' : 'bg-white border border-slate-100 shadow-sm'}`}>
                
                {/* 1. أقصى اليسار: الترتيب (الرقم) */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-mono font-black text-xl border-2 transition-transform group-hover:scale-110 ${rankStyle}`}>
                  {index + 1}
                </div>

                {/* 2. المنتصف: النقاط */}
                <div className="flex flex-col items-center px-4 shrink-0">
                  <span className={`text-xl font-black font-mono tracking-tighter leading-none ${isMe ? 'text-white' : 'text-[#065F46]'}`}>
                    {player.score.toLocaleString()}
                  </span>
                  <span className={`text-[8px] font-bold header-font mt-1 ${isMe ? 'text-emerald-200/70' : 'text-slate-400'}`}>
                    نقطة
                  </span>
                </div>

                {/* 3. أقصى اليمين: الاسم (كبير وواضح) */}
                <div className="flex-grow text-right min-w-0">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-xl font-black header-font leading-tight truncate ${isMe ? 'text-white' : 'text-slate-800'}`}>
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="bg-white/20 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md header-font shrink-0">أنت</span>
                    )}
                  </div>
                  {/* تم حذف النص السفلي لإعطاء مساحة أكبر للاسم */}
                </div>

              </div>
            )
          })
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            {isLoading ? (
              <Loader2 className="w-10 h-10 text-emerald-200 animate-spin" />
            ) : (
              <WifiOff className="w-10 h-10 text-slate-200 opacity-20" />
            )}
          </div>
        )}
      </div>

      <div className="text-center py-6">
        <p className="text-[10px] font-black header-font text-slate-300 uppercase tracking-widest leading-relaxed">
          "سَابِقُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ"
        </p>
      </div>

    </div>
  );
};

export default Leaderboard;
