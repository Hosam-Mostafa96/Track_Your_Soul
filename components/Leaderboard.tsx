
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Crown, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Users, Medal, RefreshCw, Sparkles, Quote, Zap } from 'lucide-react';
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
    const todayStr = getLocalDateStr();
    if (entry.isToday === true || entry.isToday === "true") return true;
    if (entry.date) {
      const entryStr = String(entry.date);
      if (entryStr.includes(todayStr)) return true;
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
      case 0: return { bg: 'bg-amber-400', text: 'text-white', icon: <Crown className="w-3.5 h-3.5" /> };
      case 1: return { bg: 'bg-slate-300', text: 'text-slate-600', icon: <Medal className="w-3.5 h-3.5" /> };
      case 2: return { bg: 'bg-orange-400', text: 'text-white', icon: <Star className="w-3.5 h-3.5" /> };
      default: return { bg: 'bg-slate-100', text: 'text-slate-400', icon: null };
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700 pb-24">
      
      {/* قسم النفحة الربانية */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-100/50 shadow-sm text-center relative overflow-hidden group">
        <Quote className="absolute -top-1 -right-1 w-12 h-12 text-emerald-200/30 -rotate-12" />
        <p className="text-lg font-bold quran-font text-emerald-900 leading-relaxed mb-1 relative z-10">"{currentQuote.text}"</p>
        <span className="text-[9px] font-black text-emerald-600/50 header-font uppercase tracking-widest">{currentQuote.source}</span>
      </div>

      {/* الهيدر المطور - إبراز الترتيب الشخصي */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border border-white/10 text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-xs font-black header-font opacity-80 uppercase tracking-[0.2em]">موقعك الحالي في السباق</h2>
          
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-yellow-400/25 blur-[40px] rounded-full scale-150 animate-pulse"></div>
            
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.8rem] p-8 min-w-[170px] shadow-2xl relative overflow-hidden ring-4 ring-white/5">
               <div className="absolute -top-2 -right-2 opacity-10"><Crown className="w-20 h-20" /></div>
              <span className="text-[10px] font-black text-emerald-200 block mb-2 uppercase tracking-widest">رتبتك اليوم</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-7xl font-black font-mono text-yellow-400 tracking-tighter drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] leading-none">
                  {userRank || "---"}
                </span>
                <span className="text-3xl font-black text-yellow-400/40">#</span>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] font-bold text-emerald-100/50 header-font italic tracking-wide">النتائج تتحدث تلقائياً</p>
        </div>
      </div>

      {/* الجلسات النشطة - نبض المحراب */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-5 px-2">
           <div className="flex items-center gap-2.5">
             <div className="relative flex items-center justify-center">
               <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping absolute"></div>
               <div className="w-2.5 h-2.5 bg-rose-500 rounded-full relative"></div>
             </div>
             <h3 className="text-sm font-black text-slate-800 header-font">الجلسات النشطة لنبض المحراب</h3>
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

      {/* قائمة الفرسان */}
      <div className="space-y-4 px-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black header-font text-slate-800">فرسان اليوم</h2>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-100 shadow-sm">
             <Users className="w-3.5 h-3.5" />
             <span className="text-[10px] font-black header-font">{globalTop.length} مجاهد في المحراب</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {globalTop.length > 0 ? (
            globalTop.map((player, index) => {
              const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
              const rank = getRankConfig(index);

              return (
                <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-4 rounded-[2rem] transition-all relative gap-4 group ${isMe ? 'bg-emerald-700 text-white shadow-xl shadow-emerald-100 scale-[1.01] z-10' : 'bg-white border border-slate-100'}`}>
                  
                  {/* الرتبة - جهة اليسار (في RTL تظهر يساراً) */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-mono font-black text-sm border-2 transition-transform ${isMe ? 'bg-white/20 border-white/30 text-white' : `${rank.bg} ${rank.text} border-transparent shadow-sm`}`}>
                    {rank.icon ? rank.icon : index + 1}
                  </div>

                  {/* النقاط - المنتصف */}
                  <div className={`flex flex-col items-center px-3 shrink-0 border-x border-slate-100/50 ${isMe ? 'border-white/10' : ''}`}>
                    <span className={`text-base font-black font-mono tracking-tighter leading-none ${isMe ? 'text-white' : 'text-emerald-700'}`}>
                      {player.score.toLocaleString()}
                    </span>
                    <span className={`text-[8px] font-bold header-font mt-1 ${isMe ? 'text-emerald-200/50' : 'text-slate-400'}`}>
                      نقطة
                    </span>
                  </div>

                  {/* الاسم - جهة اليمين (تصغير الخط وحذف الهاشتاج) */}
                  <div className="flex-grow text-right min-w-0">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-base font-bold header-font truncate leading-tight ${isMe ? 'text-white' : 'text-slate-800'}`}>
                        {player.name}
                      </span>
                      {isMe && <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />}
                    </div>
                  </div>

                </div>
              )
            })
          ) : (
            <div className="text-center py-20 flex flex-col items-center">
              {isLoading ? (
                <Loader2 className="w-10 h-10 text-emerald-200 animate-spin" />
              ) : (
                <div className="p-8 bg-slate-50 rounded-[2.5rem] text-slate-400 flex flex-col items-center gap-4 border-2 border-dashed border-slate-200">
                    <WifiOff className="w-10 h-10 opacity-20" />
                    <p className="text-[10px] font-black header-font">بانتظار التحاق الفرسان بالمحراب..</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 bg-slate-900 rounded-[2.2rem] text-white text-center shadow-lg mx-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <Sparkles className="w-full h-full scale-150" />
        </div>
        <p className="text-[10px] font-bold header-font opacity-60 italic leading-relaxed relative z-10">
          "ميزانك هو ما استقر في قلبك وصدقه عملك"
        </p>
      </div>

    </div>
  );
};

export default Leaderboard;
