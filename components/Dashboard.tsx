
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
  CloudSun
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, YAxis } from 'recharts';
import { format, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DailyLog, AppWeights, PrayerName, PrayerEntry, Book } from '../types';
import { calculateTotalScore } from '../utils/scoring';
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
  const [showiOSInstructions, setShowiOSInstructions] = useState(false);
  
  const prevBadgesActiveState = useRef<Record<string, boolean>>({});
  const isFirstRender = useRef(true);

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

      {/* المستشار الذكي */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2rem] p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><BrainCircuit className={`w-5 h-5`} /></div>
            <h4 className="text-sm font-bold header-font">المستشار الروحي</h4>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); }} className="relative">
            <input type="text" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="اطلب نصيحة أو تحليل لأدائك.." className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder:text-emerald-100/50 outline-none" />
          </form>
        </div>
      </div>

      {/* الهدف اليومي */}
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

      {/* مخطط الاستمرارية المطوّر */}
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

      {/* مؤشر الطمأنينة القلبية (Mood Tracker) */}
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

      {/* قسم تتبع القراءة */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 relative">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl"><BookMarked className="w-7 h-7 text-emerald-600" /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 header-font leading-tight">متابعة القراءة اليومية</h3>
              <p className="text-[11px] text-slate-400 font-bold header-font">دوّن ما نهلت منه اليوم</p>
            </div>
          </div>
          <button onClick={() => onSwitchTab('library')} className="flex items-center gap-1 text-emerald-600 font-bold text-xs header-font hover:underline">المكتبة <ChevronLeft className="w-4 h-4" /></button>
        </div>
        {activeBook ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end"><h4 className="text-sm font-bold text-slate-800 header-font">خريطة التزكية</h4><div className="text-right"><span className="text-xs font-black text-emerald-600 header-font">الإنجاز: {Math.round((activeBook.currentPages / activeBook.totalPages) * 100)}%</span></div></div>
              <p className="text-[10px] font-bold text-slate-400 font-mono text-left mb-1">{activeBook.currentPages} / {activeBook.totalPages} صفحة</p>
              <div className="w-full bg-slate-50 h-4 rounded-full overflow-hidden p-0.5 shadow-inner"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(activeBook.currentPages / activeBook.totalPages) * 100}%` }}></div></div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleUpdateReading} className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0"><Check className="w-8 h-8 stroke-[3]" /></button>
              <div className="flex-1 bg-slate-50 rounded-[1.5rem] p-1 border border-transparent focus-within:bg-white focus-within:border-emerald-100 transition-all"><input type="number" value={readingInput} onChange={(e) => setReadingInput(e.target.value)} placeholder="صفحات اليوم" className="w-full bg-transparent px-6 py-5 text-lg font-bold header-font outline-none text-center placeholder:text-slate-300" /></div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-3xl"><p className="text-xs text-slate-400 font-bold header-font">لا يوجد كتاب نشط.. أضف كتاباً من المكتبة</p></div>
        )}
      </div>

      {/* أوسمة الأبرار اليوم */}
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

    </div>
  );
};

export default Dashboard;
