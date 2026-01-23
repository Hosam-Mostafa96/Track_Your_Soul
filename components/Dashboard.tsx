
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
  BookMarked,
  ChevronLeft as ChevronLeftIcon
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
  
  const handleUpdateReading = () => {
    if (!activeBook || !readingInput) return;
    const pages = parseInt(readingInput);
    if (isNaN(pages) || pages <= 0) return;
    onUpdateBook(activeBook, pages);
    setReadingInput('');
    confetti({ 
      particleCount: 100, 
      spread: 70, 
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399']
    });
  };

  const badges = useMemo(() => {
    const rawatibIds = ['fajr_pre', 'dhuhr_pre', 'dhuhr_post', 'maghrib_post', 'isha_post'];
    const allUserSunnahs = (Object.values(log.prayers) as PrayerEntry[]).flatMap(p => p.surroundingSunnahIds || []);
    const fullRawatibDone = rawatibIds.every(id => allUserSunnahs.includes(id));
    
    return [
      { id: 'rawatib', title: 'بيت في الجنة', desc: 'من صلى ثنتي عشرة ركعة..', icon: <Home className="w-7 h-7" />, active: fullRawatibDone, color: 'from-emerald-400 to-teal-600' },
      { id: 'fajr', title: 'بشرى الرؤية', desc: 'تستحق رؤية الله في الآخرة', icon: <Sun className="w-7 h-7" />, active: log.prayers[PrayerName.FAJR]?.performed, color: 'from-amber-400 to-orange-500' },
      { id: 'istighfar', title: 'مفتاح الرزق', desc: 'فقلت استغفروا ربكم.. يرسل السماء', icon: <Coins className="w-7 h-7" />, active: log.athkar.counters.istighfar > 0, color: 'from-blue-400 to-cyan-600' },
      { id: 'fasting', title: 'بعيد عن النار', desc: 'باعد الله وجهه عن النار ٧٠ خريفاً', icon: <Flame className="w-7 h-7" />, active: log.nawafil.fasting, color: 'from-rose-400 to-orange-500' },
      { id: 'hawqalah', title: 'مفتاح النجاح', desc: 'لا حول ولا قوة إلا بالله كنز الجنة', icon: <Key className="w-7 h-7" />, active: log.athkar.counters.hawqalah > 0, color: 'from-indigo-400 to-blue-700' },
      { id: 'salawat', title: 'مفتاح القرب', desc: 'أقربكم مني مجلساً أكثركم صلاة علي', icon: <Heart className="w-7 h-7" />, active: log.athkar.counters.salawat > 0, color: 'from-rose-400 to-pink-600' },
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

  const askAi = async () => {
    if (isAiLoading || !userQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userQuery.trim(),
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
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <Target className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-black text-slate-800 header-font text-lg">هدف اليوم</h3>
          </div>
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-20 bg-transparent border-none outline-none text-sm font-bold text-emerald-700 text-center" autoFocus />
                <button onClick={() => { onTargetChange(parseInt(tempTarget)); setIsEditingTarget(false); }} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => { setTempTarget(targetScore.toString()); setIsEditingTarget(true); }} className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all border border-transparent border-slate-100">
                <span className="text-sm font-black header-font">{targetScore.toLocaleString()}</span>
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden mb-3 relative">
          <div 
            className={`${progressPercent >= 100 ? 'bg-amber-400' : 'bg-emerald-500'} h-full transition-all duration-1000 ease-out`} 
            style={{ width: `${Math.min(progressPercent, 100)}%` }} 
          />
        </div>
        <div className="flex justify-between text-xs font-black text-slate-400 px-1 header-font uppercase tracking-wider">
          <span className="text-emerald-600">تم إنجاز {Math.round(progressPercent)}%</span>
          <span className="font-mono">{currentTotalScore.toLocaleString()} / {targetScore.toLocaleString()}</span>
        </div>
      </div>

      {/* قسم تتبع القراءة (مطابق للصورة) */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-slate-800 header-font leading-tight mb-2">متابعة القراءة اليومية</h3>
            <p className="text-sm text-slate-400 font-bold header-font">دوّن ما نهلت منه اليوم</p>
          </div>
          <button 
            onClick={() => onSwitchTab('library')}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-50/50 text-emerald-600 rounded-[1.5rem] font-bold text-sm header-font hover:bg-emerald-100 transition-all group"
          >
            المكتبة
            <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {activeBook ? (
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h4 className="text-lg font-black text-slate-700 header-font">خريطة التزكية</h4>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600 header-font">الإنجاز: {Math.round((activeBook.currentPages / activeBook.totalPages) * 100)}%</span>
                  <p className="text-xs font-bold text-slate-400 font-mono mt-1">{activeBook.currentPages} / {activeBook.totalPages} صفحة</p>
                </div>
              </div>
              <div className="w-full bg-slate-50 h-6 rounded-full overflow-hidden p-1 shadow-inner">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-lg shadow-emerald-200" 
                  style={{ width: `${(activeBook.currentPages / activeBook.totalPages) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleUpdateReading}
                className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200 active:scale-90 transition-all shrink-0"
              >
                <Check className="w-10 h-10 stroke-[3]" />
              </button>
              <div className="flex-1 bg-slate-50 rounded-[2rem] p-1 border border-slate-100 focus-within:border-emerald-200 focus-within:bg-white transition-all shadow-inner">
                <input 
                  type="number" 
                  value={readingInput}
                  onChange={(e) => setReadingInput(e.target.value)}
                  placeholder="صفحات اليوم"
                  className="w-full bg-transparent px-8 py-6 text-xl font-bold header-font outline-none text-center placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative z-10">
            <BookMarked className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-bold header-font mb-4">لا يوجد كتاب نشط حالياً</p>
            <button onClick={() => onSwitchTab('library')} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold header-font shadow-lg">إضافة كتاب جديد</button>
          </div>
        )}
      </div>

      {/* قسم أوسمة الأبرار اليوم (مطابق للصورة) */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-amber-50 rounded-2xl">
               <Award className="w-6 h-6 text-amber-500" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 header-font">أوسمة الأبرار اليوم</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className={`relative flex flex-col items-center text-center p-6 rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                badge.active 
                ? `bg-gradient-to-br ${badge.color} border-transparent shadow-xl shadow-emerald-100 scale-100` 
                : 'bg-white border-slate-50 opacity-40 grayscale-[0.8] scale-95'
              }`}
            >
              {badge.active && (
                <div className="absolute top-3 left-3 bg-white/20 p-1.5 rounded-full backdrop-blur-md">
                   <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              
              <div className={`p-4 rounded-[1.8rem] mb-4 shadow-lg ${badge.active ? 'bg-white/20 backdrop-blur-md text-white' : 'bg-slate-50 text-slate-300'}`}>
                {badge.active ? badge.icon : <Lock className="w-7 h-7" />}
              </div>
              
              <h4 className={`text-[13px] font-black header-font mb-2 leading-tight ${badge.active ? 'text-white' : 'text-slate-400'}`}>
                {badge.title}
              </h4>
              <p className={`text-[9px] font-bold leading-relaxed px-2 ${badge.active ? 'text-white/80' : 'text-slate-300'}`}>
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* مخطط الاستمرارية (آخر ٧ أيام) */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <History className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-800 header-font">مخطط الاستمرارية</h3>
        </div>
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
