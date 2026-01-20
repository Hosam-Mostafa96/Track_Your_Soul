
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
import { format, addDays, startOfMonth } from 'date-fns';
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
  const progressPercent = Math.min((currentTotalScore / targetScore) * 100, 100);

  const activeBook = useMemo(() => books.find(b => !b.isFinished), [books]);
  
  const finishedThisMonth = useMemo(() => {
    const monthStart = startOfMonth(new Date()).getTime();
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
          systemInstruction: `أنت "المستشار الروحي والتقني" لتطبيق "إدارة العبادات والأوراد".
          توضيح للمستخدمين الجدد:
          1. لتسجيل العبادات: اذهب لتبويب "تسجيل" (أيقونة القلم).
          2. للمنافسة: تبويب "إنجازاتي" (أيقونة الميدالية) - تعرض فرسان اليوم أولاً ثم فرسان الأمس.
          3. للمؤقت: تبويب "المؤقت" (أيقونة الساعة) للقيام أو العلم.
          4. للمكتبة: تبويب "المكتبة" (أيقونة الكتب) لإضافة كتبك وتتبع صفحاتك.
          5. الإحصائيات: تبويب "إحصائيات" لرؤية رسوم بيانية والمزامنة السحابية.
          6. اليوميات: تبويب "يوميات" لكتابة خواطرك الخاصة.
          7. الإعدادات: اضغط على أيقونة المستخدم (أعلى اليمين) لتغيير أوزان النقاط أو المزامنة.
          قواعد النقاط: الجماعة (2700)، الصفحة (2)، ربع القرآن (40)، الصيام (1000).
          أجب بلغة مشجعة، بسيطة، قصيرة، ومباشرة.`
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* المستشار الروحي المطور */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"><Sparkles className="w-full h-full" /></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                <BrainCircuit className={`w-6 h-6 ${isAiLoading ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h4 className="text-sm font-black header-font">المستشار الروحي الذكي</h4>
                <p className="text-[10px] text-emerald-100 font-bold opacity-80">اسأل عن التطبيق أو اطلب نصيحة</p>
              </div>
            </div>
            {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <HelpCircle className="w-5 h-5 text-emerald-200 opacity-50" />}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); askAi(); }} className="relative">
            <input 
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="كيف أسجل ورد القراءة؟ / أعطني نصيحة.."
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-xs font-bold text-white placeholder:text-emerald-200/50 outline-none focus:bg-white/15 transition-all pr-12"
            />
            <button type="submit" disabled={isAiLoading} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-xl shadow-lg active:scale-90 transition-all disabled:opacity-50">
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => askAi("كيف أستخدم التطبيق؟ اشرح لي التبويبات باختصار")} className="text-[9px] text-emerald-200 font-black uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <HelpCircle className="w-3 h-3" /> كيف أستخدم التطبيق؟
            </button>
            <button onClick={() => askAi()} className="text-[9px] text-white font-black uppercase tracking-wider bg-emerald-500/30 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-emerald-500/50 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> حلل أدائي اليوم
            </button>
          </div>

          {aiAdvice && (
            <div className="bg-white/95 backdrop-blur-md border border-white p-5 rounded-[2rem] relative animate-in zoom-in duration-300 shadow-2xl">
              <button onClick={() => setAiAdvice(null)} className="absolute top-3 left-3 text-slate-400 p-1 hover:bg-slate-100 rounded-full transition-colors"><X className="w-3 h-3" /></button>
              <p className="text-sm text-slate-800 quran-font text-center leading-relaxed px-2 font-medium">"{aiAdvice}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-sm">الهدف اليومي</h3></div>
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 animate-in zoom-in duration-200">
                <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-16 bg-transparent border-none opacity-100 outline-none text-xs font-bold text-emerald-700 text-center" autoFocus />
                <button onClick={handleSaveTarget} className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"><Check className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => { setTempTarget(targetScore.toString()); setIsEditingTarget(true); }} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all border border-transparent hover:border-slate-200"><span className="text-xs font-bold header-font">{targetScore.toLocaleString()}</span><Edit2 className="w-3 h-3" /></button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-2 relative"><div className="bg-emerald-500 h-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} /></div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 header-font uppercase tracking-wider"><span>{Math.round(progressPercent)}% تم إنجازه</span><span>المتبقي: {Math.max(0, targetScore - currentTotalScore).toLocaleString()}</span></div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500/20"></div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl"><BookOpen className="w-6 h-6 text-emerald-600" /></div>
            <div>
                <h3 className="font-bold text-slate-800 header-font text-lg">متابعة القراءة اليومية</h3>
                <p className="text-[10px] text-slate-400 font-bold">دوّن ما نهلت منه اليوم</p>
            </div>
          </div>
          <button onClick={() => onSwitchTab('library')} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">المكتبة <ChevronLeft className="w-4 h-4" /></button>
        </div>

        {activeBook ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 min-w-0 w-full">
                <h4 className="text-base font-bold text-slate-700 truncate mb-1">{activeBook.title}</h4>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-emerald-700 header-font tracking-wide">الإنجاز: {Math.round((activeBook.currentPages / activeBook.totalPages) * 100)}%</span>
                    <span className="text-[11px] font-bold text-slate-400">{activeBook.currentPages} / {activeBook.totalPages} صفحة</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(activeBook.currentPages / activeBook.totalPages) * 100}%` }}></div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                <div className="relative flex-1 md:w-36">
                    <input 
                    type="number" 
                    value={readingInput}
                    onChange={(e) => setReadingInput(e.target.value)}
                    placeholder="صفحات اليوم"
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-center text-lg font-black focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 placeholder:text-xs placeholder:font-bold"
                    />
                </div>
                <button onClick={handleUpdateReading} className="p-5 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-100 active:scale-90 transition-all hover:bg-emerald-700">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-3xl">
            <p className="text-xs text-slate-400 font-bold header-font mb-3">لا يوجد كتاب قيد القراءة حالياً</p>
            <button onClick={() => onSwitchTab('library')} className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors">ابدأ رحلة علمية جديدة</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-amber-500" /><h3 className="font-bold text-slate-800 header-font text-sm uppercase tracking-wider">أوسمة الأبرار اليوم</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map(badge => (
            <div key={badge.id} className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-500 overflow-hidden min-h-[110px] ${badge.active ? `bg-gradient-to-br ${badge.color} text-white border-transparent shadow-lg shadow-emerald-100` : 'bg-slate-50 text-slate-400 border-slate-100 grayscale opacity-60'}`}>
              <div className={`p-2 rounded-xl mb-2 ${badge.active ? 'bg-white/20' : 'bg-slate-200'}`}>{badge.active ? badge.icon : <Lock className="w-5 h-5" />}</div>
              <span className="text-[10px] font-black header-font text-center leading-tight mb-1">{badge.title}</span>
              <p className={`text-[8px] text-center leading-tight font-bold px-1 ${badge.active ? 'text-white/80' : 'text-slate-400'}`}>{badge.desc}</p>
              {badge.active && <div className="absolute top-1 left-1 bg-white/30 rounded-full p-0.5"><CheckCircle2 className="w-2.5 h-2.5 text-white" /></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className={`p-3 rounded-2xl mb-3 ${momentumInfo.percent >= 0 ? 'bg-emerald-50' : 'bg-amber-50'}`}><Activity className={`w-6 h-6 ${momentumInfo.color}`} /></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font mb-1">زخم الارتقاء</p>
          <span className={`text-xl font-black font-mono ${momentumInfo.color}`}>{momentumInfo.percent > 0 ? '+' : ''}{momentumInfo.percent}%</span>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-1 opacity-10"><Library className="w-8 h-8 text-emerald-900" /></div>
          <div className="p-3 bg-emerald-50 rounded-2xl mb-3"><BookOpen className="w-6 h-6 text-emerald-600" /></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font mb-1">الكتب المتمة</p>
          <span className="text-xl font-black font-mono text-emerald-700">{finishedThisMonth} كتاب</span>
          <p className="text-[8px] text-slate-300 font-bold mt-1 tracking-widest">خلال هذا الشهر</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4"><History className="w-4 h-4 text-slate-400" /><h3 className="font-bold text-slate-600 header-font text-xs">نبض الأداء (أخر ٧ أيام)</h3></div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
