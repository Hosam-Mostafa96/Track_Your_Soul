
import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Globe, Moon, Sun, GraduationCap, Activity, Loader2, WifiOff } from 'lucide-react';
import { DailyLog, AppWeights, User } from '../types';

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzbkn4MVK27wrmAhkDvKjZdq01vOQWG7-SFDOltC4e616Grjp-uMsON4cVcr3OOVKqg/exec"; 

interface LeaderboardProps {
  user: User | null;
  currentScore: number;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  isSync: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, currentScore, isSync }) => {
  const [liveStats, setLiveStats] = useState({
    qiyam: 0, duha: 0, knowledge: 0, athkar: 0, totalUsers: 0
  });
  const [globalTop, setGlobalTop] = useState<any[]>([]);
  const [userGlobalRank, setUserGlobalRank] = useState<number | string>("---");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const fetchGlobalData = async (isSilent = false) => {
    if (!isSync || !user?.email || GOOGLE_STATS_API.includes("FIX_ME")) return;
    
    if (!isSilent) setIsLoading(true);
    try {
      const res = await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify({
          action: 'getStats',
          email: user.email.toLowerCase().trim(),
          name: user.name || "مصلٍ مجهول",
          score: currentScore
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.leaderboard) {
          // 1. تصفية التكرارات (Deduplication) - نأخذ أعلى نتيجة لكل إيميل
          const uniqueUsersMap = new Map();
          
          data.leaderboard.forEach((entry: any) => {
            if (!entry.email && !entry.name) return;
            const emailKey = (entry.email || entry.name).toLowerCase().trim();
            const score = parseInt(entry.score) || 0;
            
            if (!uniqueUsersMap.has(emailKey) || uniqueUsersMap.get(emailKey).score < score) {
              uniqueUsersMap.set(emailKey, { ...entry, score });
            }
          });

          // 2. تحويل الخريطة لمصفوفة وترتيبها تنازلياً
          const sortedList = Array.from(uniqueUsersMap.values())
            .sort((a, b) => b.score - a.score);

          // 3. حساب ترتيب المستخدم الحالي بدقة
          const myEmail = user.email.toLowerCase().trim();
          const myIndex = sortedList.findIndex(p => (p.email || p.name).toLowerCase().trim() === myEmail);
          
          setGlobalTop(sortedList.slice(0, 50)); // عرض أفضل 50 فقط
          setUserGlobalRank(myIndex !== -1 ? myIndex + 1 : (data.userRank || "---"));
          
          if (data.stats) setLiveStats(data.stats);
          setHasError(false);
        }
      } else {
        setHasError(true);
      }
    } catch (e) {
      console.error("Leaderboard error:", e);
      setHasError(true);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    // تقليل وتيرة التحديث لـ 15 ثانية لضمان استقرار السيرفر وتجنب التكرار السريع
    const interval = setInterval(() => fetchGlobalData(true), 15000); 
    return () => clearInterval(interval);
  }, [isSync, currentScore, user?.email]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* بطاقة الترتيب العلوي */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-4 bg-white/10 rounded-full mb-4 backdrop-blur-md">
            <Trophy className="w-10 h-10 text-yellow-400 fill-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold header-font">والسابقون السابقون أولئك المقربون</h2>
          
          {isSync ? (
            <div className="mt-4 bg-white/10 rounded-3xl px-8 py-4 border border-white/20 backdrop-blur-sm animate-in zoom-in duration-500">
                <span className="text-5xl font-black font-mono text-yellow-400 block mb-1">
                  {userGlobalRank === "---" ? "..." : `#${userGlobalRank}`}
                </span>
                <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest opacity-80">مركزك بين المتسابقين</p>
            </div>
          ) : (
            <p className="text-emerald-100 text-[11px] font-bold header-font opacity-80 mt-1 uppercase tracking-widest italic">المزامنة معطلة - فعلها من الإعدادات</p>
          )}
        </div>
      </div>

      {hasError && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-pulse">
          <WifiOff className="w-5 h-5" />
          <p className="text-xs font-bold header-font">تعذر الاتصال بالسحاب. تأكد من جودة الإنترنت.</p>
        </div>
      )}

      {/* إحصائيات المحراب */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className={`w-5 h-5 ${isSync ? 'text-emerald-500' : 'text-slate-300'}`} />
            <h3 className="font-bold text-slate-800 header-font text-sm">نبض الأمة الآن</h3>
          </div>
          {isSync && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> متصل
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'يقيمون الليل', val: liveStats.qiyam, icon: <Moon className="w-3 h-3 text-indigo-500" /> },
            { label: 'يصلون الضحى', val: liveStats.duha, icon: <Sun className="w-3 h-3 text-amber-500" /> },
            { label: 'طلاب علم', val: liveStats.knowledge, icon: <GraduationCap className="w-3 h-3 text-emerald-500" /> },
            { label: 'ذاكرون', val: liveStats.athkar, icon: <Activity className="w-3 h-3 text-rose-500" /> }
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-emerald-100 transition-all text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {s.icon} <span className="text-[10px] font-bold text-slate-500 header-font">{s.label}</span>
              </div>
              <span className="text-xl font-black text-slate-800 font-mono">{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة المتصدرين المصفاة */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-slate-800 header-font text-sm uppercase tracking-wider">الأوائل في الخيرات</h3>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
        </div>

        <div className="space-y-3">
          {globalTop.length > 0 ? globalTop.map((player, index) => {
             const isMe = (player.email || player.name).toLowerCase().trim() === user?.email.toLowerCase().trim();
             return (
              <div key={player.email || index} className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-500 ${isMe ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 scale-[1.03] z-10' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-yellow-400 text-white shadow-sm' : index === 1 ? 'bg-slate-300 text-slate-600' : index === 2 ? 'bg-amber-600 text-white' : 'bg-white/30 text-slate-400'}`}>
                      {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold header-font">
                        {player.name} {isMe && "(أنت)"}
                    </span>
                    {isMe && <span className="text-[8px] opacity-70 header-font">أداء مبارك اليوم</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black font-mono ${isMe ? 'text-white' : 'text-slate-800'}`}>{player.score.toLocaleString()}</span>
                  {isMe && <Activity className="w-4 h-4 text-emerald-200 animate-pulse" />}
                </div>
              </div>
             )
          }) : (
            <div className="text-center py-12 flex flex-col items-center">
                <div className="p-4 bg-slate-50 rounded-full mb-3">
                  <Loader2 className="w-8 h-8 text-emerald-200 animate-spin" />
                </div>
                <p className="text-[10px] text-slate-300 font-bold header-font animate-pulse">جاري جلب قائمة الأبرار المحدثة..</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
