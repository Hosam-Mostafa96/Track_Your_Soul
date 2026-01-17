
import React from 'react';
import { 
  Star, Heart, Book, GraduationCap, Zap, 
  Target, Clock, Sun, Flame,
  Award, Home, Coins, Key, CloudMoon, 
  Activity, BookOpen, Users, MapPin, Sparkles,
  ShieldCheck, UserCheck, HeartHandshake, Smile,
  HandMetal, TreePine
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
          هذا الدليل يوضح لك كيف يحسب النظام نقاطك الروحية بناءً على الأوزان الافتراضية لكل عمل صالح.
        </p>
      </div>

      {/* الفرائض والصلوات */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <SectionHeader icon={Star} title="الفرائض والصلوات" color="emerald" />
        <div className="space-y-2">
          <PointRow label="صلاة الفريضة (في جماعة)" points={DEFAULT_WEIGHTS.fardCongregation} />
          <PointRow label="صلاة الفريضة (منفرداً)" points={DEFAULT_WEIGHTS.fardSolo} />
          <PointRow label="السنة الراتبة (للواحدة)" points={DEFAULT_WEIGHTS.sunnahRawatib} />
          <PointRow label="ترديد الأذان" points={50} />
          <PointRow label="التبكير للمسجد والصف الأول" points={100} />
          <PointRow label="ختم الصلاة (الأذكار)" points={100} />
        </div>
      </div>

      {/* القرآن الكريم */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <SectionHeader icon={BookOpen} title="ورد القرآن الكريم" color="amber" />
        <div className="space-y-2">
          <PointRow label="حفظ جديد (لكل ربع)" points={DEFAULT_WEIGHTS.quranHifz} />
          <PointRow label="مراجعة ورد (لكل ربع)" points={DEFAULT_WEIGHTS.quranRevision} />
        </div>
      </div>

      {/* الأذكار */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <SectionHeader icon={Activity} title="الأذكار اليومية" color="rose" />
        <div className="space-y-2">
          <PointRow label="أذكار الصباح / المساء (كاملة)" points={DEFAULT_WEIGHTS.athkarChecklist} />
          <PointRow label="أذكار النوم / السفر (كاملة)" points={DEFAULT_WEIGHTS.athkarChecklist} />
          <PointRow label="الذكر المفتوح (لكل ١٠ عدات)" points={DEFAULT_WEIGHTS.athkarCounter} />
        </div>
      </div>

      {/* النوافل والعلم */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <SectionHeader icon={Clock} title="النوافل وطلب العلم" color="blue" />
        <div className="space-y-2">
          <PointRow label="قيام الليل / الضحى / الوتر" points={DEFAULT_WEIGHTS.nawafilPerMin} unit="نقطة/دقيقة" />
          <PointRow label="طلب العلم الشرعي" points={DEFAULT_WEIGHTS.knowledgeShari} unit="نقطة/دقيقة" />
          <PointRow label="القراءة العامة والاطلاع" points={DEFAULT_WEIGHTS.knowledgeGeneral} unit="نقطة/دقيقة" />
          <PointRow label="صيام يوم كامل" points={DEFAULT_WEIGHTS.fastingDay} />
        </div>
      </div>

      {/* العبادات الاجتماعية والسنن المخصصة */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <SectionHeader icon={HeartHandshake} title="المعاملات والسنن المخصصة" color="purple" />
        <div className="space-y-4">
          <p className="text-[10px] text-slate-400 font-bold header-font mb-2">يمكنك إضافة هذه الأعمال الصالحة في قسم "سنن مخصصة":</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "بر الوالدين", icon: <UserCheck className="w-4 h-4" /> },
              { label: "صلة الرحم", icon: <Users className="w-4 h-4" /> },
              { label: "صدقة سر / علن", icon: <Coins className="w-4 h-4" /> },
              { label: "إماطة الأذى", icon: <TreePine className="w-4 h-4" /> },
              { label: "تبسم في وجه أخيك", icon: <Smile className="w-4 h-4" /> },
              { label: "قضاء حاجة مسلم", icon: <HandMetal className="w-4 h-4" /> }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-purple-600">{item.icon}</span>
                <span className="text-[10px] font-bold text-purple-900 header-font">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-bold bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
            * السنن المخصصة تمنحك نقاطاً إضافية تحددها أنت (الافتراضي ٥٠ نقطة للعمل الواحد).
          </p>
        </div>
      </div>

      {/* معاملات الجهد والخشوع */}
      <div className="bg-emerald-900 text-white rounded-[2rem] p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bold header-font">مضاعفات الإخلاص والجهد</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
            <h4 className="text-xs font-black mb-1 header-font">١. معامل الخشوع (حتى +٢٠٪)</h4>
            <p className="text-[10px] opacity-70 leading-relaxed font-bold">كلما ارتفع خشوعك في الصلاة، زادت النقاط المحتسبة لتلك الفريضة.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
            <h4 className="text-xs font-black mb-1 header-font">٢. معامل المجاهدة (+٥٪ أو +١٠٪)</h4>
            <p className="text-[10px] opacity-70 leading-relaxed font-bold">عندما تؤدي وردك رغم التعب أو الانشغال، يضرب إجمالي نقاطك اليومية في هذا المعامل.</p>
          </div>
          <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/30">
            <h4 className="text-xs font-black mb-1 header-font text-rose-300">٣. العبء الروحي (-٢٠٪)</h4>
            <p className="text-[10px] opacity-70 leading-relaxed font-bold">في حالات الفتور الشديد أو التقصير المتعمد، يقلل النظام النقاط لتنبيهك بضرورة العودة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorshipGuide;
