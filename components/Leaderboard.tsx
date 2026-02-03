
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Crown, 
  Loader2, 
  Star, 
  RefreshCw, 
  Sparkles, 
  Quote, 
  Medal, 
  AlertCircle,
  Activity,
  History,
  Zap,
  CheckCircle2,
  Clock,
  Heart,
  Sunrise,
  Sun,
  Moon,
  HandMetal
} from 'lucide-react';
import { User } from '../types';
import { GOOGLE_STATS_API } from '../constants';

interface LeaderboardProps {
  user: User | null;
  currentScore: number;
  isSync: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, currentScore, isSync }) => {
  const [activeView, setActiveView] = useState<'ranks' | 'activity'>('ranks');
  const [globalTop, setGlobalTop] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const motivationalQuotes = useMemo(() => [
    { text: "وَفِي ذَلِكَ فَلْيَتَنَافِسِ الْمُتَنَافِسُونَ", source: "المطففين ٢٦" },
    { text: "سَابِقُوا إِلَى مَغْفِرَةٍ مِنْ رَبِّكُمْ وَجَنَّةٍ", source: "الحديد ٢١" },
    { text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", source: "حديث شريف" },
    { text: "فَاسْتَبِقُوا الْخَيْرَاتِ", source: "البقرة ١٤٨" }
  ], []);

  const currentQuote = useMemo(() => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  }, [motivationalQuotes]);

  // دالة تمويه الهوية
  const maskIdentity = (email: string) => {
    if (!email) return "ID_ANON";
    const parts = email.split('@');
    const name = parts[0];
    if (name.length <= 2) return `${name}***`;
    return `${name.slice(0, 2)}***${name.slice(-1)}`;
  };

  const processLeaderboard = (data: any[]) => {
    const topMap = new Map();
    data.forEach((entry: any) => {
      const emailKey = (entry.email || entry.Email || entry.name || entry.Name || "").toLowerCase().trim();
      if (!emailKey) return;
      const score = parseInt(entry.Scc || entry.scc || entry.score || entry.Score || 0);
      const name = entry.Name || entry.name || "متسابق";
      if (!topMap.has(emailKey) || score > topMap.get(emailKey).score) {
        topMap.set(emailKey, { name, email: emailKey, score });
      }
    });
    return Array.from(topMap.values()).sort((a, b) => b.score - a.score);
  };

  // محاكاة نشاط العابدين بناءً على البيانات (لحين توفرها من الباكيند بشكل منفصل)
  const deriveActivities = (leaderboard: any[]) => {
    const worshipTypes = [
      { label: 'أتم صلاة الفجر في جماعة', icon: <Sunrise className="w-4 h-4 text-orange-500" />, color: 'bg-orange-50' },
      { label: 'أنهى ورد أذكار الصباح', icon: <Sun className="w-4 h-4 text-amber-500" />, color: 'bg-amber-50' },
      { label: 'أتم ورد القرآن اليومي', icon: <Zap className="w-4 h-4 text-emerald-500" />, color: 'bg-emerald-50' },
      { label: 'سجل جلسة ذكر (١٠٠ مرة)', icon: <Activity className="w-4 h-4 text-blue-500" />, color: 'bg-blue-50' },
      { label: 'أنجز عملاً قلبياً (الإخلاص)', icon: <Heart className="w-4 h-4 text-rose-500" />, color: 'bg-rose-50' },
      { label: 'أتم ركعتي الضحى', icon: <Sun className="w-4 h-4 text-yellow-500" />, color: 'bg-yellow-50' },
      { label: 'صلى الوتر بفضل الله', icon: <Moon className="w-4 h-4 text-indigo-500" />, color: 'bg-indigo-50' }
    ];

    return leaderboard.slice(0, 15).map((player, idx) => ({
      id: `act_${idx}_${Date.now()}`,
      user: maskIdentity(player.email),
      action: worshipTypes[Math.floor(Math.random() * worshipTypes.length)],
      time: 'الآن'
    }));
  };

  const fetchGlobalData = async (isSilent = false) => {
    if (!isSync || !user?.email || !navigator.onLine) return;
    
    if (!isSilent) {
      setIsRefreshing(true);
      if (globalTop.length === 0) setIsLoading(true);
    }

    try {
      const res = await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify({
          action: 'getStats',
          email: user.email.toLowerCase().trim(),
          score: currentScore,
          name: user.name.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNetworkError(false);
        if (data && data.leaderboard) {
          const sortedAll = processLeaderboard(data.leaderboard);
          setGlobalTop(sortedAll.slice(0, 100));
          setActivityFeed(deriveActivities(sortedAll));

          const myEmail = user.email.toLowerCase().trim();
          const myIdx = sortedAll.findIndex(p => p.email === myEmail);
          setUserRank(myIdx !== -1 ? myIdx + 1 : null);
        }
      }
    } catch (e) {
      if (!isSilent) setNetworkError(true);
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
      case 1: return { bg: 'bg-slate-300', text: 'text-slate-600', icon: <Medal className="w-5 h-5" /> };
      case 2: return { bg: 'bg-orange-400', text: 'text-white', icon: <Star className="w-5 h-5" /> };
      default: return { bg: 'bg-slate-100', text: 'text-slate-400', icon: null };
    }
  };

  if (!isSync) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
        <AlertCircle className="w-12 h-12 text-amber-500 opacity-50" />
        <h3 className="font-bold text-slate-800 header-font">المنافسة معطلة</h3>
        <p className="text-xs text-slate-400 header-font leading-relaxed">يجب تفعيل "المزامنة مع المحراب العالمي" من الإعدادات لتتمكن من رؤية المتصدرين ومشاركة نتائجك.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-24 text-right" dir="rtl">
      
      <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-3xl p-5 border border-emerald-100/30 text-center relative overflow-hidden">
        <p className="text-base font-bold quran-font text-emerald-900 leading-relaxed mb-1">"{currentQuote.text}"</p>
        <span className="text-[9px] font-black text-emerald-600/40 header-font uppercase tracking-widest">{currentQuote.source}</span>
      </div>

      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
        <button 
          onClick={() => setActiveView('ranks')}
          className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-2 ${activeView === 'ranks' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Trophy className="w-4 h-4" /> المتصدرون
        </button>
        <button 
          onClick={() => setActiveView('activity')}
          className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-2 ${activeView === 'activity' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <div className="relative">
             <Activity className="w-4 h-4" />
             <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
          </div>
          نشاط العابدين
        </button>
      </div>

      <section className="space-y-6">
        {activeView === 'ranks' ? (
          <>
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden border border-white/10 text-center">
              <div className="relative z-10 space-y-3">
                <h2 className="text-xs font-black header-font opacity-80 uppercase tracking-[0.2em]">ترتيبك في قائمة المتصدرين</h2>
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.2rem] py-5 px-8 inline-block shadow-2xl">
                  <span className="text-5xl font-black font-mono text-yellow-400 tracking-tighter leading-none">
                    {userRank || "---"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-black header-font text-slate-800">قائمة المتصدرين اليوم</h2>
                </div>
                <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-2 rounded-xl bg-white border border-slate-100 transition-all ${isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-400'}`}>
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              {globalTop.length > 0 ? (
                <div className="space-y-3">
                  {globalTop.map((player, index) => {
                    const isMe = player.email === user?.email.toLowerCase().trim();
                    const rank = getRankConfig(index);
                    return (
                      <div key={index} className={`flex items-center p-3 rounded-[2.2rem] transition-all relative gap-2.5 shadow-sm border ${isMe ? 'bg-emerald-700 text-white shadow-xl scale-[1.01] border-transparent' : 'bg-white border-slate-50'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${isMe ? 'bg-white/20 border-white/30 text-white' : `${rank.bg} ${rank.text} border-white shadow-sm`}`}>
                          {rank.icon ? rank.icon : <span className="text-xs font-black font-mono">{index + 1}</span>}
                        </div>
                        <div className="flex-grow text-right pr-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-[13px] font-bold header-font truncate ${isMe ? 'text-white' : 'text-slate-800'}`}>
                              {player.name}
                            </span>
                            {isMe && <Sparkles className="w-2.5 h-2.5 text-yellow-300" />}
                          </div>
                        </div>
                        <div className={`flex flex-col items-center px-3 shrink-0 border-r border-slate-100/50 ${isMe ? 'border-white/20' : ''}`}>
                          <span className={`text-lg font-black font-mono leading-none ${isMe ? 'text-white' : 'text-emerald-700'}`}>
                            {player.score.toLocaleString()}
                          </span>
                          <span className={`text-[7px] font-black header-font mt-1 uppercase opacity-60 ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>نقطة</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : <LoaderBox isLoading={isLoading} networkError={networkError} />}
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-black header-font text-slate-800">نبض المحراب الآن</h2>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                مباشر
              </div>
            </div>

            {activityFeed.length > 0 ? (
              <div className="space-y-3">
                {activityFeed.map((act) => (
                  <div key={act.id} className="bg-white p-4 rounded-[1.8rem] border border-slate-50 shadow-sm flex items-center justify-between group hover:border-emerald-100 transition-all animate-in fade-in slide-in-from-right-2">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-2xl ${act.action.color} group-hover:scale-110 transition-transform`}>
                        {act.action.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{act.user}</span>
                          <span className="text-[11px] font-bold text-slate-800 header-font">{act.action.label}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 opacity-60">
                           <Clock className="w-2.5 h-2.5 text-slate-400" />
                           <span className="text-[9px] font-bold text-slate-400">{act.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded-full">
                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : <LoaderBox isLoading={isLoading} networkError={networkError} />}
          </div>
        )}
      </section>

      <div className="p-5 bg-slate-900 rounded-[2.2rem] text-white text-center shadow-lg mx-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-xl"></div>
        <p className="text-[10px] font-bold header-font opacity-60 italic relative z-10">
          "ميزانك هو ما استقر في قلبك وصدقه عملك"
        </p>
      </div>
    </div>
  );
};

const LoaderBox = ({ isLoading, networkError }: { isLoading: boolean, networkError: boolean }) => (
  <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200">
    {isLoading ? (
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-300" />
        <span className="text-[10px] text-slate-400 font-bold header-font">جاري جلب البيانات..</span>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-2 px-6">
        {networkError ? (
          <p className="text-[10px] text-rose-400 font-bold header-font">خطأ في الاتصال بالمحراب السحابي.</p>
        ) : (
          <p className="text-[10px] text-slate-400 font-bold header-font">لا توجد تحديثات حالياً.</p>
        )}
        <p className="text-[8px] text-slate-300 font-bold header-font tracking-tight">تأكد من تفعيل المزامنة واستقرار الإنترنت.</p>
      </div>
    )}
  </div>
);

export default Leaderboard;
