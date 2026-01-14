
import React, { useMemo } from 'react';
import { Trophy, Medal, Crown, Sparkles, Flame, Zap, Moon, Sun, Stars, GraduationCap, BookOpen, AlertCircle, User, TrendingUp, CalendarDays } from 'lucide-react';
import { DailyLog, AppWeights } from '../types';
import { calculateTotalScore } from '../utils/scoring';

interface LeaderboardProps {
  user: { name: string, email: string } | null;
  currentScore: number;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, currentScore, logs, weights }) => {
  const topScores = useMemo(() => {
    // Explicitly cast Object.entries result to [string, DailyLog][] to ensure correct typing during iteration
    return (Object.entries(logs) as [string, DailyLog][])
      .map(([date, log]) => ({
        date,
        score: calculateTotalScore(log, weights)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [logs, weights]);

  const averageScore = useMemo(() => {
    // Explicitly cast Object.values result to DailyLog[] to avoid 'unknown' type errors
    const values = (Object.values(logs) as DailyLog[]).map(l => calculateTotalScore(l, weights));
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [logs, weights]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-4 bg-white/10 rounded-full mb-4 backdrop-blur-md">
            <Trophy className="w-10 h-10 text-yellow-400 fill-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold header-font">سجل الإنجازات الشخصي</h2>
          <p className="text-emerald-100 text-[11px] font-bold header-font opacity-80 mt-1 uppercase tracking-widest">
            تحدَّ نفسك وارتقِ بميزانك يوماً بعد يوم
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font">متوسط النقاط</p>
          <p className="text-2xl font-black text-slate-800 font-mono">{averageScore.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <CalendarDays className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font">إجمالي الأيام</p>
          <p className="text-2xl font-black text-slate-800 font-mono">{Object.keys(logs).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Medal className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-slate-800 header-font text-sm uppercase tracking-wider">أفضل 10 أيام في ميزانك</h3>
        </div>

        <div className="space-y-3">
          {topScores.length > 0 ? topScores.map((entry, index) => (
            <div 
              key={entry.date} 
              className={`flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-emerald-100 transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm ${index === 0 ? 'bg-yellow-400 text-white shadow-md' : 'bg-white text-slate-400'}`}>
                  {index + 1}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700 header-font text-sm">
                        {entry.date === new Date().toISOString().split('T')[0] ? 'اليوم' : entry.date}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase header-font">تاريخ الإنجاز</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-600 font-mono">{entry.score.toLocaleString()}</span>
                <span className="text-[8px] text-slate-400 block font-bold uppercase header-font">نقطة</span>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center py-12 text-slate-300">
              <Sparkles className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-xs font-bold header-font">ابدأ التسجيل اليوم لتبني تاريخك!</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-emerald-600" />
        <p className="text-[10px] text-emerald-700 font-bold header-font leading-relaxed">
            تم إيقاف المزامنة السحابية. جميع بياناتك وإنجازاتك الآن مخزنة بشكل آمن على جهازك فقط لضمان أقصى درجات الخصوصية.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
