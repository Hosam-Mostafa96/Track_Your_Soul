
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

  // مجموعة من النفحات الإيمانية المختارة للتحفيز
  const motivationalQuotes = useMemo(() => [
    { text: "وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ", source: "المطففين ٢٦" },
    { text: "سَابِقُوا إِلَى مَغْفِرَةٍ مِنْ رَبِّكُمْ وَجَنَّةٍ", source: "الحديد ٢١" },
    { text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", source: "حديث شريف" },
    { text: "فَاسْتَبِقُوا الْخَيْرَاتِ", source: "البقرة ١٤٨" },
    { text: "لَن يَنَالَ اللَّهَ لُحُومُهَا وَلَا دِمَاؤُهَا وَلَٰكِن يَنَالُهُ التَّقْوَىٰ مِنكُمْ", source: "الحج ٣٧" },
    { text: "إِنَّ اللهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ", source: "حديث شريف" },
    { text: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ", source: "حديث شريف" }
  ], []);

  const currentQuote = useMemo(() => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  }, [motivationalQuotes]);

  // الحصول على التاريخ المحلي الحالي
  const getLocalDateStr = () => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  };

  // دالة محسنة للتحقق من أن السجل لليوم (مرنة جداً)
  const checkIfIsTodayLocal = (entry: any) => {
    const today = new Date();
    const todayStr = getLocalDateStr(); // YYYY-MM-DD
    
    // 1. إذا كان السيرفر يؤكد أنه لليوم
    if (entry.isToday === true || entry.isToday === "true") return true;
    
    // 2. إذا كان هناك تاريخ، نقارنه بمرونة
    if (entry.date) {
      const entryStr = String(entry.date);
      if (entryStr.includes(todayStr)) return true;
      
      // مطابقة الأرقام (يوم وشهر)
      const digits = entryStr.match(/\d+/g);
      if (digits && digits.length >= 2) {
        const hasDay = digits.some(d => parseInt(d) === today.getDate());
        const hasMonth = digits.some(d => parseInt(d) === (today.getMonth() + 1));
        if (hasDay && hasMonth) return true;
      }
    }
    
    // 3. كحل أخير، إذا لم يوجد تاريخ ولكن تم إرساله في استعلام "اليوم"، نعتبره صالحاً
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

            // الفلترة المرنة لليوم
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

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return {
        bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
        text: 'text-white',
        shadow: 'shadow-amber-200',
        icon: <Crown className="w-5 h-5 text-white" />,
        label: 'متصدر السباق'
      };
      case 1: return {
        bg: 'bg-gradient-to-br from-slate-300 to-slate-500',
        text: 'text-white',
        shadow: 'shadow-slate-200',
        icon: <Medal className="w-5 h-5 text-white" />,
        label: 'وصيف الخير'
      };
      case 2: return {
        bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
        text: 'text-white',
        shadow: 'shadow-orange-200',
        icon: <Star className="w-5 h-5 text-white" />,
        label: 'من الأوائل'
      };
      default: return {
        bg: 'bg-slate-50',
        text: 'text-slate-500',
        shadow: 'shadow-none',
        icon: null,
        label: 'سابق بالخيرات'
      };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      
      {/* قسم النفحات الربانية - علوي */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[2.5rem] p-6 border border-emerald-100 shadow-sm relative overflow-hidden group">
        <Quote className="absolute -top-2 -right-2 w-16 h-16 text-emerald-200/40 -rotate-12 transition-transform group-hover:rotate-0" />
        <div className="relative z-10 text-center">
          <p className="text-xl md:text-2xl font-bold quran-font text-emerald-900 leading-relaxed mb-2">
            "{currentQuote.text}"
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-emerald-200"></span>
            <span className="text-[10px] font-black text-emerald-600/60 header-font uppercase tracking-widest">{currentQuote.source}</span>
            <span className="w-8 h-px bg-emerald-200"></span>
          </div>
        </div>
      </div>

      {/* هيدر الترتيب الملكي */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-black header-font mb-2">فرسان المحراب اليوم</h2>
          <p className="text-emerald-100/60 text-[10px] font-bold header-font uppercase tracking-[0.3em] mb-10">
            {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')} • سباق الأبرار
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-1.5 w-full max-w-[260px] border border-white/20 shadow-2xl">
            <div className="bg-emerald-950/60 rounded-[2.8rem] py-8 px-4 flex flex-col items-center border border-white/5">
               <div className="flex items-center gap-1 dir-ltr mb-1">
                 <span className="text-7xl font-black font-mono text-yellow-400 tracking-tighter drop-shadow-lg">{userRank || "---"}</span>
                 <span className="text-2xl font-black text-yellow-400/40 mt-4">#</span>
               </div>
               <div className="flex items-center gap-2">
                 <Sparkles className="w-3 h-3 text-emerald-400" />
                 <span className="text-[11px] font-black text-emerald-100/80 uppercase tracking-widest header-font">رتبتك الحالية</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* نبض المحراب العالمي */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl relative">
              <Globe className={`w-6 h-6 ${isSync ? 'text-emerald-600' : 'text-slate-300'}`} />
              {isSync && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-ping"></span>}
            </div>
            <div>
              <h3 className="font-black text-slate-800 header-font text-base tracking-tight">النشاط العالمي الآن</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إحصائيات المجاهدين حولك</p>
            </div>
          </div>
          <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all active:scale-95 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'قائمون بالليل', val: liveStats.qiyam, icon: <Moon className="w-4 h-4 text-indigo-600" /> },
            { label: 'مصلو الضحى', val: liveStats.duha, icon: <Sun className="w-4 h-4 text-amber-600" /> },
            { label: 'طلاب العلم', val: liveStats.knowledge, icon: <GraduationCap className="w-4 h-4 text-emerald-600" /> },
            { label: 'الذاكرون', val: liveStats.athkar, icon: <Activity className="w-4 h-4 text-rose-600" /> }
          ].map((s, i) => (
            <div key={i} className="group bg-slate-50/70 p-5 rounded-[2.2rem] border border-transparent hover:border-slate-100 hover:bg-white transition-all text-center">
              <div className="inline-flex p-3 rounded-2xl bg-white shadow-sm mb-3 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800 font-mono leading-none mb-1 tracking-tighter">{s.val}</span>
                <span className="text-[10px] font-bold text-slate-400 header-font uppercase tracking-tight">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة الفرسان - تصميم محسن */}
      <div className="bg-white rounded-[3rem] p-4 md:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 rounded-2xl shadow-inner">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 header-font text-lg tracking-tight">السابقون اليوم</h3>
              <p className="text-[10px] text-slate-400 font-bold">بناءً على موقعك الجغرافي</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 flex items-center gap-2 shadow-sm">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-emerald-700 font-mono">{globalTop.length} نشط</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {globalTop.length > 0 ? (
            <>
              {globalTop.map((player, index) => {
                const isMe = (player.email || "").toLowerCase().trim() === user?.email.toLowerCase().trim();
                const rankStyle = getRankStyle(index);

                return (
                  <div key={`${player.email || player.name}-${index}`} className={`flex items-center justify-between p-5 md:p-7 rounded-[2.5rem] transition-all duration-500 relative gap-4 group ${isMe ? 'bg-gradient-to-l from-emerald-700 to-emerald-900 text-white shadow-2xl shadow-emerald-200 scale-[1.02] border-none ring-4 ring-emerald-500/10' : 'bg-white border border-slate-50 hover:border-emerald-100 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1'}`}>
                    
                    {/* الهوية والرتبة */}
                    <div className="flex items-center gap-5 flex-grow min-w-0">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.4rem] flex items-center justify-center shrink-0 border-2 font-mono font-black text-lg shadow-sm group-hover:rotate-3 transition-transform ${isMe ? 'bg-white/20 border-white/30 text-white' : `${rankStyle.bg} border-white text-white ${rankStyle.shadow}`}`}>
                        {rankStyle.icon ? rankStyle.icon : index + 1}
                      </div>
                      <div className="flex flex-col min-w-0 flex-grow">
                        <div className="flex items-center gap-2">
                          <span className={`text-base md:text-lg font-black header-font truncate tracking-tight ${isMe ? 'text-white' : 'text-slate-800'}`}>
                            {player.name}
                          </span>
                          {isMe && <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />}
                          {index === 0 && <ShieldCheck className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${isMe ? 'bg-emerald-300' : 'bg-emerald-500'}`}></div>
                          <span className={`text-[10px] md:text-[11px] font-black header-font uppercase tracking-widest ${isMe ? 'text-emerald-100/70' : 'text-slate-400'}`}>
                            {rankStyle.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* النقاط */}
                    <div className="flex flex-col items-end shrink-0 min-w-fit">
                      <div className={`px-5 py-2.5 rounded-[1.8rem] flex items-center gap-2 border shadow-inner ${isMe ? 'bg-white/10 border-white/10' : 'bg-emerald-50/50 border-emerald-100/50'}`}>
                        <span className={`text-xl md:text-3xl font-black font-mono tracking-tighter tabular-nums ${isMe ? 'text-white' : 'text-emerald-800'}`}>
                          {player.score.toLocaleString()}
                        </span>
                        <ArrowUpRight className={`w-4 h-4 ${isMe ? 'text-white/40' : 'text-emerald-300'}`} />
                      </div>
                      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-2 ${isMe ? 'text-emerald-200/80' : 'text-emerald-500/60'}`}>
                        الرصيد الروحي
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
                <div className="p-10 bg-slate-50 rounded-[3rem] text-slate-400 flex flex-col items-center gap-5 border-2 border-dashed border-slate-200 max-w-sm">
                    <WifiOff className="w-14 h-14 opacity-20" />
                    <div className="space-y-2">
                        <p className="text-sm font-black header-font text-slate-500">بانتظار انطلاق السباق..</p>
                        <p className="text-[11px] font-bold header-font leading-relaxed">لم تسجل أي بيانات لليوم في منطقتك الجغرافية بعد. كن أنت الفارس الأول الذي يفتتح محراب الخير!</p>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* حكمة ختامية */}
      <div className="p-8 bg-slate-900 rounded-[3rem] text-white text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <p className="text-sm font-bold header-font leading-relaxed relative z-10 opacity-80 italic">
          "ميزانك الحقيقي هو ما استقر في قلبك وصدقه عملك.. استعن بالله ولا تعجز."
        </p>
      </div>

    </div>
  );
};

export default Leaderboard;
