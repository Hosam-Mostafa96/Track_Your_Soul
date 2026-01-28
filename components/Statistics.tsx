
import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Flame, 
  CloudIcon,
  Loader2,
  Layers,
  Zap,
  Activity,
  Target,
  CloudUpload,
  Bed,
  Moon,
  ShieldAlert,
  MapPin,
  Sparkle,
  Smile,
  ShieldCheck,
  RefreshCw,
  Wrench,
  Download,
  FileJson,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';
import { DailyLog, AppWeights, User, PrayerEntry, Book } from '../types';
import { endOfDay, format, addDays, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { calculateTotalScore } from '../utils/scoring';
import { GOOGLE_STATS_API } from '../constants';

interface StatisticsProps {
  user: User | null;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  books: Book[]; 
  lastSyncTime?: string | null;
  onManualSync?: (force?: boolean) => void;
}

type ActivityType = 'all' | 'prayers' | 'quran' | 'knowledge' | 'fasting' | 'athkar' | 'sleep' | 'burden' | 'takbir' | 'mood';

const Statistics: React.FC<StatisticsProps> = ({ user, logs, weights, books, lastSyncTime, onManualSync }) => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');
  const [activityFilter, setActivityFilter] = useState<ActivityType>('all');
  const [isExporting, setIsExporting] = useState(false);

  const activityOptions: { id: ActivityType; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'الالتزام العام', icon: <Activity className="w-3 h-3" />, color: 'emerald' },
    { id: 'mood', label: 'الحالة القلبية', icon: <Smile className="w-3 h-3" />, color: 'amber' },
    { id: 'prayers', label: 'الصلوات', icon: <CheckCircle2 className="w-3 h-3" />, color: 'blue' },
    { id: 'takbir', label: 'تكبيرة الإحرام', icon: <Sparkle className="w-3 h-3" />, color: 'amber' },
    { id: 'quran', label: 'القرآن', icon: <BookOpen className="w-3 h-3" />, color: 'emerald' },
    { id: 'knowledge', label: 'طلب العلم', icon: <Clock className="w-3 h-3" />, color: 'purple' },
    { id: 'fasting', label: 'الصيام', icon: <Flame className="w-3 h-3" />, color: 'orange' },
    { id: 'athkar', label: 'الأذكار', icon: <Zap className="w-3 h-3" />, color: 'rose' },
    { id: 'sleep', label: 'النوم', icon: <Bed className="w-3 h-3" />, color: 'indigo' },
    { id: 'burden', label: 'العبء الروحي', icon: <ShieldAlert className="w-3 h-3" />, color: 'rose' },
  ];

  const radarData = useMemo(() => {
    const now = new Date();
    const startDate = timeFilter === 'week' ? addDays(now, -7) : timeFilter === 'month' ? addDays(now, -30) : addDays(now, -365);
    const periodLogs = (Object.values(logs) as DailyLog[]).filter(log => {
      const logDate = new Date(log.date.replace(/-/g, '/'));
      const start = startDate.getTime();
      const end = endOfDay(now).getTime();
      const current = logDate.getTime();
      return current >= start && current <= end;
    });
    let counts = { prayers: 0, quran: 0, knowledge: 0, fasting: 0, dhikr: 0 };
    periodLogs.forEach(log => {
      counts.prayers += (Object.values(log.prayers) as PrayerEntry[]).filter(p => p.performed).length;
      counts.quran += ((log.quran.hifzRub || 0) + log.quran.revisionRub);
      counts.knowledge += (log.knowledge.shariDuration + (log.knowledge.readingDuration || 0)) / 30;
      counts.fasting += log.nawafil.fasting ? 10 : 0;
      counts.dhikr += (Object.values(log.athkar.counters) as number[]).reduce((a, b) => a + b, 0) / 100;
    });
    const max = Math.max(...Object.values(counts), 1);
    return [
      { subject: 'الصلاة', A: (counts.prayers / max) * 100 },
      { subject: 'القرآن', A: (counts.quran / max) * 100 },
      { subject: 'العلم', A: (counts.knowledge / max) * 100 },
      { subject: 'الصيام', A: (counts.fasting / max) * 100 },
      { subject: 'الأذكار', A: (counts.dhikr / max) * 100 },
    ];
  }, [logs, timeFilter]);

  const sleepStatsData = useMemo(() => {
    const days = 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const dStr = format(d, 'yyyy-MM-dd');
      const log = logs[dStr];
      let totalHours = 0;
      if (log && log.sleep?.sessions) {
        log.sleep.sessions.forEach(s => {
          const [startH, startM] = s.start.split(':').map(Number);
          const [endH, endM] = s.end.split(':').map(Number);
          let mins = (endH * 60 + endM) - (startH * 60 + startM);
          if (mins < 0) mins += 24 * 60;
          totalHours += mins / 60;
        });
      }
      data.push({ date: format(d, 'dd MMM', { locale: ar }), hours: parseFloat(totalHours.toFixed(1)) });
    }
    return data;
  }, [logs]);

  const avgSleepHours = useMemo(() => {
    const total = sleepStatsData.reduce((acc, curr) => acc + curr.hours, 0);
    const recordedDays = sleepStatsData.filter(d => d.hours > 0).length;
    return recordedDays > 0 ? (total / recordedDays).toFixed(1) : "0";
  }, [sleepStatsData]);

  const consistencyGrid = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const date = addDays(new Date(), -(29 - i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = logs[dateStr];
      let isConnected = false;
      if (log) {
        switch (activityFilter) {
          case 'all': isConnected = calculateTotalScore(log, weights) > 0; break;
          case 'mood': isConnected = (log.mood || 0) >= 4; break; 
          case 'prayers': isConnected = (Object.values(log.prayers) as PrayerEntry[]).some(p => p.performed); break;
          case 'takbir': isConnected = (Object.values(log.prayers) as PrayerEntry[]).some(p => p.surroundingSunnahIds?.includes('takbir')); break;
          case 'quran': isConnected = ((log.quran.hifzRub || 0) + log.quran.revisionRub) > 0; break;
          case 'knowledge': isConnected = (log.knowledge.shariDuration + (log.knowledge.readingDuration || 0)) > 0; break;
          case 'fasting': isConnected = log.nawafil.fasting; break;
          case 'athkar': isConnected = (Object.values(log.athkar.checklists) as boolean[]).some(v => v) || (Object.values(log.athkar.counters) as number[]).some(v => v > 0); break;
          case 'sleep': isConnected = (log.sleep?.sessions || []).length > 0; break;
          case 'burden': isConnected = log.hasBurden; break;
        }
      }
      const activeColor = { all: 'bg-emerald-500', mood: 'bg-amber-400', prayers: 'bg-blue-500', takbir: 'bg-amber-500', quran: 'bg-emerald-600', knowledge: 'bg-purple-500', fasting: 'bg-orange-500', athkar: 'bg-rose-500', sleep: 'bg-indigo-500', burden: 'bg-rose-600' }[activityFilter];
      return { date, isConnected, colorClass: isConnected ? activeColor : 'bg-slate-100', dateStr };
    });
  }, [logs, weights, activityFilter]);

  const handleCloudBackup = async (force = false) => {
    if (!user?.email || !navigator.onLine) return;
    if (force && !window.confirm("هذا الإجراء سيقوم بمسح أي بيانات مكررة في السحابة واستبدالها بنسخة نظيفة ومرتبة من جهازك. هل تود المتابعة؟")) return;
    
    setIsExporting(true);
    try {
      if (onManualSync) {
        await onManualSync(force);
      } else {
        const payload = { 
          action: 'syncLogs', 
          email: user.email.toLowerCase().trim(), 
          logs: JSON.stringify(logs),
          books: JSON.stringify(books),
          forceUpdate: force,
          timestamp: new Date().toISOString()
        };
        const res = await fetch(GOOGLE_STATS_API, { 
          method: 'POST', 
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload) 
        });
        if (!res.ok) throw new Error("Sync failed");
      }
      if(force) alert("تم إصلاح التداخل وإعادة تنظيم السجلات السحابية بنجاح.");
    } catch (e) { 
      alert("خطأ في المزامنة. تأكد من اتصال الإنترنت.");
    } finally { 
      setIsExporting(false); 
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `mizan_backup_${format(new Date(), 'yyyy_MM_dd')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      
      {/* بطاقة السحابة والمزامنة */}
      <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold header-font leading-tight">حالة البيانات السحابية</h2>
                <p className="text-[10px] text-emerald-200 font-bold">
                  {lastSyncTime ? `آخر مزامنة: ${formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true, locale: ar })}` : 'لم يتم المزامنة بعد'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleCloudBackup(true)} 
                title="إصلاح تداخل السجلات السحابية"
                disabled={isExporting}
                className="p-3 bg-white/10 hover:bg-white/20 text-emerald-200 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wrench className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => handleCloudBackup(false)} 
                disabled={isExporting}
                className={`p-3 rounded-2xl transition-all ${isExporting ? 'bg-emerald-500/50' : 'bg-emerald-500 hover:bg-emerald-400 shadow-lg active:scale-95'}`}
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black header-font transition-all border border-white/5"
            >
              <FileJson className="w-4 h-4 text-emerald-300" />
              تحميل نسخة احتياطية (JSON) للجهاز
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-500" /><h3 className="font-bold text-slate-700 text-xs header-font">خريطة تكرار الأعمال (آخر 30 يوماً)</h3></div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {activityOptions.map(opt => (
            <button 
              key={opt.id} 
              onClick={() => setActivityFilter(opt.id)} 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black header-font whitespace-nowrap transition-all border ${activityFilter === opt.id ? `bg-${opt.color}-50 border-${opt.color}-200 text-${opt.color}-700 shadow-sm` : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
            >
              {opt.icon}{opt.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-10 gap-2 mb-4">
          {consistencyGrid.map((day, i) => (
            <div key={i} title={`${day.dateStr}`} className={`aspect-square rounded-md transition-all duration-300 hover:scale-110 cursor-help ${day.colorClass} shadow-sm border border-black/5`}></div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-[9px] text-amber-800 font-bold header-font leading-relaxed">إذا وجدت مربعات فارغة لأيام قمت بتسجيلها، استخدم أيقونة "مفتاح الربط" لإصلاح السحابة.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -translate-y-12 translate-x-12 opacity-50 group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between mb-6 relative z-10"><div className="flex items-center gap-3"><div className="p-3 bg-indigo-100 rounded-2xl text-indigo-700"><Moon className="w-6 h-6" /></div><div><h3 className="text-lg font-black text-slate-800 header-font leading-tight">تحليل ساعات النوم</h3><p className="text-[10px] text-slate-400 font-bold uppercase header-font">آخر 30 يوماً</p></div></div><div className="text-right"><span className="text-2xl font-black font-mono text-indigo-600 leading-none">{avgSleepHours}</span><p className="text-[8px] font-bold text-slate-400 header-font mt-1">ساعة كمتوسط</p></div></div>
        <div className="h-48 w-full relative z-10"><ResponsiveContainer width="100%" height="100%"><BarChart data={sleepStatsData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8', fontFamily: 'Cairo' }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} width={20}/><RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo' }} /><Bar dataKey="hours" radius={[4, 4, 0, 0]}>{sleepStatsData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.hours >= 6 && entry.hours <= 8 ? '#6366f1' : '#a5b4fc'} />))}</Bar></BarChart></ResponsiveContainer></div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /><h3 className="font-bold text-slate-700 text-xs header-font">توازن المحراب</h3></div></div>
        <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}><PolarGrid stroke="#f1f5f9" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700, fontFamily: 'Cairo' }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} /><Radar name="الأداء" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} /></RadarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
};

export default Statistics;
