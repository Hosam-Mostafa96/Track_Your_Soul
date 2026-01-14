
import React from 'react';
import { 
  Star, Heart, Book, GraduationCap, Zap, 
  Target, Info, ArrowUpRight, ShieldAlert,
  Users, Sparkles, Clock, Sun, Flame
} from 'lucide-react';
// Fix: Import DEFAULT_WEIGHTS from constants.ts since specific point constants are missing
import { 
  DEFAULT_WEIGHTS
} from '../constants';

const WorshipGuide: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 header-font">دليل ميزان الأعمال</h2>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed header-font">
          نظام موزون يربط الأجر بالمشقة والزمن، مصمم ليشجعك على "حبس النفس" في العبادة الطويلة (كالقيام) بدلاً من العبادات الخاطفة.
        </p>
      </div>

      {/* Nawafil Section - The Core of Effort */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font">قاعدة الوقت (النوافل والقيام)</h3>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-emerald-900 header-font">القيام والضحى والوتر</span>
              {/* Fix: Access nawafilPerMin from DEFAULT_WEIGHTS */}
              <span className="text-lg font-black text-emerald-600 header-font">{DEFAULT_WEIGHTS.nawafilPerMin} ن/د</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-bold header-font">
              هذا هو "المحرك الأساسي" للميزان. كلما طال وقوفك بين يدي الله، زادت نقاطك بشكل مطرد. 
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300">
            <h4 className="text-[10px] font-black text-slate-500 mb-2 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" /> سر المضاعفة (القيام بالقرآن)
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-bold header-font">
              عندما تصلي القيام بالقرآن، فأنت تجمع بين <span className="text-emerald-600">نقاط الوقت</span> و <span className="text-emerald-600">نقاط الورد</span>. 
              <br/>مثال: صلاة 15 دقيقة بـ ربع واحد = 75 (وقت) + 15 (قرآن) = <span className="text-emerald-600 text-sm">90 نقطة</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Quran & Knowledge */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Book className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 header-font">القرآن الكريم (نقاط الورد)</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-600 header-font">حفظ ربع جديد</span>
              {/* Fix: Access quranHifz from DEFAULT_WEIGHTS */}
              <span className="font-black text-emerald-600 header-font">{DEFAULT_WEIGHTS.quranHifz} نقطة</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-600 header-font">مراجعة ربع</span>
              {/* Fix: Access quranRevision from DEFAULT_WEIGHTS */}
              <span className="font-black text-emerald-600 header-font">{DEFAULT_WEIGHTS.quranRevision} نقطة</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold header-font mt-2 border-t pt-2 italic">
              * تم تقليل هذه القيم لضمان أن القراءة السريعة "خارج الصلاة" لا تسبق الصلاة الخاشعة في الميزان.
            </p>
          </div>
        </div>
      </div>

      {/* Prayers Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font">الفرائض (الأساس المتين)</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-700 header-font">صلاة الجماعة</span>
            </div>
            {/* Fix: Access fardCongregation from DEFAULT_WEIGHTS */}
            <span className="text-lg font-black text-emerald-600 header-font">{DEFAULT_WEIGHTS.fardCongregation}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-slate-700 header-font">السنن الرواتب (لكل ركعتين)</span>
            </div>
            {/* Fix: Access sunnahRawatib from DEFAULT_WEIGHTS */}
            <span className="text-lg font-black text-emerald-600 header-font">+{DEFAULT_WEIGHTS.sunnahRawatib}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <h4 className="text-[10px] font-black text-amber-800 uppercase mb-2 header-font tracking-widest flex items-center gap-1">
            <Info className="w-3 h-3" /> ملاحظة عن الخشوع
          </h4>
          <p className="text-[11px] text-amber-700 leading-relaxed font-bold header-font">
            الخشوع ليس إضافة بسيطة، بل هو "مضاعف". الصلاة الخاشعة تزيد قيمتها بنسبة <span className="text-amber-900">20%</span>، مما يجعل 5 صلوات خاشعة أثقل بكثير في الميزان.
          </p>
        </div>
      </div>

      {/* Special Factors */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold header-font">عوامل المجاهدة والعبء</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <Heart className="w-5 h-5 text-rose-400 mb-2" />
              <h4 className="text-[10px] font-bold uppercase mb-1 header-font">المجاهدة</h4>
              <p className="text-[11px] leading-relaxed opacity-80 font-bold">تزيد إجمالي اليوم <span className="font-black text-white">10%</span>.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <ShieldAlert className="w-5 h-5 text-amber-400 mb-2" />
              <h4 className="text-[10px] font-bold uppercase mb-1 header-font">العبء</h4>
              <p className="text-[11px] leading-relaxed opacity-80 font-bold">تخصم من الإجمالي <span className="font-black text-white">20%</span>.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center p-4">
        <p className="text-[10px] text-slate-400 font-bold header-font">
          "وقل اعملوا فسيرى الله عملكم ورسوله والمؤمنون"
        </p>
      </div>
    </div>
  );
};

export default WorshipGuide;
