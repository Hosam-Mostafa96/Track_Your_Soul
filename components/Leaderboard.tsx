
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff, Star, Users, Medal, RefreshCw, History } from 'lucide-react';
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

  /**
   * دالة معالجة التاريخ لضمان مطابقة 20 يناير
   */
  const checkIfIsToday = (entryDateStr: string) => {
    if (!entryDateStr) return false;

    try {
      // تنظيف النص من أي فراغات زائدة
      const cleanStr = entryDateStr.trim();
      // فصل التاريخ عن الوقت
      const datePart = cleanStr.split(/\s+/)[0]; 
      // تقسيم المكونات (يدعم / و -)
      const parts = datePart.split(/[-/]/);
      
      if (parts.length !== 3) return false;

      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth() + 1;

      // تحويل الأجزاء لأرقام
      const p0 = parseInt(parts[0]);
      const p1 = parseInt(parts[1]);
      const p2 = parseInt(parts[2]);

      // منطق مرن: نبحث عن وجود اليوم (20) والشهر (1) في أي من الخانتين الأوليين
      const hasDay = p0 === currentDay || p1 === currentDay;
      const hasMonth = p0 === currentMonth || p1 === currentMonth;

      return hasDay && hasMonth;
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
          includeYesterday: true 
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.leaderboard) {
          const uniqueMap = new Map();
          const myEmail = user.email.toLowerCase().trim();
          
          data.leaderboard.forEach((entry: any) => {
            const emailKey = (entry.email || entry.name || "").toLowerCase().trim();
            if (!emailKey) return;
            
            const scoreInSheet = parseInt(entry.score) || 0;
            if (scoreInSheet <= 0) return;

            const isMe = emailKey === myEmail;
            
            // القاعدة الذهبية: إذا كان هذا أنا وسكوري في الشيت يطابق سكوري الحالي، فهو "اليوم" حتماً
            // أو إذا نجحت دالة فحص التاريخ
            let isToday = checkIfIsToday(entry.date) || entry.isToday === true || entry.isToday === "true";
            
            if (isMe && scoreInSheet === currentScore) {
              isToday = true;
            }
            
            if (!uniqueMap.has(emailKey)) {
              uniqueMap.set(emailKey, { ...entry, score: scoreInSheet, isToday, isMe });
            } else {
              const existing = uniqueMap.get(emailKey);
              // تفضيل سكور اليوم على الأمس لنفس الشخص
              if (isToday && !existing.isToday) {
                uniqueMap.set(emailKey, { ...entry, score: scoreInSheet, isToday, isMe });
              } else if (isToday === existing.isToday && scoreInSheet > existing.score) {
                uniqueMap.set(emailKey, { ...entry, score: scoreInSheet, isToday, isMe });
              }
            }
          });

          const allPlayers = Array.from(uniqueMap.values());
          
          // ترتيب: فرسان اليوم (حسب السكور) ثم فرسان الأمس (حسب السكور)
          const todayPlayers = allPlayers.filter(p => p.isToday).sort((a, b) => b.score - a.score);
          const yesterdayPlayers = allPlayers.filter(p => !p.isToday).sort((a, b) => b.score - a.score);

          const combined = [...todayPlayers, ...yesterdayPlayers];
          setGlobalTop(combined.slice(0, 100));
          
          const myIdx = combined.findIndex(p => p.isMe);
          if (myIdx !== -1) setUserRank(myIdx + 1);
          else setUserRank(null);
          
          if (data.stats) setLiveStats(data.stats);
        }
      }
    } catch (e) {
      console.error("Leaderboard fetch error", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(() => fetchGlobalData(true), 10000); 
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.email]);

  const getRankStyle = (index: number, isToday: boolean) => {
    if (!isToday) return { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-100', shadow: '', icon: null };
    switch(index) {
      case 0: return { bg: 'bg-gradient-to-br from-yellow-400 to-amber-600', text: 'text-white', border: 'border-yellow-200', shadow: 'shadow-lg shadow-yellow-100', icon: <Trophy className="w-3 h-3 fill-current" /> };
      case 1: return { bg: 'bg-gradient-to-br from-slate-200 to-slate-400', text: 'text-slate-700', border: 'border-slate-100', shadow: 'shadow-md shadow-slate-100', icon: <Medal className="w-3 h-3" /> };
      case 2: return { bg: 'bg-gradient-to-br from-orange-300 to-orange-500', text: 'text-white', border: 'border-orange-200', shadow: 'shadow-md shadow-orange-100', icon: <Star className="w-3 h-3 fill-current" /> };
      default: return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', shadow: '', icon: null };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-4 bg-white/10 rounded-full mb-4 backdrop-blur-md"><Crown className="w-10 h-10 text-yellow-400 drop-shadow-lg" /></div>
          <h2 className="text-2xl font-bold header-font">سباق الأبرار اليوم</h2>
          <div className="mt-4 bg-white/10 rounded-3xl px-10 py-5 border border-white/20 backdrop-blur-md shadow-inner flex flex-col items-center min-w-[180px]">
              <div className="flex items-center gap-1 justify-center dir-ltr">
                <span className="text-6xl font-black font-mono text-yellow-400 drop-shadow-md leading-none">{userRank || "---"}</span>
                <span className="text-3xl font-black text-yellow-400/50 mt-2">#</span>
              </div>
              <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-[0.2em] opacity-80 mt-2 header-font">ترتيبك في سباق اللحظة</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><Globe className={`w-5 h-5 ${isSync ? 'text-emerald-500' : 'text-slate-300'}`} /><h3 className="font-bold text-slate-800 header-font text-sm">نبض المحراب الآن</h3></div>
          <button onClick={() => fetchGlobalData()} disabled={isRefreshing} className={`p-2 rounded-xl bg-slate-50 transition-all ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-400'}`}><RefreshCw className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'يقيمون الليل', val: liveStats.qiyam, icon: <Moon className="w-3 h-3 text-indigo-500" /> },
            { label: 'يصلون الضحى', val: liveStats.duha, icon: <Sun className="w-3 h-3 text-amber-500" /> },
            { label: 'طلاب علم', val: liveStats.knowledge, icon: <GraduationCap className="w-3 h-3 text-emerald-500" /> },
            { label: 'ذاكرون', val: liveStats.athkar, icon: <Activity className="w-3 h-3 text-rose-500" /> }
          ].map((s, i) => (
            <div key={i} className="bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all text-center group">
              <div className="flex items-center justify-center gap-2 mb-1">{s.icon} <span className="text-[10px] font-bold text-slate-400 header-font group-hover:text-slate-600 transition-colors">{s.label}</span></div>
              <span className="text-2xl font-black text-slate-800 font-mono tracking-tighter">{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /><h3 className="font-black text-slate-800 header-font text-sm uppercase tracking-wide">المتصدرون</h3></div>
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-100"><Users className="w-3 h-3 text-emerald-600" /><span className="text-[10px] font-black text-emerald-700">{globalTop.length} نشط حالياً</span></div>
        </div>
        
        <div className="space-y-4">
          {globalTop.length > 0 ? (
            <>
              {globalTop.map((player, index) => {
                const rank = getRankStyle(index, player.isToday);
                const isFirstYesterday = index > 0 && globalTop[index-1].isToday && !player.isToday;

                return (
                  <React.Fragment key={`${player.email}-${index}`}>
                    {isFirstYesterday && (
                      <div className="flex items-center gap-4 py-8">
                        <div className="h-px bg-slate-100 flex-1"></div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                          <History className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500 header-font uppercase tracking-widest">مجاهدو الأمس</span>
                        </div>
                        <div className="h-px bg-slate-100 flex-1"></div>
                      </div>
                    )}
                    <div className={`group flex items-center justify-between p-4 rounded-3xl transition-all duration-500 ${player.isMe ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl scale-[1.02] border-none' : player.isToday ? 'bg-white border border-slate-100 hover:border-emerald-200' : 'bg-slate-50/50 border border-transparent opacity-80'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black relative overflow-hidden ${rank.bg} ${rank.text} border-2 ${rank.border}`}>
                          <span className="relative z-10">{index + 1}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold header-font truncate max-w-[140px] ${player.isMe ? 'text-white' : 'text-slate-800'}`}>{player.name} {player.isMe && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-lg mr-1">أنت</span>}</span>
                          <span className={`text-[9px] font-bold header-font ${player.isMe ? 'text-emerald-100 opacity-70' : 'text-slate-400'}`}>{player.isToday ? 'والسابقون السابقون' : 'جاهد فأصاب بالأمس'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-base font-black font-mono ${player.isMe ? 'text-white' : player.isToday ? 'text-emerald-700' : 'text-slate-500'}`}>{player.score.toLocaleString()}</span>
                        <span className={`text-[8px] font-black uppercase ${player.isMe ? 'text-emerald-200' : 'text-slate-400'}`}>{player.isToday ? 'نقاط اليوم' : 'نقاط الأمس'}</span>
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}
            </>
          ) : (
            <div className="text-center py-20 flex flex-col items-center">
              {isLoading ? <Loader2 className="w-12 h-12 text-emerald-100 animate-spin" /> : <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 flex flex-col items-center gap-3"><WifiOff className="w-10 h-10 opacity-20" /><p className="text-xs font-bold header-font">لا يوجد متسابقون نشطون حالياً</p></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
