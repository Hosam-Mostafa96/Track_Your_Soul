
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Target, 
  Sparkles, 
  Edit2, 
  Check, 
  BrainCircuit, 
  X, 
  Activity, 
  History, 
  Award, 
  Sun, 
  Moon, 
  Lock, 
  Home, 
  Key, 
  Coins, 
  Heart, 
  CloudMoon, 
  BellRing,
  Info,
  ChevronLeft
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DailyLog, AppWeights, PrayerName, PrayerEntry } from '../types';
import { calculateTotalScore } from '../utils/scoring';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';

interface DashboardProps {
  log: DailyLog;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  onDateChange: (date: string) => void;
  targetScore: number;
  onTargetChange: (score: number) => void;
  onOpenSettings: () => void;
  adminMessages?: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ log, logs, weights, onDateChange, targetScore, onTargetChange, onOpenSettings, adminMessages = [] }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetScore.toString());
  
  const prevBadgesActiveState = useRef<Record<string, boolean>>({});
  const isFirstRender = useRef(true);

  const currentTotalScore = calculateTotalScore(log, weights);
  const progressPercent = Math.min((currentTotalScore / targetScore) * 100, 100);

  const badges = useMemo(() => {
    const rawatibIds = ['fajr_pre', 'dhuhr_pre', 'dhuhr_post', 'maghrib_post', 'isha_post'];
    const allUserSunnahs = (Object.values(log.prayers) as PrayerEntry[]).flatMap(p => p.surroundingSunnahIds || []);
    const fullRawatibDone = rawatibIds.every(id => allUserSunnahs.includes(id));
    
    return [
      { id: 'fajr', title: 'بشرى الرؤية', desc: 'تستحق رؤية الله في الآخرة', icon: <Sun className="w-5 h-5" />, active: log.prayers[PrayerName.FAJR]?.performed, color: 'from-amber-400 to-orange-500' },
      { id: 'rawatib', title: 'بيت في الجنة', desc: 'من صلى ثنتي عشرة ركعة..', icon: <Home className="w-5 h-5" />, active: fullRawatibDone, color: 'from-emerald-400 to-teal-600' },
      { id: 'fasting', title: 'بعيد عن النار', desc: 'باعد الله وجهه عن النار ٧٠ خريفاً', icon: <Flame className="w-5 h-5" />, active: log.nawafil.fasting, color: 'from-orange-400 to-rose-600' },
      { id: 'istighfar', title: 'مفتاح الرزق', desc: 'فقلت استغفروا ربكم.. يرسل السماء', icon: <Coins className="w-5 h-5" />, active: log.athkar.counters.istighfar > 0, color: 'from-blue-400 to-cyan-600' },
      { id: 'hawqalah', title: 'مفتاح النجاح', desc: 'لا حول ولا قوة إلا بالله كنز الجنة', icon: <Key className="w-5 h-5" />, active: log.athkar.counters.hawqalah > 0, color: 'from-indigo-400 to-blue-700' },
      { id: 'salawat', title: 'مفتاح القرب', desc: 'أقربكم مني مجلساً أكثركم صلاة علي', icon: <Heart className="w-5 h-5" />, active: log.athkar.counters.salawat > 0, color: 'from-rose-400 to-pink-600' },
      { id: 'witr', title: 'محبوب الرحمن', desc: 'إن الله وتر يحب الوتر فأوتروا', icon: <CloudMoon className="w-5 h-5" />, active: log.nawafil.witrDuration > 0, color: 'from-slate-700 to-indigo-900' }
    ];
  }, [log]);

  useEffect(() => {
    if (isFirstRender.current) {
      badges.forEach(badge => { prevBadgesActiveState.current[badge.id] = !!badge.active; });
      isFirstRender.current = false;
      return;
    }
    let triggered = false;
    badges.forEach(badge => {
      if (badge.active && !prevBadgesActiveState.current[badge.id]) triggered = true;
      prevBadgesActiveState.current[badge.id] = !!badge.active;
    });
    if (triggered) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#fbbf24', '#3b82f6', '#f43f5e', '#a855f7'], zIndex: 9999 });
    }
  }, [badges]);

  const momentumInfo = useMemo(() => {
    const scores = Array.from({ length: 7 }).map((_, i) => {
      const d = format(subDays(new Date(), i + 1), 'yyyy-MM-dd');
      const l = logs[d];
      return l ? calculateTotalScore(l, weights) : 0;
    });
    const avg = scores.reduce((a, b) => a + b, 0) / 7;
    const diff = avg === 0 ? 100 : Math.round(((currentTotalScore - avg) / avg) * 100);
    return { percent: diff, status: diff >= 0 ? 'ارتقاء' : 'مجاهدة', color: diff >= 0 ? 'text-emerald-500' : 'text-amber-500' };
  }, [logs, currentTotalScore, weights]);

  const streakCount = useMemo(() => {
    let count = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dayLog = logs[dateStr];
      if (!dayLog) break;
      if (calculateTotalScore(dayLog, weights) >= targetScore * 0.5) { count++; checkDate = subDays(checkDate, 1); } 
      else break;
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
        contents: `أنا مستخدم لتطبيق إدارة عبادات. نقاطي ${currentTotalScore} من ${targetScore}. زخمي ${momentumInfo.percent}%. نصيحة قصيرة بأسلوب مشجع جداً ومقتضب.`,
      });
      setAiAdvice(response.text || "استمر في المجاهدة، فما نال الفتح إلا من أدمن الطرق.");
    } catch (e) { setAiAdvice("النية الصالحة هي روح العمل، والصدق مع الله يفتح المغاليق."); } 
    finally { setIsAiLoading(false); }
  };

  const handleSaveTarget = () => {
    const newTarget = parseInt(tempTarget);
    if (!isNaN(newTarget) && newTarget > 0) { onTargetChange(newTarget); setIsEditingTarget(false); }
  };

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = subDays(new Date(), i);
      const d = format(dateObj, 'yyyy-MM-dd');
      const l = logs[d];
      return { date: format(dateObj, 'EEE', { locale: ar }), score: l ? calculateTotalScore(l, weights) : 0 };
    }).reverse();
  }, [logs, weights]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* عرض رسائل الإدارة بأسلوب جذاب */}
      {adminMessages.length > 0 && (
        <div className="space-y-3">
          {adminMessages.map((msg, idx) => (
            <div key={idx} className="bg-gradient-to-l from-emerald-50 to-white border-r-4 border-emerald-500 p-5 rounded-2xl shadow-sm animate-in slide-in-from-right duration-500 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-x-12 -translate-y-12 blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-100"><BellRing className="w-5 h-5 text-white animate-bounce" /></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest header-font">توجيه إداري</h4>
                    <span className="text-[8px] font-bold text-emerald-300 bg-white px-2 py-0.5 rounded-full border border-emerald-50 uppercase">بث مباشر</span>
                  </div>
                  <p className="text-sm text-emerald-800 leading-relaxed font-bold header-font">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative group">
        <button onClick={getAiAdvice} disabled={isAiLoading} className="w-full bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-[2.5rem] shadow-xl flex items-center justify-between group-active:scale-95 transition-all text-white border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full translate-x-16 -translate-y-16 blur-2xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10"><BrainCircuit className={`w-6 h-6 text-emerald-400 ${isAiLoading ? 'animate-pulse' : ''}`} /></div>
            <div className="text-right">
              <h4 className="text-base font-bold header-font">بصيرة المحراب (AI)</h4>
              <p className="text-[10px] opacity-60 header-font uppercase tracking-wider">نصيحة روحية فورية من الذكاء الاصطناعي</p>
            </div>
          </div>
          <Sparkles className={`w-6 h-6 text-yellow-400 ${isAiLoading ? 'animate-spin' : 'animate-bounce'}`} />
        </button>
        {aiAdvice && (
          <div className="mt-4 bg-emerald-50/50 backdrop-blur-md border border-emerald-100 p-5 rounded-3xl relative animate-in slide-in-from-top duration-300 shadow-inner">
            <button onClick={() => setAiAdvice(null)} className="absolute top-3 left-3 text-emerald-800 p-1.5 hover:bg-emerald-100 rounded-full transition-colors"><X className="w-4 h-4" /></button>
            <p className="text-base text-emerald-900 quran-font text-center leading-relaxed px-6">"{aiAdvice}"</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6"><Award className="w-6 h-6 text-amber-500" /><h3 className="font-black text-slate-800 header-font text-xs uppercase tracking-[0.2em]">أوسمة الأبرار والفتوحات</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {badges.map(badge => (
            <div key={badge.id} className={`relative flex flex-col items-center p-4 rounded-3xl border transition-all duration-700 overflow-hidden min-h-[130px] ${badge.active ? `bg-gradient-to-br ${badge.color} text-white border-transparent shadow-2xl shadow-emerald-100/50 scale-100` : 'bg-slate-50 text-slate-300 border-slate-100 grayscale opacity-40 hover:opacity-60 cursor-not-allowed'}`}>
              <div className={`p-3 rounded-2xl mb-3 ${badge.active ? 'bg-white/20' : 'bg-slate-200'}`}>{badge.active ? badge.icon : <Lock className="w-6 h-6" />}</div>
              <span className="text-xs font-black header-font text-center leading-tight mb-2 uppercase">{badge.title}</span>
              <p className={`text-[9px] text-center leading-relaxed font-bold px-1 ${badge.active ? 'text-white/90' : 'text-slate-400'}`}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2"><Target className="w-6 h-6 text-emerald-500" /><h3 className="font-black text-slate-800 header-font text-xs uppercase tracking-[0.2em]">الهدف اليومي</h3></div>
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 animate-in zoom-in duration-200">
                <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-20 bg-transparent border-none outline-none text-sm font-black text-emerald-700 text-center font-mono" autoFocus />
                <button onClick={handleSaveTarget} className="p-2 bg-emerald-500 text-white rounded-xl shadow-md"><Check className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => { setTempTarget(targetScore.toString()); setIsEditingTarget(true); }} className="flex items-center gap-2 px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl transition-all border border-slate-100 hover:border-slate-200"><span className="text-sm font-black font-mono tracking-tighter">{targetScore.toLocaleString()}</span><Edit2 className="w-3 h-3 opacity-50" /></button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden mb-3 relative shadow-inner"><div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-1000 ease-out shadow-lg" style={{ width: `${progressPercent}%` }} /></div>
        <div className="flex justify-between text-[10px] font-black text-slate-400 px-1 header-font uppercase tracking-widest"><span>{Math.round(progressPercent)}% إنجاز</span><span>متبقي {Math.max(0, targetScore - currentTotalScore).toLocaleString()}</span></div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
          <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 duration-500 ${momentumInfo.percent >= 0 ? 'bg-emerald-50' : 'bg-amber-50'}`}><Activity className={`w-8 h-8 ${momentumInfo.color}`} /></div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest header-font mb-1">زخم الارتقاء</p>
          <span className={`text-2xl font-black font-mono ${momentumInfo.color}`}>{momentumInfo.percent > 0 ? '+' : ''}{momentumInfo.percent}%</span>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-orange-200 transition-all">
          <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 duration-500 ${streakCount > 0 ? 'bg-orange-50' : 'bg-slate-50'}`}><Flame className={`w-8 h-8 ${streakCount > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-200'}`} /></div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest header-font mb-1">سلسلة النور</p>
          <span className={`text-2xl font-black font-mono ${streakCount > 0 ? 'text-orange-600' : 'text-slate-300'}`}>{streakCount} يوم</span>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><History className="w-5 h-5 text-slate-400" /><h3 className="font-black text-slate-800 header-font text-xs uppercase tracking-widest">نبض الأداء الأسبوعي</h3></div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#cbd5e1', fontFamily: 'Cairo' }} />
              <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo', fontSize: '12px', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorScore)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
