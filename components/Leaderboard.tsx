
import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Users, Medal, RefreshCw, Sparkles } from 'lucide-react';
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

  // دالة الحصول على تاريخ القاهرة الحالي بتنسيق YYYY-MM-DD
  const getCairoDateStr = () => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  };

  // دالة ذكية للتحقق من أن السجل ينتمي لليوم الحالي في القاهرة
  const checkIfIsTodayCairo = (entry: any) => {
    const todayCairo = getCairoDateStr(); // الناتج: YYYY-MM-DD
    const [cYear, cMonth, cDay] = todayCairo.split('-').map(Number);

    if (entry.isToday === true || entry.isToday === "true") return true;
    if (!entry.date) return false;
    
    try {
      const entryStr = String(entry.date).trim();
      
      // الحالة 1: يبدأ بـ YYYY-MM-DD
      if (entryStr.startsWith(todayCairo)) return true;

      // الحالة 2: تحليل الأرقام يدوياً (DD/MM/YYYY أو MM/DD/YYYY)
      const digits = entryStr.match(/\d+/g);
      if (digits && digits.length >= 2) {
        // نبحث عن تطابق اليوم والشهر في أجزاء التاريخ
        const hasDay = digits.some(d => parseInt(d) === cDay);
        const hasMonth = digits.some(d => parseInt(d) === cMonth);
        // نتحقق أيضاً من عدم قدم السنة إذا وجدت
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

            // تطبيق الفلترة الصارمة لتوقيت القاهرة
            if (!checkIfIsTodayCairo(entry)) return;

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
      case 0: return { bg: 'bg-amber-400', text: 'text-amber-900', border: 'border-amber-300', icon: <Trophy className="w-4 h-4" /> };
      case 1: return { bg: 'bg-slate-200', text: 'text-slate-700', border: 'border-slate-300', icon: <Medal className="w-4 h-4" /> };
      case 2: return { bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-300', icon: <Star className="w-4 h-4" /> };
      default: return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', icon: null };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* هيدر الترتيب الملكي */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-5 bg-white/10 rounded-[2rem] mb-6 backdrop-blur-xl border border-white/20 shadow-inner">
            <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </div>
          <h2 className="text-3xl font-black header-font mb-2 tracking-tight">سباق الأبرار اليوم</h2>
          <p className="text-emerald-100/70 text-[10px] font-bold header-font uppercase tracking-[0.3em] mb-8">بتوقيت القاهرة • المحراب العالمي</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-1 w-full max-w-[240px] border border-white/10 shadow-2xl">
            <div className="bg-emerald-950/50 rounded-[2.2rem] py-6 px-4 flex flex-col items-center">
               <div className="flex items-center gap-1 dir-ltr mb-1">
                 <span className="text-6xl font-black font-mono text-yellow-400 tracking-tighter">{userRank || "---"}</span>
                 <span className="text-2xl font-black text-yellow-400/40 mt-3">#</span>
               </div>
               <div className="flex items-center gap-2">
                 <Sparkles className="w-3 h-3 text-emerald-400" />
                 <span className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest header-font">ترتيبك الآن</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* نبض المحراب */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Globe className={`w-6 h-6 ${isSync ? 'text-emerald-500' : 'text-slate-300'}`} />
              {isSync && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base">نبض المحراب الآن</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">نشاط اليوم القاهري</p>
            </div>
          </div>
          <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'يقيمون الليل', val: liveStats.qiyam, icon: <Moon className="w-4 h-4" /> },
            { label: 'يصلون الضحى', val: liveStats.duha, icon: <Sun className="w-4 h-4" /> },
            { label: 'طلاب علم', val: liveStats.knowledge, icon: <GraduationCap className="w-4 h-4" /> },
            { label: 'ذاكرون لله', val: liveStats.athkar, icon: <Activity className="w-4 h-4" /> }
          ].map((s, i) => (
            <div key={i} className="group bg-slate-50/70 p-5 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white transition-all text-center">
              <div className="inline-flex p-3 rounded-xl bg-white shadow-sm text-slate-400 mb-3 group-hover:text-emerald-500 transition-colors">
                {s.icon}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800 font-mono leading-none mb-1">{s.val}</span>
                <span className="text-[9px] font-bold text-slate-400 header-font">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة الفرسان - تصميم محسن للفصل بين الاسم والنقاط */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-2xl">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-black text-slate-800 header-font text-base uppercase tracking-wider">فرسان اليوم</h3>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 font-mono">{globalTop.length} نشط</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {globalTop.length > 0 ? (
            <>
              {globalTop.map((player, index) => {
                const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
                const badge = getRankBadge(index);

                return (
                  <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-4 md:p-6 rounded-[2.2rem] transition-all duration-300 relative gap-4 ${isMe ? 'bg-gradient-to-l from-emerald-600 to-emerald-700 text-white shadow-xl shadow-emerald-100 scale-[1.02] border-none' : 'bg-white border border-slate-50 hover:border-emerald-100 hover:shadow-lg'}`}>
                    
                    {/* الكتلة اليمنى: الهوية */}
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 font-mono font-black text-sm md:text-base ${isMe ? 'bg-white/20 border-white/30 text-white' : `${badge.bg} ${badge.border} ${badge.text}`}`}>
                        {badge.icon ? badge.icon : index + 1}
                      </div>
                      <div className="flex flex-col min-w-0 flex-grow">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm md:text-base font-bold header-font truncate ${isMe ? 'text-white' : 'text-slate-800'}`}>
                            {player.name}
                          </span>
                          {isMe && <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />}
                        </div>
                        <span className={`text-[9px] md:text-[10px] font-bold header-font ${isMe ? 'text-emerald-100/70' : 'text-slate-400'}`}>
                          والسابقون السابقون
                        </span>
                      </div>
                    </div>

                    {/* الكتلة اليسرى: الأداء الرقمي */}
                    <div className="flex flex-col items-end shrink-0 min-w-fit">
                      <div className={`px-4 py-1.5 rounded-2xl flex items-center gap-1.5 ${isMe ? 'bg-white/10' : 'bg-emerald-50/50'}`}>
                        <span className={`text-lg md:text-2xl font-black font-mono tracking-tighter tabular-nums ${isMe ? 'text-white' : 'text-emerald-700'}`}>
                          {player.score.toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-wider mt-1 px-1 ${isMe ? 'text-emerald-200' : 'text-emerald-400'}`}>
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
                  <Loader2 className="w-16 h-16 text-emerald-100 animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500" />
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-[3rem] text-slate-400 flex flex-col items-center gap-4 border-2 border-dashed border-slate-100">
                    <WifiOff className="w-12 h-12 opacity-20" />
                    <p className="text-xs font-bold header-font leading-relaxed">دخلنا يوماً جديداً بتوقيت القاهرة..<br/>بانتظار الفرسان لتسجيل أورادهم الأولى.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
