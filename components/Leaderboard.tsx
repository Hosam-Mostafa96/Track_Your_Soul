
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

  const getEncouragement = (index: number) => {
    if (index === 0) return "سابق بالخيرات";
    if (index === 1) return "مقبل غير مدبر";
    if (index === 2) return "فارس مجتهد";
    if (index < 10) return "في علياء الخير";
    return "مرابط في المحراب";
  };

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
      case 0: return { bg: 'bg-amber-400', text: 'text-white', icon: <Crown className="w-5 h-5" /> };
      case 1: return { bg: 'bg-slate-400', text: 'text-white', icon: <Medal className="w-5 h-5" /> };
      case 2: return { bg: 'bg-orange-500', text: 'text-white', icon: <Star className="w-5 h-5" /> };
      default: return { bg: 'bg-slate-50', text: 'text-slate-400', icon: null };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      
      {/* قسم الآية الكريمة */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[2.5rem] p-6 border border-emerald-100 shadow-sm text-center relative overflow-hidden">
        <Quote className="absolute -top-2 -right-2 w-16 h-16 text-emerald-200/20 -rotate-12" />
        <p className="text-2xl font-bold quran-font text-emerald-950 leading-relaxed mb-1 relative z-10">"{currentQuote.text}"</p>
        <span className="text-[10px] font-black text-emerald-600/50 header-font uppercase tracking-[0.3em]">{currentQuote.source}</span>
      </div>

      {/* هيدر الترتيب الملكي - رقم ضخم جداً */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_100%)]"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm">
             <Trophy className="w-4 h-4 text-yellow-400" />
             <h2 className="text-xs font-black header-font uppercase tracking-widest">ترتيبك في سباق الخير</h2>
          </div>
          
          <div className="relative mb-6">
            <span className="text-[14rem] font-black font-mono leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]">
              {userRank || "---"}
            </span>
          </div>
          
          <p className="text-emerald-200/40 text-[9px] font-bold header-font uppercase tracking-[0.5em]">حسب توقيتك الجغرافي الفعلي</p>
        </div>
      </div>

      {/* نبض المحراب - جلسات نشطة */}
      <div className="bg-white rounded-[2.8rem] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center relative shadow-inner">
                <Zap className="w-7 h-7 text-emerald-600 fill-emerald-600" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-white animate-ping"></span>
             </div>
             <div>
                <h3 className="font-black text-slate-900 header-font text-base mb-1 uppercase tracking-tight">جلسات إيمانية نشطة</h3>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">نبض المحراب في هذه اللحظة</p>
             </div>
          </div>
          <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white active:scale-90 ${isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-300'}`}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar px-1">
          {[
            { label: 'قيام', val: liveStats.qiyam, icon: <Moon className="w-4 h-4" />, color: 'text-indigo-500' },
            { label: 'ضحى', val: liveStats.duha, icon: <Sun className="w-4 h-4" />, color: 'text-amber-500' },
            { label: 'علم', val: liveStats.knowledge, icon: <GraduationCap className="w-4 h-4" />, color: 'text-emerald-500' },
            { label: 'ذكر', val: liveStats.athkar, icon: <Activity className="w-4 h-4" />, color: 'text-rose-500' }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center bg-slate-50/50 min-w-[6rem] py-5 rounded-[2rem] border border-slate-100 group hover:bg-white hover:border-emerald-100 transition-all duration-300">
              <span className={`p-2.5 rounded-xl bg-white shadow-sm ${s.color} mb-2 group-hover:scale-110 transition-transform`}>{s.icon}</span>
              <span className="text-xl font-black text-slate-900 font-mono leading-none tracking-tighter">{s.val}</span>
              <span className="text-[10px] font-bold text-slate-400 header-font mt-1 uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة الفرسان - تصميم موسع وفخم */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-6 mb-2">
            <div className="w-1.5 h-6 bg-amber-400 rounded-full"></div>
            <h3 className="text-sm font-black text-slate-800 header-font uppercase tracking-[0.2em]">فرسان اليوم</h3>
        </div>

        {globalTop.length > 0 ? (
          globalTop.map((player, index) => {
            const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
            const rank = getRankConfig(index);

            return (
              <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-8 md:p-10 rounded-[3rem] transition-all duration-500 relative gap-6 group ${isMe ? 'bg-gradient-to-r from-emerald-800 to-emerald-950 text-white shadow-[0_25px_50px_rgba(6,95,70,0.3)] scale-[1.04] z-10 border-none ring-4 ring-emerald-400/20' : 'bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-slate-100 hover:-translate-y-2'}`}>
                
                {/* الرتبة - أيقونة أو رقم أنيق */}
                <div className={`w-12 h-12 rounded-[1.5rem] flex items-center justify-center shrink-0 font-mono font-black text-base shadow-sm border-2 ${isMe ? 'bg-white/10 text-white border-white/20' : `${rank.bg} ${rank.text} border-white`}`}>
                  {rank.icon ? rank.icon : index + 1}
                </div>

                {/* الاسم والمعلومات التشجيعية */}
                <div className="flex-grow min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-2xl md:text-3xl font-black header-font truncate tracking-tight leading-none mb-1 ${isMe ? 'text-white' : 'text-slate-900'}`}>
                      {player.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isMe ? 'bg-emerald-300' : 'bg-emerald-400'}`}></div>
                      <span className={`text-[11px] font-black header-font uppercase tracking-[0.1em] ${isMe ? 'text-emerald-200' : 'text-emerald-600/70'}`}>
                        {getEncouragement(index)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* النقاط - في كبسولة فخمة */}
                <div className="flex flex-col items-end shrink-0">
                   <div className={`px-8 py-4 rounded-[2rem] flex items-center gap-3 border shadow-inner transition-all group-hover:scale-105 ${isMe ? 'bg-white/10 border-white/10' : 'bg-emerald-50/50 border-emerald-100 group-hover:bg-emerald-100'}`}>
                      <span className={`text-3xl md:text-5xl font-black font-mono tracking-tighter tabular-nums leading-none ${isMe ? 'text-white' : 'text-emerald-900'}`}>
                        {player.score.toLocaleString()}
                      </span>
                      <ArrowUpRight className={`w-5 h-5 ${isMe ? 'text-white/40' : 'text-emerald-300'}`} />
                   </div>
                </div>

              </div>
            )
          })
        ) : (
          <div className="text-center py-24 flex flex-col items-center">
            {isLoading ? (
              <div className="p-12 bg-white rounded-[3.5rem] shadow-sm flex flex-col items-center gap-6 border border-slate-50">
                 <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                 <p className="text-xs font-black text-slate-500 header-font uppercase tracking-widest">جاري استحضار الفرسان..</p>
              </div>
            ) : (
              <div className="p-12 bg-slate-50 rounded-[3.5rem] text-slate-400 flex flex-col items-center gap-6 border-2 border-dashed border-slate-100">
                  <WifiOff className="w-16 h-16 opacity-20" />
                  <p className="text-[11px] font-black header-font uppercase tracking-widest text-center leading-relaxed">لم ينطلق أي فارس في رحلته اليوم بعد..<br/>كن أنت الأول!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-8 bg-emerald-950 rounded-[3rem] text-white text-center shadow-2xl relative overflow-hidden group mt-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_100%)]"></div>
        <p className="text-sm font-bold header-font opacity-60 italic relative z-10 leading-relaxed">
          "إنما تُقطع المسافات بعزائم القلوب.. فاستعن بالله ولا تعجز"
        </p>
      </div>

    </div>
  );
};

export default Leaderboard;
