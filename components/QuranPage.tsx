
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

// قائمة بأسماء الأرباع الـ 240 (عناوين البدايات المشهورة)
const QURAN_PORTIONS_NAMES = [
  "1- الفاتحة (الحمد لله)", "2- البقرة (إن الله لا يستحيي)", "3- البقرة (أفتطمعون)", "4- البقرة (ولقد جاءكم)", "5- البقرة (ما ننسخ)", "6- البقرة (وإذ ابتلى)", "7- البقرة (سيقول السفهاء)", "8- البقرة (تلك الرسل)",
  "9- الجزء 2 (تلك الرسل - يتبع)", "10- البقرة (ألم تر إلى الذين)", "11- البقرة (واذكروا الله)", "12- البقرة (ليس البر)", "13- البقرة (يسألونك عن الأهلة)", "14- البقرة (وإذ استسقى)", "15- البقرة (ألم تر إلى الملأ)", "16- البقرة (يا أيها الذين آمنوا)",
  "17- الجزء 3 (تلك الرسل - يتبع)", "18- آل عمران (إن الله اصطفى)", "19- آل عمران (فلما أحس)", "20- آل عمران (يا أيها الذين آمنوا)", "21- آل عمران (قل يا أهل الكتاب)", "22- آل عمران (ليسوا سواء)", "23- آل عمران (كنتم خير أمة)", "24- آل عمران (إن في خلق)",
  "25- الجزء 4 (لن تنالوا البر)", "26- آل عمران (فبما رحمة)", "27- آل عمران (إنما ذلكم الشيطان)", "28- آل عمران (لقد سمع الله)", "29- النساء (يا أيها الناس اتقوا)", "30- النساء (وآتوا النساء)", "31- النساء (وإن خفتم)", "32- النساء (واعبدوا الله)",
  "33- الجزء 5 (والمحصنات)", "34- النساء (فما لكم في المنافقين)", "35- النساء (فليقاتل في سبيل الله)", "36- النساء (ومن يهاجر في سبيل الله)", "37- النساء (لا يحب الله الجهر)", "38- النساء (إنا أوحينا إليك)", "39- النساء (يستفتونك)", "40- النساء (يا أهل الكتاب لا تغلوا)",
  "41- الجزء 6 (لا يحب الله)", "42- المائدة (يا أيها الذين آمنوا)", "43- المائدة (اليوم أحل لكم)", "44- المائدة (وقالت اليهود والنصارى)", "45- المائدة (يا أيها الرسول بلغ)", "46- المائدة (لتبلون في أموالكم)", "47- المائدة (لعن الذين كفروا)", "48- المائدة (وإذا سمعوا ما أنزل)",
  "49- الجزء 7 (وإذا سمعوا)", "50- المائدة (ما على الرسول إلا البلاغ)", "51- المائدة (يا أيها الذين آمنوا لا تسألوا)", "52- المائدة (يوم يجمع الله الرسل)", "53- الأنعام (الحمد لله الذي خلق)", "54- الأنعام (ولقد استهزئ برسل)", "55- الأنعام (قل إني أخاف)", "56- الأنعام (قل تعالوا أتل)",
  "57- الجزء 8 (ولو أننا نزلنا)", "58- الأنعام (وإذ قال إبراهيم لأبيه آزر)", "59- الأنعام (وممن حولكم)", "60- الأنعام (سيقول الذين أشركوا)", "61- الأعراف (المص)", "62- الأعراف (وكم من قرية)", "63- الأعراف (وإلى عاد أخاهم)", "64- الأعراف (قال الملأ الذين استكبروا)",
  "65- الجزء 9 (قال الملأ)", "66- الأعراف (وإلى مدين أخاهم)", "67- الأعراف (ولقد أخذنا آل فرعون)", "68- الأعراف (وقال الملأ من قوم فرعون)", "69- الأعراف (واكتب لنا في هذه الدنيا)", "70- الأعراف (واتل عليهم نبأ الذي آتيناه)", "71- الأعراف (وإذ نتقنا الجبل)", "72- الأنفال (يسألونك عن الأنفال)",
  "73- الجزء 10 (واعلموا)", "74- الأنفال (وإذ يمكر بك)", "75- الأنفال (يا أيها النبي حسبك)", "76- التوبة (براءة من الله)", "77- التوبة (أجعلتم سقاية الحاج)", "78- التوبة (ما كان لأهل المدينة)", "79- التوبة (إنما الصدقات)", "80- التوبة (يعتذرون إليكم)",
  "81- الجزء 11 (يعتذرون)", "82- التوبة (إن الله اشترى)", "83- التوبة (ما كان للمؤمنين)", "84- يونس (الر تلك آيات الكتاب)", "85- يونس (وجاوزنا ببني إسرائيل)", "86- يونس (ثم بعثنا من بعدهم)", "87- يونس (دعواهم فيها سبحانك)", "88- يونس (وإذا تتلى عليهم)",
  "89- الجزء 12 (وما من دابة)", "90- هود (وإلى عاد أخاهم هودا)", "91- هود (وإلى ثمود أخاهم صالحا)", "92- هود (وإلى مدين أخاهم شعيبا)", "93- هود (ولقد أرسلنا موسى)", "94- هود (وأقم الصلاة طرفي النهار)", "95- يوسف (الر تلك آيات الكتاب)", "96- يوسف (إذ قال يوسف لأبيه)",
  "97- الجزء 13 (وما أبرئ نفسي)", "98- يوسف (وقال الذي اشتراه)", "99- يوسف (ودخل معه السجن)", "100- يوسف (فلما رجعوا إلى أبيهم)", "101- الرعد (المر تلك آيات الكتاب)", "102- الرعد (ولو أن قرآنا سيرت)", "103- إبراهيم (الر كتاب أنزلناه)", "104- إبراهيم (وإذ قال إبراهيم رب اجعل)",
  "105- الجزء 14 (الر تلك آيات)", "106- الحجر (ربما يود الذين كفروا)", "107- الحجر (ونبئهم عن ضيف إبراهيم)", "108- النحل (أتى أمر الله فلا تستعجلوه)", "109- النحل (وإن لكم في الأنعام)", "110- النحل (وضرب الله مثلا)", "111- النحل (إن الله يأمر بالعدل)", "112- النحل (وقيل للذين اتقوا ماذا أنزل)",
  "113- الجزء 15 (سبحان الذي)", "114- الإسراء (وإذ قلنا لك)", "115- الإسراء (ولقد كرمنا بني آدم)", "116- الإسراء (وقل جاء الحق)", "117- الكهف (الحمد لله الذي أنزل)", "118- الكهف (واضرب لهم مثلا)", "119- الكهف (وإذ قال موسى لفتاه)", "120- الكهف (قال ألم أقل لك)",
  "121- الجزء 16 (قال ألم)", "122- مريم (كهيعص)", "123- مريم (واذكر في الكتاب)", "124- مريم (فلما اعتزلهم)", "125- طه (طه ما أنزلنا)", "126- طه (إذ رأت نارا)", "127- طه (فاجتباه ربه)", "128- طه (وكذلك أنزلناه قرآنا)",
  "129- الجزء 17 (اقترب للناس حسابهم)", "130- الأنبياء (إن الذين سبقت لهم)", "131- الأنبياء (واذكر أخا عاد)", "132- الأنبياء (اقترب للناس حسابهم - يتبع)", "133- الحج (يا أيها الناس اتقوا ربكم)", "134- الحج (إن الله يدخل الذين آمنوا)", "135- الحج (ألم تر أن الله يسجد له)", "136- الحج (ذلك ومن يعظم)",
  "137- الجزء 18 (قد أفلح المؤمنون)", "138- المؤمنون (ثم أرسلنا رسلنا)", "139- المؤمنون (وقل رب أعوذ بك)", "140- النور (سورة أنزلناها وفرضناها)", "141- النور (الله نور السماوات)", "142- النور (ألم تر أن الله يسبح له)", "143- النور (وعد الله الذين آمنوا)", "144- الفرقان (تبارك الذي نزل الفرقان)",
  "145- الجزء 19 (وقال الذين لا يرجون)", "146- الفرقان (وقال الذين لا يرجون لقاءنا - يتبع)", "147- الفرقان (وعباد الرحمن الذين يمشون)", "148- الشعراء (طسم تلك آيات الكتاب)", "149- الشعراء (وإذ نادى ربك موسى)", "150- الشعراء (كذبت قوم نوح)", "151- النمل (طس تلك آيات القرآن)", "152- النمل (وإذ قال موسى لأهله)",
  "153- الجزء 20 (أمن خلق)", "154- النمل (فلما جاءهم سليمان)", "155- القصص (طسم تلك آيات الكتاب)", "156- القصص (نتلو عليك من نبأ)", "157- القصص (فلما قضى موسى الأجل)", "158- القصص (إنما أوتيته على علم)", "159- العنكبوت (الم أحسب الناس)", "160- العنكبوت (ولا تجادلوا أهل الكتاب)",
  "161- الجزء 21 (اتل ما أوحي إليك)", "162- الروم (الم غلبت الروم)", "163- الروم (ومن آياته أن خلقكم)", "164- الروم (فاصبر إن وعد الله حق)", "165- لقمان (الم تلك آيات الكتاب)", "166- السجدة (الم تنزيل الكتاب)", "167- الأحزاب (يا أيها النبي اتق الله)", "168- الأحزاب (يا أيها الذين آمنوا اذكروا)",
  "169- الجزء 22 (ومن يقنت)", "170- الأحزاب (يا أيها النبي إنا أرسلناك)", "171- الأحزاب (لقد كان لكم في رسول الله)", "172- سبأ (الحمد لله الذي له ما في)", "173- سبأ (ويرى الذين أوتوا العلم)", "174- فاطر (الحمد لله فاطر السماوات)", "175- يس (يس والقرآن الحكيم)", "176- يس (وجاء من أقصى المدينة)",
  "177- الجزء 23 (وما أنزلنا)", "178- يس (ألم تروا أن الله سخر)", "179- الصافات (والصافات صفا)", "180- الصافات (فليعرضوا عن ذكر الله)", "181- ص (ص والقرآن ذي الذكر)", "182- ص (واذكر عبدنا إبراهيم)", "183- الزمر (تنزيل الكتاب من الله)", "184- الزمر (قل يا عبادي الذين أسرفوا)",
  "185- الجزء 24 (فمن أظلم)", "186- الزمر (وسيق الذين اتقوا ربهم)", "187- غافر (حم تنزيل الكتاب)", "188- غافر (الذين يحملون العرش)", "189- غافر (وقال رجل مؤمن من آل فرعون)", "190- غافر (فلم يك ينفعهم إيمانهم)", "191- فصلت (حم تنزيل من الرحمن)", "192- فصلت (إن الذين قالوا ربنا الله)",
  "193- الجزء 25 (إليه يرد علم الساعة)", "194- الشورى (حم عسق)", "195- الشورى (ولو بسط الله الرزق)", "196- الزخرف (حم والكتاب المبين)", "197- الزخرف (ولما ضرب ابن مريم مثلا)", "198- الدخان (حم والكتاب المبين - يتبع)", "199- الجاثية (حم تنزيل الكتاب من الله)", "200- الجاثية (هذا بصائر للناس)",
  "201- الجزء 26 (حم تنزيل)", "202- الأحقاف (وإذ صرفنا إليك)", "203- محمد (الذين كفروا وصدوا)", "204- الفتح (إنا فتحنا لك فتحا مبين)", "205- الحجرات (يا أيها الذين آمنوا لا تقدموا)", "206- ق (ق والقرآن المجيد)", "207- ق (وجاءت سكرة الموت)", "208- الذاريات (والذاريات ذروا)",
  "209- الجزء 27 (قال فما خطبكم)", "210- الطور (والطور وكتاب مسطور)", "211- النجم (والنجم إذا هوى)", "212- القمر (اقتربت الساعة وانشق القمر)", "213- الرحمن (الرحمن علم القرآن)", "214- الواقعة (إذا وقعت الواقعة)", "215- الحديد (سبح لله ما في السماوات)", "216- الحديد (لقد أرسلنا رسلنا بالبينات)",
  "217- الجزء 28 (قد سمع الله)", "218- الحشر (سبح لله ما في السماوات)", "219- الممتحنة (يا أيها الذين آمنوا لا تتخذوا)", "220- الصف (سبح لله ما في السماوات)", "221- الجمعة (يسبح لله ما في السماوات)", "222- المنافقون (إذا جاءك المنافقون)", "223- التغابن (يسبح لله ما في السماوات)", "224- التحريم (يا أيها النبي لم تحرم)",
  "225- الجزء 29 (تبارك الذي)", "226- القلم (ن والقلم وما يسطرون)", "227- الحاقة (الحاقة ما الحاقة)", "228- المعارج (سأل سائل بعذاب واقع)", "229- الجن (قل أوحي إلي أنه استمع)", "230- المزمل (يا أيها المزمل)", "231- المدثر (يا أيها المدثر)", "232- القيامة (لا أقسم ليوم القيامة)",
  "233- الجزء 30 (عم يتساءلون)", "234- النازعات (والنازعات غرقا)", "235- عبس (عبس وتولى)", "236- التكوير (إذا الشمس كورت)", "237- الانفطار (إذا السماء انفطرت)", "238- المطففين (ويل للمطففين)", "239- الانشقاق (إذا السماء انشقت)", "240- الأعلى والغاشية وما بعدها"
];

// توليد قائمة الصفحات (604 صفحة)
const PAGES_604 = Array.from({ length: 604 }, (_, i) => ({
  id: `page_${i + 1}`,
  label: `الصفحة رقم ${i + 1}`,
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

  // استخراج الفهرس الحالي بناءً على القيمة المختارة (من النص المكتوب في البداية)
  const currentIndex = useMemo(() => {
    if (!quranData.todayPortion) return 0;
    // استخراج الرقم من بداية النص مثل "123-"
    const match = quranData.todayPortion.match(/^\d+/);
    return match ? parseInt(match[0]) : 0;
  }, [quranData.todayPortion]);

  // الربط التلقائي (آخر 10 وحدات سابقة للمحفوظ الحالي)
  const rabtPortions = useMemo(() => {
    if (currentIndex <= 1) return [];
    const unit = plan === 'new_1' ? 'صفحة' : 'ربع';
    const portions = [];
    const limit = Math.max(1, currentIndex - 10);
    for (let i = currentIndex - 1; i >= limit; i--) {
      if (plan === 'new_1') {
        portions.push({ label: `الصفحة رقم ${i}`, index: i });
      } else {
        portions.push({ label: QURAN_PORTIONS_NAMES[i - 1], index: i });
      }
    }
    return portions;
  }, [currentIndex, plan]);

  // المراجعة التلقائية (باقي المحفوظ مقسماً على 6 أيام)
  const murajaaPortions = useMemo(() => {
    if (currentIndex <= 11) return [];
    const dayOfWeek = new Date().getDay(); // 0-6
    const murajaaEnd = currentIndex - 11;
    
    const chunkSize = Math.ceil(murajaaEnd / 6);
    const start = (dayOfWeek % 6) * chunkSize + 1;
    const end = Math.min(murajaaEnd, start + chunkSize - 1);
    
    if (start > murajaaEnd) return [];
    
    if (plan === 'new_1') {
        return [{ label: `من صفحة ${start} إلى ${end}` }];
    } else {
        return [{ label: `من ربع "${QURAN_PORTIONS_NAMES[start - 1].split(' ')[1]}" إلى ربع "${QURAN_PORTIONS_NAMES[end - 1].split(' ')[1]}"` }];
    }
  }, [currentIndex, plan]);

  const plans = [
    { id: 'new_1', label: 'حفظ (وجه واحد/يوم)', sub: 'ختمة في ٢٠ شهر' },
    { id: 'new_2', label: 'حفظ (وجهين/يوم)', sub: 'ختمة في ١٠ أشهر' },
    { id: 'itqan_3', label: 'إتقان (٣ أوجه/يوم)', sub: 'ختمة في ٧ أشهر' },
    { id: 'itqan_4', label: 'إتقان (٤ أوجه/يوم)', sub: 'ختمة في ٥ أشهر' },
  ];

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
                    QURAN_PORTIONS_NAMES.map((name, idx) => <option key={idx} value={name}>{name}</option>)
                  )}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
             </div>
             <p className="text-[10px] text-slate-400 font-bold mt-3 px-1">
               * يعتمد النظام على {plan === 'new_1' ? 'أرقام الصفحات' : 'عناوين الأرباع'} لسهولة التعرف والمتابعة.
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
            <div className="grid grid-cols-1 gap-2">
              {rabtPortions.length > 0 ? rabtPortions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-600 header-font">{item.label}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                </div>
              )) : (
                <div className="text-center py-6 text-[10px] text-slate-400 font-bold italic">اختر موضع حفظك الحالي ليتم جدولة الربط تلقائياً</div>
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
