
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Users, Medal, RefreshCw, Sparkles, Quote, Heart, ArrowUpRight, Flame, ShieldCheck } from 'lucide-react';
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
      case 0: return { bg: 'bg-amber-400', text: 'text-white', icon: <Crown className="w-3 h-3" />, label: 'الأول' };
      case 1: return { bg: 'bg-slate-400', text: 'text-white', icon: <Medal className="w-3 h-3" />, label: 'الثاني' };
      case 2: return { bg: 'bg-orange-500', text: 'text-white', icon: <Star className="w-3 h-3" />, label: 'الثالث' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-500', icon: null, label: `#${index + 1}` };
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700 pb-20">
      
      {/* قسم النفحة الربانية */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-100/50 shadow-sm text-center relative overflow-hidden group">
        <Quote className="absolute -top-1 -right-1 w-12 h-12 text-emerald-200/30 -rotate-12" />
        <p className="text-lg font-bold quran-font text-emerald-900 leading-relaxed mb-1 relative z-10">"{currentQuote.text}"</p>
        <span className="text-[9px] font-black text-emerald-600/50 header-font uppercase tracking-widest">{currentQuote.source}</span>
      </div>

      {/* هيدر الترتيب مدمج */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-xl font-black header-font mb-1">فرسان اليوم</h2>
          <p className="text-emerald-100/40 text-[9px] font-bold header-font uppercase tracking-[0.2em] mb-4">حسب توقيتك المحلي الفعلي</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 flex items-center gap-4 border border-white/10 shadow-lg">
             <div className="flex flex-col items-center px-4 border-l border-white/10">
                <span className="text-4xl font-black font-mono text-yellow-400 tracking-tighter leading-none">{userRank || "---"}</span>
                <span className="text-[9px] font-black text-emerald-100/60 uppercase mt-1">ترتيبك</span>
             </div>
             <div className="flex flex-col items-center px-2">
                <Users className="w-5 h-5 text-emerald-300 mb-1" />
                <span className="text-[9px] font-black text-emerald-100/60 uppercase">{globalTop.length} مجاهد</span>
             </div>
          </div>
        </div>
      </div>

      {/* نبض المحراب - مدمج جداً */}
      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {[
          { label: 'قيام', val: liveStats.qiyam, icon: <Moon className="w-3 h-3" />, color: 'text-indigo-500' },
          { label: 'ضحى', val: liveStats.duha, icon: <Sun className="w-3 h-3" />, color: 'text-amber-500' },
          { label: 'علم', val: liveStats.knowledge, icon: <GraduationCap className="w-3 h-3" />, color: 'text-emerald-500' },
          { label: 'ذكر', val: liveStats.athkar, icon: <Activity className="w-3 h-3" />, color: 'text-rose-500' }
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center bg-slate-50 min-w-[4.5rem] py-2 rounded-2xl border border-slate-100/50">
            <span className={`p-1.5 rounded-lg bg-white shadow-xs ${s.color} mb-1`}>{s.icon}</span>
            <span className="text-sm font-black text-slate-800 font-mono leading-none">{s.val}</span>
            <span className="text-[8px] font-bold text-slate-400 header-font mt-0.5">{s.label}</span>
          </div>
        ))}
        <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-3 rounded-2xl ${isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-300'}`}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* قائمة الفرسان - تصميم جديد ومركز على الاسم */}
      <div className="space-y-2">
        {globalTop.length > 0 ? (
          globalTop.map((player, index) => {
            const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
            const rank = getRankConfig(index);

            return (
              <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-3.5 rounded-2xl transition-all relative gap-3 group ${isMe ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 ring-2 ring-emerald-400' : 'bg-white border border-slate-100 hover:border-emerald-200'}`}>
                
                {/* الرتبة - مصغرة جداً */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-xs ${isMe ? 'bg-white/20 text-white' : `${rank.bg} ${rank.text} shadow-sm`}`}>
                  {rank.icon ? rank.icon : index + 1}
                </div>

                {/* الاسم - هو المركز الآن */}
                <div className="flex-grow min-w-0 flex flex-col">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-sm md:text-base font-black header-font truncate tracking-tight ${isMe ? 'text-white' : 'text-slate-800'}`}>
                      {player.name}
                    </span>
                    {isMe && <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${isMe ? 'bg-emerald-300' : 'bg-emerald-400'}`}></div>
                    <span className={`text-[8px] font-bold header-font uppercase tracking-widest ${isMe ? 'text-emerald-100/60' : 'text-slate-400'}`}>
                      {rank.label}
                    </span>
                  </div>
                </div>

                {/* النقاط - في كبسولة أنيقة */}
                <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1 border shrink-0 ${isMe ? 'bg-white/10 border-white/10' : 'bg-emerald-50 border-emerald-100'}`}>
                  <span className={`text-sm md:text-base font-black font-mono tracking-tighter tabular-nums ${isMe ? 'text-white' : 'text-emerald-700'}`}>
                    {player.score.toLocaleString()}
                  </span>
                  <ArrowUpRight className={`w-3 h-3 ${isMe ? 'text-white/40' : 'text-emerald-300'}`} />
                </div>

              </div>
            )
          })
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            {isLoading ? (
              <Loader2 className="w-10 h-10 text-emerald-200 animate-spin" />
            ) : (
              <div className="p-8 bg-slate-50 rounded-[2rem] text-slate-400 flex flex-col items-center gap-3 border-2 border-dashed border-slate-100">
                  <WifiOff className="w-10 h-10 opacity-20" />
                  <p className="text-[10px] font-bold header-font">بانتظار أول فارس في منطقتك..</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 rounded-3xl text-white text-center shadow-lg relative overflow-hidden">
        <p className="text-[10px] font-bold header-font opacity-60 italic">
          "ميزانك هو ما استقر في قلبك وصدقه عملك"
        </p>
      </div>

    </div>
  );
};

export default Leaderboard;
