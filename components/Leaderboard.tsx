
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Crown, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Users, Medal, RefreshCw, Sparkles, Quote, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [globalTopToday, setGlobalTopToday] = useState<any[]>([]);
  const [globalTopYesterday, setGlobalTopYesterday] = useState<any[]>([]);
  const [userRankToday, setUserRankToday] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [showYesterday, setShowYesterday] = useState(true);

  const motivationalQuotes = useMemo(() => [
    { text: "وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ", source: "المطففين ٢٦" },
    { text: "سَابِقُوا إِلَى مَغْفِرَةٍ مِنْ رَبِّكُمْ وَجَنَّةٍ", source: "الحديد ٢١" },
    { text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", source: "حديث شريف" },
    { text: "فَاسْتَبِقُوا الْخَيْرَاتِ", source: "البقرة ١٤٨" }
  ], []);

  const currentQuote = useMemo(() => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  }, [motivationalQuotes]);

  // دالة للحصول على التاريخ بتنسيق YYYY-MM-DD
  const getLocalDateStr = (offset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  const processLeaderboard = (data: any[], todayStr: string, yesterdayStr: string) => {
    const todayMap = new Map();
    const yesterdayMap = new Map();

    data.forEach((entry: any) => {
      const emailKey = (entry.email || entry.name || "").toLowerCase().trim();
      if (!emailKey) return;
      
      const score = parseInt(entry.score) || 0;
      if (score <= 0) return;

      const entryDateFull = String(entry.date || ""); // قد يحتوي على "2023-10-27 00:50:00"
      const entryDateOnly = entryDateFull.split(' ')[0]; // استخراج "2023-10-27"

      // التحقق هل السجل يخص اليوم أم الأمس
      const isToday = entryDateOnly === todayStr || entry.isToday === true || entry.isToday === "true";
      const isYesterday = entryDateOnly === yesterdayStr;

      if (isToday) {
        if (!todayMap.has(emailKey) || score > todayMap.get(emailKey).score) {
          todayMap.set(emailKey, { ...entry, score });
        }
      } else if (isYesterday) {
        if (!yesterdayMap.has(emailKey) || score > yesterdayMap.get(emailKey).score) {
          yesterdayMap.set(emailKey, { ...entry, score });
        }
      }
    });

    const sortedToday = Array.from(todayMap.values()).sort((a, b) => b.score - a.score);
    const sortedYesterday = Array.from(yesterdayMap.values()).sort((a, b) => b.score - a.score);

    return { sortedToday, sortedYesterday };
  };

  const fetchGlobalData = async (isSilent = false) => {
    if (!isSync || !user?.email || !navigator.onLine) return;
    if (!isSilent) setIsRefreshing(true);
    if (!isSilent && globalTopToday.length === 0) setIsLoading(true);
    
    try {
      const res = await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
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
        setNetworkError(false);
        if (data && data.leaderboard) {
          const todayStr = getLocalDateStr(0);
          const yesterdayStr = getLocalDateStr(-1);

          const { sortedToday, sortedYesterday } = processLeaderboard(data.leaderboard, todayStr, yesterdayStr);

          setGlobalTopToday(sortedToday.slice(0, 50));
          setGlobalTopYesterday(sortedYesterday.slice(0, 50));

          const myEmail = user.email.toLowerCase().trim();
          const myIdxToday = sortedToday.findIndex(p => (p.email || "").toLowerCase().trim() === myEmail);
          setUserRankToday(myIdxToday !== -1 ? myIdxToday + 1 : null);

          if (data.stats) setLiveStats(data.stats);
        }
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      console.error("Leaderboard fetch error:", e);
      if (!isSilent) setNetworkError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(() => fetchGlobalData(true), 30000); 
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.email]);

  const getRankConfig = (index: number) => {
    switch(index) {
      case 0: return { bg: 'bg-amber-400', text: 'text-white', icon: <Crown className="w-5 h-5" /> };
      case 1: return { bg: 'bg-slate-300', text: 'text-slate-600', icon: <Medal className="w-5 h-5" /> };
      case 2: return { bg: 'bg-orange-400', text: 'text-white', icon: <Star className="w-5 h-5" /> };
      default: return { bg: 'bg-slate-100', text: 'text-slate-400', icon: null };
    }
  };

  const renderPlayerList = (list: any[], showRankIcons: boolean, title: string, icon: React.ReactNode) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-black header-font text-slate-800">{title}</h2>
        </div>
        <span className="text-[10px] font-black header-font bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">{list.length} فرسان</span>
      </div>
      
      {list.length > 0 ? (
        <div className="space-y-3">
          {list.map((player, index) => {
            const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
            const rank = getRankConfig(index);

            return (
              <div key={`${player.email || player.name}-${index}`} className={`flex items-center p-3 rounded-[2.2rem] transition-all relative gap-2.5 shadow-sm group border ${isMe ? 'bg-emerald-700 text-white shadow-xl shadow-emerald-100 scale-[1.01] z-10 border-transparent' : 'bg-white border-slate-50 hover:border-emerald-100'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-transform shadow-sm ${isMe ? 'bg-white/20 border-white/30 text-white' : `${rank.bg} ${rank.text} border-white shadow-inner`}`}>
                  {(showRankIcons && rank.icon) ? rank.icon : <span className="text-xs font-black font-mono">{index + 1}</span>}
                </div>
                <div className="flex-grow text-right min-w-0 pr-1">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className={`text-[13px] font-bold header-font truncate leading-tight ${isMe ? 'text-white' : 'text-slate-800'}`}>
                      {player.name}
                    </span>
                    {isMe && <Sparkles className="w-2.5 h-2.5 text-yellow-300 shrink-0" />}
                  </div>
                </div>
                <div className={`flex flex-col items-center px-3 shrink-0 border-r border-slate-100/50 ${isMe ? 'border-white/20' : ''}`}>
                  <span className={`text-lg font-black font-mono tracking-tighter leading-none ${isMe ? 'text-white' : 'text-emerald-700'}`}>
                    {player.score.toLocaleString()}
                  </span>
                  <span className={`text-[7px] font-black header-font mt-1 uppercase opacity-60 ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                    نقطة
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200">
           {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-300" /> : <p className="text-[10px] text-slate-400 font-bold header-font">لا يوجد فرسان مسجلون في هذه القائمة حالياً</p>}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 text-right" dir="rtl">
      
      {/* النفحة الربانية */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-100/50 shadow-sm text-center relative overflow-hidden group">
        <Quote className="absolute -top-1 -right-1 w-12 h-12 text-emerald-200/30 -rotate-12" />
        <p className="text-lg font-bold quran-font text-emerald-900 leading-relaxed mb-1 relative z-10">"{currentQuote.text}"</p>
        <span className="text-[9px] font-black text-emerald-600/50 header-font uppercase tracking-widest">{currentQuote.source}</span>
      </div>

      {/* الترتيب اليومي والنبض */}
      <section className="space-y-6">
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden border border-white/10 text-center">
          <div className="relative z-10 space-y-3">
            <h2 className="text-xs font-black header-font opacity-80 uppercase tracking-[0.2em]">رتبتك بين فرسان اليوم</h2>
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.2rem] py-5 px-8 inline-block shadow-2xl">
              <span className="text-5xl font-black font-mono text-yellow-400 tracking-tighter drop-shadow-[0_0_10px_rgba(250,204,21,0.4)] leading-none">
                {userRankToday || "---"}
              </span>
            </div>
          </div>
        </div>

        {/* نبض المحراب */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5 px-2">
             <div className="flex items-center gap-2.5">
               <div className="relative flex items-center justify-center">
                 <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping absolute"></div>
                 <div className="w-2.5 h-2.5 bg-rose-500 rounded-full relative"></div>
               </div>
               <h3 className="text-sm font-black text-slate-800 header-font">نبض المحراب الآن</h3>
             </div>
             <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-2 rounded-xl bg-slate-50 transition-all active:scale-90 ${isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-300'}`}>
               <RefreshCw className="w-4 h-4" />
             </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'يقيمون الليل', val: liveStats.qiyam, icon: <Moon className="w-4 h-4" />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: 'يصلون الضحى', val: liveStats.duha, icon: <Sun className="w-4 h-4" />, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'في طلب علم', val: liveStats.knowledge, icon: <GraduationCap className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'ذاكرون لله', val: liveStats.athkar, icon: <Activity className="w-4 h-4" />, color: 'text-rose-500', bg: 'bg-rose-50' }
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-50 bg-slate-50/20 hover:border-emerald-100 transition-all group">
                <div className={`p-2.5 rounded-xl ${s.bg} ${s.color} shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>{s.icon}</div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-800 font-mono leading-none tracking-tight">{s.val}</span>
                  <span className="text-[9px] font-bold text-slate-400 header-font mt-1 leading-none">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* فرسان اليوم */}
        {renderPlayerList(globalTopToday, true, "فرسان اليوم", <Sun className="w-5 h-5 text-amber-500" />)}

        {/* أرشيف الأمس (أسفل قائمة اليوم) */}
        <section className="space-y-4 pt-6 border-t border-slate-100">
          <button 
            onClick={() => setShowYesterday(!showYesterday)}
            className="w-full flex items-center justify-between px-3 py-3 bg-slate-50 rounded-2xl border border-slate-100"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-black header-font text-slate-700">أرشيف الأمس</h2>
            </div>
            {showYesterday ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showYesterday && (
            <div className="animate-in slide-in-from-top duration-300">
              {renderPlayerList(globalTopYesterday, false, "سجل شرف الأمس", <Moon className="w-5 h-5 text-slate-400" />)}
            </div>
          )}
        </section>
      </section>

      <div className="p-5 bg-slate-900 rounded-[2.2rem] text-white text-center shadow-lg mx-1">
        <p className="text-[10px] font-bold header-font opacity-60 italic leading-relaxed">
          "ميزانك هو ما استقر في قلبك وصدقه عملك"
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
