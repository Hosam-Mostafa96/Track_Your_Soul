
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Users, Medal, RefreshCw, Sparkles, Quote, Heart, ArrowUpRight, Flame, ShieldCheck, Zap } from 'lucide-react';
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

  const motivationalQuotes = useMemo(() => [
    { text: "وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ", source: "المطففين ٢٦" },
    { text: "سَابِقُوا إِلَى مَغْفِرَةٍ مِنْ رَبِّكُمْ وَجَنَّةٍ", source: "الحديد ٢١" },
    { text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", source: "حديث شريف" },
    { text: "فَاسْتَبِقُوا الْخَيْرَاتِ", source: "البقرة ١٤٨" }
  ], []);

  const currentQuote = useMemo(() => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  }, [motivationalQuotes]);

  const getLocalDateStr = () => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  };

  const checkIfIsTodayLocal = (entry: any) => {
    const today = new Date();
    const todayStr = getLocalDateStr();
    if (entry.isToday === true || entry.isToday === "true") return true;
    if (entry.date) {
      const entryStr = String(entry.date);
      if (entryStr.includes(todayStr)) return true;
      const digits = entryStr.match(/\d+/g);
      if (digits && digits.length >= 2) {
        const hasDay = digits.some(d => parseInt(d) === today.getDate());
        const hasMonth = digits.some(d => parseInt(d) === (today.getMonth() + 1));
        if (hasDay && hasMonth) return true;
      }
    }
    return entry.score > 0 && (!entry.date || entry.date === "undefined");
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
            if (score <= 0) return;
            if (!checkIfIsTodayLocal(entry)) return;
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

  const getRankConfig = (index: number) => {
    switch(index) {
      case 0: return { bg: 'bg-amber-400', text: 'text-white', icon: <Crown className="w-4 h-4" /> };
      case 1: return { bg: 'bg-slate-400', text: 'text-white', icon: <Medal className="w-4 h-4" /> };
      case 2: return { bg: 'bg-orange-500', text: 'text-white', icon: <Star className="w-4 h-4" /> };
      default: return { bg: 'bg-slate-100', text: 'text-slate-500', icon: null };
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-700 pb-20">
      
      {/* قسم النفحة الربانية */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[2rem] p-6 border border-emerald-100 shadow-sm text-center relative overflow-hidden group">
        <Quote className="absolute -top-1 -right-1 w-12 h-12 text-emerald-200/30 -rotate-12" />
        <p className="text-xl font-bold quran-font text-emerald-900 leading-relaxed mb-1 relative z-10">"{currentQuote.text}"</p>
        <span className="text-[10px] font-black text-emerald-600/50 header-font uppercase tracking-widest">{currentQuote.source}</span>
      </div>

      {/* هيدر الترتيب الملكي المحدث */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-2xl font-black header-font mb-1 tracking-tight">فرسان السباق اليوم</h2>
          <p className="text-emerald-100/40 text-[10px] font-bold header-font uppercase tracking-[0.3em] mb-8">حسب التوقيت الجغرافي الفعلي</p>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-2 w-full max-w-[280px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-110">
            <div className="bg-emerald-950/60 rounded-[2.8rem] py-10 px-4 flex flex-col items-center border border-white/5">
               <div className="flex items-center gap-1 dir-ltr mb-1">
                 <span className="text-8xl font-black font-mono text-yellow-400 tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{userRank || "---"}</span>
                 <span className="text-3xl font-black text-yellow-400/40 mt-6">#</span>
               </div>
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-emerald-400" />
                 <span className="text-[12px] font-black text-emerald-100/80 uppercase tracking-widest header-font">رتبتك في الخيرات</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* نبض المحراب - جلسات نشطة */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-5 px-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 rounded-xl relative">
                <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-ping"></span>
             </div>
             <div>
                <h3 className="font-black text-slate-800 header-font text-sm uppercase">جلسات نشطة الآن</h3>
                <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">نبض المحراب العالمي</p>
             </div>
          </div>
          <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-3 rounded-2xl bg-slate-50 transition-all active:scale-90 ${isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-300'}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar px-1">
          {[
            { label: 'قيام', val: liveStats.qiyam, icon: <Moon className="w-3 h-3" />, color: 'text-indigo-500' },
            { label: 'ضحى', val: liveStats.duha, icon: <Sun className="w-3 h-3" />, color: 'text-amber-500' },
            { label: 'علم', val: liveStats.knowledge, icon: <GraduationCap className="w-3 h-3" />, color: 'text-emerald-500' },
            { label: 'ذكر', val: liveStats.athkar, icon: <Activity className="w-3 h-3" />, color: 'text-rose-500' }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center bg-slate-50/80 min-w-[5rem] py-3 rounded-2xl border border-slate-100 group hover:bg-white hover:border-emerald-100 transition-all">
              <span className={`p-2 rounded-xl bg-white shadow-sm ${s.color} mb-1.5 group-hover:scale-110 transition-transform`}>{s.icon}</span>
              <span className="text-base font-black text-slate-800 font-mono leading-none tracking-tighter">{s.val}</span>
              <span className="text-[9px] font-bold text-slate-400 header-font mt-1 uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة الفرسان - تصميم موسع ومبسط */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-4 mb-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black text-slate-700 header-font uppercase tracking-widest">المتسابقون اليوم</h3>
        </div>

        {globalTop.length > 0 ? (
          globalTop.map((player, index) => {
            const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
            const rank = getRankConfig(index);

            return (
              <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-5 md:p-6 rounded-[2rem] transition-all duration-500 relative gap-4 group ${isMe ? 'bg-gradient-to-l from-emerald-700 to-emerald-900 text-white shadow-2xl shadow-emerald-200 scale-[1.03] border-none ring-4 ring-emerald-500/10' : 'bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1'}`}>
                
                {/* الرتبة - مصغرة وأنيقة */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-mono font-black text-sm shadow-sm transition-transform group-hover:rotate-3 ${isMe ? 'bg-white/20 text-white' : `${rank.bg} ${rank.text} border-2 border-white`}`}>
                  {rank.icon ? rank.icon : index + 1}
                </div>

                {/* الاسم - هو المركز البصري */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg md:text-xl font-black header-font truncate tracking-tight ${isMe ? 'text-white' : 'text-slate-800'}`}>
                      {player.name}
                    </span>
                    {isMe && <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse shrink-0" />}
                    {index < 3 && !isMe && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                  </div>
                </div>

                {/* النقاط - كبسولة احترافية */}
                <div className="flex flex-col items-end shrink-0">
                   <div className={`px-5 py-2.5 rounded-[1.5rem] flex items-center gap-2 border shadow-inner transition-colors ${isMe ? 'bg-white/10 border-white/10' : 'bg-emerald-50 border-emerald-100 group-hover:bg-emerald-100'}`}>
                      <span className={`text-xl md:text-3xl font-black font-mono tracking-tighter tabular-nums ${isMe ? 'text-white' : 'text-emerald-800'}`}>
                        {player.score.toLocaleString()}
                      </span>
                      <ArrowUpRight className={`w-4 h-4 ${isMe ? 'text-white/40' : 'text-emerald-300'}`} />
                   </div>
                </div>

              </div>
            )
          })
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            {isLoading ? (
              <div className="p-10 bg-white rounded-[3rem] shadow-sm flex flex-col items-center gap-4">
                 <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                 <p className="text-xs font-bold text-slate-400 header-font">جاري استحضار الفرسان..</p>
              </div>
            ) : (
              <div className="p-10 bg-slate-50 rounded-[3rem] text-slate-400 flex flex-col items-center gap-4 border-2 border-dashed border-slate-200">
                  <WifiOff className="w-12 h-12 opacity-20" />
                  <p className="text-[11px] font-bold header-font">لم ينطلق أي فارس في رحلته اليوم بعد..</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white text-center shadow-xl relative overflow-hidden group mt-6">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5"></div>
        <p className="text-xs font-bold header-font opacity-70 italic relative z-10">
          "إنما تُقطع المسافات بعزائم القلوب.. فاستعن بالله ولا تعجز"
        </p>
      </div>

    </div>
  );
};

export default Leaderboard;
