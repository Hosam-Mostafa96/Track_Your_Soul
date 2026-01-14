
import React, { useState, useEffect } from 'react';
import { NotebookPen, Save, Trash2, ShieldAlert, Sparkles, Quote } from 'lucide-react';
import { DailyLog } from '../types';

interface ReflectionsProps {
  log: DailyLog;
  onUpdate: (log: DailyLog) => void;
}

const Reflections: React.FC<ReflectionsProps> = ({ log, onUpdate }) => {
  const [text, setText] = useState(log.notes || '');
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    setText(log.notes || '');
  }, [log.date]);

  const handleSave = () => {
    onUpdate({ ...log, notes: text });
    setIsSaved(true);
  };

  const handleClear = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع ملاحظات اليوم؟')) {
      setText('');
      onUpdate({ ...log, notes: '' });
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left duration-300">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Quote className="w-20 h-20 text-emerald-900" />
        </div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <NotebookPen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 header-font">يوميات المحاسبة</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase header-font">اكتب خواطرك، ذنوبك، ونجواك</p>
          </div>
        </div>

        <div className="relative group">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setIsSaved(false);
            }}
            placeholder="كيف كان قلبك اليوم؟ هل هناك ذنب تبت منه؟ لحظة تجلي شعرت بها؟"
            className="w-full min-h-[300px] p-6 bg-amber-50/30 rounded-2xl border border-amber-100/50 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-700 leading-relaxed quran-font text-xl resize-none shadow-inner"
          />
          
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold text-xs header-font"
            >
              <Trash2 className="w-4 h-4" /> مسح
            </button>
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold text-xs header-font shadow-lg ${isSaved ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 active:scale-95'}`}
            >
              <Save className="w-4 h-4" /> {isSaved ? 'محفوظ' : 'حفظ الخواطر'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
        <div className="flex gap-3">
          <div className="p-2 bg-white rounded-lg self-start">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-800 mb-1 header-font">خصوصيتك أولاً</h4>
            <p className="text-xs text-emerald-700 leading-relaxed font-bold header-font">
              هذه اليوميات محفوظة فقط على جهازك ولا نطلع عليها أبداً. هي مرآة لقلبك، كن صادقاً مع نفسك ومع الله.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <p className="text-[11px] text-slate-500 font-bold header-font">
          "تذكر أن تدوين الذنب خطوة أولى للندم، وتدوين النعمة خطوة أولى للشكر."
        </p>
      </div>
    </div>
  );
};

export default Reflections;
