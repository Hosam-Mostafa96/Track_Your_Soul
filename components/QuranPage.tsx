
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
  Settings,
  MessageSquareText
} from 'lucide-react';
import { DailyLog } from '../types';

const QURAN_PORTIONS_NAMES = [
  "1- الفاتحة: (الحمد لله رب العالمين)", "2- البقرة: (إن الله لا يستحيي)", "3- البقرة: (أتأمرون الناس بالبر)", "4- البقرة: (وإذ استسقى موسى)", "5- البقرة: (أفتطمعون أن يؤمنوا)", "6- البقرة: (ولقد جاءكم موسى)", "7- البقرة: (ما ننسخ من آية)", "8- البقرة: (وإذ ابتلى إبراهيم ربه)",
  "9- البقرة: (سيقول السفهاء)", "10- البقرة: (إن الصفا والمروة)", "11- البقرة: (ليس البر أن تولوا)", "12- البقرة: (يسألونك عن الأهلة)", "13- البقرة: (واذكروا الله في أيام)", "14- البقرة: (يسألونك عن الخمر)", "15- البقرة: (والوالدات يرضعن)", "16- البقرة: (ألم تر إلى الذين خرجوا)",
  "17- البقرة: (تلك الرسل فضلنا)", "18- البقرة: (قول معروف ومغفرة)", "19- البقرة: (ليس عليك هداهم)", "20- البقرة: (يا أيها الذين آمنوا إذا تداينتم)", "21- آل عمران: (إن الله اصطفى آدم)", "22- آل عمران: (فلما أحس عيسى)", "23- آل عمران: (كل الطعام كان حلاً)", "24- آل عمران: (وإذ غدوت من أهلك)",
  "25- آل عمران: (لن تنالوا البر)", "26- آل عمران: (فإن كذبوك فقد كذب)", "27- آل عمران: (لكن الذين اتقوا ربهم)", "28- آل عمران: (ما كان الله ليذر المؤمنين)", "29- النساء: (وآتوا النساء صدقاتهن)", "30- النساء: (والوالدات يرضعن)", "31- النساء: (حرمت عليكم أمهاتكم)", "32- النساء: (واعبدوا الله ولا تشركوا)",
  "33- النساء: (والمحصنات من النساء)", "34- النساء: (فما لكم في المنافقين)", "35- النساء: (ومن يهاجر في سبيل الله)", "36- النساء: (إن الله لا يغفر أن يشرك به)", "37- النساء: (يا أيها الذين آمنوا كونوا قوامين)", "38- النساء: (لا يحب الله الجهر بالسوء)", "39- النساء: (إن الله لا يغفر أن يشرك به)", "40- النساء: (يا أيها الناس قد جاءكم البرهان)",
  "41- المائدة: (يا أيها الذين آمنوا أوفوا)", "42- المائدة: (لقد أخذ الله ميثاق بني إسرائيل)", "43- المائدة: (واتل عليهم نبأ ابني آدم)", "44- المائدة: (يا أيها الرسول لا يحزنك)", "45- المائدة: (سماعون للكذب أكالون)", "46- المائدة: (وأنزلنا إليك الكتاب بالحق)", "47- المائدة: (يا أيها الذين آمنوا لا تتخذوا الذين اتخذوا)", "48- المائدة: (ولو أنهم أقاموا التوراة والإنجيل)",
  "49- المائدة: (لتجدن أشد الناس عداوة)", "50- المائدة: (وإذا سمعوا ما أنزل)", "51- المائدة: (يا أيها الذين آمنوا لا تحرموا)", "52- المائدة: (ما جعل الله من بحيرة)", "53- المائدة: (يوم يجمع الله الرسل)", "54- المائدة: (قال الله هذا يوم ينفع الصادقين)", "55- الأنعام: (ولقد استهزئ برسل من قبلك)", "56- الأنعام: (قل إني أخاف إن عصيت)",
  "57- الأنعام: (ولو أننا نزلنا إليهم)", "58- الأنعام: (وذروا ظاهر الإثم وباطنه)", "59- الأنعام: (أو من كان ميتاً فأحييناه)", "60- الأنعام: (وهو الذي أنشأ جنات)", "61- الأنعام: (ثلاثة أزواج من الضأن)", "62- الأنعام: (قل تعالوا أتل ما حرم ربكم)", "63- الأنعام: (إنما يستجيب الذين يسمعون)", "64- الأنعام: (وما من دابة في الأرض)",
  "65- الأعراف: (ولقد جئناهم بكتاب)", "66- الأعراف: (قل من حرم زينة الله)", "67- الأعراف: (وإلى مدين أخاهم شعيباً)", "68- الأعراف: (وقال الملأ الذين استكبروا)", "69- الأعراف: (وإذ نتقنا الجبل فوقهم)", "70- الأعراف: (ولو شئنا لرفعناه بها)", "71- الأعراف: (واختار موسى قومه)", "72- الأعراف: (وإذ قالت أمة منهم)",
  "73- الأنفال: (يسألونك عن الأنفال)", "74- الأنفال: (وإذ يمكر بك الذين كفروا)", "75- الأنفال: (واعلموا أنما غنمتم)", "76- الأنفال: (يا أيها النبي حسبك الله)", "77- التوبة: (إنما الصدقات للفقراء)", "78- التوبة: (ألم يعلموا أن الله هو يقبل التوبة)", "79- التوبة: (ما كان للنبي والذين آمنوا)", "80- التوبة: (لقد جاءكم رسول من أنفسكم)",
  "81- يونس: (الر تلك آيات الكتاب)", "82- يونس: (إنما مثل الحياة الدنيا)", "83- يونس: (قالوا اتخذ الله ولداً)", "84- يونس: (ويا قوم لا أسألكم عليه مالاً)", "85- هود: (ويا قوم اعملوا على مكانتكم)", "86- هود: (فلو كان من القرون من قبلكم)", "87- يوسف: (إذ قال يوسف لأبيه)", "88- يوسف: (قالوا يا أيها العزيز)",
  "89- الرعد: (المر تلك آيات الكتاب)", "90- الرعد: (مثل الجنة التي وعد المتقون)", "91- إبراهيم: (الر كتاب أنزلناه إليك)", "92- إبراهيم: (ألم تر كيف ضرب الله مثلاً)", "93- الحجر: (الر تلك آيات الكتاب)", "94- الحجر: (لقد علمنا المستقدمين منكم)", "95- النحل: (أتى أمر الله فلا تستعجلوه)", "96- النحل: (وضرب الله مثلاً رجلين)",
  "97- الإسراء: (سبحان الذي أسرى بعبده)", "98- الإسراء: (وإذ قلنا للملائكة اسجدوا لآدم)", "99- الكهف: (الحمد لله الذي أنزل)", "100- الكهف: (وإذ اعتزلتموهم وما يعبدون)", "101- الكهف: (قال له صاحبه وهو يحاوره)", "102- الكهف: (فانطلقا حتى إذا ركبا)", "103- الكهف: (قال ألم أقل لك إنك لن تستطيع)", "104- الكهف: (يسألونك عن ذي القرنين)",
  "105- مريم: (كهيعص ذكر رحمت ربك)", "106- مريم: (واذكر في الكتاب مريم)", "107- طه: (طه ما أنزلنا عليك)", "108- طه: (قال فمن ربكما يا موسى)", "109- طه: (قالوا لن نؤثرك على ما جاءنا)", "110- طه: (وكذلك أنزلناه قرآناً عربياً)", "111- الأنبياء: (اقترب للناس حسابهم)", "112- الأنبياء: (قالوا يا ويلنا إنا كنا ظالمين)",
  "113- الحج: (يا أيها الناس اتقوا ربكم)", "114- الحج: (إن الله يدخل الذين آمنوا)", "115- الحج: (ألم تر أن الله يسجد له)", "116- الحج: (هذان خصمان اختصموا)", "117- المؤمنون: (قد أفلح المؤمنون)", "118- المؤمنون: (ولقد خلقنا فوقكم سبع طرائق)", "119- النور: (سورة أنزلناها وفرضناها)", "120- النور: (الله نور السماوات والأرض)",
  "121- الفرقان: (تبارك الذي نزل الفرقان)", "122- الفرقان: (وقال الذين لا يرجون لقاءنا)", "123- الشعراء: (طسم تلك آيات الكتاب)", "124- الشعراء: (قال للملأ حوله إن هذا لساهر)", "125- الشعراء: (قالوا أرجه وأخاه وابعث)", "126- الشعراء: (كذبت قوم لوط المرسلين)", "127- النمل: (طس تلك آيات القرآن)", "128- النمل: (فلما جاء سليمان قال أتمدونني)",
  "129- القصص: (طسم تلك آيات الكتاب)", "130- القصص: (وإذ يتلى عليهم قالوا آمنّا)", "131- القصص: (فما كان جواب قومه إلا أن قالوا)", "132- القصص: (إن قارون كان من قوم موسى)", "133- العنكبوت: (الم أحسب الناس أن يتركوا)", "134- العنكبوت: (وقال الذين كفروا للذين آمنوا)", "135- الروم: (الم غلبت الروم)", "136- الروم: (ومن آياته أن خلقكم من تراب)",
  "137- لقمان: (ألم تروا أن الله سخر لكم)", "138- السجدة: (ألم تنزيل الكتاب)", "139- الأحزاب: (يا أيها النبي اتق الله)", "140- الأحزاب: (وإذ تقول للذي أنعم الله عليه)", "141- الأحزاب: (يا أيها النبي إنا أرسلناك)", "142- الأحزاب: (يا أيها الذين آمنوا اذكروا الله)", "143- سبأ: (الحمد لله الذي له ما في السماوات)", "144- سبأ: (وقال الذين كفروا لا تأتينا الساعة)",
  "145- فاطر: (الحمد لله فاطر السماوات)", "146- فاطر: (وما يستوي البحران)", "147- يس: (يس والقرآن الحكيم)", "148- يس: (وما أنزلنا على قومه من بعده)", "149- الصافات: (والصافات صفاً)", "150- الصافات: (وإن يونس لمن المرسلين)", "151- ص: (ص والقرآن ذي الذكر)", "152- ص: (إذ قال ربك للملائكة إني خالق بشراً)",
  "153- الزمر: (تنزيل الكتاب من الله)", "154- الزمر: (قل يا عبادي الذين أسرفوا)", "155- غافر: (حم تنزيل الكتاب)", "156- غافر: (وقال رجل مؤمن من آل فرعون)", "157- فصلت: (حم تنزيل من الرحمن)", "158- فصلت: (ولو جعلناه قرآناً أعجمياً)", "159- الشورى: (حم عسق كذلك يوحي إليك)", "160- الشورى: (استجيبوا لربكم من قبل أن يأتي)",
  "161- الزخرف: (حم والكتاب المبين)", "162- الزخرف: (فلما جاءهم بالحق إذا هم)", "163- الدخان: (حم والكتاب المبين)", "164- الجاثية: (حم تنزيل الكتاب)", "165- الأحقاف: (حم تنزيل الكتاب)", "166- الأحقاف: (وإذ صرفنا إليك نفراً من الجن)", "167- محمد: (الذين كفروا وصدوا عن سبيل الله)", "168- الفتح: (إنا فتحنا لك فتحاً مبيناً)",
  "169- الحجرات: (يا أيها الذين آمنوا لا تقدموا)", "170- ق: (ق والقرآن المجيد)", "171- الذاريات: (والذاريات ذرواً)", "172- الذاريات: (فما خطبكم أيها المرسلون)", "173- الطور: (والطور وكتاب مسطور)", "174- النجم: (والنجم إذا هوى)", "175- القمر: (اقتربت الساعة وانشق القمر)", "176- الرحمن: (الرحمن علم القرآن)",
  "177- الواقعة: (إذا وقعت الواقعة)", "178- الحديد: (سبح لله ما في السماوات)", "179- المجادلة: (قد سمع الله قول التي)", "180- الحشر: (سبح لله ما في السماوات)", "181- الممتحنة: (يا أيها الذين آمنوا لا تتخذوا)", "182- الصف: (سبح لله ما في السماوات)", "183- الجمعة والمنافقون: (يسبح لله ما في السماوات)", "184- التغابن والطلاق والتحريم: (يسبح لله)",
  "185- الملك: (تبارك الذي بيده الملك)", "186- الملك: (وقالوا لو كنا نسمع أو نعقل)", "187- القلم: (ن والقلم وما يسطرون)", "188- القلم: (فاصبر لحكم ربك)", "189- الحاقة: (الحاقة ما الحاقة)", "190- المعارج: (سأل سائل بعذاب واقع)", "191- نوح: (إنا أرسلنا نوحاً إلى قومه)", "192- الجن: (قل أوحي إلي أنه استمع نفر)",
  "193- المزمل: (يا أيها المزمل قم الليل)", "194- المدثر: (يا أيها المدثر قم فأنذر)", "195- القيامة: (لا أقسم بيوم القيامة)", "196- الإنسان: (هل أتى على الإنسان حين)", "197- المرسلات: (والمرسلات عرفاً)", "198- النبأ: (عم يتساءلون)", "199- النازعات: (والنازعات غرقاً)", "200- عبس: (عبس وتولى أن جاءه الأعمى)",
  "201- التكوير: (إذا الشمس كورت)", "202- الانفطار: (إذا السماء انفطرت)", "203- المطففين: (ويل للمطففين)", "204- الانشقاق: (إذا السماء انشقت)", "205- البروج: (والسماء ذات البروج)", "206- الطارق: (والسماء والطارق)", "207- الأعلى: (سبح اسم ربك الأعلى)", "208- الغاشية: (هل أتاك حديث الغاشية)",
  "209- الفجر: (والفجر وليال عشر)", "210- البلد: (لا أقسم بهذا البلد)", "211- الشمس: (والشمس وضحاها)", "212- الليل: (والليل إذا يغشى)", "213- الضحى: (والضحى والليل إذا سجى)", "214- الشرح: (ألم نشرح لك صدرك)", "215- التين: (والتين والزيتون)", "216- العلق: (اقرأ باسم ربك الذي خلق)",
  "217- القدر: (إنا أنزلناه في ليلة القدر)", "218- البينة: (لم يكن الذين كفروا)", "219- الزلزلة: (إذا زلزلت الأرض زلزالها)", "220- العاديات: (والعاديات ضبحاً)", "221- القارعة: (القارعة ما القارعة)", "222- التكاثر: (ألهاكم التكاثر)", "223- العصر: (والعصر إن الإنسان لفي خسر)", "224- الهمزة: (ويل لكل همزة لمزة)",
  "225- الفيل: (ألم تر كيف فعل ربك)", "226- قريش: (لإيلاف قريش)", "227- الماعون: (أرأيت الذي يكذب بالدين)", "228- الكوثر: (إنا أعطيناك الكوثر)", "229- الكافرون: (قل يا أيها الكافرون)", "230- النصر: (إذا جاء نصر الله والفتح)", "231- المسد: (تبت يدا أبي لهب وتب)", "232- الإخلاص: (قل هو الله أحد)",
  "233- الفلق: (قل أعوذ برب الفلق)", "234- الناس: (قل أعوذ برب الناس)", "235- سورة الفاتحة مكرر", "236- سورة البقرة مطلع مكرر", "237- سورة آل عمران مطلع مكرر", "238- سورة النساء مطلع مكرر", "239- سورة المائدة مطلع مكرر", "240- الختام والدعاء (الناس)"
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

  const murajaaData = useMemo(() => {
    const list = hifzUnit === 'rub' ? QURAN_PORTIONS_NAMES : QURAN_PAGES_LIST;
    const buffer = hifzUnit === 'rub' ? 11 : 25;
    
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
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex">
        <button onClick={() => setSubTab('hifz')} className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-2 ${subTab === 'hifz' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}><Repeat className="w-4 h-4" /> برنامج الحفظ والإتقان</button>
        <button onClick={() => setSubTab('tadabbur')} className={`flex-1 py-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-2 ${subTab === 'tadabbur' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}><Sparkles className="w-4 h-4" /> محراب التدبر</button>
      </div>

      {subTab === 'hifz' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 mb-4">
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
