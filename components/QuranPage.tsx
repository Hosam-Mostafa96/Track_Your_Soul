
import React, { useState, useMemo } from 'react';
import { 
  Book, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Zap, 
  Repeat, 
  History, 
  ArrowLeftRight,
  Sparkles,
  ChevronDown,
  Settings,
  MessageSquareText,
  Clock,
  Mic,
  ListChecks
} from 'lucide-react';
import { DailyLog } from '../types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// توليد قائمة الأرباع (240 ربع)
const PORTIONS_240 = Array.from({ length: 240 }, (_, i) => ({
  id: `rub_${i + 1}`,
  label: `الربع رقم ${i + 1}`,
  index: i + 1
}));

// توليد قائمة الصفحات (604 صفحة)
const PAGES_604 = Array.from({ length: 604 }, (_, i) => ({
  id: `page_${i + 1}`,
  label: `صفحة رقم ${i + 1}`,
  index: i + 1
}));

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

  // استخراج الفهرس الحالي بناءً على القيمة المختارة
  const currentIndex = useMemo(() => {
    if (!quranData.todayPortion) return 0;
    const match = quranData.todayPortion.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }, [quranData.todayPortion]);

  // الربط التلقائي (آخر 10 وحدات سابقة للمحفوظ الحالي)
  const rabtPortions = useMemo(() => {
    if (currentIndex <= 1) return [];
    const unit = plan === 'new_1' ? 'صفحة' : 'ربع';
    const portions = [];
    const limit = Math.max(1, currentIndex - 10);
    for (let i = currentIndex - 1; i >= limit; i--) {
      portions.push({ label: `${unit} رقم ${i}`, index: i });
    }
    return portions;
  }, [currentIndex, plan]);

  // المراجعة التلقائية (باقي المحفوظ مقسماً على 6 أيام)
  const murajaaPortions = useMemo(() => {
    if (currentIndex <= 11) return [];
    const unit = plan === 'new_1' ? 'صفحة' : 'ربع';
    const dayOfWeek = new Date().getDay(); // 0-6
    const murajaaEnd = currentIndex - 11;
    
    // تقسيم المحفوظ القديم إلى 6 مجموعات
    const chunkSize = Math.ceil(murajaaEnd / 6);
    const start = (dayOfWeek % 6) * chunkSize + 1;
    const end = Math.min(murajaaEnd, start + chunkSize - 1);
    
    if (start > murajaaEnd) return [];
    return [{ label: `من ${unit} ${start} إلى ${end}` }];
  }, [currentIndex, plan]);

  const plans = [
    { id: 'new_1', label: 'حفظ (وجه واحد/يوم)', sub: 'ختمة في ٢٠ شهر' },
    { id: 'new_2', label: 'حفظ (وجهين/يوم)', sub: 'ختمة في ١٠ أشهر' },
    { id: 'itqan_3', label: 'إتقان (٣ أوجه/يوم)', sub: 'ختمة في ٧ أشهر' },
    { id: 'itqan_4', label: 'إتقان (٤ أوجه/يوم)', sub: 'ختمة في ٥ أشهر' },
  ];

  // تعديل الترتيب: التكرار قبل التسجيل
  const hifzSteps = [
    { id: 'listen', label: 'الاستماع لمجود مع النظر', desc: 'للتأكد من سلامة النطق', icon: <Clock className="w-4 h-4" /> },
    { id: 'repeat', label: plan.includes('new') ? 'تكرار الوجه ٤٠ مرة' : 'تكرار الوجه ٣٠ مرة', desc: 'تثبيت الحفظ في الذاكرة العميقة', icon: <Repeat className="w-4 h-4" /> },
    { id: 'record', label: 'التسجيل الصوتي والمطابقة', desc: 'قراءة غيبية ومطابقتها للتصحيح', icon: <Mic className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 text-right" dir="rtl">
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
              <h3 className="font-bold text-slate-800 header-font text-sm">خطة الحفظ الحالية</h3>
            </div>
            <div className="relative">
              <select 
                value={plan}
                onChange={(e) => onUpdatePlan(e.target.value as any)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pr-10 text-xs font-black header-font appearance-none outline-none focus:border-emerald-500 transition-all text-slate-700"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.label} - {p.sub}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Today's Memorization - Dropdown Version */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-4">
               <Book className="w-5 h-5 text-emerald-500" />
               <h3 className="font-bold text-slate-800 header-font text-sm">المحفوظ الجديد لليوم</h3>
             </div>
             
             <div className="relative">
                <select 
                  value={quranData.todayPortion || ''}
                  onChange={(e) => updatePortionName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pr-10 text-xs font-black header-font appearance-none outline-none focus:border-emerald-500 transition-all text-slate-700"
                >
                  <option value="">اختر موضع الحفظ من المصحف..</option>
                  {plan === 'new_1' ? (
                    PAGES_604.map(p => <option key={p.id} value={p.label}>{p.label}</option>)
                  ) : (
                    PORTIONS_240.map(p => <option key={p.id} value={p.label}>{p.label}</option>)
                  )}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
             </div>
             <p className="text-[10px] text-slate-400 font-bold mt-3 px-1">
               * تم توحيد النظام ليعتمد على {plan === 'new_1' ? 'أرقام الصفحات' : 'أرقام الأرباع'} لضمان دقة التتبع.
             </p>
          </div>

          {/* Hifz Checklist */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <ListChecks className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-800 header-font text-sm">خطوات الإتقان (بالترتيب)</h3>
            </div>
            <div className="space-y-3">
              {hifzSteps.map((step, idx) => (
                <button 
                  key={step.id}
                  onClick={() => toggleTask(step.id)}
                  className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-right ${quranData.tasksCompleted?.includes(step.id) ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-slate-50 border-transparent'}`}
                >
                  <div className={`mt-1 rounded-lg p-2 ${quranData.tasksCompleted?.includes(step.id) ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 shadow-sm'}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-black header-font ${quranData.tasksCompleted?.includes(step.id) ? 'text-emerald-800 line-through' : 'text-slate-700'}`}>{idx + 1}. {step.label}</p>
                      {quranData.tasksCompleted?.includes(step.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-200" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rabt - Automatic Schedule */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <ArrowLeftRight className="w-5 h-5 text-blue-500" />
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-800 header-font text-sm">دعامة الربط التلقائي</h3>
                <p className="text-[9px] text-slate-400 font-bold italic">مراجعة الـ 10 مواضع السابقة لموضعك الحالي</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {rabtPortions.length > 0 ? rabtPortions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-600 header-font">{item.label}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                </div>
              )) : (
                <div className="col-span-2 text-center py-6 text-[10px] text-slate-400 font-bold italic">اختر موضع حفظك الحالي ليتم جدولة الربط تلقائياً</div>
              )}
            </div>
          </div>

          {/* Murajaa - Automatic Schedule */}
          <div className="bg-emerald-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-bold header-font">المراجعة السداسية التلقائية</h3>
              </div>
              <p className="text-[11px] text-emerald-200 font-bold mb-6">يتم جدولة محفوظك القديم بالكامل ليختم كل 6 أيام غيباً بناءً على ترتيب المصحف:</p>
              
              <div className="space-y-3">
                {murajaaPortions.length > 0 ? murajaaPortions.map((item, idx) => (
                  <div key={idx} className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-emerald-300 font-bold mb-1 uppercase tracking-widest">ورد المراجعة لليوم</p>
                      <span className="text-sm font-black header-font">{item.label}</span>
                    </div>
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                )) : (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <p className="text-[10px] text-emerald-300 font-bold leading-relaxed">بمجرد أن يتجاوز محفوظك الـ 11 {plan === 'new_1' ? 'صفحة' : 'ربعاً'}، سيبدأ النظام بجدولة مراجعتك القديمة تلقائياً لضمان عدم النسيان.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-left duration-500">
          <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[40vh]">
             <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquareText className="w-24 h-24" /></div>
             <div className="relative z-10 flex flex-col items-center">
               <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                 <Clock className="w-10 h-10 text-emerald-600" />
               </div>
               <h2 className="text-3xl font-black text-slate-800 header-font mb-4">قريباً...</h2>
               <p className="text-sm text-slate-500 leading-relaxed font-bold header-font max-w-xs mx-auto">
                 نعمل حالياً على بناء محراب التدبر بمنهجية متكاملة تعينك على فهم كتاب الله وتطبيقه في حياتك اليومية.
               </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranPage;
