import React, { useState } from 'react';
import { 
  Star, Heart, Book, GraduationCap, Zap, 
  Target, Info, ArrowUpRight, ShieldAlert,
  Users, Sparkles, Clock, Sun, Flame,
  Award, Home, Coins, Key, CloudMoon, MapPin,
  ListChecks, Activity, ScrollText, Tags,
  BookOpen, CheckCircle2, Skull, Shield,
  TrendingUp, Bell, Compass, RotateCcw,
  Library, Calendar, Medal, BarChart3,
  Moon, Check, Share2, HelpCircle, Layers,
  ChevronDown, ChevronUp, Sliders, Smartphone
} from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../constants';

const WorshipGuide: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'quran' | 'athkar' | 'fortress' | 'evaluation' | 'system'>('all');

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans" dir="rtl">
      {/* 1. الترويسة الشاملة والترحيب بالمستخدم */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-700/40">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-amber-300">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block mb-1">
                المرجع الكامل للمستخدم الجديد
              </span>
              <h2 className="text-xl sm:text-2xl font-black header-font text-white">الدليل الشامل لتطبيق «أوراد»</h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed header-font max-w-2xl mt-2 font-medium">
            أهلاً بك في تطبيق «أوراد» — ميزانك الروحي الذكي وأداتك المتكاملة لمحاسبة النفس، وبناء العادات الإيمانية الراسخة، ومتابعة الأوراد اليومية بدقة وفق ميزان أجور ونقاط مستنبط من هدي الكتاب والسنة.
          </p>

          {/* تبويبات الفهرس السريع */}
          <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'كافة الأقسام' },
              { id: 'basics', label: 'الميزان والصلوات' },
              { id: 'quran', label: 'القرآن والتلاوة' },
              { id: 'athkar', label: 'الأذكار والسبحة' },
              { id: 'fortress', label: 'قلعة الإيمان والتزكية' },
              { id: 'evaluation', label: 'النبض والتقييم الأسبوعي' },
              { id: 'system', label: 'التنبيهات والمزامنة' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold header-font whitespace-nowrap transition-all ${
                  activeCategory === tab.id
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                    : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. فلسفة الرصيد الروحي ومعادلة النقاط */}
      {(activeCategory === 'all' || activeCategory === 'basics') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">فلسفة «الرصيد الروحي» ونظام النقاط</h3>
              <p className="text-[11px] text-slate-400 font-bold">كيف تُحسب نقاطك اليومية وماذا تعني؟</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            الهدف هو تقريب الجهد المبذول في العبادة إلى مقياس كمي يشحذ الهمّة للمنافسة في الخيرات (﴿وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾). يتم احتساب الرصيد وفق معادلة رياضية دقيقة:
          </p>

          <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs text-center border border-slate-800 leading-loose" dir="ltr">
            Final Score = [ (الطاعات + النوافل + الأذكار + القرآن + العلم) × معامل المجاهدة ] - خصم الذنوب غير المستغفر منها
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <span className="text-xs font-black text-emerald-800 block mb-1">🎯 الهدف اليومي (Target)</span>
              <p className="text-[11px] text-slate-600 font-bold leading-normal">
                الهدف الافتراضي هو <span className="font-mono text-emerald-700">13,500</span> نقطة (يمكنك تعديله في ملفك الشخصي بحسب استطاعتك وهمّتك).
              </p>
            </div>
            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
              <span className="text-xs font-black text-amber-800 block mb-1">⚔️ معامل المجاهدة</span>
              <p className="text-[11px] text-slate-600 font-bold leading-normal">
                عند المرض، السفر، أو التعب الشديد، يمكنك رفع معامل المجاهدة ليضاعف نقاطك تقديراً لمشقة الطاعة في العسر.
              </p>
            </div>
            <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
              <span className="text-xs font-black text-rose-800 block mb-1">⚠️ ميزان الذنوب والتوبة</span>
              <p className="text-[11px] text-slate-600 font-bold leading-normal">
                كل سيئة تُخصم من الرصيد. وتفعيل خيار «أشهد أني تبت» يمحو أثر الخصم امتثالاً لـ «التائب من الذنب كمن لا ذنب له».
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. الصلوات الخمس والسنن ومضاعف الخشوع */}
      {(activeCategory === 'all' || activeCategory === 'basics') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">الصلوات المكتوبة والسنن الرواتب</h3>
              <p className="text-[11px] text-slate-400 font-bold">صلاة الجماعة، السنن القبلية والبعدية، ومستويات الطمأنينة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black text-emerald-900">🕌 صلاة الفريضة في جماعة بالمسجد</span>
                <span className="text-base font-black text-emerald-600 font-mono">+{DEFAULT_WEIGHTS.fardCongregation} ن</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                تمنحك ٢٧ ضعفاً مقارنة بصلاة المنفرد (+100 نقطة) تحقيقاً لحديث النبي ﷺ: «صلاة الجماعة تفضل صلاة الفذ بسبع وعشرين درجة».
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black text-amber-900">✨ مضاعف درجات الخشوع</span>
                <span className="text-xs font-black text-amber-700 font-mono">حتى +20%</span>
              </div>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
                • نقر/عجلة: <span className="text-slate-400">0%</span> | • حضور معتدل: <span className="text-emerald-600">+5%</span> | • خاشع جداً: <span className="text-emerald-600">+10%</span> | • مرتبة الإحسان: <span className="text-emerald-600">+20%</span> زيادة فورية على صلاتك.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="text-xs font-black text-slate-800 block">🌿 السنن الرواتب والنوافل المحيطة:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold text-slate-600">
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">☀️ سنة الفجر: ركعتان قبلية</div>
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">☀️ سنة الظهر: 4 قبلية + 2 بعدية</div>
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">☀️ سنة المغرب: ركعتان بعدية</div>
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">☀️ سنة العشاء: ركعتان بعدية</div>
            </div>
            <p className="text-[10px] text-emerald-700 font-bold mt-1">
              💡 إتمام الـ 12 ركعة راتبة كاملة في اليوم يمنحك تلقائياً وسام «بيت في الجنة» بمؤثرات الاحتفال.
            </p>
          </div>
        </div>
      )}

      {/* 4. نبض طمأنينة الإيمان ومعامل الغفلة (-30% كل ساعة) */}
      {(activeCategory === 'all' || activeCategory === 'evaluation') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">نبض طمأنينة الإيمان والسكينة (Line Chart)</h3>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">جديد</span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold">منحنى بياني تفاعلي يمثل صعود وهبوط نشاط قلبك الإيماني ساعة بساعة</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-black text-emerald-900 block">📈 المحور الرأسي (عدد النقاط):</span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                  يصعد الخط البياني بقوة مع كل صلاة وفريضة وذكر وقرآن تسجله في توقيته الفعلي، وتظهر نقطة خضراء 🟢 تمثل ساعة الطاعة مع بيان النقاط المضافة.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-black text-rose-800 block">⏳ معامل الغفلة (-30% كل ساعة دون عبادة):</span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                  إذا انقضت ساعة كاملة دون تسجيل أي عمل صالح، يهبط المؤشر تلقائياً بنسبة <span className="text-rose-600 font-black">٣٠٪</span> من رصيد السكينة التراكمي وتظهر نقطة حمراء 🔴 لتنبيهك باستدراك الورد.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-0.5">البداية</span>
              <span className="text-emerald-700 font-black">5:00 ص (الفجر)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-0.5">الرصد</span>
              <span className="text-emerald-700 font-black">تلقائي 24 ساعة</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-0.5">المعامل</span>
              <span className="text-rose-600 font-black">خصم 30% / ساعة</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-0.5">التحكم</span>
              <span className="text-emerald-700 font-black">تبديل (حتى اللحظة / كامل)</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. ورد القرآن الكريم والمصحف والتدبر وخطط الختم */}
      {(activeCategory === 'all' || activeCategory === 'quran') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Book className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">منظومة القرآن الكريم المتكاملة</h3>
              <p className="text-[11px] text-slate-400 font-bold">تلاوة، تدبر، مراجعة، تكرار، والمصحف التفاعلي</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <h4 className="text-xs font-black text-emerald-900 mb-1">📖 المصحف التفاعلي</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed font-bold">
                قراءة القرآن صفحة بصفحة داخل التطبيق مع حفظ تلقائي لآخر صفحة وقفت عليها (+15 نقطة لكل صفحة).
              </p>
            </div>

            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100">
              <h4 className="text-xs font-black text-teal-900 mb-1">💡 سجل وقفات التدبر</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed font-bold">
                توثيق الفوائد الإيمانية والخواطر مع تحديد نية العمل بالآية (+150 نقطة لكل تدبر موثق).
              </p>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <h4 className="text-xs font-black text-indigo-900 mb-1">📅 مخطط الورد والختمات</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed font-bold">
                اختر خطة ختمتك (شهرية، شهرين، أسبوعية) مع أرشيف كامل لختماتك السابقة وتواريخ إتمامها.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>• ورد الحفظ الجديد: <span className="text-emerald-700 font-mono">+{DEFAULT_WEIGHTS.quranHifz}ن/ربع</span></span>
            <span>• ورد المراجعة والتثبيت: <span className="text-emerald-700 font-mono">+{DEFAULT_WEIGHTS.quranRevision}ن/ربع</span></span>
            <span>• تكرار الصفحة الواحدة: <span className="text-emerald-700 font-mono">+{DEFAULT_WEIGHTS.quranPageRepetition}ن/مرة</span></span>
          </div>
        </div>
      )}

      {/* 6. الأذكار المقروءة، حصن المسلم، والسبحة الذكية */}
      {(activeCategory === 'all' || activeCategory === 'athkar') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ScrollText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">الأذكار والتحصين والسبحة الإلكترونية</h3>
              <p className="text-[11px] text-slate-400 font-bold">أذكار اليوم والليلة، حصن المسلم، عدادات السبحة المخصصة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" /> أذكار الصباح والمساء والنوم والسفر
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                شاشة تفاعلية تتيح لك قراءة كل ذكر مع عداد تنازلي خاص به وفضله الشرعي. إتمام القائمة كاملة يمنحك نقاطاً مجمعة (+{DEFAULT_WEIGHTS.athkarChecklist} نقطة) بالإضافة لنقاط كل ذكر مفرد.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" /> حصن المسلم والتدبر في الأذكار
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                قسم كامل لأدعية حصن المسلم، مع إمكانية تدوين «تدبر الأذكار» لتسجيل أثر الذكر على يقينك وطمأنينتك (+15 نقطة لكل تدبر).
              </p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-emerald-600 font-black">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-950">السبحة الإلكترونية متعددة الأوراد</h4>
                <p className="text-[10px] text-slate-600 font-bold">استغفار، صلاة على النبي، حوقلة، تهليل، الباقيات الصالحات + إضافة أي ذكر مخصص</p>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
              +{DEFAULT_WEIGHTS.athkarCounter * 10} نقطة لكل 10 تسبيحات
            </span>
          </div>
        </div>
      )}

      {/* 7. قلعة الإيمان (The Fortress of Faith) */}
      {(activeCategory === 'all' || activeCategory === 'fortress') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">قلعة الإيمان (Fortress of Faith)</h3>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">خاصية فريدة</span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold">بناء قلعتك المعمارية التفاعلية حجرًا بحجر مع كل عبادة تؤديها اليوم</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            تجسيد بصري حي ومبهر لحصنك الإيماني؛ كل ركن في القلعة مرتبط بعبادة حقيقية تؤديها خلال اليوم، وتبدأ القلعة باهتة ومغلقة ثم تضيء وتزدهر وتكتمل مع إنجازاتك:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-right">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-black text-slate-800 block mb-0.5">🏰 أبراج الصلوات الخمس</span>
              <p className="text-[9px] text-slate-500 font-bold">ترتفع القباب والأنوار مع صلاة الفجر والظهر والعصر والمغرب والعشاء.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-black text-slate-800 block mb-0.5">🛡️ درع وأسوار الأذكار</span>
              <p className="text-[9px] text-slate-500 font-bold">الأسوار الحصينة التي تصد السهام تُبنى بأذكار الصباح والمساء.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-black text-slate-800 block mb-0.5">🌙 منارة قيام الليل</span>
              <p className="text-[9px] text-slate-500 font-bold">برج شاهق يشع نوراً أبيض في الثلث الأخير من الليل مع الوتر والتهجد.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-black text-slate-800 block mb-0.5">🌺 بساتين التزكية</span>
              <p className="text-[9px] text-slate-500 font-bold">حدائق خضراء تزهر داخل ساحة القلعة مع أعمال القلوب وتطهيرها.</p>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-[11px] font-bold text-indigo-900 flex items-center justify-between">
            <span>✨ إمكانية مشاركة بطاقة القلعة كصورة إيمانية ملهمة عبر واتساب ومواقع التواصل!</span>
            <Share2 className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
      )}

      {/* 8. تحدي الأربعين يوماً (Forty Day Challenge) */}
      {(activeCategory === 'all' || activeCategory === 'fortress') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">تحدي الأربعين يوماً لبناء العادات وتثبيتها</h3>
              <p className="text-[11px] text-slate-400 font-bold">تطبيق لمنهج «من صلى لله أربعين يوماً في جماعة» وبناء الاستقامة</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            خاصية متخصصة تتيح لك اختيار عادة إيمانية والالتزام بها 40 يوماً متتالية لترسيخها في حياتك كخلق وسجية دائمة:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-black text-slate-800 block mb-1">1. قوالب عادات جاهزة</span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                إدراك تكبيرة الإحرام، فجر المسجد، قيام الليل، حزب القرآن اليومي، صيام الإثنين والخميس، أو أي عادة مخصصة.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-black text-slate-800 block mb-1">2. شبكة الأيام التفاعلية (1-40)</span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                تأكيد يومك بنقرة زر مع عداد تتابع الأيام ونسبة الإنجاز والتحذير من كسر السلسلة.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-black text-slate-800 block mb-1">3. وسام الأربعينية والشهادة</span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                عند إتمام الـ 40 يوماً بنجاح، تفتح وسام «أربعينية الصالحين» مع بطاقة تهنئة للمشاركة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 9. التقييم الأسبوعي، الأهداف المخصصة، والمنافسة الجماعية */}
      {(activeCategory === 'all' || activeCategory === 'evaluation') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">منظومة التقييم الأسبوعي ولوحة الصدارة</h3>
              <p className="text-[11px] text-slate-400 font-bold">تتبع إنجاز الأسبوع من الأحد إلى السبت والمنافسة في الخيرات</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" /> تقييم الأسبوع الحالي وبطاقة المشاركة
              </span>
              <p className="text-[10px] text-slate-600 leading-relaxed font-bold">
                انقر على شريط التقييم الأسبوعي أعلى الشاشة لتفتح نافذة تحليل الأسبوع: نسبة تحقيق الهدف التراكمي، تفصيل الصلوات، قراءة القرآن، والأهداف المخصصة مع إمكانية تصدير بطاقة أسبوعية مصممة بأناقة لمشاركتها مع أهلك وأصحابك.
              </p>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-amber-600" /> لوحة المتنافسين ونشاط العابدين العام
              </span>
              <p className="text-[10px] text-slate-600 leading-relaxed font-bold">
                تنافس مع إخوانك في الله على المراتب الأولى عالمياً مع الحفاظ الصارم على الخصوصية؛ حيث يتم حجب أي نشاط متعلق بالذنوب أو محاسبة النفس تماماً وفق أدب الستر الإسلامي.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 10. أدوات الإسناد: المؤقت الذكي، المكتبة، والمواقيت المحلية */}
      {(activeCategory === 'all' || activeCategory === 'system') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">أدوات العبادة المساندة</h3>
              <p className="text-[11px] text-slate-400 font-bold">مؤقت البومودورو، المكتبة العلمية، وتحديد مواقيت الصلاة عبر GPS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black text-slate-800">مؤقت العبادة وبومودورو</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                عدّاد مفتوح أو فترات تركيز (15د، 25د، 45د، أو مخصص) مع حفظ الجلسات وإضافتها تلقائياً لطلب العلم أو النوافل.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Library className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-black text-slate-800">المكتبة ومتابعة الكتب</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                إضافة كتبك ومتابعة عدد الصفحات المقروءة ونسبة إتمام كل كتاب (+20 نقطة لكل صفحة قراءة عامة).
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-black text-slate-800">مواقيت الصلاة الدقيقة</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                حساب فلكي دقيق بالدقيقة والثانية مع دعم الموقع الجغرافي الفعلي (GPS) أو اختيار مدينتك والتحويل بين هيئة المساحة المصرية وأم القرى.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 11. التنبيهات المجدولة والتثبيت كـ PWA والنسخ الاحتياطي */}
      {(activeCategory === 'all' || activeCategory === 'system') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">نظام التنبيهات المجدولة والحفظ السحابي</h3>
              <p className="text-[11px] text-slate-400 font-bold">تذكيرك في أوقات الطاعة، والعمل أوفلاين مع إمكانية التثبيت كتطبيق</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" /> التنبيهات اليومية المجدولة
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                تنبيهات مدمجة ومخصصة لـ (أذكار الصباح، أذكار المساء، قيام الليل، صلاة الضحى، ورد القرآن، قراءة سورة الكهف يوم الجمعة، وصيام الإثنين والخميس) مع شريط تنبيه مباشر داخل التطبيق وإشعارات المتصفح.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" /> التثبيت (PWA) والنسخ الاحتياطي
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                يمكنك تثبيت تطبيق «أوراد» على شاشة هاتفك الرئيسية (Install PWA) ليعمل كتطبيق أصلي سريع بدون إنترنت، مع إمكانية تصدير نسخة احتياطية واستيرادها أو مزامنتها سحابياً بأمان عبر شيت جوجل.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 12. دليل الأوسمة اليومية وأوسمة السلاسل المتتالية */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg">دليل الأوسمة والكرامات والشرائط</h3>
        </div>
        <p className="text-[11px] text-slate-400 font-bold header-font">تُمنح هذه الأوسمة تكريماً لثباتك اليومي وتتابع سلاسل الالتزام:</p>
        
        {/* الأوسمة اليومية الفورية */}
        <span className="text-xs font-black text-emerald-900 block mt-2">🌟 الأوسمة اليومية المباشرة (تُفتح داخل بطاقات اليوم):</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
            <div className="p-2 bg-white rounded-xl h-fit shadow-xs"><Sun className="w-5 h-5 text-amber-500" /></div>
            <div>
              <h4 className="text-xs font-black text-slate-800 mb-0.5">بشرى الرؤية</h4>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">يُستحق عند تسجيل أداء صلاة الفجر في وقتها.</p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
            <div className="p-2 bg-white rounded-xl h-fit shadow-xs"><Home className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <h4 className="text-xs font-black text-slate-800 mb-0.5">بيت في الجنة</h4>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">يُستحق عند إتمام ١٢ ركعة راتبة كاملة.</p>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100 flex gap-3">
            <div className="p-2 bg-white rounded-xl h-fit shadow-xs"><Flame className="w-5 h-5 text-rose-500" /></div>
            <div>
              <h4 className="text-xs font-black text-slate-800 mb-0.5">بعيد عن النار</h4>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">يُستحق عند تفعيل خيار الصيام لهذا اليوم.</p>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
            <div className="p-2 bg-white rounded-xl h-fit shadow-xs"><Coins className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h4 className="text-xs font-black text-slate-800 mb-0.5">مفتاح الرزق</h4>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">بلوغ 500 استغفار في عداد السبحة اليومي.</p>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3">
            <div className="p-2 bg-white rounded-xl h-fit shadow-xs"><Key className="w-5 h-5 text-indigo-600" /></div>
            <div>
              <h4 className="text-xs font-black text-slate-800 mb-0.5">مفتاح النجاح</h4>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">بلوغ 500 حوقلة في عداد السبحة اليومي.</p>
            </div>
          </div>

          <div className="p-3.5 bg-pink-50 rounded-2xl border border-pink-100 flex gap-3">
            <div className="p-2 bg-white rounded-xl h-fit shadow-xs"><Heart className="w-5 h-5 text-pink-500" /></div>
            <div>
              <h4 className="text-xs font-black text-slate-800 mb-0.5">مفتاح القرب من النبي</h4>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">بلوغ 500 صلاة على النبي ﷺ في السبحة.</p>
            </div>
          </div>
        </div>

        {/* أوسمة السلاسل المتتالية التاريخية */}
        <span className="text-xs font-black text-amber-900 block mt-4">🏆 أوسمة الاستقامة وتتابع الأيام (Streak Badges):</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-[10px]">٧</span>
            <div>
              <div className="font-black text-slate-800">البداية المباركة</div>
              <div className="text-[9px] text-slate-400">٧ أيام متصلة من الورد</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-black text-[10px]">١٤</span>
            <div>
              <div className="font-black text-slate-800">المجاهدة والمصابرة</div>
              <div className="text-[9px] text-slate-400">١٤ يوماً متصلاً</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-[10px]">٣٠</span>
            <div>
              <div className="font-black text-slate-800">تاج الثلاثين يوماً</div>
              <div className="text-[9px] text-slate-400">شهراً كاملاً من الاستقامة</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-[10px]">٤٠</span>
            <div>
              <div className="font-black text-slate-800">أربعينية الصالحين</div>
              <div className="text-[9px] text-slate-400">٤٠ يوماً من الثبات</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-black text-[10px]">٦٠</span>
            <div>
              <div className="font-black text-slate-800">وسام عابد الدهر</div>
              <div className="text-[9px] text-slate-400">شهران متصلان من الطاعة</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center font-black text-[10px]">١٠٠</span>
            <div>
              <div className="font-black text-slate-800">وسام المئة الذهبي</div>
              <div className="text-[9px] text-slate-400">١٠٠ يوم متصل من النور</div>
            </div>
          </div>
        </div>
      </div>

      {/* 13. وصية ختامية للمستخدم */}
      <div className="text-center p-8 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Sparkles className="w-full h-full" />
        </div>
        <p className="text-sm font-bold header-font leading-relaxed relative z-10 max-w-xl mx-auto text-emerald-100">
          «إنما الأعمال بالنيات وإنما لكل امرئ ما نوى.. واعلم أن هذا الميزان الرقمي والنقاط والأوسمة ليست غاية في ذاتها، بل هي محفزات معنوية تعينك على مجاهدة نفسك وصد الشيطان، والقبول أولاً وآخراً هو من فضل الله الواسع ورحمته سبحانه.»
        </p>
      </div>
    </div>
  );
};

export default WorshipGuide;
