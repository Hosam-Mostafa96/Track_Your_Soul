
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Users, Medal, RefreshCw, Sparkles, Quote, Heart, ArrowUpRight } from 'lucide-react';
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

  // نفحات إيمانية تحفيزية
  const motivationalQuotes = useMemo(() => [
    { text: "وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ", source: "سورة المطففين" },
    { text: "سَابِقُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ", source: "سورة الحديد" },
    { text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", source: "حديث شريف" },
    { text: "فَاسْتَبِقُوا الْخَيْرَاتِ", source: "سورة البقرة" },
    { text: "لَن يَنَالَ اللَّهَ لُحُومُهَا وَلَا دِمَاؤُهَا وَلَٰكِن يَنَالُهُ التَّقْوَىٰ مِنكُمْ", source: "سورة الحج" },
    { text: "إِنَّ اللهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ", source: "حديث شريف" }
  ], []);

  const randomQuote = useMemo(() => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  }, [motivationalQuotes]);

  // دالة الحصول على التاريخ المحلي الحالي للمستخدم
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
    const todayLocal = getLocalDateStr();
    const [cYear, cMonth, cDay] = todayLocal.split('-').map(Number);

    if (entry.isToday === true || entry.isToday === "true") return true;
    if (!entry.date) return false;
    
    try {
      const entryStr = String(entry.date).trim();
      if (entryStr.startsWith(todayLocal)) return true;
      const digits = entryStr.match(/\d+/g);
      if (digits && digits.length >= 2) {
        const hasDay = digits.some(d => parseInt(d) === cDay);
        const hasMonth = digits.some(d => parseInt(d) === cMonth);
        const hasOldYear = digits.some(d => d.length === 4 && parseInt(d) < cYear);
        return hasDay && hasMonth && !hasOldYear;
      }
      return false;
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
            const record = { ...entry, score, isToday: true };
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
    const interval = setInterval(() => fetchGlobalData(true), 12000); 
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.email]);

  const getRankBadge = (index: number) => {
    switch(index) {
      case 0: return { bg: 'bg-amber-400 shadow-amber-200', text: 'text-amber-900', border: 'border-amber-300', icon: <Trophy className="w-5 h-5" /> };
      case 1: return { bg: 'bg-slate-200 shadow-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: <Medal className="w-5 h-5" /> };
      case 2: return { bg: 'bg-orange-200 shadow-orange-100', text: 'text-orange-900', border: 'border-orange-300', icon: <Star className="w-5 h-5" /> };
      default: return { bg: 'bg-slate-50 shadow-none', text: 'text-slate-500', border: 'border-slate-100', icon: null };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* هيدر الترتيب الملكي */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-5 bg-white/10 rounded-[2.5rem] mb-6 backdrop-blur-xl border border-white/20 shadow-inner group">
            <Crown className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black header-font mb-2 tracking-tight">سابقو اليوم</h2>
          <p className="text-emerald-100/70 text-[10px] md:text-[11px] font-black header-font uppercase tracking-[0.4em] mb-10">المحراب العالمي • {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-1.5 w-full max-w-[280px] border border-white/15 shadow-2xl scale-105">
            <div className="bg-emerald-950/60 rounded-[2.8rem] py-8 px-4 flex flex-col items-center border border-white/5">
               <div className="flex items-center gap-1 dir-ltr mb-1">
                 <span className="text-7xl font-black font-mono text-yellow-400 tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">{userRank || "---"}</span>
                 <span className="text-3xl font-black text-yellow-400/40 mt-4">#</span>
               </div>
               <div className="flex items-center gap-2">
                 <Sparkles className="w-3 h-3 text-emerald-400" />
                 <span className="text-[11px] font-black text-emerald-100/80 uppercase tracking-widest header-font">منزلتك في الخير</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* النفحة الإيمانية التحفيزية */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[2.5rem] p-6 border border-emerald-100/50 shadow-inner relative overflow-hidden group">
        <Quote className="absolute -top-4 -right-4 w-20 h-20 text-emerald-200/40 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
        <div className="relative z-10 text-center space-y-3">
          <p className="text-lg md:text-xl font-bold quran-font text-emerald-900 leading-relaxed">
            "{randomQuote.text}"
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-emerald-200"></div>
            <span className="text-[10px] font-black text-emerald-600/60 header-font uppercase tracking-widest">{randomQuote.source}</span>
            <div className="h-px w-8 bg-emerald-200"></div>
          </div>
        </div>
      </div>

      {/* نبض المحراب */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-emerald-50 rounded-2xl">
              <Globe className={`w-6 h-6 ${isSync ? 'text-emerald-600' : 'text-slate-300'}`} />
              {isSync && <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>}
            </div>
            <div>
              <h3 className="font-black text-slate-800 header-font text-base tracking-tight">نبض المحراب الآن</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إحصائيات السباق اللحظية</p>
            </div>
          </div>
          <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all active:scale-90 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'يقيمون الليل', val: liveStats.qiyam, icon: <Moon className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'يصلون الضحى', val: liveStats.duha, icon: <Sun className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'طلاب علم', val: liveStats.knowledge, icon: <GraduationCap className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'ذاكرون لله', val: liveStats.athkar, icon: <Activity className="w-4 h-4" />, color: 'text-rose-600', bg: 'bg-rose-50' }
          ].map((s, i) => (
            <div key={i} className="group bg-slate-50/70 p-5 rounded-[2rem] border border-transparent hover:border-slate-100 hover:bg-white transition-all text-center">
              <div className={`inline-flex p-3 rounded-2xl bg-white shadow-sm ${s.color} mb-3 group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800 font-mono leading-none mb-1 tracking-tighter">{s.val}</span>
                <span className="text-[10px] font-black text-slate-400 header-font uppercase tracking-tight">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة الفرسان */}
      <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl shadow-inner shadow-amber-100/50">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 header-font text-lg tracking-tight uppercase">فرسان السباق</h3>
              <p className="text-[10px] text-slate-400 font-bold">بناءً على التوقيت المحلي الفعلي</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 flex items-center gap-2 shadow-sm">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-black text-emerald-700 font-mono tracking-wider">{globalTop.length} مجاهد</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {globalTop.length > 0 ? (
            <>
              {globalTop.map((player, index) => {
                const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
                const badge = getRankBadge(index);

                return (
                  <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-5 md:p-7 rounded-[2.5rem] transition-all duration-300 relative gap-4 group ${isMe ? 'bg-gradient-to-l from-emerald-700 to-emerald-900 text-white shadow-2xl shadow-emerald-200 scale-[1.02] border-none ring-4 ring-emerald-500/10' : 'bg-white border border-slate-50 hover:border-emerald-100 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1'}`}>
                    
                    {/* الكتلة اليمنى: الهوية والرتبة */}
                    <div className="flex items-center gap-5 flex-grow min-w-0">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 font-mono font-black text-lg shadow-sm transition-transform group-hover:scale-105 ${isMe ? 'bg-white/20 border-white/30 text-white' : `${badge.bg} ${badge.border} ${badge.text}`}`}>
                        {badge.icon ? badge.icon : index + 1}
                      </div>
                      <div className="flex flex-col min-w-0 flex-grow">
                        <div className="flex items-center gap-2">
                          <span className={`text-base md:text-lg font-black header-font truncate tracking-tight ${isMe ? 'text-white' : 'text-slate-800'}`}>
                            {player.name}
                          </span>
                          {isMe && <Sparkles className="w-4 h-4 text-yellow-300 shrink-0 animate-pulse" />}
                          {index < 3 && !isMe && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Heart className={`w-3 h-3 ${isMe ? 'text-emerald-300' : 'text-emerald-500 opacity-40'}`} />
                          <span className={`text-[10px] md:text-[11px] font-black header-font uppercase tracking-widest ${isMe ? 'text-emerald-100/70' : 'text-slate-400'}`}>
                            {index === 0 ? "متصدر الركب" : index < 3 ? "من الأوائل" : "سابق بالخيرات"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* الكتلة اليسرى: النقاط */}
                    <div className="flex flex-col items-end shrink-0 min-w-fit">
                      <div className={`px-5 py-2.5 rounded-[1.8rem] flex items-center gap-2 shadow-inner border ${isMe ? 'bg-white/10 border-white/10' : 'bg-emerald-50/50 border-emerald-100/50'}`}>
                        <span className={`text-xl md:text-3xl font-black font-mono tracking-tighter tabular-nums ${isMe ? 'text-white' : 'text-emerald-800'}`}>
                          {player.score.toLocaleString()}
                        </span>
                        <ArrowUpRight className={`w-4 h-4 ${isMe ? 'text-white/40' : 'text-emerald-300'}`} />
                      </div>
                      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-1 ${isMe ? 'text-emerald-200/80' : 'text-emerald-500/60'}`}>
                        رصيد اليوم
                      </p>
                    </div>

                  </div>
                )
              })}
            </>
          ) : (
            <div className="text-center py-24 flex flex-col items-center">
              {isLoading ? (
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500" />
                </div>
              ) : (
                <div className="p-10 bg-slate-50 rounded-[3rem] text-slate-400 flex flex-col items-center gap-5 border-2 border-dashed border-slate-200/60 max-w-sm">
                    <WifiOff className="w-14 h-14 opacity-20" />
                    <div className="space-y-2">
                        <p className="text-sm font-black header-font text-slate-500">محراب اليوم ينتظر رواده..</p>
                        <p className="text-[11px] font-bold header-font leading-relaxed">لم يسجل أي فارس رصيده بعد في منطقتك الزمنية. كن أنت الأول وانطلق في رحلة الارتقاء.</p>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <p className="text-xs font-bold header-font leading-relaxed relative z-10 opacity-80 italic">
          "إنما يقطع السفر بقوة العزيمة، لا بطول الأقدام. استعن بالله ولا تعجز."
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
