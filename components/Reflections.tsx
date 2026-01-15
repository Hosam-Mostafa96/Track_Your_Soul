
import React, { useState } from 'react';
import { NotebookPen, Plus, Trash2, ShieldAlert, Sparkles, Quote, Share2, Clock, Check } from 'lucide-react';
import { DailyLog, ReflectionNote } from '../types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ReflectionsProps {
  log: DailyLog;
  onUpdate: (log: DailyLog) => void;
}

const Reflections: React.FC<ReflectionsProps> = ({ log, onUpdate }) => {
  const [inputText, setInputText] = useState('');
  
  // استخدام reflections من اللوج، مع دعم الملاحظات القديمة (notes) إذا وجدت
  const reflections = log.reflections || [];

  const handleAddNote = () => {
    if (!inputText.trim()) return;
    
    const newNote: ReflectionNote = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputText.trim(),
      timestamp: Date.now()
    };
    
    // الملاحظات الجديدة دائماً في البداية (Top)
    onUpdate({
      ...log,
      reflections: [newNote, ...reflections]
    });
    setInputText('');
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      onUpdate({
        ...log,
        reflections: reflections.filter(n => n.id !== id)
      });
    }
  };

  const handleShareNote = async (text: string) => {
    const shareData = {
      title: 'خاطرة من تطبيق الميزان',
      text: `"${text}"\n\n- من يوميات ميزان العبادات`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        alert('تم نسخ الخاطرة للحافظة لمشاركتها');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* رأس الصفحة */}
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
            <p className="text-[10px] text-slate-400 font-bold uppercase header-font">دوّن خواطرك، نجواك، وتجليات يومك</p>
          </div>
        </div>

        {/* حقل الإضافة الذكي */}
        <div className="relative group z-10">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="كيف كان قلبك في صلاة الفجر؟ هل شعرت بلحظة إحسان اليوم؟"
            className="w-full min-h-[120px] p-5 bg-amber-50/40 rounded-2xl border border-amber-100/50 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 outline-none text-slate-700 leading-relaxed quran-font text-xl resize-none shadow-inner transition-all"
          />
          
          <div className="flex justify-end mt-3">
            <button 
              onClick={handleAddNote}
              disabled={!inputText.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-xs header-font shadow-lg ${
                !inputText.trim() 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 active:scale-95'
              }`}
            >
              <Plus className="w-4 h-4" /> إضافة خاطرة
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الخواطر */}
      <div className="space-y-4">
        {reflections.length > 0 ? (
          reflections.map((note) => (
            <div 
              key={note.id} 
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-in slide-in-from-top-4 duration-300 group hover:border-emerald-200 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold header-font">
                    {format(new Date(note.timestamp), 'hh:mm a', { locale: ar })}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleShareNote(note.text)}
                    className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="مشاركة الخاطرة"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-slate-700 leading-relaxed quran-font text-lg whitespace-pre-wrap">
                {note.text}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <Quote className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-bold header-font">لا توجد خواطر مسجلة لهذا اليوم</p>
            <p className="text-[10px] text-slate-300 header-font mt-1">"اكتب لتفرغ قلبك وتوثق رحلتك مع الله"</p>
          </div>
        )}
      </div>

      {/* تنبيه الخصوصية */}
      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
        <div className="flex gap-3">
          <div className="p-2 bg-white rounded-lg self-start">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-800 mb-1 header-font">خصوصيتك مطلقة</h4>
            <p className="text-xs text-emerald-700 leading-relaxed font-bold header-font">
              هذه الخواطر تُحفظ فقط على ذاكرة متصفحك. لا ترسل لخوادمنا ولا يراها أحد سواك، إلا إذا اخترت مشاركتها بنفسك.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <p className="text-[10px] text-slate-500 font-bold header-font">
          "تذكر أن تدوين الذنب خطوة أولى للندم، وتدوين النعمة خطوة أولى للشكر."
        </p>
      </div>
    </div>
  );
};

export default Reflections;
