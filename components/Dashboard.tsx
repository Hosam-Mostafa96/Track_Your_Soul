
import React, { useMemo, useState } from 'react';
import { Flame, TrendingUp, Target, Medal, Sparkles, Edit2, Check, Settings, CalendarDays, BrainCircuit, X } from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DailyLog, AppWeights } from '../types';
import { calculateTotalScore } from '../utils/scoring';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  log: DailyLog;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  onDateChange: (date: string) => void;
  targetScore: number;
  onTargetChange: (score: number) => void;
  onOpenSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ log, logs, weights, onDateChange, targetScore, onTargetChange, onOpenSettings }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const currentTotalScore = calculateTotalScore(log, weights);
  const progressPercent = Math.min((currentTotalScore / targetScore) * 100, 100);

  // استخدام Gemini API لتقديم نصيحة روحية
  const getAiAdvice = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنا مستخدم لتطبيق عبادات. نقاطي اليوم هي ${currentTotalScore} من هدف ${targetScore}. 
        أعطني نصيحة روحية قصيرة جداً (سطرين كحد أقصى) باللغة العربية بأسلوب مشجع ومؤثر بناءً على هذا الأداء.`,
      });
      setAiAdvice(response.text || "استمر في مجاهدة نفسك، فكل خطوة تقربك من الله هي ربح عظيم.");
    } catch (e) {
      console.error("Gemini Error:", e);
      setAiAdvice("النية الصالحة هي روح العمل، واصل مسيرك بارك الله فيك ونفع بك.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      // Manual replacement for subDays(new Date(), i)
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - i);
      const d = format(dateObj, 'yyyy-MM-dd');
      const l = logs[d];
      return {
        // Manual replacement for parseISO(d)
        date: format(new Date(d.replace(/-/g, '/')), 'EEE', { locale: ar }),
        score: l ? calculateTotalScore(l, weights) : 0,
        fullDate: d
      };
    }).reverse();
  }, [logs, weights]);

  const maxScore = useMemo(() => {
    const allScores = (Object.values(logs) as DailyLog[]).map(l => calculateTotalScore(l, weights));
    return allScores.length > 0 ? Math.max(...allScores, currentTotalScore) : currentTotalScore;
  }, [logs, currentTotalScore, weights]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* زر المستشار الروحي الذكي */}
      <div className="relative group">
        <button 
          onClick={getAiAdvice}
          disabled={isAiLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 p-4 rounded-3xl shadow-lg flex items-center justify-between group-active:scale-95 transition-all text-white border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <BrainCircuit className={`w-5 h-5 ${isAiLoading ? 'animate-pulse' : ''}`} />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-bold header-font">المستشار الروحي (AI)</h4>
              <p className="text-[10px] opacity-80 header-font">اضغط للحصول على نصيحة لميزانك</p>
            </div>
          </div>
          <Sparkles className={`w-5 h-5 text-yellow-300 ${isAiLoading ? 'animate-spin' : 'animate-bounce'}`} />
        </button>

        {aiAdvice && (
          <div className="mt-4 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl relative animate-in slide-in-from-top duration-300">
            <button onClick={() => setAiAdvice(null)} className="absolute top-2 left-2 text-emerald-800 p-1 hover:bg-emerald-100 rounded-full">
              <X className="w-3 h-3" />
            </button>
            <p className="text-sm text-emerald-900 quran-font text-center leading-relaxed px-4">"{aiAdvice}"</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 header-font">التقدم نحو الهدف</h3>
          </div>
          <button onClick={onOpenSettings} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <Settings className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-2 relative">
          <div className="bg-emerald-500 h-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 header-font">
          <span>{Math.round(progressPercent)}% تم إنجازه</span>
          <span>المتبقي: {Math.max(0, targetScore - currentTotalScore).toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <Medal className="w-6 h-6 text-yellow-500 mb-2" />
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font">أعلى ميزان</p>
          <p className="text-xl font-bold text-slate-800 font-mono">{maxScore.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <Flame className="w-6 h-6 text-rose-500 mb-2" />
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font">النقاط الحالية</p>
          <p className="text-xl font-bold text-emerald-600 font-mono">{currentTotalScore.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
