
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
  Lock, 
  Home, 
  Key, 
  Coins, 
  Heart, 
  CloudMoon, 
  CheckCircle2
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, addDays } from 'date-fns';
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
}

const Dashboard: React.FC<DashboardProps> = ({ log, logs, weights, onDateChange, targetScore, onTargetChange, onOpenSettings }) => {
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
      const d = format(addDays(new Date(), -(i + 1)), 'yyyy-MM-dd');
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
      if (calculateTotalScore(dayLog, weights) >= targetScore * 0.5) { 
        count++; 
        checkDate = addDays(checkDate, -1); 
      } 
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
        contents: `أنا مستخدم لتطبيق إدارة عبادات. مجموع نقاطي ${currentTotalScore} من هدف ${targetScore}. زخمي ${momentumInfo.percent}%. أعطني نصيحة مشجعة قصيرة جداً.`,
      });
      setAiAdvice(response.text || "استمر في المجاهدة، فكل خطوة تقربك من الله هي ربح عظيم.");
    } catch (e) { setAiAdvice("النية الصالحة هي روح العمل، واصل مسيرك بارك الله فيك."); } 
    finally { setIsAiLoading(false); }
  };

  const handleSaveTarget = () => {
    const newTarget = parseInt(tempTarget);
    if (!isNaN(newTarget) && newTarget > 0) { onTargetChange(newTarget); setIsEditingTarget(false); }
  };

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = addDays(new Date(), -i);
      const d = format(dateObj, 'yyyy-MM-dd');
      const l = logs[d];
      return { date: format(dateObj, 'EEE', { locale: ar }), score: l ? calculateTotalScore(l, weights) : 0 };
    }).reverse();
  }, [logs, weights]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative group">
        <button onClick={getAiAdvice} disabled={isAiLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-emerald-950 p-4 rounded-3xl shadow-lg flex items-center justify-between transition-all text-white border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl"><BrainCircuit className={`w-5 h-5 ${isAiLoading ? 'animate-pulse' : ''}`} /></div>
            <div className="text-right">
              <h4 className="text-sm font-bold header-font">المستشار الروحي (AI)</h4>
              <p className="text-[10px] opacity-80 header-font">اضغط للحصول على نصيحة لأورادك</p>
            </div>
          </div>
          <Sparkles className={`w-5 h-5 text-yellow-300 ${isAiLoading ? 'animate-spin' : 'animate-bounce'}`} />
        </button>
        {aiAdvice && (
          <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl relative animate-in slide-in-from-top duration-300">
            <button onClick={() => setAiAdvice(null)} className="absolute top-2 left-2 text-emerald-800 dark:text-emerald-200 p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full"><X className="w-3 h-3" /></button>
            <p className="text-sm text-emerald-900 dark:text-emerald-100 quran-font text-center leading-relaxed px-4">"{aiAdvice}"</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-amber-500" /><h3 className="font-bold text-slate-800 dark:text-slate-100 header-font text-sm uppercase tracking-wider">أوسمة الأبرار اليوم</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map(badge => (
            <div key={badge.id} className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-500 overflow-hidden min-h-[110px] ${badge.active ? `bg-gradient-to-br ${badge.color} text-white border-transparent shadow-lg shadow-emerald-100 dark:shadow-none` : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 grayscale opacity-60'}`}>
              <div className={`p-2 rounded-xl mb-2 ${badge.active ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>{badge.active ? badge.icon : <Lock className="w-5 h-5" />}</div>
              <span className="text-[10px] font-black header-font text-center leading-tight mb-1">{badge.title}</span>
              <p className={`text-[8px] text-center leading-tight font-bold px-1 ${badge.active ? 'text-white/80' : 'text-slate-400 dark:text-slate-600'}`}>{badge.desc}</p>
              {badge.active && <div className="absolute top-1 left-1 bg-white/30 rounded-full p-0.5"><CheckCircle2 className="w-2.5 h-2.5 text-white" /></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 dark:text-slate-100 header-font text-sm">الهدف اليومي</h3></div>
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-16 bg-transparent border-none outline-none text-xs font-bold text-emerald-700 dark:text-emerald-400 text-center" autoFocus />
                <button onClick={handleSaveTarget} className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><Check className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => { setTempTarget(targetScore.toString()); setIsEditingTarget(true); }} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"><span className="text-xs font-bold header-font">{targetScore.toLocaleString()}</span><Edit2 className="w-3 h-3" /></button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden mb-2 relative"><div className="bg-emerald-500 h-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} /></div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1 header-font uppercase tracking-wider"><span>{Math.round(progressPercent)}% تم إنجازه</span><span>المتبقي: {Math.max(0, targetScore - currentTotalScore).toLocaleString()}</span></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center transition-colors">
          <div className={`p-3 rounded-2xl mb-3 ${momentumInfo.percent >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}><Activity className={`w-6 h-6 ${momentumInfo.color}`} /></div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase header-font mb-1">زخم الارتقاء</p>
          <span className={`text-xl font-black font-mono ${momentumInfo.color}`}>{momentumInfo.percent > 0 ? '+' : ''}{momentumInfo.percent}%</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center transition-colors">
          <div className={`p-3 rounded-2xl mb-3 ${streakCount > 0 ? 'bg-orange-50 dark:bg-orange-950/30' : 'bg-slate-50 dark:bg-slate-800'}`}><Flame className={`w-6 h-6 ${streakCount > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300 dark:text-slate-700'}`} /></div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase header-font mb-1">سلسلة النور</p>
          <span className={`text-xl font-black font-mono ${streakCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-600'}`}>{streakCount} يوم</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 mb-4"><History className="w-4 h-4 text-slate-400 dark:text-slate-500" /><h3 className="font-bold text-slate-600 dark:text-slate-400 header-font text-xs">نبض الأداء (أخر ٧ أيام)</h3></div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff', color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }} />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
