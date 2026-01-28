
import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Target, 
  ChevronDown, 
  ChevronUp,
  FlaskConical,
  Zap,
  Droplets,
  Sunrise,
  HandMetal,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { DailyLog } from '../types';

interface HeartTazkiyaProps {
  log: DailyLog;
  onUpdate: (log: DailyLog) => void;
}

interface HeartTask {
  id: string;
  label: string;
}

interface HeartConfig {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  tasks: HeartTask[];
}

const DEEDS_CONFIG: HeartConfig[] = [
  { 
    id: 'sincerity', 
    label: 'الإخلاص', 
    desc: 'تصفية العمل من رؤية الخلق والتعلق بالثناء.', 
    icon: <Sunrise className="w-5 h-5" />, 
    color: 'amber',
    tasks: [
      { id: 'sinc_1', label: 'قمت بخبيئة عمل صالح لا يراه إلا الله اليوم.' },
      { id: 'sinc_2', label: 'جددت نيتي قبل البدء في عباداتي الأساسية.' },
      { id: 'sinc_3', label: 'لم أتأثر بمدح أو ذم الناس لعملي الصالح.' }
    ]
  },
  { 
    id: 'reliance', 
    label: 'التوكل', 
    desc: 'اعتماد القلب على الله مع الأخذ بالأسباب.', 
    icon: <HandMetal className="w-5 h-5" />, 
    color: 'blue',
    tasks: [
      { id: 'rel_1', label: 'فوضت أمراً مقلقاً لله بقلب مطمئن اليوم.' },
      { id: 'rel_2', label: 'بذلت مجهوداً في عملي مع اليقين أن النتيجة بيد الله.' },
      { id: 'rel_3', label: 'لم أشعر بالسخط عند فوات أمر كنت أرجوه.' }
    ]
  },
  { 
    id: 'patience', 
    label: 'الصبر والرضا', 
    desc: 'حبس النفس عن السخط على أقدار الله.', 
    icon: <Droplets className="w-5 h-5" />, 
    color: 'indigo',
    tasks: [
      { id: 'pat_1', label: 'حبست لساني عن الشكوى لغير الله عند ضيق.' },
      { id: 'pat_2', label: 'صبرت على مشقة طاعة (كقيام أو صيام) دون تضجر.' },
      { id: 'pat_3', label: 'قلت "الحمد لله" بصدق عند سماع خبر غير سار.' }
    ]
  },
  { 
    id: 'gratitude', 
    label: 'الشكر', 
    desc: 'ظهور أثر نعمة الله على الجوارح.', 
    icon: <Zap className="w-5 h-5" />, 
    color: 'emerald',
    tasks: [
      { id: 'gra_1', label: 'عددت نعم الله عليّ اليوم وشكرته عليها سراً.' },
      { id: 'gra_2', label: 'استخدمت نعمة (مال، صحة، وقت) في طاعة الله.' },
      { id: 'gra_3', label: 'أثنيت على الله بلساني أمام أهلي أو أصحابي.' }
    ]
  },
];

const DISEASES_CONFIG: HeartConfig[] = [
  { 
    id: 'pride', 
    label: 'الكبر والعُجب', 
    desc: 'رؤية النفس فوق الآخرين.', 
    icon: <ShieldAlert className="w-5 h-5" />, 
    color: 'rose',
    tasks: [
      { id: 'pri_1', label: 'بادرت بالسلام والتواضع مع من أراه دوني منزلة.' },
      { id: 'pri_2', label: 'تقبلت نصيحة أو انتقاداً من غيري دون دفاع عن النفس.' },
      { id: 'pri_3', label: 'تذكرت عيوب نفسي عند رؤية عيوب الآخرين.' }
    ]
  },
  { 
    id: 'envy', 
    label: 'الحسد والغل', 
    desc: 'تمني زوال النعمة عن الغير.', 
    icon: <FlaskConical className="w-5 h-5" />, 
    color: 'purple',
    tasks: [
      { id: 'env_1', label: 'دعوت بظهر الغيب لمن رزقه الله نعمة أتمناها.' },
      { id: 'env_2', label: 'نظفت قلبي من حقد تجاه شخص أساء إليّ.' },
      { id: 'env_3', label: 'فرحت لنجاح غيري وكأنني أنا المنجز.' }
    ]
  },
  { 
    id: 'showingOff', 
    label: 'الرياء والسمعة', 
    desc: 'طلب الجاه بالعبادة.', 
    icon: <Sparkles className="w-5 h-5" />, 
    color: 'yellow',
    tasks: [
      { id: 'show_1', label: 'أخفيت طاعة قمت بها كنت أود إظهارها.' },
      { id: 'show_2', label: 'تركت العمل من أجل الناس (مخافة الرياء) ثم عدت للنية.' },
      { id: 'show_3', label: 'استويت في النشاط في صلاة السر وصلاة العلانية.' }
    ]
  },
];

const HeartTazkiya: React.FC<HeartTazkiyaProps> = ({ log, onUpdate }) => {
  const [activeSection, setActiveSection] = useState<'deeds' | 'diseases' | 'methodology'>('deeds');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleTask = (type: 'deeds' | 'diseases', categoryId: string, taskId: string) => {
    const newState = { ...log.heartStates };
    if (!newState[type]) newState[type] = {};
    
    const currentTasks = newState[type][categoryId] || [];
    const updatedTasks = currentTasks.includes(taskId)
      ? currentTasks.filter(id => id !== taskId)
      : [...currentTasks, taskId];
    
    newState[type][categoryId] = updatedTasks;
    onUpdate({ ...log, heartStates: newState });
  };

  const renderCard = (config: HeartConfig, type: 'deeds' | 'diseases') => {
    const completedCount = log.heartStates?.[type]?.[config.id]?.length || 0;
    const isExpanded = expandedId === config.id;

    return (
      <div key={config.id} className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${isExpanded ? `border-${config.color}-300` : 'border-slate-100 hover:border-slate-200'}`}>
        <button 
          onClick={() => setExpandedId(isExpanded ? null : config.id)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-${config.color}-50 text-${config.color}-600 rounded-2xl`}>
              {config.icon}
            </div>
            <div className="text-right">
              <h4 className="font-bold text-slate-800 header-font text-sm">{config.label}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${config.color}-500 transition-all duration-500`} 
                    style={{ width: `${(completedCount / config.tasks.length) * 100}%` }}
                  />
                </div>
                <span className={`text-[9px] font-black text-${config.color}-600 header-font`}>
                  {completedCount}/{config.tasks.length}
                </span>
              </div>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
        </button>

        {isExpanded && (
          <div className="mt-6 space-y-3 animate-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] text-slate-500 font-bold header-font mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {config.desc}
            </p>
            {config.tasks.map(task => {
              const isDone = log.heartStates?.[type]?.[config.id]?.includes(task.id);
              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(type, config.id, task.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl border transition-all text-right group ${isDone ? `bg-${config.color}-50 border-${config.color}-200` : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className={`w-4 h-4 text-${config.color}-600`} />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-200 group-hover:text-slate-300" />
                    )}
                  </div>
                  <span className={`text-[11px] font-bold header-font leading-relaxed ${isDone ? `text-${config.color}-900` : 'text-slate-600'}`}>
                    {task.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 text-right" dir="rtl">
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex">
        <button 
          onClick={() => setActiveSection('deeds')} 
          className={`flex-1 py-3 rounded-xl text-[10px] font-black header-font transition-all flex items-center justify-center gap-2 ${activeSection === 'deeds' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}
        >
          <Heart className="w-4 h-4" /> ثمار القلوب
        </button>
        <button 
          onClick={() => setActiveSection('diseases')} 
          className={`flex-1 py-3 rounded-xl text-[10px] font-black header-font transition-all flex items-center justify-center gap-2 ${activeSection === 'diseases' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400'}`}
        >
          <ShieldAlert className="w-4 h-4" /> تطهير النفس
        </button>
        <button 
          onClick={() => setActiveSection('methodology')} 
          className={`flex-1 py-3 rounded-xl text-[10px] font-black header-font transition-all flex items-center justify-center gap-2 ${activeSection === 'methodology' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400'}`}
        >
          <FlaskConical className="w-4 h-4" /> المنهجية
        </button>
      </div>

      <div className="space-y-4">
        {activeSection === 'deeds' && DEEDS_CONFIG.map(config => renderCard(config, 'deeds'))}
        {activeSection === 'diseases' && DISEASES_CONFIG.map(config => renderCard(config, 'diseases'))}
        
        {activeSection === 'methodology' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
              <Target className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-black header-font">منهجية "القلب السليم"</h2>
              <p className="text-xs text-slate-300 font-bold header-font leading-relaxed mt-2">لا يمكن قياس الإيمان بالأرقام، بل بالمواقف التي ننتصر فيها على هوانا.</p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'التخلية قبل التحلية', desc: 'ابدأ بمجاهدة "تطهير النفس" أولاً لتقليل الحجب، ثم ستجد ثمار أعمال القلوب تظهر تلقائياً.', icon: <FlaskConical className="w-6 h-6 text-purple-500" /> },
                { title: 'عبادة المواقف', desc: 'كل موقف يومي هو "محراب". إذا تعرضت لإساءة فصبرت، فأنت في صلاة قلبية ممتدة.', icon: <Sunrise className="w-6 h-6 text-amber-500" /> },
                { title: 'المحاسبة الصادقة', desc: 'هذا السجل ليس للمفاخرة، بل لتعرف مواضع الخلل في نفسك بوضوح وتعمل على علاجها ببطء وثبات.', icon: <ShieldCheck className="w-6 h-6 text-emerald-500" /> },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex gap-4 transition-all hover:bg-slate-50">
                  <div className="p-3 bg-white rounded-2xl shadow-sm h-fit">{item.icon}</div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 header-font mb-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold header-font">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-lg text-center">
        <p className="text-[10px] font-bold header-font leading-relaxed italic">
          "ميزانك هو ما استقر في قلبك وصدقه عملك في مواقف الحياة اليومية."
        </p>
      </div>
    </div>
  );
};

export default HeartTazkiya;
