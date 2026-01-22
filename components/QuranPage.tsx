
import React, { useState, useMemo } from 'react';
import { 
  Book, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Zap, 
  Repeat, 
  Mic, 
  History, 
  BookOpen,
  ArrowLeftRight,
  Sparkles,
  Info,
  ChevronLeft,
  Settings,
  MessageSquareText
} from 'lucide-react';
import { DailyLog } from '../types';
import { format, subDays, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';

interface QuranPageProps {
  log: DailyLog;
  logs: Record<string, DailyLog>;
  plan: 'new_1' | 'new_2' | 'itqan_3' | 'itqan_4';
  onUpdatePlan: (plan: 'new_1' | 'new_2' | 'itqan_3' | 'itqan_4') => void;
  onUpdateLog: (log: DailyLog) => void;
}

const QuranPage: React.FC<QuranPageProps> = ({ log, logs, plan, onUpdatePlan, onUpdateLog }) => {
  const [subTab, setSubTab] = useState<'hifz' | 'tadabbur'>('hifz');

  const quranData = log.quran || { hifzRub: 0, revisionRub: 0, todayPortion: '', tasksCompleted: [] };

  const toggleTask = (taskId: string) => {
    const currentTasks = quranData.tasksCompleted || [];
    const newTasks = currentTasks.includes(taskId)
      ? currentTasks.filter(id => id !== taskId)
      : [...currentTasks, taskId];
    
    onUpdateLog({
      ...log,
      quran: { ...quranData, tasksCompleted: newTasks }
    });
  };

  const updatePortionName = (name: string) => {
    onUpdateLog({
      ...log,
      quran: { ...quranData, todayPortion: name }
    });
  };

  // Logic for Yesterday's Repetition
  const yesterdayLog = useMemo(() => {
    const yesterdayDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    return logs[yesterdayDate];
  }, [logs]);

  // Logic for Rabt (Last 10 days)
  const rabtPortions = useMemo(() => {
    const portions = [];
    for (let i = 1; i <= 10; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const l = logs[d];
      if (l?.quran?.todayPortion) {
        portions.push({ date: d, portion: l.quran.todayPortion });
      }
    }
    return portions;
  }, [logs]);

  // Logic for Murajaa (Old portions > 32 days, divided by 6)
  const murajaaPortions = useMemo(() => {
    // Cast Object.values to DailyLog[] to resolve "type unknown" errors in property access
    const allPortions = (Object.values(logs) as DailyLog[])
      .filter(l => l.quran?.todayPortion)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // We only take portions older than roughly 32 days
    const oldPortions = allPortions.filter(l => {
      const daysDiff = (new Date().getTime() - new Date(l.date).getTime()) / (1000 * 3600 * 24);
      return daysDiff >= 32;
    });

    // Divide them into 6 groups based on day of week for cycle
    const dayOfWeek = new Date().getDay(); // 0-6
    // Fix: Map to objects with 'portion' property to match the JSX component expectation and resolve property access error.
    return oldPortions
      .filter((_, idx) => idx % 6 === dayOfWeek % 6)
      .map(l => ({ portion: l.quran.todayPortion as string }));
  }, [logs]);

  const hifzSteps = [
    { id: 'listen', label: 'الاستماع لمجود مع النظر', desc: 'للتأكد من سلامة النطق' },
    { id: 'focus', label: 'التركيز على الوقف والابتداء', desc: 'فهم المعاني من خلال الوقوف' },
    { id: 'link_next', label: 'ربط السطر الأول من الوجه التالي', desc: 'لضمان تسلسل الأوجه' },
    { id: 'record', label: 'التسجيل الصوتي والمطابقة', desc: 'قراءة غيبية ومطابقتها' },
    { id: 'repeat', label: plan.includes('new') ? 'تكرار الوجه ٤٠ مرة' : 'تكرار الوجه ٣٠ مرة', desc: 'تثبيت الحفظ في الذاكرة العميقة' },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Tab Switcher */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex">
        <button 
          onClick={() => setSubTab('hifz')}
          className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-2 ${subTab === 'hifz' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}
        >
          <Repeat className="w-4 h-4" /> برنامج الحفظ والإتقان
        </button>
        <button 
          onClick={() => setSubTab('tadabbur')}
          className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-2 ${subTab === 'tadabbur' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}
        >
          <Sparkles className="w-4 h-4" /> محراب التدبر
        </button>
      </div>

      {subTab === 'hifz' ? (
        <div className="space-y-6">
          {/* Plan Settings */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-800 header-font text-sm">إعدادات الخطة الحالية</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'new_1', label: 'حفظ (وجه/يوم)', sub: '٢٠ شهر' },
                { id: 'new_2', label: 'حفظ (وجهين/يوم)', sub: '١٠ أشهر' },
                { id: 'itqan_3', label: 'إتقان (٣ أوجه/يوم)', sub: '٧ أشهر' },
                { id: 'itqan_4', label: 'إتقان (٤ أوجه/يوم)', sub: '٥ أشهر' },
              ].map(p => (
                <button 
                  key={p.id}
                  onClick={() => onUpdatePlan(p.id as any)}
                  className={`p-3 rounded-2xl border text-right transition-all ${plan === p.id ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                >
                  <p className={`text-xs font-black header-font ${plan === p.id ? 'text-emerald-700' : 'text-slate-600'}`}>{p.label}</p>
                  <p className="text-[9px] text-slate-400 font-bold">{p.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Memorization Name */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-4">
               <Book className="w-5 h-5 text-emerald-500" />
               <h3 className="font-bold text-slate-800 header-font text-sm">المحفوظ الجديد لليوم</h3>
             </div>
             <input 
               type="text"
               value={quranData.todayPortion || ''}
               onChange={(e) => updatePortionName(e.target.value)}
               placeholder="مثال: سورة البقرة - من وجه ٤ إلى ٥"
               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black header-font focus:border-emerald-500 outline-none transition-all"
             />
          </div>

          {/* Hifz Checklist */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-800 header-font text-sm">قائمة مهام الحفظ (تكرار اليوم)</h3>
            </div>
            <div className="space-y-3">
              {hifzSteps.map(step => (
                <button 
                  key={step.id}
                  onClick={() => toggleTask(step.id)}
                  className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-right ${quranData.tasksCompleted?.includes(step.id) ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-slate-50 border-transparent'}`}
                >
                  <div className={`mt-1 rounded-lg p-1 ${quranData.tasksCompleted?.includes(step.id) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {quranData.tasksCompleted?.includes(step.id) ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-xs font-black header-font ${quranData.tasksCompleted?.includes(step.id) ? 'text-emerald-800 line-through' : 'text-slate-700'}`}>{step.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Yesterday Review */}
          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-900 header-font text-sm">تكرار الأمس (٥ مرات)</h3>
              </div>
              <button onClick={() => toggleTask('yesterday_rep')} className={`p-2 rounded-xl ${quranData.tasksCompleted?.includes('yesterday_rep') ? 'bg-emerald-500 text-white' : 'bg-white text-amber-300 border border-amber-100'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
            {yesterdayLog?.quran?.todayPortion ? (
              <p className="text-sm font-black text-amber-800 header-font">📖 {yesterdayLog.quran.todayPortion}</p>
            ) : (
              <p className="text-[10px] text-amber-600 font-bold italic">لا يوجد محفوظ مسجل ليوم أمس</p>
            )}
          </div>

          {/* Rabt (Last 10 Days) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <ArrowLeftRight className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-800 header-font text-sm">دعامة الربط (آخر ١٠ أيام)</h3>
            </div>
            <div className="space-y-2">
              {rabtPortions.length > 0 ? rabtPortions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-600 header-font">{item.portion}</span>
                  <span className="text-[9px] text-slate-400 font-bold">{format(new Date(item.date), 'dd MMM', { locale: ar })}</span>
                </div>
              )) : (
                <div className="text-center py-6 text-[10px] text-slate-400 font-bold italic">ستظهر هنا محفوظات آخر ١٠ أيام للربط</div>
              )}
            </div>
          </div>

          {/* Murajaa (Old Hifz) */}
          <div className="bg-emerald-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-bold header-font">مراجعة المحفوظ القديم</h3>
              </div>
              <p className="text-[11px] text-emerald-200 font-bold mb-4">خطة مراجعة لختم محفوظك "كل ٦ أيام" غيباً:</p>
              <div className="space-y-3">
                {murajaaPortions.length > 0 ? murajaaPortions.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-black header-font">{item.portion}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-50" />
                  </div>
                )) : (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <p className="text-[10px] text-emerald-300 font-bold">المحفوظات التي مر عليها ٣٢ يوماً ستظهر هنا تلقائياً لتدخل في دورة المراجعة السداسية.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-left duration-500">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquareText className="w-20 h-20" /></div>
             <div className="relative z-10">
               <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <Sparkles className="w-8 h-8 text-emerald-600" />
               </div>
               <h2 className="text-xl font-bold text-slate-800 header-font mb-2">مدونة التدبر والتفكر</h2>
               <p className="text-xs text-slate-500 leading-relaxed font-bold header-font">
                 "أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَى قُلُوبٍ أَقْفَالُهَا"<br/>
                 سيتم تفعيل الخطوات المنهجية للتدبر قريباً بناءً على مسارك المختار.
               </p>
             </div>
          </div>

          {/* Placeholder for Tadabbur steps */}
          <div className="space-y-4">
            {[
              { id: 1, label: 'فهم السياق وأسباب النزول', desc: 'لماذا وكيف نزلت هذه الآيات؟' },
              { id: 2, label: 'معاني المفردات الغريبة', desc: 'تفكيك الكلمات لتعميق الفهم' },
              { id: 3, label: 'استخراج الهدايات العملية', desc: 'كيف أطبق هذه الآية في حياتي اليوم؟' },
            ].map(step => (
              <div key={step.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 opacity-50 grayscale">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 font-mono">{step.id}</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700 header-font">{step.label}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranPage;
