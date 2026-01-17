
import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Flame, 
  FileSpreadsheet,
  Loader2,
  Layers,
  Zap,
  Activity,
  Target,
  CalendarDays
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Tooltip as RechartsTooltip
} from 'recharts';
import { DailyLog, AppWeights, User, PrayerEntry } from '../types';
import { isWithinInterval, endOfDay, format, addDays } from 'date-fns';
import { calculateTotalScore } from '../utils/scoring';
import { GOOGLE_STATS_API } from '../constants';

interface StatisticsProps {
  user: User | null;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
}

type ActivityType = 'all' | 'prayers' | 'quran' | 'knowledge' | 'fasting' | 'athkar';

const Statistics: React.FC<StatisticsProps> = ({ user, logs, weights }) => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');
  const [activityFilter, setActivityFilter] = useState<ActivityType>('all');
  const [isExporting, setIsExporting] = useState(false);

  const activityOptions: { id: ActivityType; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'الالتزام العام', icon: <Activity className="w-3 h-3" />, color: 'emerald' },
    { id: 'prayers', label: 'الصلوات', icon: <CheckCircle2 className="w-3 h-3" />, color: 'blue' },
    { id: 'quran', label: 'القرآن', icon: <BookOpen className="w-3 h-3" />, color: 'amber' },
    { id: 'knowledge', label: 'طلب العلم', icon: <Clock className="w-3 h-3" />, color: 'purple' },
    { id: 'fasting', label: 'الصيام', icon: <Flame className="w-3 h-3" />, color: 'orange' },
    { id: 'athkar', label: 'الأذكار', icon: <Zap className="w-3 h-3" />, color: 'rose' },
  ];

  const radarData = useMemo(() => {
    const now = new Date();
    const startDate = timeFilter === 'week' ? addDays(now, -7) : timeFilter === 'month' ? addDays(now, -30) : addDays(now, -365);
    const periodLogs = (Object.values(logs) as DailyLog[]).filter(log => {
      const logDate = new Date(log.date.replace(/-/g, '/'));
      return isWithinInterval(logDate, { start: startDate, end: endOfDay(now) });
    });
    let counts = { prayers: 0, quran: 0, knowledge: 0, fasting: 0, dhikr: 0 };
    periodLogs.forEach(log => {
      counts.prayers += Object.values(log.prayers).filter(p => (p as PrayerEntry).performed).length;
      counts.quran += (log.quran.hifzRub + log.quran.revisionRub);
      counts.knowledge += (log.knowledge.shariDuration + log.knowledge.readingDuration) / 30;
      counts.fasting += log.nawafil.fasting ? 10 : 0;
      counts.dhikr += Object.values(log.athkar.counters).reduce((a, b) => a + (b as number), 0) / 100;
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

  const consistencyGrid = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const date = addDays(new Date(), -(29 - i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = logs[dateStr];
      let isConnected = false;
      if (log) {
        switch (activityFilter) {
          case 'all': isConnected = calculateTotalScore(log, weights) > 0; break;
          case 'prayers': isConnected = Object.values(log.prayers).some(p => p.performed); break;
          case 'quran': isConnected = (log.quran.hifzRub + log.quran.revisionRub) > 0; break;
          case 'knowledge': isConnected = (log.knowledge.shariDuration + log.knowledge.readingDuration) > 0; break;
          case 'fasting': isConnected = log.nawafil.fasting; break;
          case 'athkar': isConnected = Object.values(log.athkar.checklists).some(v => v) || Object.values(log.athkar.counters).some(v => v > 0); break;
        }
      }
      const activeColor = { all: 'bg-emerald-500', prayers: 'bg-blue-500', quran: 'bg-amber-500', knowledge: 'bg-purple-500', fasting: 'bg-orange-500', athkar: 'bg-rose-500' }[activityFilter];
      return { date, isConnected, colorClass: isConnected ? activeColor : 'bg-slate-100', dateStr };
    });
  }, [logs, weights, activityFilter]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const anonId = localStorage.getItem('mizan_anon_id') || Math.random().toString(36).substring(7);
      await fetch(GOOGLE_STATS_API, { method: 'POST', body: JSON.stringify({ action: 'exportData', id: anonId, userName: user?.name, data: (Object.values(logs) as DailyLog[]).map(l => ({ التاريخ: l.date, النقاط: calculateTotalScore(l, weights) })) }) });
      alert("تم التصدير بنجاح");
    } catch (e) { alert("فشل التصدير"); } finally { setIsExporting(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl"><BarChart3 className="w-6 h-6 text-emerald-600" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 header-font">بصمتك الروحية</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase header-font">أنماط الاتصال والانقطاع</p>
          </div>
        </div>
        <button onClick={handleExport} disabled={isExporting} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all">{isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}</button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-500" /><h3 className="font-bold text-slate-700 text-xs header-font">خريطة تكرار الأعمال</h3></div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {activityOptions.map(opt => (
            <button key={opt.id} onClick={() => setActivityFilter(opt.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-bold header-font whitespace-nowrap transition-all border ${activityFilter === opt.id ? `bg-${opt.color}-50 border-${opt.color}-200 text-${opt.color}-700 shadow-sm` : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>{opt.icon}{opt.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-10 gap-2 mb-4">
          {consistencyGrid.map((day, i) => (<div key={i} title={`${day.dateStr}`} className={`aspect-square rounded-md transition-all duration-300 hover:scale-110 cursor-help ${day.colorClass} shadow-sm`}></div>))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /><h3 className="font-bold text-slate-700 text-xs header-font">توازن المحراب</h3></div></div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#f1f5f9" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700, fontFamily: 'Cairo' }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="الأداء" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
