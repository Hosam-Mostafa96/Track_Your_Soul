
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
  "1- الفاتحة: (الحمد لله رب العالمين)",
  "2- البقرة: (إن الله لا يستحيي أن يضرب مثلاً)",
  "3- البقرة: (أتأمرون الناس بالبر)",
  "4- البقرة: (وإذ استسقى موسى لقومه)",
  "5- البقرة: (أفتطمعون أن يؤمنوا لكم)",
  "6- البقرة: (ولقد جاءكم موسى بالبينات)",
  "7- البقرة: (ما ننسخ من آية)",
  "8- البقرة: (وإذ ابتلى إبراهيم ربه)",
  "9- البقرة: (سيقول السفهاء من الناس)",
  "10- البقرة: (إن الصفا والمروة من شعائر الله)",
  "11- البقرة: (ليس البر أن تولوا وجوهكم)",
  "12- البقرة: (يسألونك عن الأهلة)",
  "13- البقرة: (واذكروا الله في أيام معدودات)",
  "14- البقرة: (يسألونك عن الخمر والميسر)",
  "15- البقرة: (والوالدات يرضعن أولادهن)",
  "16- البقرة: (ألم تر إلى الذين خرجوا من ديارهم)",
  "17- البقرة: (تلك الرسل فضلنا بعضهم على بعض)",
  "18- البقرة: (قول معروف ومغفرة خير من صدقة)",
  "19- البقرة: (ليس عليك هداهم ولكن الله يهدي)",
  "20- البقرة: (يا أيها الذين آمنوا إذا تداينتم)",
  "21- آل عمران: (قل أؤنبئكم بخير من ذلكم)",
  "22- آل عمران: (إن الله اصطفى آدم ونوحاً)",
  "23- آل عمران: (فلما أحس عيسى منهم الكفر)",
  "24- آل عمران: (ومن أهل الكتاب من إن تأمنه)",
  "25- آل عمران: (كل الطعام كان حلاً لبني إسرائيل)",
  "26- آل عمران: (ليسوا سواء من أهل الكتاب)",
  "27- آل عمران: (وسارعوا إلى مغفرة من ربكم)",
  "28- آل عمران: (إذ تصعدون ولا تلوون على أحد)",
  "29- آل عمران: (يستبشرون بنعمة من الله وفضل)",
  "30- آل عمران: (لتبلون في أموالكم وأنفسكم)",
  "31- النساء: (يا أيها الناس اتقوا ربكم)",
  "32- النساء: (ولكم نصف ما ترك أزواجكم)",
  "33- النساء: (والمحصنات من النساء إلا ما ملكت)",
  "34- النساء: (واعبدوا الله ولا تشركوا به شيئاً)",
  "35- النساء: (إن الله يأمركم أن تؤدوا الأمانات)",
  "36- النساء: (فليقاتل في سبيل الله الذين يشرون)",
  "37- النساء: (فما لكم في المنافقين فئتين)",
  "38- النساء: (ومن يهاجر في سبيل الله)",
  "39- النساء: (لا خير في كثير من نجواهم)",
  "40- النساء: (يا أيها الذين آمنوا كونوا قوامين)",
  "41- النساء: (لا يحب الله الجهر بالسوء)",
  "42- النساء: (إنا أوحينا إليك كما أوحينا إلى نوح)",
  "43- المائدة: (يا أيها الذين آمنوا أوفوا بالعقود)",
  "44- المائدة: (ولقد أخذ الله ميثاق بني إسرائيل)",
  "45- المائدة: (واتل عليهم نبأ ابني آدم بالحق)",
  "46- المائدة: (يا أيها الرسول لا يحزنك الذين يسارعون)",
  "47- المائدة: (يا أيها الذين آمنة لا تتخذوا اليهود والنصارى)",
  "48- المائدة: (يا أيها الرسول بلغ ما أنزل إليك)",
  "49- المائدة: (لتجدن أشد الناس عداوة للذين آمنوا)",
  "50- المائدة: (جعل الله الكعبة البيت الحرام قياماً)",
  "51- المائدة: (يوم يجمع الله الرسل فيقول ماذا أجبتم)",
  "52- الأنعام: (وله ما سكن في الليل والنهار)",
  "53- الأنعام: (إنما يستجيب الذين يسمعون)",
  "54- الأنعام: (وعنده مفاتح الغيب لا يعلمها إلا هو)",
  "55- الأنعام: (وإذ قال إبراهيم لأبيه آزر أتتخذ)",
  "56- الأنعام: (إن الله فالق الحب والنوى)",
  "57- الأنعام: (ولو أننا نزلنا إليهم الملائكة)",
  "58- الأنعام: (لهم دار السلام عند ربهم)",
  "59- الأنعام: (وهو الذي أنشأ جنات معروشات)",
  "60- الأنعام: (قل تعالوا أتل ما حرم ربكم عليكم)",
  "61- الأعراف: (المص * كتاب أنزل إليك)",
  "62- الأعراف: (يا بني آدم خذوا زينتكم عند كل مسجد)",
  "63- الأعراف: (وإلى عاد أخاهم هوداً قال يا قوم)",
  "64- الأعراف: (وإلى مدين أخاهم شعيباً قال يا قوم)",
  "65- الأعراف: (قال الملأ الذين استكبروا من قومه)",
  "66- الأعراف: (وأوحينا إلى موسى أن ألق عصاك)",
  "67- الأعراف: (وواعدنا موسى ثلاثين ليلة)",
  "68- الأعراف: (واكتب لنا في هذه الدنيا حسنة)",
  "69- الأعراف: (وإذ نتقنا الجبل فوقهم كأنه ظلة)",
  "70- الأعراف: (هو الذي خلقكم من نفس واحدة)",
  "71- الأنفال: (يسألونك عن الأنفال قل الأنفال لله والرسول)",
  "72- الأنفال: (إن شر الدواب عند الله الذين كفروا)",
  "73- الأنفال: (واعلموا أنما غنمتم من شيء)",
  "74- الأنفال: (يا أيها النبي حرض المؤمنين على القتال)",
  "75- التوبة: (براءة من الله ورسوله إلى الذين عاهدتم)",
  "76- التوبة: (أجعلتم سقاية الحاج وعمارة المسجد)",
  "77- التوبة: (يا أيها الذين آمنوا إن كثيراً من الأحبار)",
  "78- التوبة: (ولو أرادوا الخروج لأعدوا له عدة)",
  "79- التوبة: (إنما الصدقات للفقراء والمساكين)",
  "80- التوبة: (ومنهم من عاهد الله لئن آتانا)",
  "81- التوبة: (يعتذرون إليكم إذا رجعتم إليهم)",
  "82- التوبة: (إن الله اشترى من المؤمنين أنفسهم)",
  "83- التوبة: (وما كان المؤمنون لينفروا كافة)",
  "84- يونس: (الر تلك آيات الكتاب الحكيم)",
  "85- يونس: (وجاوزنا ببني إسرائيل البحر)",
  "86- يونس: (ويستنبئونك أحق هو قل إي وربي)",
  "87- يونس: (دعواهم فيها سبحانك اللهم)",
  "88- يونس: (وإذا تتلى عليهم آياتنا بينات)",
  "89- هود: (وما من دابة في الأرض إلا على الله رزقها)",
  "90- هود: (وإلى عاد أخاهم هوداً قال يا قوم)",
  "91- هود: (وإلى ثمود أخاهم صالحاً قال يا قوم)",
  "92- هود: (وإلى مدين أخاهم شعيباً قال يا قوم)",
  "93- هود: (ولقد أرسلنا موسى بآياتنا وسلطان مبين)",
  "94- هود: (وأقم الصلاة طرفي النهار وزلفاً)",
  "95- يوسف: (الر تلك آيات الكتاب المبين)",
  "96- يوسف: (إذ قال يوسف لأبيه يا أبت إني رأيت)",
  "97- يوسف: (وما أبرئ نفسي إن النفس لأمارة)",
  "98- يوسف: (وقال الذي اشتراه من مصر لامرأته)",
  "99- يوسف: (ودخل معه السجن فتيان)",
  "100- يوسف: (فلما رجعوا إلى أبيهم قالوا يا أبانا)",
  "101- الرعد: (المر تلك آيات الكتاب والذي أنزل إليك)",
  "102- الرعد: (ولو أن قرآناً سيرت به الجبال)",
  "103- إبراهيم: (الر كتاب أنزلناه إليك لتخرج الناس)",
  "104- إبراهيم: (وإذ قال إبراهيم رب اجعل هذا البلد)",
  "105- الحجر: (الر تلك آيات الكتاب وقرآن مبين)",
  "106- الحجر: (ربما يود الذين كفروا لو كانوا مسلمين)",
  "107- الحجر: (ونبئهم عن ضيف إبراهيم)",
  "108- النحل: (أتى أمر الله فلا تستعجلوه)",
  "109- النحل: (وإن لكم في الأنعام لعبرة)",
  "110- النحل: (وضرب الله مثلاً رجلين أحدهما أبكم)",
  "111- النحل: (إن الله يأمر بالعدل والإحسان)",
  "112- النحل: (يوم تأتي كل نفس تجادل عن نفسها)",
  "113- الإسراء: (سبحان الذي أسرى بعبده ليلاً)",
  "114- الإسراء: (وإذ قلنا لك إن ربك أحاط بالناس)",
  "115- الإسراء: (ولقد كرمنا بني آدم)",
  "116- الإسراء: (وقل جاء الحق وزهق الباطل)",
  "117- الكهف: (الحمد لله الذي أنزل على عبده الكتاب)",
  "118- الكهف: (واضرب لهم مثلاً رجلين جعلنا لأحدهما)",
  "119- الكهف: (وإذ قال موسى لفتاه لا أبرح حتى)",
  "120- الكهف: (قال ألم أقل لك إنك لن تستطيع معي صبراً)",
  "121- الكهف: (يسألونك عن ذي القرنين قل سأتلوا عليكم)",
  "122- مريم: (كهيعص * ذكر رحمت ربك عبده زكريا)",
  "123- مريم: (واذكر في الكتاب مريم إذ انتبذت)",
  "124- مريم: (فلما اعتزلهم وما يعبدون من دون الله)",
  "125- طه: (طه)",
  "126- طه: (منها خلقناكم وفيها نعيدكم ومنها نخرجكم تارة أخرى)",
  "127- طه: (وما أعجلك عن قومك يا موسى)",
  "128- طه: (وعنت الوجوه للحي القيوم)",
  "129- الأنبياء: (اقترب للناس حسابهم وهم في غفلة)",
  "130- الأنبياء: (إن الذين سبقت لهم منا الحسنى)",
  "131- الأنبياء: (واذكر أخا عاد إذ أنذر قومه بالأحقاف)",
  "132- الأنبياء: (اقترب للناس حسابهم - يتبع)",
  "133- الحج: (يا أيها الناس اتقوا ربكم إن زلزلة الساعة)",
  "134- الحج: (إن الله يدخل الذين آمنوا وعملوا الصالحات)",
  "135- الحج: (ألم تر أن الله يسجد له من في السماوات)",
  "136- الحج: (ذلك ومن يعظم حرمات الله فهو خير له)",
  "137- المؤمنون: (قد أفلح المؤمنون الذين هم في صلاتهم)",
  "138- المؤمنون: (ثم أرسلنا رسلنا تترى كلما جاء أمة)",
  "139- المؤمنون: (وقل رب أعوذ بك من همزات الشياين)",
  "140- النور: (سورة أنزلناها وفرضناها وأنزلنا فيها)",
  "141- النور: (الله نور السماوات والأرض مثل نوره)",
  "142- النور: (ألم تر أن الله يسبح له من في السماوات)",
  "143- النور: (وعد الله الذين آمنوا منكم وعملوا الصالحات)",
  "144- الفرقان: (تبارك الذي نزل الفرقان على عبده)",
  "145- الفرقان: (وقال الذين لا يرجون لقاءنا لولا أنزل)",
  "146- الفرقان: (وهو الذي مرج البحرين هذا عذب فرات)",
  "147- الفرقان: (وعباد الرحمن الذين يمشون على الأرض)",
  "148- الشعراء: (طسم * تلك آيات الكتاب المبين)",
  "149- الشعراء: (وإذ نادى ربك موسى أن ائت القوم)",
  "150- الشعراء: (كذبت قوم نوح المرسلين)",
  "151- النمل: (طس تلك آيات القرآن وكتاب مبين)",
  "152- النمل: (وإذ قال موسى لأهله إني آنست ناراً)",
  "153- النمل: (أمن خلق السماوات والأرض وأنزل لكم)",
  "154- النمل: (فلما جاءهم سليمان قال أتمدونن بمال)",
  "155- القصص: (طسم * تلك آيات الكتاب المبين)",
  "156- القصص: (نتلوا عليك من نبأ موسى وفرعون)",
  "157- القصص: (فلما قضى موسى الأجل وسار بأهله)",
  "158- القصص: (إنما أوتيته على علم عندي أولم يعلم)",
  "159- العنكبوت: (الم * أحسب الناس أن يتركوا أن يقولوا)",
  "160- العنكبوت: (ولا تجادلوا أهل الكتاب إلا بالتي هي)",
  "161- العنكبوت: (اتل ما أوحي إليك من الكتاب وأقم)",
  "162- الروم: (الم * غلبت الروم في أدنى الأرض)",
  "163- الروم: (ومن آياته أن خلقكم من تراب ثم إذا)",
  "164- الروم: (فاصبر إن وعد الله حق ولا يستخفنك)",
  "165- لقمان: (الم تلك آيات الكتاب الحكيم)",
  "166- السجدة: (الم تنزيل الكتاب لا ريب فيه من رب)",
  "167- الأحزاب: (يا أيها النبي اتق الله ولا تطع الكافرين)",
  "168- الأحزاب: (يا أيها الذين آمنوا اذكروا الله ذكراً كثيراً)",
  "169- الأحزاب: (ومن يقنت منكن لله ورسوله وتعمل صالحاً)",
  "170- الأحزاب: (يا أيها النبي إنا أرسلناك شاهداً ومبشراً)",
  "171- الأحزاب: (لقد كان لكم في رسول الله أسوة حسنة)",
  "172- سبأ: (الحمد لله الذي له ما في السماوات وما في)",
  "173- سبأ: (ويرى الذين أوتوا العلم الذي أنزل إليك)",
  "174- فاطر: (الحمد لله فاطر السماوات والأرض جاعل)",
  "175- يس: (يس * والقرآن الحكيم * إنك لمن المرسلين)",
  "176- يس: (وجاء من أقصى المدينة رجل يسعى قال يا قوم)",
  "177- يس: (ألم تروا أن الله سخر لكم ما في السماوات)",
  "178- يس: (وما أنزلنا على قومه من بعده من جند من السماء)",
  "179- الصافات: (والصافات صفاً * فالزاجرات زجراً)",
  "180- الصافات: (فليعرضوا عن ذكر الله إنهم كاذبون)",
  "181- ص: (ص والقرآن ذي الذكر * بل الذين كفروا)",
  "182- ص: (واذكر عبدنا إبراهيم وإسحاق ويعقوب)",
  "183- الزمر: (تنزيل الكتاب من الله العزيز الحكيم)",
  "184- الزمر: (قل يا عبادي الذين أسرفوا على أنفسهم)",
  "185- الزمر: (فمن أظلم ممن كذب على الله وكذب بالصدق)",
  "186- الزمر: (وسيق الذين اتقوا ربهم إلى الجنة زمراً)",
  "187- غافر: (حم * تنزيل الكتاب من الله العزيز العليم)",
  "188- غافر: (الذين يحملون العرش ومن حوله يسبحون)",
  "189- غافر: (وقال رجل مؤمن من آل فرعون يكتم إيمانه)",
  "190- غافر: (فلم يك ينفعهم إيمانهم لما رأوا بأسنا)",
  "191- فصلت: (حم * تنزيل من الرحمن الرحيم)",
  "192- فصلت: (إن الذين قالوا ربنا الله ثم استقاموا)",
  "193- فصلت: (إليه يرد علم الساعة وما تخرج من ثمرات)",
  "194- الشورى: (حم * عسق * كذلك يوحي إليك وإلى)",
  "195- الشورى: (ولو بسط الله الرزق لعباده لبغوا في الأرض)",
  "196- الزخرف: (حم * والكتاب المبين * إنا جعلناه قرآناً)",
  "197- الزخرف: (ولما ضرب ابن مريم مثلاً إذا قومك منه)",
  "198- الدخان: (حم * والكتاب المبين * إنا أنزلناه في ليلة)",
  "199- الجاثية: (حم * تنزيل الكتاب من الله العزيز الحكيم)",
  "200- الجاثية: (هذا بصائر للناس وهدى ورحمة لقوم)",
  "201- الأحقاف: (حم * تنزيل الكتاب من الله العزيز الحكيم)",
  "202- الأحقاف: (وإذ صرفنا إليك نفراً من الجن يستمعون)",
  "203- محمد: (الذين كفروا وصدوا عن سبيل الله أضل)",
  "204- محمد: (يا أيها الذين آمنوا أطيعوا الله وأطيعوا الرسول ولا تبطلوا أعمالكم)",
  "205- الفتح: (لقد رضي الله عن المؤمنين إذ يبايعونك تحت الشجرة)",
  "206- الحجرات: (يا أيها الذين آمنوا لا تقدموا بين يدي)",
  "207- الحجرات: (قالت الأعراب آمنا)",
  "208- ق: (قال قرينه ربنا ما أطغيته ولكن كان في ضلال بعيد)",
  "209- الذاريات: (قال فما خطبكم أيها المرسلون)",
  "210- الطور: (والطور * وكتاب مسطور * في رق منشور)",
  "211- النجم: (والنجم إذا هوى * ما ضل صاحبكم وما)",
  "212- القمر: (اقتربت الساعة وانشق القمر * وإن يروا آية)",
  "213- الرحمن: (الرحمن * علم القرآن * خلق الإنسان)",
  "214- الواقعة: (إذا وقعت الواقعة * ليس لوقعتها كاذبة)",
  "215- الحديد: (سبح لله ما في السماوات والأرض وهو العزيز)",
  "216- الحديد: (لقد أرسلنا رسلنا بالبينات وأنزلنا معهم)",
  "217- المجادلة: (قد سمع الله قول التي تجادلك في زوجها)",
  "218- الحشر: (سبح لله ما في السماوات وما في الأرض وهو)",
  "219- الممتحنة: (يا أيها الذين آمنوا لا تتخذوا عدوي وعدوكم)",
  "220- الصف: (سبح لله ما في السماوات وما في الأرض وهو)",
  "221- الجمعة: (يسبح لله ما في السماوات وما في الأرض الملك)",
  "222- المنافقون: (إذا جاءك المنافقون قالوا نشهد إنك)",
  "223- التغابن: (يسبح لله ما في السماوات وما في الأرض له)",
  "224- التحريم: (يا أيها النبي لم تحرم ما أحل الله لك)",
  "225- الملك: (تبارك الذي بيده الملك وهو على كل شيء)",
  "226- القلم: (ن والقلم وما يسطرون * ما أنت بنعمة ربك)",
  "227- الحاقة: (الحاقة * ما الحاقة * وما أدراك ما الحاقة)",
  "228- المعارج: (سأل سائل بعذاب واقع * للكافرين ليس له)",
  "229- الجن: (قل أوحي إلي أنه استمع نفر من الجن)",
  "230- المزمل: (يا أيها المزمل * قم الليل إلا قليلاً)",
  "231- المدثر: (يا أيها المدثر * قم فأنذر * وربك فكبر)",
  "232- القيامة: (لا أقسم بيوم القيامة * ولا أقسم بالنفس)",
  "233- النبأ: (عم يتساءلون * عن النبأ العظيم)",
  "234- النازعات: (والنازعات غرقاً * والناشطات نشطاً)",
  "235- عبس: (عبس وتولى * أن جاءه الأعمى)",
  "236- التكوير: (إذا الشمس كورت * وإذا النجوم انكدرت)",
  "237- الانفطار: (إذا السماء انفطرت * وإذا الكواكب انتثرت)",
  "238- المطففين: (ويل للمطففين * الذين إذا اكتالوا على الناس)",
  "239- الانشقاق: (إذا السماء انشقت * وأذنت لربها وحقت)",
  "240- الأعلى والغاشية والقصار (حتى الناس)"
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
