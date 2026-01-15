
import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Flame, 
  FileSpreadsheet,
  TrendingUp,
  Loader2,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { DailyLog, AppWeights, User, PrayerName, PrayerEntry } from '../types';
import { subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface StatisticsProps {
  user: User | null;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
}

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzbkn4MVK27wrmAhkDvKjZdq01vOQWG7-SFDOltC4e616Grjp-uMsON4cVcr3OOVKqg/exec"; 

const Statistics: React.FC<StatisticsProps> = ({ user, logs, weights }) => {
  const [filter, setFilter] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [isExporting, setIsExporting] = useState(false);

  const filteredLogs = useMemo<DailyLog[]>(() => {
    const now = new Date();
    let startDate: Date;

    const allLogs = Object.values(logs) as DailyLog[];

    if (filter === 'day') startDate = startOfDay(now);
    else if (filter === 'week') startDate = subDays(now, 7);
    else if (filter === 'month') startDate = subDays(now, 30);
    else return allLogs;

    return allLogs.filter((log: DailyLog) => {
      const logDate = new Date(log.date.replace(/-/g, '/'));
      return isWithinInterval(logDate, { start: startDate, end: endOfDay(now) });
    });
  }, [logs, filter]);

  const statsData = useMemo(() => {
    let totalPrayers = 0;
    let congregationPrayers = 0;
    let quranRubs = 0;
    let knowledgeMins = 0;
    let fastingDays = 0;

    filteredLogs.forEach((log: DailyLog) => {
      (Object.values(log.prayers) as PrayerEntry[]).forEach(p => {
        if (p.performed) {
          totalPrayers++;
          if (p.inCongregation) congregationPrayers++;
        }
      });
      quranRubs += (log.quran.hifzRub + log.quran.revisionRub);
      knowledgeMins += (log.knowledge.shariDuration + log.knowledge.readingDuration);
      if (log.nawafil.fasting) fastingDays++;
    });

    return [
      { name: 'الصلوات', value: totalPrayers, color: '#10b981', icon: <CheckCircle2 className="w-4 h-4" /> },
      { name: 'الجماعة', value: congregationPrayers, color: '#059669', icon: <Sparkles className="w-4 h-4" /> },
      { name: 'أرباع قرآن', value: quranRubs, color: '#3b82f6', icon: <BookOpen className="w-4 h-4" /> },
      { name: 'دقائق علم', value: knowledgeMins, color: '#f59e0b', icon: <Clock className="w-4 h-4" /> },
      { name: 'أيام صيام', value: fastingDays, color: '#ef4444', icon: <Flame className="w-4 h-4" /> },
    ];
  }, [filteredLogs]);

  const handleExport = async () => {
    if (GOOGLE_STATS_API.includes("FIX_ME")) {
      alert("خاصية التصدير السحابي تتطلب تكوين الرابط الموحد.");
      return;
    }
    
    setIsExporting(true);
    const anonId = localStorage.getItem('mizan_anon_id') || Math.random().toString(36).substring(7);

    try {
      const payload = {
        action: 'exportData',
        id: anonId,
        userName: user?.name,
        userEmail: user?.email,
        data: (Object.values(logs) as DailyLog[]).map((l: DailyLog) => ({
          التاريخ: l.date,
          الفجر: l.prayers[PrayerName.FAJR]?.performed ? 'تم' : 'لم يتم',
          الظهر: l.prayers[PrayerName.DHUHR]?.performed ? 'تم' : 'لم يتم',
          العصر: l.prayers[PrayerName.ASR]?.performed ? 'تم' : 'لم يتم',
          المغرب: l.prayers[PrayerName.MAGHRIB]?.performed ? 'تم' : 'لم يتم',
          العشاء: l.prayers[PrayerName.ISHA]?.performed ? 'تم' : 'لم يتم',
          أرباع_القرآن: l.quran.hifzRub + l.quran.revisionRub,
          دقائق_طلب_العلم: l.knowledge.shariDuration + l.knowledge.readingDuration,
          الصيام: l.nawafil.fasting ? 'نعم' : 'لا'
        }))
      };

      await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      alert("تم إرسال بياناتك بنجاح إلى Google Sheets المرتبط بحسابك.");
    } catch (e) {
      console.error("Export Error:", e);
      alert("حدث خطأ أثناء التصدير. يرجى المحاولة لاحقاً.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 header-font">إحصائيات الميزان</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase header-font">تحليل بياني لمسارك الروحي</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className={`p-3 rounded-2xl transition-all ${isExporting ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm'}`}
          title="تصدير إلى Google Sheets"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
        {(['day', 'week', 'month', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold header-font transition-all ${filter === f ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {f === 'day' ? 'اليوم' : f === 'week' ? 'الأسبوع' : f === 'month' ? 'الشهر' : 'الكل'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-slate-700 text-xs header-font">تكرار الأعمال في هذه الفترة</h3>
        </div>
        {/* زيادة الارتفاع ليعطي مساحة أكبر للبارات */}
        <div className="h-72 w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={statsData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b', fontFamily: 'Cairo' }}
                width={85}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                  fontFamily: 'Cairo',
                  fontSize: '12px'
                }}
              />
              {/* تعديل barSize ليكون 32 بدلاً من 24 ليكون أكثر "امتلاءً" */}
              <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                {statsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statsData.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 group hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                {s.icon}
              </div>
              <span className="text-xl font-black font-mono text-slate-800">{s.value}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold header-font uppercase tracking-tighter">{s.name}</p>
          </div>
        ))}
      </div>

      <div className="bg-emerald-900 text-white rounded-[2rem] p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="flex gap-4 items-center relative z-10">
          <div className="p-3 bg-white/10 rounded-2xl">
            <CalendarDays className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold header-font mb-1">استمرارية العمل</h4>
            <p className="text-[10px] text-emerald-100 leading-relaxed font-bold header-font opacity-80">
              "أحب الأعمال إلى الله أدومها وإن قل". الإحصائيات هي مرآة ثباتك، واصل السير.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
