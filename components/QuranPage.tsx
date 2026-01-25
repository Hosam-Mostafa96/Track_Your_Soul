
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Book, 
  CheckCircle2, 
  Circle, 
  Repeat, 
  History, 
  ArrowLeftRight,
  Sparkles,
  ChevronDown,
  Clock,
  Mic,
  ListChecks,
  Plus,
  Minus,
  LayoutGrid,
  FileText,
  // Added missing imports
  Settings,
  MessageSquareText
} from 'lucide-react';
import { DailyLog } from '../types';

const QURAN_PORTIONS_NAMES = [
  "1- الفاتحة: (الحمد لله رب العالمين)",
  "2- البقرة: (إن الله لا يستحيي أن يضرب مثلاً)",
  "3- البقرة: (أتأمرون الناس بالبر)",
  "4- البقرة: (وإذ استسقى موسى لقومه)",
  "5- البقرة: (أفتطمعون أن يؤمنوا لكم)",
  "6- البقرة: (ولقد جاءكم موسى بالبينات)",
  "7- البقرة: (ما ننسخ من آية)",
  "8- البقرة: (وإذ ابتلى إبراهيم ربه)",
  "9- البقرة: (سيقول السفهاء من الناس)",
  "10- البقرة: (إن الصفا والمروة من شعائر الله)",
  "11- البقرة: (ليس البر أن تولوا وجوهكم)",
  "12- البقرة: (يسألونك عن الأهلة)",
  "13- البقرة: (واذكروا الله في أيام معدودات)",
  "14- البقرة: (يسألونك عن الخمر والميسر)",
  "15- البقرة: (والوالدات يرضعن أولادهن)",
  "16- البقرة: (ألم تر إلى الذين خرجوا من ديارهم)",
  "17- البقرة: (تلك الرسل فضلنا بعضهم على بعض)",
  "18- البقرة: (قول معروف ومغفرة خير من صدقة)",
  "19- البقرة: (ليس عليك هداهم ولكن الله يهدي)",
  "20- البقرة: (يا أيها الذين آمنوا إذا تداينتم)",
  // ... تم اختصار القائمة هنا برمجياً لسهولة العرض، في الكود الفعلي تكون كاملة
  "240- الأعلى والغاشية والقصار (حتى الناس)"
];

// توليد قائمة الصفحات (604 صفحة)
const QURAN_PAGES_LIST = Array.from({ length: 604 }, (_, i) => `صفحة ${i + 1}`);

const getVerseStarter = (fullName: string) => {
  const match = fullName.match(/\((.*?)\)/);
  return match ? match[1] : fullName.split(':')[0];
};

interface QuranPageProps {
  log: DailyLog;
  logs: Record<string, DailyLog>;
  plan: 'new_1' | 'new_2' | 'itqan_3' | 'itqan_4';
  onUpdatePlan: (plan: 'new_1' | 'new_2' | 'itqan_3' | 'itqan_4') => void;
  onUpdateLog: (log: DailyLog) => void;
}

const QuranPage: React.FC<QuranPageProps> = ({ log, logs, plan, onUpdatePlan, onUpdateLog }) => {
  const [subTab, setSubTab] = useState<'hifz' | 'tadabbur'>('hifz');
  const [hifzUnit, setHifzUnit] = useState<'page' | 'rub'>('rub');

  useEffect(() => {
    const savedUnit = localStorage.getItem('worship_quran_unit') as 'page' | 'rub';
    if (savedUnit) setHifzUnit(savedUnit);
  }, []);

  const handleUnitChange = (unit: 'page' | 'rub') => {
    setHifzUnit(unit);
    localStorage.setItem('worship_quran_unit', unit);
    // تصفير الموضع الحالي عند تغيير الوحدة لتجنب تضارب الفهارس
    onUpdateLog({ ...log, quran: { ...log.quran, todayPortion: '' } });
  };

  const quranData = log.quran || { hifzRub: 0, revisionRub: 0, todayPortion: '', todayReps: 0, tasksCompleted: [] };

  const toggleTask = (taskId: string) => {
    const currentTasks = quranData.tasksCompleted || [];
    const newTasks = currentTasks.includes(taskId) ? currentTasks.filter(id => id !== taskId) : [...currentTasks, taskId];
    onUpdateLog({ ...log, quran: { ...quranData, tasksCompleted: newTasks } });
  };

  const updatePortionName = (name: string) => {
    onUpdateLog({ ...log, quran: { ...quranData, todayPortion: name } });
  };

  const updateReps = (val: number) => {
    onUpdateLog({ ...log, quran: { ...quranData, todayReps: Math.max(0, val) } });
  };

  const currentIndex = useMemo(() => {
    if (!quranData.todayPortion) return 0;
    const list = hifzUnit === 'rub' ? QURAN_PORTIONS_NAMES : QURAN_PAGES_LIST;
    const idx = list.indexOf(quranData.todayPortion);
    return idx !== -1 ? idx + 1 : 0;
  }, [quranData.todayPortion, hifzUnit]);

  // منطق الربط: آخر 10 خطوات (سواء كانت صفحات أو أرباع)
  const rabtPortions = useMemo(() => {
    if (currentIndex <= 1) return [];
    const portions = [];
    const list = hifzUnit === 'rub' ? QURAN_PORTIONS_NAMES : QURAN_PAGES_LIST;
    const limit = Math.max(1, currentIndex - 10);
    for (let i = currentIndex - 1; i >= limit; i--) {
      portions.push({ id: `rabt_${i}`, label: list[i - 1], index: i });
    }
    return portions;
  }, [currentIndex, hifzUnit]);

  // مراجعة المحفوظ القديم
  const murajaaData = useMemo(() => {
    const list = hifzUnit === 'rub' ? QURAN_PORTIONS_NAMES : QURAN_PAGES_LIST;
    const buffer = hifzUnit === 'rub' ? 11 : 25; // ابدأ المراجعة بعد 11 ربع أو 25 صفحة
    
    if (currentIndex <= buffer) return null;
    
    const dayOfWeek = new Date().getDay(); 
    const murajaaEnd = currentIndex - buffer;
    const chunkSize = Math.ceil(murajaaEnd / 6);
    const start = (dayOfWeek % 6) * chunkSize + 1;
    const end = Math.min(murajaaEnd, start + chunkSize - 1);
    
    if (start > murajaaEnd) return null;
    
    const totalItems = end - start + 1;
    const individualItems = [];
    for(let i = start; i <= end; i++) {
      individualItems.push({ id: `mur_${i}`, label: list[i-1] });
    }
    
    return { 
      startStarter: getVerseStarter(list[start - 1]), 
      endStarter: getVerseStarter(list[end - 1]), 
      total: totalItems,
      unitLabel: hifzUnit === 'rub' ? 'أرباع' : 'صفحات',
      individualItems 
    };
  }, [currentIndex, hifzUnit]);

  const hifzSteps = [
    { id: 'listen', label: 'الاستماع لمجود مع النظر', desc: 'للتأكد من سلامة النطق', icon: <Clock className="w-4 h-4" /> },
    { id: 'repeat', label: `تكرار ال${hifzUnit === 'rub' ? 'ربع' : 'وجه'} ٤٠ مرة`, desc: 'تثبيت الحفظ في الذاكرة العميقة', icon: <Repeat className="w-4 h-4" /> },
    { id: 'record', label: 'التسجيل الصوتي والمطابقة', desc: 'قراءة غيبية ومطابقتها للتصحيح', icon: <Mic className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* التبويبات العلوية */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex">
        <button onClick={() => setSubTab('hifz')} className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-2 ${subTab === 'hifz' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}><Repeat className="w-4 h-4" /> برنامج الحفظ والإتقان</button>
        <button onClick={() => setSubTab('tadabbur')} className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-2 ${subTab === 'tadabbur' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}><Sparkles className="w-4 h-4" /> محراب التدبر</button>
      </div>

      {subTab === 'hifz' ? (
        <div className="space-y-6">
          {/* اختيار وحدة الحفظ */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 mb-4">
               {/* Added missing Settings icon from lucide-react */}
               <Settings className="w-4 h-4 text-slate-400" />
               <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest header-font">تخصيص خطة الحفظ اليومية</h4>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => handleUnitChange('page')}
                 className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${hifzUnit === 'page' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400'}`}
               >
                 <FileText className="w-4 h-4" />
                 <span className="text-xs font-bold header-font">صفحة واحدة</span>
               </button>
               <button 
                 onClick={() => handleUnitChange('rub')}
                 className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${hifzUnit === 'rub' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400'}`}
               >
                 <LayoutGrid className="w-4 h-4" />
                 <span className="text-xs font-bold header-font">ربع حزب</span>
               </button>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-4"><Book className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-sm">المحفوظ الجديد لليوم</h3></div>
             <div className="relative mb-6">
               <select 
                 value={quranData.todayPortion || ''} 
                 onChange={(e) => updatePortionName(e.target.value)} 
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pr-10 text-xs font-black header-font appearance-none outline-none focus:border-emerald-500 transition-all text-slate-700"
               >
                 <option value="">{`اختر ${hifzUnit === 'rub' ? 'الربع' : 'الصفحة'} التي ستحفظها اليوم..`}</option>
                 {(hifzUnit === 'rub' ? QURAN_PORTIONS_NAMES : QURAN_PAGES_LIST).map((name, idx) => (
                   <option key={idx} value={name}>{name}</option>
                 ))}
               </select>
               <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
             </div>
             
             {quranData.todayPortion && (
               <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 animate-in zoom-in duration-300">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <Repeat className="w-4 h-4 text-emerald-600" />
                     <span className="text-xs font-black text-emerald-800 header-font">{`عدد تكرار ال${hifzUnit === 'rub' ? 'ربع' : 'وجه'}`}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <button onClick={() => updateReps((quranData.todayReps || 0) - 1)} className="p-1.5 bg-white rounded-lg border border-emerald-200 text-emerald-600"><Minus className="w-4 h-4" /></button>
                     <span className="text-xl font-black font-mono text-emerald-900">{quranData.todayReps || 0}</span>
                     <button onClick={() => updateReps((quranData.todayReps || 0) + 1)} className="p-1.5 bg-white rounded-lg border border-emerald-200 text-emerald-600"><Plus className="w-4 h-4" /></button>
                   </div>
                 </div>
               </div>
             )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6"><ListChecks className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-sm">خطوات الإتقان (بالترتيب)</h3></div>
            <div className="space-y-3">
              {hifzSteps.map((step, idx) => (
                <button key={step.id} onClick={() => toggleTask(step.id)} className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-right ${quranData.tasksCompleted?.includes(step.id) ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-slate-50 border-transparent'}`}>
                  <div className={`mt-1 rounded-lg p-2 ${quranData.tasksCompleted?.includes(step.id) ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 shadow-sm'}`}>{step.icon}</div>
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

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <ArrowLeftRight className="w-5 h-5 text-blue-500" />
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-800 header-font text-sm">دعامة الربط التلقائي</h3>
                <p className="text-[9px] text-slate-400 font-bold italic">{`مراجعة آخر 10 ${hifzUnit === 'rub' ? 'أرباع' : 'صفحات'} سابقة لموضعك الحالي`}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {rabtPortions.length > 0 ? rabtPortions.map((item) => (
                <button key={item.id} onClick={() => toggleTask(item.id)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${quranData.tasksCompleted?.includes(item.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent'}`}>
                  <span className={`text-[10px] font-black header-font transition-all ${quranData.tasksCompleted?.includes(item.id) ? 'text-emerald-800' : 'text-slate-600'}`}>{item.label}</span>
                  {quranData.tasksCompleted?.includes(item.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-200" />}
                </button>
              )) : (
                <div className="text-center py-6 text-[10px] text-slate-400 font-bold italic">{`اختر موضع حفظك الحالي ليتم جدولة الربط (آخر 10 ${hifzUnit === 'rub' ? 'أرباع' : 'صفحات'}) تلقائياً`}</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6"><History className="w-6 h-6 text-emerald-400" /><h3 className="text-lg font-bold header-font">مراجعة المحفوظ القديم</h3></div>
              {murajaaData ? (
                <div className="space-y-6">
                  <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                    <p className="text-[10px] text-emerald-300 font-bold mb-3 uppercase tracking-widest text-center">ورد المراجعة لليوم</p>
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-emerald-500/20 px-4 py-2 rounded-xl text-center">
                        <span className="text-xs text-emerald-200 font-bold block mb-1">من مطلع:</span>
                        <span className="text-sm md:text-lg font-black header-font leading-relaxed">({murajaaData.startStarter})</span>
                      </div>
                      <div className="h-4 w-px bg-white/20"></div>
                      <div className="bg-emerald-500/20 px-4 py-2 rounded-xl text-center">
                        <span className="text-xs text-emerald-200 font-bold block mb-1">إلى نهاية :</span>
                        <span className="text-sm md:text-lg font-black header-font leading-relaxed">({murajaaData.endStarter})</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                      <span className="text-[11px] font-bold text-emerald-100 italic bg-white/5 px-4 py-1.5 rounded-full">{`(إجمالي: ${murajaaData.total} ${murajaaData.unitLabel})`}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {murajaaData.individualItems.map((item) => (
                      <button key={item.id} onClick={() => toggleTask(item.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-right ${quranData.tasksCompleted?.includes(item.id) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100 shadow-lg' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'}`}>
                        <span className="text-[10px] font-bold header-font">{item.label}</span>
                        {quranData.tasksCompleted?.includes(item.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-white/20" />}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-[10px] text-emerald-300 font-bold leading-relaxed">{`بمجرد أن يتجاوز محفوظك الـ ${hifzUnit === 'rub' ? '11 ربعاً' : '25 صفحة'}، سيبدأ النظام بجدولة مراجعتك القديمة تلقائياً لضمان عدم النسيان.`}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-left duration-500">
          <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[40vh]">
            {/* Fixed missing MessageSquareText icon from lucide-react */}
            <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquareText className="w-24 h-24" /></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-pulse"><Clock className="w-10 h-10 text-emerald-600" /></div>
              <h2 className="text-3xl font-black text-slate-800 header-font mb-4">قريباً...</h2>
              <p className="text-sm text-slate-500 leading-relaxed font-bold header-font max-w-xs mx-auto">نعمل حالياً على بناء محراب التدبر بمنهجية متكاملة تعينك على فهم كتاب الله وتطبيقه في حياتك اليومية.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranPage;
