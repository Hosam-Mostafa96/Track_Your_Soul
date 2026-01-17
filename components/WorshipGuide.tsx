
import React from 'react';
import { 
  Star, Heart, Book, GraduationCap, Zap, 
  Target, Info, Clock, Sun, Flame,
  Award, Home, Coins, Key, CloudMoon, ListChecks,
  Activity, BookOpen, Users, MapPin, Sparkles
} from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../constants';

const WorshipGuide: React.FC = () => {
  const SectionHeader = ({ icon: Icon, title, color }: any) => (
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 rounded-xl bg-${color}-100`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <h3 className="font-bold text-slate-800 header-font text-lg">{title}</h3>
    </div>
  );

  const PointRow = ({ label, points, unit = "نقطة" }: any) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
      <span className="text-xs font-bold text-slate-600 header-font">{label}</span>
      <span className="text-sm font-black text-emerald-600 font-mono">{points} <span className="text-[9px] opacity-60">{unit}</span></span>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-xl"><Target className="w-6 h-6 text-emerald-600" /></div>
          <h2 className="text-xl font-bold text-slate-800 header-font">دليل ميزان العبادات الشامل</h2>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed header-font">
          هذا الدليل يوضح لك كيف يحسب النظام نقاطك الروحية بناءً على الأوزان الافتراضية. تذكر أنك تستطيع تخصيص هذه الأوزان من صفحة "الملف الشخصي".
        </p>
      </div>

      {/* الفرائض والصلوات */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <SectionHeader icon={Star} title="الفرائض والسنن" color="emerald" />
        <div className="space-y-2">
          <PointRow label="صلاة الفريضة (في جماعة)" points={DEFAULT_WEIGHTS.fardCongregation} />
          <PointRow label="صلاة الفريضة (منفرداً)" points={DEFAULT_WEIGHTS.fardSolo} />
          <PointRow label="السنة الراتبة (للركعتين)" points={DEFAULT_WEIGHTS.sunnahRawatib} />
          <PointRow label="ترديد الأذان ودعاء الأذان" points={50} />
          <PointRow label="التبكير للمسجد والصف الأول" points={100} />
          <PointRow label="إسباغ الوضوء" points={50} />
          <PointRow label="أذكار ما بعد الصلاة" points={100} />
        </div>
      </div>

      {/* القرآن الكريم */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <SectionHeader icon={BookOpen} title="ورد القرآن الكريم" color="amber" />
        <div className="space-y-2">
          <PointRow label="حفظ جديد (لكل ربع)" points={DEFAULT_WEIGHTS.quranHifz} />
          <PointRow label="مراجعة ورد (لكل ربع)" points={DEFAULT_WEIGHTS.quranRevision} />
          <p className="text-[10px] text-slate-400 font-bold p-2 bg-slate-50 rounded-lg mt-2 header-font">
            * الربع هو (حزب ÷ 8). الالتزام بالورد اليومي هو مفتاح التثبيت.
          </p>
        </div>
      </div>

      {/* الأذكار والتحصين */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <SectionHeader icon={Activity} title="الأذكار والتحصين" color="rose" />
        <div className="space-y-2">
          <PointRow label="أذكار الصباح / المساء (كاملة)" points={DEFAULT_WEIGHTS.athkarChecklist} />
          <PointRow label="أذكار النوم / السفر (كاملة)" points={DEFAULT_WEIGHTS.athkarChecklist} />
          <PointRow label="الذكر (لكل ١٠ عدات)" points={DEFAULT_WEIGHTS.athkarCounter} />
          <p className="text-[10px] text-slate-400 font-bold p-2 bg-slate-50 rounded-lg mt-2 header-font">
            * يشمل العداد: الصلاة على النبي ﷺ، الاستغفار، الحوقلة، والتسبيح.
          </p>
        </div>
      </div>

      {/* العلم والنوافل */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <SectionHeader icon={Clock} title="الوقت والنوافل" color="blue" />
        <div className="space-y-2">
          <PointRow label="قيام الليل / الضحى" points={DEFAULT_WEIGHTS.nawafilPerMin} unit="نقطة/دقيقة" />
          <PointRow label="طلب العلم الشرعي" points={DEFAULT_WEIGHTS.knowledgeShari} unit="نقطة/دقيقة" />
          <PointRow label="القراءة العامة والاطلاع" points={DEFAULT_WEIGHTS.knowledgeGeneral} unit="نقطة/دقيقة" />
          <PointRow label="صيام يوم كامل" points={DEFAULT_WEIGHTS.fastingDay} />
        </div>
      </div>

      {/* مضاعفات الجهد */}
      <div className="bg-emerald-900 text-white rounded-[2rem] p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bold header-font">أسرار مضاعفة الأجر</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
            <h4 className="text-xs font-black mb-1 header-font">١. مضاعف الخشوع</h4>
            <p className="text-[10px] opacity-70 leading-relaxed font-bold">كلما زاد حضور قلبك في الصلاة، زادت قيمة الفريضة بنسبة تصل لـ ٢٠٪.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
            <h4 className="text-xs font-black mb-1 header-font">٢. معامل المجاهدة</h4>
            <p className="text-[10px] opacity-70 leading-relaxed font-bold">أداء العبادة في وقت المشقة أو الانشغال يزيد إجمالي نقاطك اليومية بنسبة ١٠٪.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorshipGuide;
