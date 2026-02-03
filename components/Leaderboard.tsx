
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Crown, 
  Loader2, 
  Star, 
  RefreshCw, 
  Sparkles, 
  Medal, 
  AlertCircle,
  Activity,
  CheckCircle2,
  Clock,
  Sunrise,
  Sun,
  Moon,
  GraduationCap,
  Zap
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
    { text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", source: "حديث شريف" }
  ], []);

  const currentQuote = useMemo(() => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  }, [motivationalQuotes]);

  const processLeaderboard = (data: any[]) => {
    if (!Array.isArray(data)) return [];
    
    const topMap = new Map();
    data.forEach((entry: any) => {
      const emailKey = (entry.email || "").toLowerCase().trim();
      if (!emailKey) return;

      const score = Number(entry.score);
      const name = entry.name && entry.name !== "undefined" ? entry.name : "عابد مجهول";
      
      if (!topMap.has(emailKey) || (isNaN(topMap.get(emailKey).score) || score > topMap.get(emailKey).score)) {
        topMap.set(emailKey, { 
          name: name, 
          email: emailKey, 
          score: isNaN(score) ? 0 : score 
        });
      }
    });
    
    return Array.from(topMap.values()).sort((a, b) => b.score - a.score);
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
        if (data) {
          if (data.leaderboard) {
            const sortedAll = processLeaderboard(data.leaderboard);
            setGlobalTop(sortedAll.slice(0, 100));
            
            const myEmail = user.email.toLowerCase().trim();
            const myIdx = sortedAll.findIndex(p => p.email === myEmail);
            setUserRank(myIdx !== -1 ? myIdx + 1 : null);
          }
          if (data.activities) {
            setActivityFeed(data.activities);
          }
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
    const interval = setInterval(() => fetchGlobalData(true), 20000); 
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.email]);

  const getRankConfig = (index: number) => {
    switch(index) {
      case 0: return { bg: 'bg-amber-400', text: 'text-white', icon: <Crown className="w-5 h-5" /> };
      case 1: return { bg: 'bg-slate-300', text: 'text-slate-600', icon: <Medal className="w-5 h-5" /> };
      case 2: return { bg: 'bg-orange-400', text: 'text-white', icon: <Star className="w-5 h-5" /> };
      default: return { bg: 'bg-slate-50', text: 'text-slate-400', icon: null };
    }
  };

  const getActionIcon = (type: string) => {
    switch(type) {
      case 'quran': return <Zap className="w-4 h-4 text-emerald-500" />;
      case 'prayer': return <Sunrise className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isSync) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
        <AlertCircle className="w-12 h-12 text-amber-500 opacity-50" />
        <h3 className="font-bold text-slate-800 header-font">المنافسة معطلة</h3>
        <p className="text-xs text-slate-400 header-font">قم بتفعيل المزامنة لمشاركة النتائج.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-24 text-right" dir="rtl">
      <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-100 text-center">
        <p className="text-sm font-bold quran-font text-emerald-900 leading-relaxed mb-1">"{currentQuote.text}"</p>
        <span className="text-[8px] font-black text-emerald-600/40 header-font uppercase">{currentQuote.source}</span>
      </div>

      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
        <button onClick={() => setActiveView('ranks')} className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all ${activeView === 'ranks' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}>المتصدرون</button>
        <button onClick={() => setActiveView('activity')} className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all ${activeView === 'activity' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}>نشاط العابدين</button>
      </div>

      {activeView === 'ranks' ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-[2rem] p-6 text-white text-center shadow-lg">
            <h2 className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-2">ترتيبك الحالي</h2>
            <div className="text-4xl font-black font-mono text-yellow-400">{userRank || "---"}</div>
          </div>

          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-800 header-font text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> قائمة المتصدرين
            </h3>
            <button onClick={() => fetchGlobalData()} className={`p-2 rounded-xl bg-white border border-slate-100 ${isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-400'}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {globalTop.length > 0 ? globalTop.map((player, index) => {
              const isMe = player.email === user?.email.toLowerCase().trim();
              const rank = getRankConfig(index);
              return (
                <div key={index} className={`flex items-center p-3 rounded-[1.8rem] transition-all border ${isMe ? 'bg-emerald-700 text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white border-slate-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${isMe ? 'bg-white/20 border-white/30' : `${rank.bg} ${rank.text} border-white shadow-sm`}`}>
                    {rank.icon ? rank.icon : <span className="text-xs font-black font-mono">{index + 1}</span>}
                  </div>
                  <div className="flex-grow pr-3">
                    <div className="flex items-center gap-1">
                      <span className={`text-[13px] font-bold header-font truncate ${isMe ? 'text-white' : 'text-slate-800'}`}>{player.name}</span>
                      {isMe && <Sparkles className="w-3 h-3 text-yellow-300" />}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`text-lg font-black font-mono ${isMe ? 'text-white' : 'text-emerald-700'}`}>{Math.round(player.score).toLocaleString()}</div>
                    <div className={`text-[8px] font-bold opacity-60 ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>نقطة</div>
                  </div>
                </div>
              );
            }) : <LoaderBox isLoading={isLoading} networkError={networkError} />}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activityFeed.length > 0 ? activityFeed.map((act) => (
            <div key={act.id} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-right-2">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-50 rounded-xl">{getActionIcon(act.actionType)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{act.user}</span>
                    <span className="text-[11px] font-bold text-slate-800 header-font">{act.actionLabel}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 opacity-60">
                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400">{act.time}</span>
                  </div>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          )) : <LoaderBox isLoading={isLoading} networkError={networkError} />}
        </div>
      )}
    </div>
  );
};

const LoaderBox = ({ isLoading, networkError }: { isLoading: boolean, networkError: boolean }) => (
  <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200">
    {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-emerald-300 mx-auto" /> : <p className="text-xs text-slate-400 font-bold">{networkError ? 'خطأ في الاتصال بالسحابة' : 'لا توجد بيانات'}</p>}
  </div>
);

export default Leaderboard;
