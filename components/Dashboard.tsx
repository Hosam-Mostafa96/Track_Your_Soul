
import React, { useMemo, useState } from 'react';
import { 
  Flame, 
  Target, 
  Sparkles, 
  Edit2, 
  Check, 
  BrainCircuit, 
  X, 
  Save, 
  TrendingUp, 
  Zap,
  Activity,
  History
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, isBefore, parseISO } from 'date-fns';
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
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetScore.toString());

  const currentTotalScore = calculateTotalScore(log, weights);
  const progressPercent = Math.min((currentTotalScore / targetScore) * 100, 100);

  // حساب الزخم الروحي (مقارنة اليوم بمتوسط الـ 7 أيام الماضية)
  const momentumInfo = useMemo(() => {
    const scores = Array.from({ length: 7 }).map((_, i) => {
      const d = format(subDays(new Date(), i + 1), 'yyyy-MM-dd');
      const l = logs[d];
      return l ? calculateTotalScore(l, weights) : 0;
    });
    const avg = scores.reduce((a, b) => a + b, 0) / 7;
    const diff = avg === 0 ? 100 : Math.round(((currentTotalScore - avg) / avg) * 100);
    
    return {
      percent: diff,
      status: diff >= 0 ? 'ارتقاء' : 'مجاهدة',
      color: diff >= 0 ? 'text-emerald-500' : 'text-amber-500'
    };
  }, [logs, currentTotalScore, weights]);

  // حساب سلسلة الاستقامة (الأيام المتتالية فوق 50% من الهدف)
  const streakCount = useMemo(() => {
    let count = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dayLog = logs[dateStr];
      if (!dayLog) break;
      
      const dayScore = calculateTotalScore(dayLog, weights);
      if (dayScore >= targetScore * 0.5) {
        count++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    return count;
  }, [logs, weights, targetScore]);

  const getAiAdvice = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنا مستخدم لتطبيق عبادات. نقاطي اليوم هي ${currentTotalScore} من هدف ${targetScore}. زخمي الروحي حالياً ${momentumInfo.percent}%. 
        أعطني نصيحة روحية قصيرة جداً (سطرين كحد أقصى) باللغة العربية بأسلوب مشجع بناءً على هذه الأرقام.`,
      });
      setAiAdvice(response.text || "استمر في مجاهدة نفسك، فكل خطوة تقربك من الله هي ربح عظيم.");
    } catch (e) {
      console.error("Gemini Error:", e);
      setAiAdvice("النية الصالحة هي روح العمل، واصل مسيرك بارك الله فيك ونفع بك.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveTarget = () => {
    const newTarget = parseInt(tempTarget);
    if (!isNaN(newTarget) && newTarget > 0) {
      onTargetChange(newTarget);
      setIsEditingTarget(false);
    }
  };

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = subDays(new Date(), i);
      const d = format(dateObj, 'yyyy-MM-dd');
      const l = logs[d];
      return {
        date: format(dateObj, 'EEE', { locale: ar }),
        score: l ? calculateTotalScore(l, weights) : 0,
        fullDate: d
      };
    }).reverse();
  }, [logs, weights]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* المستشار الروحي */}
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

      {/* التقدم نحو الهدف وتعديله */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 header-font">الهدف اليومي</h3>
          </div>
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 animate-in zoom-in duration-200">
                <input 
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="w-16 bg-transparent border-none outline-none text-xs font-bold text-emerald-700 text-center"
                  autoFocus
                />
                <button onClick={handleSaveTarget} className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setTempTarget(targetScore.toString()); setIsEditingTarget(true); }} 
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all border border-transparent hover:border-slate-200"
              >
                <span className="text-xs font-bold header-font">{targetScore.toLocaleString()}</span>
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-2 relative">
          <div className="bg-emerald-500 h-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 header-font uppercase tracking-wider">
          <span>{Math.round(progressPercent)}% تم إنجازه</span>
          <span>المتبقي: {Math.max(0, targetScore - currentTotalScore).toLocaleString()}</span>
        </div>
      </div>

      {/* الخواص البديلة: الزخم الروحي وسلسلة النور */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className={`p-3 rounded-2xl mb-3 ${momentumInfo.percent >= 0 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            <Activity className={`w-6 h-6 ${momentumInfo.color}`} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font mb-1">زخم الارتقاء</p>
          <div className="flex flex-col">
            <span className={`text-xl font-black font-mono ${momentumInfo.color}`}>
              {momentumInfo.percent > 0 ? '+' : ''}{momentumInfo.percent}%
            </span>
            <span className={`text-[9px] font-bold header-font opacity-70`}>حالة {momentumInfo.status}</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className={`p-3 rounded-2xl mb-3 ${streakCount > 0 ? 'bg-orange-50' : 'bg-slate-50'}`}>
            <Flame className={`w-6 h-6 ${streakCount > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font mb-1">سلسلة النور</p>
          <div className="flex flex-col">
            <span className={`text-xl font-black font-mono ${streakCount > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
              {streakCount} يوم
            </span>
            <span className="text-[9px] font-bold header-font opacity-70">استقامة متصلة</span>
          </div>
        </div>
      </div>

      {/* الرسم البياني */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-slate-600 header-font text-xs">نبض الميزان (أخر ٧ أيام)</h3>
        </div>
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
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontFamily: 'Cairo', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
