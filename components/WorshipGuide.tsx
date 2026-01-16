
import React from 'react';
import { 
  Star, Heart, Book, GraduationCap, Zap, 
  Target, Info, ArrowUpRight, ShieldAlert,
  Users, Sparkles, Clock, Sun, Flame,
  Award, Home, Coins, Key, CloudMoon, MapPin
} from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../constants';

const WorshipGuide: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* هيدر الدليل */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 header-font">دليل ميزان الأعمال</h2>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed header-font">
          نظام ميزان هو أسلوب لمحاسبة النفس يربط الأجر بالمشقة والزمن، مصمم ليشجعك على "حبس النفس" في طاعة الله والارتقاء في معارج القبول.
        </p>
      </div>

      {/* قسم أوسمة الأبرار */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">أوسمة الأبرار وشروطها</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              title: 'بشرى الرؤية',
              condition: 'صلاة الفجر في وقتها (جماعة أو منفرداً).',
              icon: <Sun className="w-5 h-5 text-amber-500" />,
              color: 'bg-amber-50 border-amber-100'
            },
            {
              title: 'بيت في الجنة',
              condition: 'أداء الـ ١٢ ركعة الراتبة (٢ قبل الفجر، ٤ قبل الظهر، ٢ بعده، ٢ بعد المغرب، ٢ بعد العشاء).',
              icon: <Home className="w-5 h-5 text-emerald-600" />,
              color: 'bg-emerald-50 border-emerald-100'
            },
            {
              title: 'بعيد عن النار',
              condition: 'تسجيل صيام يوم نافلة أو قضاء.',
              icon: <Flame className="w-5 h-5 text-orange-500" />,
              color: 'bg-orange-50 border-orange-100'
            },
            {
              title: 'مفتاح الرزق',
              condition: 'البدء بورد الاستغفار في عداد الأذكار.',
              icon: <Coins className="w-5 h-5 text-blue-500" />,
              color: 'bg-blue-50 border-blue-100'
            },
            {
              title: 'مفتاح النجاح',
              condition: 'ذكر "لا حول ولا قوة إلا بالله" في قسم الأذكار.',
              icon: <Key className="w-5 h-5 text-indigo-500" />,
              color: 'bg-indigo-50 border-indigo-100'
            },
            {
              title: 'مفتاح القرب',
              condition: 'الصلاة على النبي ﷺ في قسم الأذكار.',
              icon: <Heart className="w-5 h-5 text-rose-500" />,
              color: 'bg-rose-50 border-rose-100'
            },
            {
              title: 'محبوب الرحمن',
              condition: 'أداء صلاة الوتر (تسجيل دقيقة واحدة على الأقل).',
              icon: <CloudMoon className="w-5 h-5 text-slate-600" />,
              color: 'bg-slate-50 border-slate-200'
            }
          ].map((badge, idx) => (
            <div key={idx} className={`flex gap-4 p-4 rounded-2xl border ${badge.color} transition-all`}>
              <div className="bg-white p-3 rounded-xl shadow-sm self-start">
                {badge.icon}
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm header-font mb-1">{badge.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-bold header-font">{badge.condition}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* قاعدة الوقت */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">قاعدة الوقت (النوافل)</h3>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-emerald-900 header-font">قيام الليل، الضحى، الوتر</span>
              <span className="text-lg font-black text-emerald-600 header-font">{DEFAULT_WEIGHTS.nawafilPerMin} نقطة/دقيقة</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-bold header-font">
              هذا هو "المحرك الأساسي" للميزان. كلما طال وقوفك بين يدي الله، زاد وزن عملك بشكل مطرد. 
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300">
            <h4 className="text-[10px] font-black text-slate-500 mb-2 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" /> سر المضاعفة
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-bold header-font">
              عندما تصلي القيام بالقرآن، فأنت تجمع بين نقاط الوقت ونقاط الورد. 
              <br/>مثال: صلاة 20 دقيقة بـ ربعين = 100 (وقت) + 30 (قرآن) = <span className="text-emerald-600 text-sm">130 نقطة</span>.
            </p>
          </div>
        </div>
      </div>

      {/* الفرائض والخشوع */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">الفرائض (الأساس المتين)</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-700 header-font">صلاة الجماعة</span>
            </div>
            <span className="text-lg font-black text-emerald-600 header-font">{DEFAULT_WEIGHTS.fardCongregation}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-slate-700 header-font">السنن الرواتب (للركعة)</span>
            </div>
            <span className="text-lg font-black text-emerald-600 header-font">+{DEFAULT_WEIGHTS.sunnahRawatib}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <h4 className="text-[10px] font-black text-amber-800 uppercase mb-2 header-font tracking-widest flex items-center gap-1">
            <Info className="w-3 h-3" /> مضاعف الخشوع
          </h4>
          <p className="text-[11px] text-amber-700 leading-relaxed font-bold header-font">
            الخشوع ليس إضافة بسيطة، بل هو "مضاعف" لإجمالي نقاط الصلاة. الصلاة الخاشعة جداً تزيد قيمتها بنسبة تصل لـ <span className="text-amber-900">20%</span>.
          </p>
        </div>
      </div>

      {/* المجاهدة والعبء */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold header-font">عوامل البيئة النفسية</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <Heart className="w-5 h-5 text-rose-400 mb-2" />
              <h4 className="text-[10px] font-bold uppercase mb-1 header-font">المجاهدة</h4>
              <p className="text-[11px] leading-relaxed opacity-80 font-bold">تزيد إجمالي اليوم بنسبة <span className="font-black text-white">10%</span> تقديراً لصعوبة الظرف.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <ShieldAlert className="w-5 h-5 text-amber-400 mb-2" />
              <h4 className="text-[10px] font-bold uppercase mb-1 header-font">العبء الروحي</h4>
              <p className="text-[11px] leading-relaxed opacity-80 font-bold">تخصم من الإجمالي <span className="font-black text-white">20%</span> للتنبيه بوجود تقصير يحتاج علاج.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center p-4">
        <p className="text-[10px] text-slate-400 font-bold header-font">
          "تذكر أن الميزان وسيلة للتحفيز، والقبول عند الله وحده سبحانه."
        </p>
      </div>
    </div>
  );
};

export default WorshipGuide;
