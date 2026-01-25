
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
  // الجزء الأول
  "1- الفاتحة: (الحمد لله رب العالمين)", "2- البقرة: (إن الله لا يستحيي)", "3- البقرة: (أتأمرون الناس بالبر)", "4- البقرة: (وإذ استسقى موسى)", "5- البقرة: (أفتطمعون أن يؤمنوا)", "6- البقرة: (ولقد جاءكم موسى)", "7- البقرة: (ما ننسخ من آية)", "8- البقرة: (وإذ ابتلى إبراهيم ربه)",
  // الجزء الثاني
  "9- البقرة: (سيقول السفهاء)", "10- البقرة: (إن الصفا والمروة)", "11- البقرة: (ليس البر أن تولوا)", "12- البقرة: (يسألونك عن الأهلة)", "13- البقرة: (واذكروا الله في أيام)", "14- البقرة: (يسألونك عن الخمر)", "15- البقرة: (والوالدات يرضعن)", "16- البقرة: (ألم تر إلى الذين خرجوا)",
  // الجزء الثالث
  "17- البقرة: (تلك الرسل فضلنا)", "18- البقرة: (قول معروف ومغفرة)", "19- البقرة: (ليس عليك هداهم)", "20- البقرة: (يا أيها الذين آمنوا إذا تداينتم)", "21- آل عمران: (إن الله اصطفى آدم)", "22- آل عمران: (فلما أحس عيسى)", "23- آل عمران: (كل الطعام كان حلاً)", "24- آل عمران: (وإذ غدوت من أهلك)",
  // الجزء الرابع
  "25- آل عمران: (لن تنالوا البر)", "26- آل عمران: (قل أؤنبئكم بخير)", "27- آل عمران: (كل الطعام كان حلاً)", "28- آل عمران: (واعتصموا بحبل الله)", "29- آل عمران: (ليسوا سواءً)", "30- آل عمران: (وإذ غدوت من أهلك)", "31- آل عمران: (ها أنتم أولاء)", "32- آل عمران: (لقد سمع الله قول الذين)",
  // الجزء الخامس
  "33- النساء: (والمحصنات من النساء)", "34- النساء: (واعبدوا الله ولا تشركوا)", "35- النساء: (إن الله يأمركم أن تؤدوا)", "36- النساء: (فليقاتل في سبيل الله)", "37- النساء: (ومن يهاجر في سبيل الله)", "38- النساء: (لا يحب الله الجهر)", "39- النساء: (يستفتونك قل الله يفتيكم)", "40- النساء: (يا أيها الناس قد جاءكم البرهان)",
  // الجزء السادس
  "41- المائدة: (لا يحب الله الجهر بالسوء)", "42- المائدة: (يا أيها الذين آمنوا أوفوا بالحق)", "43- المائدة: (لقد أخذ الله ميثاق)", "44- المائدة: (واتل عليهم نبأ ابني آدم)", "45- المائدة: (يا أيها الرسول لا يحزنك)", "46- المائدة: (وأنزلنا إليك الكتاب)", "47- المائدة: (يا أيها الذين آمنوا لا تتخذوا الذين)", "48- المائدة: (ولو أنهم أقاموا التوراة)",
  // الجزء السابع
  "49- المائدة: (لتجدن أشد الناس عداوة)", "50- المائدة: (وإذا سمعوا ما أنزل)", "51- المائدة: (يا أيها الذين آمنوا لا تحرموا)", "52- المائدة: (ما جعل الله من بحيرة)", "53- المائدة: (يوم يجمع الله الرسل)", "54- المائدة: (قال الله هذا يوم ينفع)", "55- الأنعام: (ولقد استهزئ برسل)", "56- الأنعام: (قل إني أخاف إن عصيت)",
  // الجزء الثامن
  "57- الأنعام: (ولو أننا نزلنا إليهم)", "58- الأنعام: (وذروا ظاهر الإثم)", "59- الأنعام: (أو من كان ميتاً)", "60- الأنعام: (وهو الذي أنشأ جنات)", "61- الأنعام: (ثلاثة أزواج من الضأن)", "62- الأنعام: (قل تعالوا أتل ما حرم)", "63- الأعراف: (إنما يستجيب الذين يسمعون)", "64- الأعراف: (وما من دابة في الأرض)",
  // الجزء التاسع
  "65- الأعراف: (قال الملأ الذين استكبروا)", "66- الأعراف: (وإلى مدين أخاهم شعيباً)", "67- الأعراف: (واتل عليهم نبأ الذي آتيناه)", "68- الأعراف: (وإذ نتقنا الجبل)", "69- الأنفال: (يسألونك عن الأنفال)", "70- الأنفال: (إذ أنتم بالعدوة الدنيا)", "71- الأنفال: (واعلموا أنما غنمتم)", "72- الأنفال: (يا أيها النبي حسبك الله)",
  // الجزء العاشر
  "73- الأنفال: (واعلموا أنما غنمتم)", "74- الأنفال: (يا أيها النبي حسبك الله)", "75- التوبة: (إنما الصدقات للفقراء)", "76- التوبة: (ألم يعلموا أن الله هو يقبل)", "77- التوبة: (ما كان للنبي والذين آمنوا)", "78- التوبة: (لقد جاءكم رسول من أنفسكم)", "79- التوبة: (إن الله اشترى من المؤمنين)", "80- التوبة: (ما كان لأهل المدينة)",
  // الجزء الحادي عشر
  "81- يونس: (يعتذرون إليكم إذا رجعتم)", "82- يونس: (إنما السبيل على الذين)", "83- يونس: (وممن حولكم من الأعراب)", "84- يونس: (والسابقون الأولون)", "85- يونس: (الر تلك آيات الكتاب)", "86- يونس: (إنما مثل الحياة الدنيا)", "87- يونس: (قالوا اتخذ الله ولداً)", "88- يونس: (ويا قوم لا أسألكم)",
  // الجزء الثاني عشر
  "89- هود: (وما من دابة في الأرض)", "90- هود: (ويا قوم اعملوا على مكانتكم)", "91- هود: (فلو كان من القرون)", "92- يوسف: (إذ قال يوسف لأبيه)", "93- يوسف: (وقال الذي اشتراه)", "94- يوسف: (فلما استيأسوا منه)", "95- يوسف: (وكأين من آية)", "96- يوسف: (لقد كان في قصصهم عبرة)",
  // الجزء الثالث عشر
  "97- يوسف: (وما أبرئ نفسي)", "98- يوسف: (وقال الملك ائتوني به)", "99- الرعد: (المر تلك آيات الكتاب)", "100- الرعد: (ولو أن قرآناً سيرت به)", "101- إبراهيم: (الر كتاب أنزلناه إليك)", "102- إبراهيم: (ألم تر كيف ضرب الله مثلاً)", "103- الحجر: (الر تلك آيات الكتاب)", "104- الحجر: (لقد علمنا المستقدمين)",
  // الجزء الرابع عشر
  "105- النحل: (ربما يود الذين كفروا)", "106- النحل: (أتى أمر الله فلا تستعجلوه)", "107- النحل: (وضرب الله مثلاً رجلين)", "108- النحل: (وقيل للذين اتقوا ماذا أنزل ربكم)", "109- النحل: (ولو يؤاخذ الله الناس)", "110- النحل: (ضرب الله مثلاً عبداً مملوكاً)", "111- النحل: (إن الله يأمر بالعدل)", "112- النحل: (وأوفوا بعهد الله إذا عاهدتم)",
  // الجزء الخامس عشر
  "113- الإسراء: (سبحان الذي أسرى بعبده)", "114- الإسراء: (وإذ قلنا للملائكة اسجدوا)", "115- الإسراء: (ولقد كرمنا بني آدم)", "116- الإسراء: (وقل جاء الحق)", "117- الكهف: (الحمد لله الذي أنزل)", "118- الكهف: (وإذ اعتزلتموهم)", "119- الكهف: (واتل ما أوحي إليك)", "120- الكهف: (قال له صاحبه وهو يحاوره)",
  // الجزء السادس عشر
  "121- الكهف: (قال ألم أقل لك)", "122- الكهف: (يسألونك عن ذي القرنين)", "123- مريم: (كهيعص ذكر رحمت ربك)", "124- مريم: (واذكر في الكتاب مريم)", "125- مريم: (تلك الجنة التي نورث)", "126- طه: (طه ما أنزلنا عليك)", "127- طه: (قال فمن ربكما يا موسى)", "128- طه: (قالوا لن نؤثرك على ما جاءنا)",
  // الجزء السابع عشر
  "129- الأنبياء: (اقترب للناس حسابهم)", "130- الأنبياء: (قالوا يا ويلنا إنا كنا)", "131- الأنبياء: (ولو شئنا لرفعناه)", "132- الحج: (يا أيها الناس اتقوا ربكم)", "133- الحج: (ألم تر أن الله يسجد له)", "134- الحج: (هذان خصمان اختصموا)", "135- الحج: (إن الله يدخل الذين آمنوا)", "136- الحج: (ذلك ومن يعظم حرمات الله)",
  // الجزء الثامن عشر
  "137- المؤمنون: (قد أفلح المؤمنون)", "138- المؤمنون: (ولقد خلقنا فوقكم سبع طرائق)", "139- المؤمنون: (فإذا نفخ في الصور)", "140- النور: (سورة أنزلناها وفرضناها)", "141- النور: (الله نور السماوات والأرض)", "142- النور: (في بيوت أذن الله أن ترفع)", "143- الفرقان: (تبارك الذي نزل الفرقان)", "144- الفرقان: (وقال الذين لا يرجون لقاءنا)",
  // الجزء التاسع عشر
  "145- الشعراء: (وقال الذين لا يرجون لقاءنا)", "146- الشعراء: (طسم تلك آيات الكتاب)", "147- الشعراء: (قال للملأ حوله)", "148- الشعراء: (قالوا أرجه وأخاه)", "149- الشعراء: (كذبت قوم لوط)", "150- النمل: (طس تلك آيات القرآن)", "151- النمل: (فلما جاء سليمان)", "152- النمل: (أمن خلق السماوات والأرض)",
  // الجزء العشرون
  "153- القصص: (أمن يجيب المضطر)", "154- القصص: (طسم تلك آيات الكتاب)", "155- القصص: (وإذ يتلى عليهم)", "156- القصص: (فما كان جواب قومه)", "157- القصص: (إن قارون كان من قوم موسى)", "158- العنكبوت: (الم أحسب الناس)", "159- العنكبوت: (وقال الذين كفروا للذين آمنوا)", "160- العنكبوت: (اتل ما أوحي إليك من الكتاب)",
  // الجزء الحادي والعشرون
  "161- العنكبوت: (ولا تجادلوا أهل الكتاب)", "162- الروم: (الم غلبت الروم)", "163- الروم: (ومن آياته أن خلقكم)", "164- الروم: (أولم يسيروا في الأرض)", "165- لقمان: (ألم تروا أن الله سخر لكم)", "166- السجدة: (ألم تنزيل الكتاب)", "167- الأحزاب: (يا أيها النبي اتق الله)", "168- الأحزاب: (وإذ تقول للذي أنعم الله عليه)",
  // الجزء الثاني والعشرون
  "169- الأحزاب: (ومن يقنت منكن لله ورسوله)", "170- الأحزاب: (يا أيها الذين آمنوا اذكروا الله)", "171- الأحزاب: (يا أيها النبي إنا أرسلناك)", "172- سبأ: (الحمد لله الذي له ما في السماوات)", "173- سبأ: (وقال الذين كفروا لا تأتينا الساعة)", "174- فاطر: (الحمد لله فاطر السماوات)", "175- فاطر: (وما يستوي البحران)", "176- يس: (يس والقرآن الحكيم)",
  // الجزء الثالث والعشرون
  "177- يس: (وما أنزلنا على قومه)", "178- يس: (أولم ير الإنسان أنا خلقناه)", "179- الصافات: (والصافات صفاً)", "180- الصافات: (وإن يونس لمن المرسلين)", "181- ص: (ص والقرآن ذي الذكر)", "182- ص: (إذ قال ربك للملائكة)", "183- الزمر: (تنزيل الكتاب من الله)", "184- الزمر: (قل يا عبادي الذين أسرفوا)",
  // الجزء الرابع والعشرون
  "185- الزمر: (فمن أظلم ممن كذب على الله)", "186- الزمر: (وأشرقت الأرض بنور ربها)", "187- غافر: (حم تنزيل الكتاب من الله)", "188- غافر: (وقال رجل مؤمن من آل فرعون)", "189- غافر: (ويا قوم إني أخاف عليكم)", "190- فصلت: (حم تنزيل من الرحمن)", "191- فصلت: (إليه يرد علم الساعة)", "192- فصلت: (ولو جعلناه قرآناً أعجمياً)",
  // الجزء الخامس والعشرون
  "193- الشورى: (حم عسق كذلك يوحي إليك)", "194- الشورى: (استجيبوا لربكم)", "195- الزخرف: (حم والكتاب المبين)", "196- الزخرف: (فلما جاءهم بالحق)", "197- الزخرف: (وقيله يا رب إن هؤلاء)", "198- الدخان: (حم والكتاب المبين)", "199- الجاثية: (حم تنزيل الكتاب)", "200- الجاثية: (هذا هدى والذين كفروا آيات)",
  // الجزء السادس والعشرون
  "201- الأحقاف: (حم تنزيل الكتاب)", "202- الأحقاف: (وإذ صرفنا إليك نفراً)", "203- محمد: (الذين كفروا وصدوا)", "204- محمد: (فإذا لقيتم الذين كفروا)", "205- الفتح: (إنا فتحنا لك فتحاً مبيناً)", "206- الفتح: (محمد رسول الله والذين معه)", "207- الحجرات: (يا أيها الذين آمنوا لا تقدموا)", "208- ق: (ق والقرآن المجيد)",
  // الجزء السابع والعشرون
  "209- الذاريات: (والذاريات ذرواً)", "210- الذاريات: (فما خطبكم أيها المرسلون)", "211- الطور: (والطور وكتاب مسطور)", "212- النجم: (والنجم إذا هوى)", "213- القمر: (اقتربت الساعة وانشق القمر)", "214- الرحمن: (الرحمن علم القرآن)", "215- الواقعة: (إذا وقعت الواقعة)", "216- الحديد: (سبح لله ما في السماوات)",
  // الجزء الثامن والعشرون
  "217- المجادلة: (قد سمع الله قول التي)", "218- الحشر: (سبح لله ما في السماوات)", "219- الحشر: (يا أيها الذين آمنوا اتقوا الله)", "220- الممتحنة: (يا أيها الذين آمنوا لا تتخذوا)", "221- الصف: (سبح لله ما في السماوات)", "222- الجمعة: (يسبح لله ما في السماوات)", "223- المنافقون: (إذا جاءك المنافقون)", "224- التغابن والطلاق والتحريم: (يسبح لله)",
  // الجزء التاسع والعشرون
  "225- الملك: (تبارك الذي بيده الملك)", "226- الملك: (وقالوا لو كنا نسمع)", "227- القلم: (ن والقلم وما يسطرون)", "228- الحاقة: (الحاقة ما الحاقة)", "229- المعارج: (سأل سائل بعذاب واقع)", "230- نوح: (إنا أرسلنا نوحاً)", "231- الجن: (قل أوحي إلي أنه استمع)", "232- المزمل والمدثر: (يا أيها المزمل)",
  // الجزء الثلاثون
  "233- القيامة والإنسان: (لا أقسم بيوم القيامة)", "234- النبأ: (عم يتساءلون)", "235- النازعات: (والنازعات غرقاً)", "236- عبس والتكوير: (عبس وتولى)", "237- الانفطار إلى البروج: (إذا السماء انفطرت)", "238- الطارق إلى البلد: (والسماء والطارق)", "239- الشمس إلى العلق: (والشمس وضحاها)", "240- القدر إلى الناس: (إنا أنزلناه في ليلة القدر)"
];

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
