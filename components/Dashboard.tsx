
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
  BookMarked,
  ChevronLeft,
  Smartphone,
  Download,
  Share,
  Info,
  Smile,
  Meh,
  Frown,
  Ghost,
  CloudSun,
  Send,
  Loader2
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, YAxis } from 'recharts';
import { format, addDays } from 'date-fns';
// Fix: Use arSA instead of ar to avoid export errors in some date-fns environments
import { arSA as ar } from 'date-fns/locale';
import { DailyLog, AppWeights, PrayerName, PrayerEntry, Book } from '../types';
import { calculateTotalScore } from '../utils/scoring';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";

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
  installPrompt: any;
  onClearInstallPrompt: () => void;
  onUpdateLog: (log: DailyLog) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  log, logs, weights, onDateChange, targetScore, onTargetChange, onOpenSettings,
  books, onUpdateBook, onSwitchTab, installPrompt, onClearInstallPrompt, onUpdateLog
}) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetScore.toString());
  const [readingInput, setReadingInput] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [advisorResponse, setAdvisorResponse] = useState<string | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [showiOSInstructions, setShowiOSInstructions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  
  const suggestions = [
    "حلل نمط عبادتي اليوم",
    "كيف أحسن خشوعي؟",
    "نصيحة للمجاهدة",
    "ورد لزيادة السكينة"
  ];
  const isFirstRender = useRef(true);
  const prevBadgesActiveState = useRef<Record<string, boolean>>({});

  const currentTotalScore = calculateTotalScore(log, weights);
  const progressPercent = (currentTotalScore / targetScore) * 100;

  const activeBook = useMemo(() => books.find(b => !b.isFinished), [books]);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
  
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

  const handleUpdateMood = (mood: number) => {
    onUpdateLog({ ...log, mood });
    if (mood >= 4) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.9 } });
    }
  };

  const askAdvisor = async (e?: React.FormEvent, queryOverride?: string) => {
    if (e) e.preventDefault();
    const query = queryOverride || userQuery;
    if (!query.trim() || isAdvisorLoading) return;

    setIsAdvisorLoading(true);
    setAdvisorResponse(null);
    if (!queryOverride) setUserQuery('');
    setActiveSuggestion(queryOverride || null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const recentSummary = (Object.values(logs) as DailyLog[]).slice(-7).map(l => ({
        date: l.date,
        score: calculateTotalScore(l, weights),
        jihad: l.jihadFactor,
        mood: l.mood,
        hasBurden: l.hasBurden
      }));

      const prompt = `
        أنت "المستشار الروحي الذكي" في تطبيق (الميزان) لإدارة العبادات. مهمتك هي تحليل نمط عبادة المستخدم بناءً على الجهد والزمن.
        سؤال المستخدم: "${query}"
        بيانات المستخدم الحالية: نقاط اليوم: ${currentTotalScore}، الهدف: ${targetScore}، الحالة القلبية: ${log.mood}/5.
        ملخص الأيام الأخيرة: ${JSON.stringify(recentSummary)}

        يرجى تقديم نصيحة:
        1. قصيرة، بليغة، ومشجعة (باللغة العربية الفصحى أو لهجة مهذبة).
        2. تربط بين الجهد المبذول (المجاهدة) والأثر النفسي (السكينة).
        3. تقترح عليه "ورد" معين أو "عمل قلبي" بناءً على حالته.
        
        اجعل الإجابة في حدود 3-4 جمل فقط.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAdvisorResponse(response.text || "اعتذر، لم أستطع استيعاب النمط الآن. حاول لاحقاً.");
    } catch (error) {
      console.error("Advisor Error:", error);
      setAdvisorResponse("حدث خطأ في التواصل مع المستشار. تأكد من اتصالك بالإنترنت.");
    } finally {
      setIsAdvisorLoading(false);
      setActiveSuggestion(null);
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowiOSInstructions(true);
      return;
    }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      onClearInstallPrompt();
      confetti({ particleCount: 150, spread: 90 });
    }
  };

  const handleSaveTarget = () => {
    const val = parseInt(tempTarget);
    if (!isNaN(val) && val > 0) {
      onTargetChange(val);
      setIsEditingTarget(false);
    }
  };

  const badges = useMemo(() => {
    const rawatibIds = ['fajr_pre', 'dhuhr_pre', 'dhuhr_post', 'maghrib_post', 'isha_post'];
    const allUserSunnahs = (Object.values(log.prayers) as PrayerEntry[]).flatMap(p => p.surroundingSunnahIds || []);
    const fullRawatibDone = rawatibIds.every(id => allUserSunnahs.includes(id));
    
    return [
      { id: 'rawatib', title: 'بيت في الجنة', desc: 'من صلى ثنتي عشرة ركعة..', icon: <Home className="w-6 h-6" />, active: fullRawatibDone, color: 'from-emerald-400 to-emerald-600' },
      { id: 'fajr', title: 'بشرى الرؤية', desc: 'تستحق رؤية الله في الآخرة', icon: <Sun className="w-6 h-6" />, active: log.prayers[PrayerName.FAJR]?.performed, color: 'from-orange-400 to-orange-500' },
      { id: 'istighfar', title: 'مفتاح الرزق', desc: 'فقلت استغفروا ربكم.. يرسل السماء', icon: <Coins className="w-6 h-6" />, active: log.athkar.counters.istighfar > 0, color: 'from-blue-400 to-blue-600' },
      { id: 'fasting', title: 'بعيد عن النار', desc: 'باعد الله وجهه عن النار ٧٠ خريفاً', icon: <Flame className="w-6 h-6" />, active: log.nawafil.fasting, color: 'from-rose-400 to-rose-600' },
      { id: 'hawqalah', title: 'مفتاح النجاح', desc: 'لا حول ولا قوة إلا بالله كنز الجنة', icon: <Key className="w-6 h-6" />, active: log.athkar.counters.hawqalah > 0, color: 'from-indigo-400 to-indigo-600' },
      { id: 'salawat', title: 'مفتاح القرب', desc: 'أقربكم مني مجلساً أكثركم صلاة علي', icon: <Heart className="w-6 h-6" />, active: log.athkar.counters.salawat > 0, color: 'from-pink-400 to-pink-600' },
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

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = addDays(new Date(), -i);
      const d = format(dateObj, 'yyyy-MM-dd');
      const l = logs[d];
      return { 
        date: format(dateObj, 'EEE', { locale: ar }), 
        score: l ? calculateTotalScore(l, weights) : 0,
        target: targetScore
      };
    }).reverse();
  }, [logs, weights, targetScore]);

  const moodConfig = [
    { value: 1, label: 'ضيق', icon: <Ghost className="w-5 h-5" />, color: 'text-slate-400', bg: 'bg-slate-50' },
    { value: 2, label: 'قلق', icon: <Frown className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-50' },
    { value: 3, label: 'عادي', icon: <Meh className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: 4, label: 'منشرح', icon: <Smile className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { value: 5, label: 'سكينة', icon: <CloudSun className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      
      {/* بطاقة تثبيت التطبيق */}
      {(installPrompt || (isIOS && !isStandalone)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-5 shadow-sm animate-bounce-slow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-200 rounded-2xl"><Smartphone className="w-6 h-6 text-amber-700" /></div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 header-font leading-tight">ثبّت التطبيق الآن</h4>
              <p className="text-[10px] text-amber-700 font-bold header-font">لسهولة الوصول وتجربة أسرع 🌙</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleInstallClick} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-black text-xs header-font shadow-md active:scale-95 transition-all">{isIOS ? 'كيفية التثبيت' : 'تثبيت'} <Download className="w-3.5 h-3.5" /></button>
            <button onClick={onClearInstallPrompt} className="p-1 text-amber-400 hover:text-amber-600"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* 1. المستشار الذكي */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-400/10 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
                <BrainCircuit className={`w-6 h-6 text-emerald-300 ${isAdvisorLoading ? 'animate-spin-slow' : ''}`} />
              </div>
              <div>
                <h4 className="text-base font-black header-font tracking-tight">المستشار الروحي</h4>
                <p className="text-[10px] text-emerald-200/70 font-bold">ذكاء اصطناعي يحلل وردك ويوجهك</p>
              </div>
            </div>
            {advisorResponse && (
              <button onClick={() => setAdvisorResponse(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!advisorResponse && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => askAdvisor(undefined, s)}
                  disabled={isAdvisorLoading}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black header-font transition-all border ${activeSuggestion === s ? 'bg-emerald-400 text-emerald-950 border-white shadow-lg scale-95' : 'bg-white/5 text-emerald-100 border-white/10 hover:bg-white/10'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => askAdvisor(e)} className="relative flex gap-2">
            <div className="relative flex-1 group">
              <input 
                type="text" 
                value={userQuery} 
                onChange={(e) => setUserQuery(e.target.value)} 
                placeholder="اسأل عن حالك الإيماني.." 
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-emerald-100/30 outline-none focus:bg-black/40 focus:border-emerald-400/50 transition-all shadow-inner" 
                disabled={isAdvisorLoading}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {userQuery && !isAdvisorLoading && (
                  <button type="button" onClick={() => setUserQuery('')} className="text-white/20 hover:text-white"><X className="w-4 h-4" /></button>
                )}
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isAdvisorLoading || !userQuery.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20 active:scale-90"
            >
              {isAdvisorLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </form>

          {advisorResponse && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 animate-in zoom-in-95 duration-300 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-yellow-400/20 rounded-lg"><Sparkles className="w-4 h-4 text-yellow-400" /></div>
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">توجيه إيماني</span>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed font-bold header-font whitespace-pre-wrap">
                {advisorResponse}
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                <button onClick={() => setAdvisorResponse(null)} className="text-[10px] font-black text-emerald-300/60 hover:text-emerald-300 transition-colors">إغلاق التوجيه</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. الهدف اليومي */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><Target className="w-5 h-5 text-emerald-500" /></div>
            <h3 className="font-bold text-slate-800 header-font text-sm">هدف اليوم</h3>
          </div>
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1">
                <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-20 px-2 py-1 bg-slate-50 border border-emerald-200 rounded-lg text-xs font-black text-center outline-none" autoFocus />
                <button onClick={handleSaveTarget} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => setIsEditingTarget(false)} className="p-1.5 bg-slate-100 text-slate-400 rounded-lg"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <button onClick={() => { setIsEditingTarget(true); setTempTarget(targetScore.toString()); }} className="flex items-center gap-1.5 hover:bg-slate-50 p-1 px-2 rounded-lg transition-colors">
                <span className="text-xs font-black text-emerald-600 font-mono">{currentTotalScore.toLocaleString()} / {targetScore.toLocaleString()}</span>
                <Edit2 className="w-3 h-3 text-slate-300" />
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden mb-2">
          <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 font-bold text-center">لقد أنجزت {Math.round(progressPercent)}% من هدفك الروحي</p>
      </div>

      {/* 3. متابعة القراءة اليومية (تم تصغير المربع) */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><BookMarked className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 header-font leading-tight">متابعة القراءة</h3>
              <p className="text-[9px] text-slate-400 font-bold header-font">دوّن صفحاتك المقروءة</p>
            </div>
          </div>
          <button onClick={() => onSwitchTab('library')} className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] header-font hover:underline">المكتبة <ChevronLeft className="w-3 h-3" /></button>
        </div>
        {activeBook ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <h4 className="text-[11px] font-bold text-slate-700 truncate max-w-[150px]">{activeBook.title}</h4>
                <span className="text-[10px] font-black text-emerald-600 header-font">{Math.round((activeBook.currentPages / activeBook.totalPages) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(activeBook.currentPages / activeBook.totalPages) * 100}%` }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 rounded-xl p-1 border border-transparent focus-within:bg-white focus-within:border-emerald-100 transition-all">
                <input 
                  type="number" 
                  value={readingInput} 
                  onChange={(e) => setReadingInput(e.target.value)} 
                  placeholder="عدد الصفحات" 
                  className="w-full bg-transparent px-3 py-2 text-xs font-bold header-font outline-none text-center placeholder:text-slate-300" 
                />
              </div>
              <button onClick={handleUpdateReading} className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"><Check className="w-5 h-5 stroke-[3]" /></button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-2xl"><p className="text-[10px] text-slate-400 font-bold header-font">أضف كتاباً من المكتبة للبدء</p></div>
        )}
      </div>

      {/* 4. أوسمة الأبرار اليوم */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6"><Award className="w-6 h-6 text-amber-500" /><h3 className="text-xl font-bold text-slate-800 header-font">أوسمة الأبرار اليوم</h3></div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className={`relative flex flex-col items-center text-center p-5 rounded-[1.8rem] transition-all duration-300 border ${badge.active ? `bg-gradient-to-br ${badge.color} text-white border-transparent shadow-md` : 'bg-white border-slate-50 grayscale opacity-40'}`}>
              {badge.active && <div className="absolute top-2 left-2 bg-white/20 p-1 rounded-full backdrop-blur-md"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
              <div className={`p-3 rounded-2xl mb-3 ${badge.active ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-300'}`}>{badge.active ? badge.icon : <Lock className="w-5 h-5" />}</div>
              <h4 className="text-[12px] font-bold header-font mb-1 leading-tight">{badge.title}</h4>
              <p className={`text-[8px] font-bold leading-relaxed px-1 opacity-80`}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. مؤشر الطمأنينة القلبية (Mood Tracker) */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 rounded-2xl"><CloudSun className="w-6 h-6 text-amber-600" /></div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 header-font">مؤشر الطمأنينة القلبية</h3>
            <p className="text-[10px] text-slate-400 font-bold header-font">كيف وجدت قلبك اليوم بعد أورادك؟</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          {moodConfig.map((m) => (
            <button
              key={m.value}
              onClick={() => handleUpdateMood(m.value)}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${log.mood === m.value ? `${m.bg} border-${m.color.split('-')[1]}-200 shadow-sm scale-110` : 'bg-white border-slate-50 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
            >
              <div className={`${m.color} transition-transform duration-300 ${log.mood === m.value ? 'scale-125' : ''}`}>
                {m.icon}
              </div>
              <span className={`text-[9px] font-black header-font ${log.mood === m.value ? m.color : 'text-slate-400'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. مخطط التطور الأسبوعي (في النهاية) */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><History className="w-5 h-5" /></div>
             <h3 className="text-sm font-bold text-slate-800 header-font">مخطط التطور الأسبوعي</h3>
          </div>
          <div className="text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">الخط يمثل هدفك اليومي</div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700, fontFamily: 'Cairo' }} 
              />
              <YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax, targetScore) + 2000]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo' }} 
                formatter={(value: any) => [value.toLocaleString(), 'النقاط']}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                fill="url(#scoreGradient)" 
                strokeWidth={3} 
                animationDuration={1500}
              />
              <ReferenceLine 
                y={targetScore} 
                stroke="#f59e0b" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={{ position: 'right', value: 'الهدف', fill: '#d97706', fontSize: 9, fontWeight: 'bold' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
