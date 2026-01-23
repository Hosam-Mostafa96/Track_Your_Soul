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
  CheckCircle2,
  BookOpen,
  Library,
  ChevronLeft,
  ArrowRight,
  Send,
  HelpCircle,
  Loader2,
  BookMarked
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
// Fixed: Removed startOfMonth as it was reported as not exported; addDays is used instead or manual calculation.
import { format, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DailyLog, AppWeights, PrayerName, PrayerEntry, Book } from '../types';
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
  books: Book[];
  onUpdateBook: (book: Book, pagesReadToday: number) => void;
  onSwitchTab: (tab: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  log, logs, weights, onDateChange, targetScore, onTargetChange, onOpenSettings,
  books, onUpdateBook, onSwitchTab
}) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetScore.toString());
  const [readingInput, setReadingInput] = useState('');
  const [userQuery, setUserQuery] = useState('');
  
  const prevBadgesActiveState = useRef<Record<string, boolean>>({});
  const isFirstRender = useRef(true);

  const currentTotalScore = calculateTotalScore(log, weights);
  const progressPercent = (currentTotalScore / targetScore) * 100;

  const activeBook = useMemo(() => books.find(b => !b.isFinished), [books]);
  
  const finishedThisMonth = useMemo(() => {
    // Fixed: Replaced startOfMonth with a manual Date calculation.
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return books.filter(b => b.isFinished && b.finishDate && new Date(b.finishDate).getTime() >= monthStart).length;
  }, [books]);

  const handleUpdateReading = () => {
    if (!activeBook || !readingInput) return;
    const pages = parseInt(readingInput);
    if (isNaN(pages) || pages <= 0) return;
    onUpdateBook(activeBook, pages);
    setReadingInput('');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

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

  const askAi = async (forcedQuery?: string) => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const queryToUse = forcedQuery || userQuery.trim() || `أعطني نصيحة مشجعة قصيرة جداً بناءً على أدائي (نقاطي ${currentTotalScore} من ${targetScore})`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: queryToUse,
        config: {
          systemInstruction: `أنت "المستشار الروحي والتقني" لتطبيق "إدارة العبادات والأوراد". أجب بلغة مشجعة، بسيطة، قصيرة، ومباشرة.`
        }
      });
      setAiAdvice(response.text || "واصل مسيرك، فكل خطوة تقربك من الله هي ربح عظيم.");
      setUserQuery('');
    } catch (e) { 
      setAiAdvice("حدث خطأ في الاتصال، واصل مجاهدتك فالله لا يضيع أجر المحسنين."); 
    } finally { 
      setIsAiLoading(false); 
    }
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* المستشار الروحي الذكي */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2.5rem] p-6 pt-8 shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"><Sparkles className="w-full h-full" /></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between text-white mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                <BrainCircuit className={`w-6 h-6 ${isAiLoading ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h4 className="text-sm font-black header-font">المستشار الروحي الذكي</h4>
                <p className="text-[10px] text-emerald-100 font-bold opacity-80">اطلب نصيحة أو تحليل لأدائك</p>
              </div>
            </div>
            {isAiLoading && <Loader2 className="w-5 h-5 animate-spin text-white" />}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); askAi(); }} className="relative">
            <input 
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="كيف كان أدائي اليوم؟ / أعطني نصيحة.."
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-xs font-bold text-white placeholder:text-emerald-200/50 outline-none focus:bg-white/15 transition-all pr-12"
            />
            <button type="submit" disabled={isAiLoading} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-xl shadow-lg active:scale-90 transition-all">
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>

          {aiAdvice && (
            <div className="bg-white/95 backdrop-blur-md border border-white p-5 rounded-[2rem] relative animate-in zoom-in duration-300 shadow-2xl mt-4">
              <button onClick={() => setAiAdvice(null)} className="absolute top-3 left-3 text-slate-400 p-1 hover:bg-slate-100 rounded-full"><X className="w-3 h-3" /></button>
              <p className="text-sm text-slate-800 quran-font text-center leading-relaxed font-medium">"{aiAdvice}"</p>
            </div>
          )}
        </div>
      </div>

      {/* الهدف والتقدم اليومي */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-sm">الهدف اليومي</h3></div>
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-16 bg-transparent border-none outline-none text-xs font-bold text-emerald-700 text-center" autoFocus />
                <button onClick={handleSaveTarget} className="p-1 bg-emerald-500 text-white rounded-lg"><Check className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => { setTempTarget(targetScore.toString()); setIsEditingTarget(true); }} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all border border-transparent hover:border-slate-200"><span className="text-xs font-bold header-font">{targetScore.toLocaleString()}</span><Edit2 className="w-3 h-3" /></button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-2 relative">
          <div 
            className={`${progressPercent >= 100 ? 'bg-amber-400' : 'bg-emerald-500'} h-full transition-all duration-1000 ease-out`} 
            style={{ width: `${Math.min(progressPercent, 100)}%` }} 
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 header-font uppercase">
          <span>{Math.round(progressPercent)}% إنجاز</span>
          <span>{currentTotalScore.toLocaleString()} / {targetScore.toLocaleString()}</span>
        </div>
      </div>

      {/* إحصائيات الارتقاء والأوسمة */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-emerald-500" /><span className="text-[10px] font-bold text-slate-400 header-font uppercase tracking-widest">معامل الارتقاء</span></div>
           <div>
             <span className={`text-2xl font-black font-mono ${momentumInfo.color}`}>{momentumInfo.percent}%</span>
             <p className="text-[10px] text-slate-400 font-bold header-font">مقارنة بالمتوسط الأسبوعي</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-2"><Award className="w-4 h-4 text-amber-500" /><span className="text-[10px] font-bold text-slate-400 header-font uppercase tracking-widest">الأوسمة المكتسبة</span></div>
           <div>
             <span className="text-2xl font-black font-mono text-amber-500">{badges.filter(b => b.active).length} / {badges.length}</span>
             <p className="text-[10px] text-slate-400 font-bold header-font">إنجازات ورد اليوم</p>
           </div>
        </div>
      </div>

      {/* قسم الأوسمة والكرامات */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400" /><h3 className="font-bold text-slate-800 header-font text-sm">أوسمة وكرامات اليوم</h3></div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {badges.map((badge) => (
            <div key={badge.id} className={`flex items-center p-4 rounded-2xl border transition-all ${badge.active ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-50 opacity-40 grayscale'}`}>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${badge.color} text-white shadow-lg shrink-0`}>{badge.icon}</div>
              <div className="mr-4">
                <h4 className="text-xs font-black text-slate-800 header-font">{badge.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold mt-1">{badge.desc}</p>
              </div>
              {badge.active && <div className="mr-auto"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* تتبع قراءة الكتاب اليومي */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><BookMarked className="w-5 h-5 text-blue-500" /><h3 className="font-bold text-slate-800 header-font text-sm">تتبع القراءة اليومية</h3></div>
          <button onClick={() => onSwitchTab('library')} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"><Library className="w-4 h-4" /></button>
        </div>

        {activeBook ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 header-font">{activeBook.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1">المتبقي: {activeBook.totalPages - activeBook.currentPages} صفحة</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-emerald-600 font-mono">{Math.round((activeBook.currentPages / activeBook.totalPages) * 100)}%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={readingInput}
                onChange={(e) => setReadingInput(e.target.value)}
                placeholder="كم صفحة قرأت اليوم؟"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
              />
              <button 
                onClick={handleUpdateReading}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs header-font shadow-lg shadow-emerald-100 active:scale-95"
              >
                تحديث
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-bold header-font">لا يوجد كتاب نشط حالياً</p>
            <button onClick={() => onSwitchTab('library')} className="text-[10px] text-emerald-600 font-bold underline mt-2">اختر كتاباً من المكتبة</button>
          </div>
        )}
      </div>

      {/* مخطط التقدم الأسبوعي */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><History className="w-5 h-5 text-slate-400" /><h3 className="font-bold text-slate-800 header-font text-sm">مخطط الاستمرارية (آخر ٧ أيام)</h3></div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700, fontFamily: 'Cairo' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo' }}
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