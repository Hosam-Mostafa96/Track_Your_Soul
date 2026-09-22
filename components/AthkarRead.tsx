import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Heart, 
  Award, 
  Info,
  ChevronLeft,
  Check,
  Bed,
  Compass,
  Shield,
  NotebookPen,
  Quote,
  Share2,
  Trash2,
  History,
  X,
  Copy,
  Search,
  PenLine
} from 'lucide-react';
import { DailyLog, AthkarReflectionEntry } from '../types';
import { HisnAlMuslimSection } from './HisnAlMuslimSection';

export interface AthkarItem {
  id: string;
  text: string;
  count: number;
  virtue: string;
}

export const TRAVEL_ATHKAR: AthkarItem[] = [
  {
    id: 't_1',
    text: 'الله أكبر، الله أكبر، الله أكبر، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ.',
    count: 1,
    virtue: 'دعاء ركوب الدابة وبدء السفر؛ يورث شكر المنعم واستشعار الرجوع إلى الله.'
  },
  {
    id: 't_2',
    text: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى.',
    count: 1,
    virtue: 'سؤال الله التوفيق للطاعة وصلاح العمل أثناء المسير والغربة.'
  },
  {
    id: 't_3',
    text: 'اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الأَهْلِ.',
    count: 1,
    virtue: 'استيداع النفس والأهل والمال عند من لا تضيع ودائعه سبحانه.'
  },
  {
    id: 't_4',
    text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالأَهْلِ.',
    count: 1,
    virtue: 'استعاذة شاملة من مشقة السفر وحزنه وفجائع الأقدار.'
  },
  {
    id: 't_5',
    text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
    count: 1,
    virtue: 'يقال عند نزول أي منزل أو محطة سفر؛ حرز وأمان تام حتى يرتحل.'
  },
  {
    id: 't_6',
    text: 'آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ.',
    count: 1,
    virtue: 'دعاء الرجوع والعودة من السفر شكراً لله على تمام العافية والأوبة.'
  }
];

export const MORNING_ATHKAR: AthkarItem[] = [
  {
    id: 'm_1',
    text: 'أعوذ بالله من الشيطان الرجيم: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ..." (آية الكرسي)',
    count: 1,
    virtue: 'من قالها حين يصبح أجير من الجن حتى يمسي.'
  },
  {
    id: 'm_2',
    text: 'بسم الله الرحمن الرحيم: "قُلْ هُوَ اللَّهُ أَحَدٌ..."، "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ..."، "قُلْ أَعُوذُ بِرَبِّ النَّاسِ..."',
    count: 3,
    virtue: 'من قالها ثلاثاً حين يصبح وثلاثاً حين يمسي كفته من كل شيء.'
  },
  {
    id: 'm_3',
    text: 'أصبحتُ أُثني عليكَ حَمْداً، وأشهدُ أن لا إله إلا الله.',
    count: 3,
    virtue: 'اعتراف بالتوحيد والثناء على الله جل وعلا في أول اليوم.'
  },
  {
    id: 'm_4',
    text: 'أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، ربّ أسألك خير ما في هذا اليوم وخير ما بعده، وأعوذ بك من شر ما في هذا اليوم وشر ما بعده.',
    count: 1,
    virtue: 'طلب لخير اليوم واستعاذة من شره وصيانة للعبد.'
  },
  {
    id: 'm_5',
    text: 'اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.',
    count: 1,
    virtue: 'اعتراف بفضل الله المتجدد في الصباح بالنشور واليقظة.'
  },
  {
    id: 'm_6',
    text: 'اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت. (سيد الاستغفار)',
    count: 1,
    virtue: 'من قالها موقناً بها فمات من يومه قبل أن يمسي دخل الجنة.'
  },
  {
    id: 'm_7',
    text: 'اللهم إني أصبحت أشهدك وأشهد حملة عرشك، وملائكتك وجميع خلقك، أنك أنت الله لا إله إلا أنت وحدك لا شريك لك، وأن محمداً عبدك ورسولك.',
    count: 4,
    virtue: 'من قالها مرة أعتق الله ربعه من النار، فإن قالها أربعاً أعتقه الله بالكامل.'
  },
  {
    id: 'm_8',
    text: 'اللهم ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.',
    count: 1,
    virtue: 'من قالها حين يصبح فقد أدى شكر يومه.'
  },
  {
    id: 'm_9',
    text: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.',
    count: 7,
    virtue: 'من قالها سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة.'
  },
  {
    id: 'm_10',
    text: 'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.',
    count: 3,
    virtue: 'من قالها ثلاثاً لم يضره شيء في ذلك اليوم.'
  },
  {
    id: 'm_11',
    text: 'اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت. اللهم إني أعوذ بك من الكفر والفقر، وأعوذ بك من عذاب القبر لا إله إلا أنت.',
    count: 3,
    virtue: 'حرز وصحة وسؤال لله بالعافية في الحواس الثلاثة.'
  },
  {
    id: 'm_12',
    text: 'رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً.',
    count: 3,
    virtue: 'من قالها ثلاثاً كان حقاً على الله أن يرضيه يوم القيامة.'
  },
  {
    id: 'm_13',
    text: 'يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.',
    count: 1,
    virtue: 'دعاء وتفويض كافٍ ومصلح لكل الشئون والأنشطة اليومية.'
  },
  {
    id: 'm_14',
    text: 'أصبحنا على فطرة الإسلام وعلى كلمة الإخلاص، وعلى دين نبينا محمد صلى الله عليه وسلم، وعلى ملة أبينا إبراهيم حنيفاً مسلماً وما كان من المشركين.',
    count: 1,
    virtue: 'تأسيس الصباح على التوحيد الخالص وفطرة الإسلام السليمة.'
  },
  {
    id: 'm_15',
    text: 'سبحان الله وبحمده: عدد خلقه، ورضا نفسه، وزنة عرشه، ومداد كلماته.',
    count: 3,
    virtue: 'أجر عظيم يعادل ساعات طويلة من الذكر والتسبيح المعتاد.'
  },
  {
    id: 'm_16',
    text: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.',
    count: 10,
    virtue: 'من قالها كُتبت له مائة حسنة ومُحيت عنه مائة سيئة وكانت له حرزاً من الشيطان.'
  },
  {
    id: 'm_17',
    text: 'سبحان الله وبحمده.',
    count: 100,
    virtue: 'من قالها مائة مرة حطت خطاياه وإن كانت مثل زبد البحر.'
  },
  {
    id: 'm_18',
    text: 'اللهم صلِّ وسلِّم على نبينا محمد.',
    count: 10,
    virtue: 'استحقاق شفاعة النبي يوم القيامة (قال رسول الله ﷺ: «من صلى علي حين يصبح عشراً وحين يمسي عشراً أدركته شفاعتي يوم القيامة»).'
  }
];

export const EVENING_ATHKAR: AthkarItem[] = [
  {
    id: 'e_1',
    text: 'أعوذ بالله من الشيطان الرجيم: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ..." (آية الكرسي)',
    count: 1,
    virtue: 'من قالها حين يمسي أجير من الجن حتى يصبح.'
  },
  {
    id: 'e_2',
    text: 'بسم الله الرحمن الرحيم: "قُلْ هُوَ اللَّهُ أَحَدٌ..."، "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ..."، "قُلْ أَعُوذُ بِرَبِّ النَّاسِ..."',
    count: 3,
    virtue: 'من قالها ثلاثاً حين يمسي كفته من كل شيء.'
  },
  {
    id: 'e_3',
    text: 'أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، ربّ أسألك خير ما في هذه الليلة وخير ما بعدها، وأعوذ بك من شر ما في هذه الليلة وشر ما بعدها.',
    count: 1,
    virtue: 'طلب لخير الليلة وهدايتها واستعاذة من شرها وظلمها.'
  },
  {
    id: 'e_4',
    text: 'اللهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير.',
    count: 1,
    virtue: 'الحمد لله على إدراك المساء بسلامة بدن وإيمان.'
  },
  {
    id: 'e_5',
    text: 'اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت. (سيد الاستغفار)',
    count: 1,
    virtue: 'من قالها موقناً بها فمات من ليلته قبل أن يصبح دخل الجنة.'
  },
  {
    id: 'e_6',
    text: 'اللهم إني أمسيت أشهدك وأشهد حملة عرشك، وملائكتك وجميع خلقك، أنك أنت الله لا إله إلا أنت وحدك لا شريك لك، وأن محمداً عبدك ورسولك.',
    count: 4,
    virtue: 'من قالها أمسى يحرر رقبته من النار ربعاً بربع حتى يعتقها بالكامل.'
  },
  {
    id: 'e_7',
    text: 'اللهم ما أمسى بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.',
    count: 1,
    virtue: 'من قالها حين يمسي فقد أدى شكر ليلته.'
  },
  {
    id: 'e_8',
    text: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.',
    count: 7,
    virtue: 'يكفي العبد ما أهمه وبغمه في دنياه وأخراه.'
  },
  {
    id: 'e_9',
    text: 'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.',
    count: 3,
    virtue: 'حصن عظيم يقيك ويدفع عنك كل مكروه وحادث طارئ.'
  },
  {
    id: 'e_10',
    text: 'اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت. اللهم إني أعوذ بك من الكفر والفقر، وأعوذ بك من عذاب القبر لا إله إلا أنت.',
    count: 3,
    virtue: 'الاستعاذة من الآفات وبلايا الأبدان والقلوب والقبور.'
  },
  {
    id: 'e_11',
    text: 'رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً.',
    count: 3,
    virtue: 'جزاؤها رضا الله المتكامل والكامل للعبد يوم القيامة.'
  },
  {
    id: 'e_12',
    text: 'يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.',
    count: 1,
    virtue: 'الالتجاء الدائم لواهب الحياة والقيومية.'
  },
  {
    id: 'e_13',
    text: 'أمسينا على فطرة الإسلام وعلى كلمة الإخلاص، وعلى دين نبينا محمد صلى الله عليه وسلم، وعلى ملة أبينا إبراهيم حنيفاً مسلماً وما كان من المشركين.',
    count: 1,
    virtue: 'دوام الاستمساك بالعروة الوثقى ومناهج الأنبياء.'
  },
  {
    id: 'e_14',
    text: 'أعوذ بكلمات الله التامات من شر ما خلق.',
    count: 3,
    virtue: 'من قالها حين يمسي ثلاث مرات لم تضره حمة (سم ولدغة عقرب أو حية) في تلك الليلة.'
  },
  {
    id: 'e_15',
    text: 'سبحان الله وبحمده.',
    count: 100,
    virtue: 'حط ورفع للخطايا والسيئات مهما بلغت كثرتها.'
  },
  {
    id: 'e_16',
    text: 'اللهم صلِّ وسلِّم على نبينا محمد.',
    count: 10,
    virtue: 'استحقاق شفاعة النبي يوم القيامة (قال رسول الله ﷺ: «من صلى علي حين يصبح عشراً وحين يمسي عشراً أدركته شفاعتي يوم القيامة»).'
  }
];

export const SLEEP_ATHKAR: AthkarItem[] = [
  {
    id: 's_1',
    text: 'أعوذ بالله من الشيطان الرجيم: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ..." (آية الكرسي)',
    count: 1,
    virtue: 'من قرأها إذا أوى إلى فراشه لم يزل عليه من الله حافظ ولا يقربه شيطان حتى يصبح.'
  },
  {
    id: 's_2',
    text: 'بسم الله الرحمن الرحيم: "قُلْ هُوَ اللَّهُ أَحَدٌ..."، "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ..."، "قُلْ أَعُوذُ بِرَبِّ النَّاسِ..." (ثم يمسح بهما ما استطاع من جسده)',
    count: 3,
    virtue: 'سنة نبوية تفعل عند النوم لحفظ البدن والروح من الآفات والشرور.'
  },
  {
    id: 's_3',
    text: 'أعوذ بالله من الشيطان الرجيم: "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ..." (آخر آيتين من سورة البقرة)',
    count: 1,
    virtue: 'من قرأهما في ليلة كفتاه (أي كفتاه شرور ليلته، وقيل كفتاه عن قيام الليل).'
  },
  {
    id: 's_4',
    text: 'باسمِكَ ربِّي وضَعْتُ جَنْبي وبِكَ أَرْفَعُهُ، فإنْ أَمْسَكْتَ نَفْسي فارْحَمْها، وإنْ أَرْسَلْتَها فاحْفَظْها بما تَحْفَظُ به عِبادَكَ الصَّالِحِينَ.',
    count: 1,
    virtue: 'دعاء النوم العظيم وتفويض الروح لله حال النوم الذي هو الموتة الصغرى.'
  },
  {
    id: 's_5',
    text: 'اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا. اللَّهُمَّ إِنِّي أَسْأَلُكَ العَافِيَةَ.',
    count: 1,
    virtue: 'سؤال الله دوام العافية وحفظ النفس في اليقظة والممات.'
  },
  {
    id: 's_6',
    text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.',
    count: 3,
    virtue: 'كان النبي صلى الله عليه وسلم يقولها إذا وضع يده اليمنى تحت خده عند النوم.'
  },
  {
    id: 's_7',
    text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.',
    count: 1,
    virtue: 'إعلان الاستسلام والتوحيد باسم الله عند النوم والاستيقاظ.'
  },
  {
    id: 's_8',
    text: 'التسبيح والتحميد والتكبير عند النوم: سبحان الله (33 مرة)، الحمد لله (33 مرة)، الله أكبر (34 مرة).',
    count: 1,
    virtue: 'من قالها عند النوم كانت خيراً له من خادم، وتمنحه قوة ونشاطاً في اليوم التالي.'
  },
  {
    id: 's_9',
    text: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إلَيْكَ، وَفَوَّضْتُ أَمْرِي إلَيْكَ، وَوَجَّهْتُ وَجْهِي إلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إلَيْكَ، رَغْبَةً وَرَهْبَةً إلَيْكَ، لا مَلْجَأَ وَلا مَنْجَا مِنْكَ إلَّا إلَيْكَ، آمَنْتُ بِكِتَابِكَ الذي أَنْزَلْتَ، وَبِنَبِيِّكَ الذي أَرْسَلْتَ.',
    count: 1,
    virtue: 'من قالها ومات من ليلته مات على الفطرة، واجعلهن آخر ما تقول.'
  }
];

const REFLECTION_PROMPTS = [
  'عظمة التوحيد والملك',
  'أثر الذكر على سلوكي اليومي',
  'اعتراف بالذنب وافتقار للعفو',
  'يقين بالحفظ ورضا بالله',
  'دعاء ومناجاة مستنبطة'
];

export const ALL_ATHKAR_LIST = [
  ...MORNING_ATHKAR.map(a => ({ ...a, category: 'morning' as const, categoryLabel: 'أذكار الصباح 🌅' })),
  ...EVENING_ATHKAR.map(a => ({ ...a, category: 'evening' as const, categoryLabel: 'أذكار المساء 🌃' })),
  ...SLEEP_ATHKAR.map(a => ({ ...a, category: 'sleep' as const, categoryLabel: 'أذكار النوم 🛌' })),
  ...TRAVEL_ATHKAR.map(a => ({ ...a, category: 'travel' as const, categoryLabel: 'أذكار السفر 🚗' }))
];

interface AthkarReadProps {
  log: DailyLog;
  onUpdateLog: (log: DailyLog, activityLabel?: string, activityType?: string) => void;
}

const AthkarRead: React.FC<AthkarReadProps> = ({ log, onUpdateLog }) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening' | 'sleep' | 'travel'>('morning');
  const [showVirtues, setShowVirtues] = useState<Record<string, boolean>>({});
  
  // حالات تدبرات الأذكار
  const [openReflectionId, setOpenReflectionId] = useState<string | null>(null);
  const [reflectionInputs, setReflectionInputs] = useState<Record<string, string>>({});
  const [historyOpenId, setHistoryOpenId] = useState<string | null>(null);
  const [showAllNotebookModal, setShowAllNotebookModal] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [notebookFilter, setNotebookFilter] = useState<'all' | 'morning' | 'evening' | 'sleep' | 'travel'>('all');
  const [notebookSearch, setNotebookSearch] = useState<string>('');

  const listToUse = activeTab === 'morning' 
    ? MORNING_ATHKAR 
    : activeTab === 'evening' 
      ? EVENING_ATHKAR 
      : activeTab === 'sleep'
        ? SLEEP_ATHKAR
        : TRAVEL_ATHKAR;

  const detailedData = log.athkar.completedDetailedAthkar || {};

  const handleThikrTap = (id: string, maxCount: number) => {
    // اهتزاز خفيف للهواتف
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(15); } catch (e) {}
    }

    const currentCount = detailedData[id] || 0;
    let nextCount = currentCount + 1;
    if (nextCount > maxCount) {
      nextCount = 0; // إعادة التصفير عند تجاوز الحد الأقصى ليسهل تكراره غداً
    }

    const updatedDetailed = {
      ...detailedData,
      [id]: nextCount
    };

    // حساب نسبة الإنجاز والمساندة لتعليم قائمة الأذكار المعنية تلقائياً
    const currentList = listToUse;
    const completedCountInList = currentList.filter(item => {
      // إما مكتمل تماماً في التحديث الجديد
      if (item.id === id) return nextCount >= item.count;
      return (updatedDetailed[item.id] || 0) >= item.count;
    }).length;

    const completionRate = completedCountInList / currentList.length;

    // تحديث قائمة الصح التقليدية checklists لو أكمل أكثر من نصف القائمة تسهيلاً عليه ولربط العداد
    const updatedChecklists = { ...log.athkar.checklists };
    if (completionRate >= 0.7) {
      updatedChecklists[activeTab] = true;
    } else if (completionRate < 0.2) {
      updatedChecklists[activeTab] = false;
    }

    const updatedLog: DailyLog = {
      ...log,
      athkar: {
        ...log.athkar,
        checklists: updatedChecklists,
        completedDetailedAthkar: updatedDetailed
      }
    };

    const currentItem = currentList.find(c => c.id === id);
    const label = nextCount === maxCount 
      ? `أتم ذكر: "${currentItem?.text.slice(0, 30)}..."` 
      : undefined;

    onUpdateLog(updatedLog, label, 'athkar');
  };

  const toggleVirtue = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVirtues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAllInCurrentTab = () => {
    if (window.confirm('هل أنت متأكد من تصفير عداد أذكار هذه القائمة؟')) {
      const updatedDetailed = { ...detailedData };
      listToUse.forEach(item => {
        updatedDetailed[item.id] = 0;
      });

      const updatedChecklists = { ...log.athkar.checklists };
      updatedChecklists[activeTab] = false;

      const updatedLog: DailyLog = {
        ...log,
        athkar: {
          ...log.athkar,
          checklists: updatedChecklists,
          completedDetailedAthkar: updatedDetailed
        }
      };
      
      const tabName = activeTab === 'morning' ? 'الصباح' : (activeTab === 'evening' ? 'المساء' : (activeTab === 'sleep' ? 'النوم' : 'السفر'));
      onUpdateLog(updatedLog, `صَفّر عدادات أذكار ${tabName}`, 'athkar');
    }
  };

  const getCompletedCountFor = (list: AthkarItem[]) => {
    return list.filter(item => (detailedData[item.id] || 0) >= item.count).length;
  };

  const getCompletedCount = () => {
    return getCompletedCountFor(listToUse);
  };

  const toggleReflection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openReflectionId === id) {
      setOpenReflectionId(null);
      setHistoryOpenId(null);
    } else {
      setOpenReflectionId(id);
      setHistoryOpenId(null);
      if (reflectionInputs[id] === undefined) {
        setReflectionInputs(prev => ({
          ...prev,
          [id]: log.athkar?.reflections?.[id] || ''
        }));
      }
    }
  };

  const handleSaveReflection = (item: AthkarItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentVal = reflectionInputs[item.id] !== undefined
      ? reflectionInputs[item.id]
      : (log.athkar?.reflections?.[item.id] || '');
    const trimmed = currentVal.trim();

    if (!trimmed) {
      handleDeleteReflection(item, e);
      return;
    }

    const currentReflections = { ...(log.athkar?.reflections || {}) };
    currentReflections[item.id] = trimmed;

    const updatedLog: DailyLog = {
      ...log,
      athkar: {
        ...log.athkar,
        reflections: currentReflections
      }
    };

    // حفظ في الأرشيف الشامل عبر الأيام
    try {
      const archiveKey = 'awrad_athkar_reflections_archive';
      const existing = localStorage.getItem(archiveKey);
      const archive: AthkarReflectionEntry[] = existing ? JSON.parse(existing) : [];
      const matchIdx = archive.findIndex(a => a.athkarId === item.id && a.date === log.date);
      const entry: AthkarReflectionEntry = {
        id: matchIdx >= 0 ? archive[matchIdx].id : Math.random().toString(36).substring(2, 9),
        athkarId: item.id,
        athkarTextSnippet: item.text.slice(0, 80),
        category: activeTab,
        text: trimmed,
        date: log.date,
        timestamp: Date.now()
      };
      if (matchIdx >= 0) {
        archive[matchIdx] = entry;
      } else {
        archive.unshift(entry);
      }
      localStorage.setItem(archiveKey, JSON.stringify(archive.slice(0, 400)));
    } catch (err) {
      console.error(err);
    }

    onUpdateLog(
      updatedLog, 
      `دوّن تدبراً في ذكر: "${item.text.slice(0, 25)}..." (+15 نقطة)`, 
      'athkar'
    );

    setOpenReflectionId(null);
    setHistoryOpenId(null);
    setNotice('تم حفظ التدبر بنجاح واحتساب بركته الإيمانية (+15 نقطة) ✨');
    setTimeout(() => setNotice(null), 3500);
  };

  const handleDeleteReflection = (item: AthkarItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل تريد حذف تدبرك لهذا الذكر؟')) return;

    const currentReflections = { ...(log.athkar?.reflections || {}) };
    delete currentReflections[item.id];

    const updatedLog: DailyLog = {
      ...log,
      athkar: {
        ...log.athkar,
        reflections: currentReflections
      }
    };

    onUpdateLog(updatedLog, `حذف تدبر ذكر`, 'athkar');
    setReflectionInputs(prev => ({ ...prev, [item.id]: '' }));
    setOpenReflectionId(null);
    setHistoryOpenId(null);
    setNotice('تم حذف التدبر');
    setTimeout(() => setNotice(null), 2500);
  };

  const handleShareReflection = async (item: AthkarItem, reflectionText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `✨ وقفة تدبر مع الذكر:\n\n«${item.text}»\n\n💡 تدبري وخاطرتي:\n"${reflectionText}"\n\n— من يوميات رحلة الأوراد`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'تدبر الذكر', text: shareText });
      } catch (err) {}
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setNotice('تم نسخ الذكر مع تدبرك للحافظة بنجاح');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const getPastReflectionsForItem = (itemId: string): AthkarReflectionEntry[] => {
    try {
      const archiveKey = 'awrad_athkar_reflections_archive';
      const existing = localStorage.getItem(archiveKey);
      if (!existing) return [];
      const archive: AthkarReflectionEntry[] = JSON.parse(existing);
      return archive.filter(a => a.athkarId === itemId);
    } catch {
      return [];
    }
  };

  const getAllArchivedReflections = (): AthkarReflectionEntry[] => {
    try {
      const archiveKey = 'awrad_athkar_reflections_archive';
      const existing = localStorage.getItem(archiveKey);
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  };

  const handleInsertPrompt = (itemId: string, promptText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentVal = reflectionInputs[itemId] !== undefined 
      ? reflectionInputs[itemId] 
      : (log.athkar?.reflections?.[itemId] || '');
    const prefix = currentVal.trim() ? `${currentVal}\n• [${promptText}]: ` : `• [${promptText}]: `;
    setReflectionInputs(prev => ({ ...prev, [itemId]: prefix }));
  };

  const handleApplyPastReflection = (itemId: string, pastText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReflectionInputs(prev => ({ ...prev, [itemId]: pastText }));
    setHistoryOpenId(null);
    setNotice('تم استحضار التدبر السابق إلى الحقل');
    setTimeout(() => setNotice(null), 2500);
  };

  const todayReflections = log.athkar?.reflections || {};
  const totalReflectionsCountToday = Object.values(todayReflections).filter(t => !!t?.trim()).length;

  const handleCopyAllTodayReflections = async () => {
    const entries = Object.entries(todayReflections).filter(([_, text]) => !!text?.trim());
    if (entries.length === 0) return;

    let fullText = `📔 تدبراتي في الأوراد والأذكار اليومية (${log.date}):\n\n`;
    entries.forEach(([id, text], idx) => {
      const found = ALL_ATHKAR_LIST.find(a => a.id === id);
      const catLabel = found?.categoryLabel || 'ذكر';
      const snippet = found?.text || id;
      fullText += `[${idx + 1}] ${catLabel}\nالذكر: «${snippet}»\nالتدبر: "${text}"\n\n`;
    });
    fullText += `— من تطبيق الأوراد اليومية وإدارة العبادات`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullText);
        setNotice('تم نسخ كافة تدبرات اليوم بنجاح!');
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28 max-w-3xl mx-auto text-right" dir="rtl">
      
      {/* رأس الشاشة مع خيارات الانتقال */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${
              activeTab === 'morning' 
                ? 'bg-amber-50 text-amber-600' 
                : activeTab === 'evening' 
                  ? 'bg-slate-900 text-slate-100' 
                  : activeTab === 'sleep'
                    ? 'bg-indigo-950 text-indigo-300'
                    : 'bg-teal-900 text-teal-300'
            }`}>
              {activeTab === 'morning' ? (
                <Sun className="w-6 h-6" />
              ) : activeTab === 'evening' ? (
                <Moon className="w-6 h-6" />
              ) : activeTab === 'sleep' ? (
                <Bed className="w-6 h-6" />
              ) : (
                <Compass className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 header-font leading-tight">الأذكار والتحصين اليومي</h2>
              <p className="text-[10px] text-slate-400 font-bold header-font">تلاوتك الفردية للأذكار تمنحك درجات وتأثيراً فورياً لعلامة قلبك</p>
            </div>
          </div>
          <button 
            onClick={resetAllInCurrentTab}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl transition-all active:scale-95"
            title="تصفير عدادات القائمة بالكامل"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* أزرار التبديل الفخمة */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-6 p-1 bg-slate-50 rounded-2xl">
          <button
            onClick={() => setActiveTab('morning')}
            className={`py-4.5 rounded-xl font-bold header-font text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'morning'
                ? 'bg-white text-amber-600 shadow-md transform scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sun className={`w-4 h-4 ${activeTab === 'morning' ? 'text-amber-500 animate-spin-slow' : ''}`} />
            <span>الصباح</span>
            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-full font-mono text-slate-500">
              {`${getCompletedCountFor(MORNING_ATHKAR)}/${MORNING_ATHKAR.length}`}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('evening')}
            className={`py-4.5 rounded-xl font-bold header-font text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'evening'
                ? 'bg-slate-900 text-slate-100 shadow-lg transform scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Moon className={`w-4 h-4 ${activeTab === 'evening' ? 'text-blue-300' : ''}`} />
            <span>المساء</span>
            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
              {`${getCompletedCountFor(EVENING_ATHKAR)}/${EVENING_ATHKAR.length}`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sleep')}
            className={`py-4.5 rounded-xl font-bold header-font text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'sleep'
                ? 'bg-indigo-950 text-indigo-300 shadow-lg transform scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Bed className={`w-4 h-4 ${activeTab === 'sleep' ? 'text-indigo-300' : ''}`} />
            <span>النوم</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === 'sleep' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
              {`${getCompletedCountFor(SLEEP_ATHKAR)}/${SLEEP_ATHKAR.length}`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('travel')}
            className={`py-4.5 rounded-xl font-bold header-font text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'travel'
                ? 'bg-teal-800 text-teal-100 shadow-lg transform scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Compass className={`w-4 h-4 ${activeTab === 'travel' ? 'text-teal-300' : ''}`} />
            <span>السفر</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === 'travel' ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-500'}`}>
              {`${getCompletedCountFor(TRAVEL_ATHKAR)}/${TRAVEL_ATHKAR.length}`}
            </span>
          </button>
        </div>

        {/* شريط الإجراءات: الانتقال للحصن ومفكرة تدبرات الأذكار */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllNotebookModal(true)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black header-font flex items-center gap-1.5 transition-all border active:scale-95 shadow-2xs ${
                totalReflectionsCountToday > 0
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="استعراض مفكرة تدبرات الأذكار اليومية وتدويناتك"
            >
              <NotebookPen className="w-3.5 h-3.5 text-amber-600" />
              <span>مفكرة التدبرات ({totalReflectionsCountToday})</span>
            </button>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('hisn-al-muslim-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-black header-font flex items-center gap-1.5 transition-all border border-emerald-200/80 active:scale-95 shadow-2xs"
          >
            <span>انتقل لأدعية الحصن ({log.duaIdsCompleted?.length || 0})</span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* المؤشر العام للتقدم في هذه القائمة */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-300 animate-bounce" />
            <span className="text-xs font-black header-font">بركة وريادة الأذكار</span>
          </div>
          <span className="text-xs font-black font-mono">
            {Math.round((getCompletedCount() / listToUse.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-yellow-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${(getCompletedCount() / listToUse.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 opacity-95">
          <span className="flex items-center gap-1 font-bold">
            <NotebookPen className="w-3.5 h-3.5 text-yellow-200" />
            <span>تدبرات أذكار اليوم: {totalReflectionsCountToday} (+{Math.min(75, totalReflectionsCountToday * 15)} نقطة بركة)</span>
          </span>
          <button 
            onClick={() => setShowAllNotebookModal(true)}
            className="text-[10px] text-yellow-200 underline hover:text-white font-bold"
          >
            فتح المفكرة
          </button>
        </div>
        <p className="text-[10px] opacity-90 leading-relaxed font-bold">
          💡 <span className="underline">المعادلة الإيمانية الذكية:</span> نسبة إنجاز هذه القائمة تمنحك درجات بحد أقصى <span className="text-yellow-200 font-black">100 درجة كاملة</span> لأذكار {activeTab === 'morning' ? 'الصباح 🌅' : (activeTab === 'evening' ? 'المساء 🌃' : (activeTab === 'sleep' ? 'النوم 🛌' : 'السفر 🚗'))} بالتناسب مع ما قرأته، وبمجرد إنهائك لـ 70% من القائمة يُفعّل لك تلقائياً العداد الإيماني العام.
        </p>
      </div>

      {/* بطاقات قراءة الأذكار فرداً فرداً */}
      <div className="space-y-4">
        {listToUse.map((item, index) => {
          const countDone = detailedData[item.id] || 0;
          const isDone = countDone >= item.count;
          const virtueOpen = !!showVirtues[item.id];
          const savedReflection = log.athkar?.reflections?.[item.id] || '';
          const isEditingReflection = openReflectionId === item.id;
          const reflectionTextValue = reflectionInputs[item.id] !== undefined
            ? reflectionInputs[item.id]
            : savedReflection;
          const pastReflections = isEditingReflection ? getPastReflectionsForItem(item.id) : [];

          return (
            <div 
              key={item.id}
              onClick={() => handleThikrTap(item.id, item.count)}
              className={`bg-white rounded-3xl p-5 border transition-all duration-300 cursor-pointer hover:border-slate-300 active:scale-[0.98] relative overflow-hidden select-none tap-highlight-transparent ${
                isDone 
                  ? 'border-emerald-100 bg-emerald-50/20 shadow-sm' 
                  : 'border-slate-100 shadow-sm'
              }`}
            >
              {/* ترقيم وقفل الذكر عند الإتمام */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                  isDone ? 'bg-emerald-150 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  ذكر {index + 1}
                </span>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={(e) => toggleVirtue(item.id, e)}
                    className="p-1 px-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[10px] font-bold"
                  >
                    {virtueOpen ? 'إخفاء الفضل' : 'فضل الذكر'}
                    <ChevronDown className={`w-3 h-3 transition-transform ${virtueOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>

                  <button 
                    onClick={(e) => toggleReflection(item.id, e)}
                    className={`p-1 px-2.5 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold ${
                      savedReflection
                        ? 'bg-amber-100/90 text-amber-900 border border-amber-300 hover:bg-amber-200'
                        : isEditingReflection
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                    }`}
                    title="تدوين خواطر وتدبر إيماني حول هذا الذكر"
                  >
                    <NotebookPen className={`w-3 h-3 ${savedReflection ? 'text-amber-700' : ''}`} />
                    <span>{savedReflection ? 'تدبري مكتوب ✓' : 'تدبر الذكر'}</span>
                  </button>
                </div>
              </div>

              {/* نص الذكر الكريم */}
              <p className="text-sm font-bold text-slate-800 leading-loose text-justify font-sans px-1 pb-4">
                {item.text}
              </p>

              {/* الفضل لو مفتوح */}
              {virtueOpen && (
                <div className="mt-2 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 text-[11px] text-slate-500 leading-normal font-bold flex gap-2 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p>{item.virtue}</p>
                </div>
              )}

              {/* بطاقة عرض التدبر المحفوظ (إن وُجد ولم يكن قيد التحرير) */}
              {savedReflection && !isEditingReflection && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 mb-3 p-3.5 bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/40 rounded-2xl border border-amber-200/70 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-900 header-font">
                      <Quote className="w-3.5 h-3.5 text-amber-600 rotate-180" />
                      <span>تدبري وخاطرتي الإيمانية:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleShareReflection(item, savedReflection, e)}
                        className="text-[10px] text-amber-800 hover:text-amber-950 flex items-center gap-0.5 font-bold transition-all"
                        title="مشاركة الذكر والتدبر"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>مشاركة</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenReflectionId(item.id);
                          setReflectionInputs(prev => ({ ...prev, [item.id]: savedReflection }));
                        }}
                        className="text-[10px] bg-white/90 hover:bg-white text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-200 font-bold transition-all shadow-2xs"
                      >
                        تعديل
                      </button>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed font-sans text-slate-800 whitespace-pre-wrap select-text">
                    {savedReflection}
                  </p>
                </div>
              )}

              {/* صندوق تدوين وتحرير التدبر */}
              {isEditingReflection && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="mt-2 mb-4 p-4 bg-gradient-to-br from-slate-50 via-amber-50/40 to-slate-50 rounded-2xl border-2 border-amber-200/90 shadow-sm animate-in zoom-in-95 duration-200 space-y-3 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-950 header-font">
                      <div className="p-1 bg-amber-100 text-amber-800 rounded-lg">
                        <NotebookPen className="w-4 h-4" />
                      </div>
                      <span>وقفة تدبر مع هذا الذكر الكريم</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenReflectionId(null); setHistoryOpenId(null); }}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-all"
                      title="إغلاق التحرير"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* معينات استحضار القلب والتدبر */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400 font-bold">معينات ملهمة:</span>
                    {REFLECTION_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={(e) => handleInsertPrompt(item.id, prompt, e)}
                        className="text-[9.5px] px-2 py-0.5 bg-white hover:bg-amber-100/80 text-amber-900 rounded-full border border-amber-200/70 transition-all font-bold active:scale-95 shadow-2xs"
                      >
                        + {prompt}
                      </button>
                    ))}
                  </div>

                  {/* حقل الكتابة */}
                  <textarea
                    rows={3}
                    value={reflectionTextValue}
                    onChange={(e) => {
                      e.stopPropagation();
                      setReflectionInputs(prev => ({ ...prev, [item.id]: e.target.value }));
                    }}
                    placeholder="اكتب ما يفيض به فؤادك من معانٍ، استحضار للمقصد، عهد عملي، أو افتقار لله عند تلاوة هذا الذكر..."
                    className="w-full text-xs font-sans p-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/60 outline-hidden bg-white text-slate-800 leading-relaxed resize-none shadow-inner"
                  />

                  {/* أزرار الحفظ والإجراءات */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-100/60">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleSaveReflection(item, e)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black header-font flex items-center gap-1.5 transition-all shadow-xs active:scale-95 border border-amber-400/40"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ التدبر (+15 نقطة)</span>
                      </button>

                      {savedReflection && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteReflection(item, e)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="حذف التدبر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {pastReflections.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistoryOpenId(historyOpenId === item.id ? null : item.id);
                        }}
                        className="text-[10px] text-amber-800 hover:text-amber-950 flex items-center gap-1 font-bold underline"
                      >
                        <History className="w-3 h-3" />
                        <span>تدبرات سابقة ({pastReflections.length})</span>
                      </button>
                    )}
                  </div>

                  {/* قائمة التدبرات السابقة إن وُجدت وطُلبت */}
                  {historyOpenId === item.id && pastReflections.length > 0 && (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-amber-200 space-y-2 max-h-40 overflow-y-auto">
                      <div className="text-[10px] font-black text-amber-900 border-b pb-1">سجل تدبراتك السابقة لهذا الذكر:</div>
                      {pastReflections.map((p) => (
                        <div key={p.id} className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                            <span>{p.date}</span>
                            <button
                              type="button"
                              onClick={(e) => handleApplyPastReflection(item.id, p.text, e)}
                              className="text-amber-700 hover:underline font-bold"
                            >
                              استحضار هذا النص
                            </button>
                          </div>
                          <p className="text-slate-700 font-sans leading-relaxed">{p.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* خط التقدم الحركي والعداد */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">التكرارات المطلوبة: {item.count}</span>
                </div>
                
                {/* زر العداد التفاعلي المستدير الرائع */}
                <div className={`relative flex items-center justify-center p-1 rounded-full px-4 py-1.5 font-bold transition-all ${
                  isDone 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : countDone > 0 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {isDone ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Check className="w-4 h-4" />
                      <span>تمَّ الورد</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-black font-mono">
                      <span>{countDone} من {item.count}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* تأثير خلفية خافتة عند الإنجاز */}
              {isDone && (
                <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03] -translate-x-2 translate-y-4">
                  <CheckCircle2 className="w-36 h-36 text-emerald-800" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* قسم أدعية حصن المسلم والمناسبات الحياتية بالأسفل */}
      <div id="hisn-al-muslim-section" className="pt-4">
        <HisnAlMuslimSection log={log} onUpdateLog={onUpdateLog} />
      </div>

      {/* نافذة مفكرة تدبرات الأذكار الشاملة */}
      {showAllNotebookModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowAllNotebookModal(false)}
        >
          <div 
            className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200 text-right"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* رأس المفكرة */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-xs">
                  <NotebookPen className="w-6 h-6 text-amber-100" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black header-font leading-tight">مفكرة تدبرات الأذكار</h3>
                  <p className="text-[11px] text-amber-100/90 font-bold">خواطرك الإيمانية، فتوحات المعاني، واستحضار مقاصد الذكر</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllNotebookModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* شريط الأدوات والفلترة */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'morning', 'evening', 'sleep', 'travel'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNotebookFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      notebookFilter === cat 
                        ? 'bg-amber-600 text-white shadow-xs' 
                        : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'الكل' : cat === 'morning' ? 'الصباح 🌅' : cat === 'evening' ? 'المساء 🌃' : cat === 'sleep' ? 'النوم 🛌' : 'السفر 🚗'}
                  </button>
                ))}
              </div>

              {totalReflectionsCountToday > 0 && (
                <button
                  onClick={handleCopyAllTodayReflections}
                  className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-black header-font flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-600" />
                  <span>نسخ تدبرات اليوم</span>
                </button>
              )}
            </div>

            {/* شريط البحث */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-100 shrink-0">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                <input
                  type="text"
                  value={notebookSearch}
                  onChange={(e) => setNotebookSearch(e.target.value)}
                  placeholder="ابحث في نصوص تدبراتك أو الذكر المرتبط..."
                  className="w-full text-xs pr-9 pl-8 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-400 focus:bg-white outline-hidden font-sans"
                />
                {notebookSearch && (
                  <button 
                    onClick={() => setNotebookSearch('')} 
                    className="absolute left-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* محتوى التدبرات */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const entries = Object.entries(todayReflections)
                  .filter(([_, text]) => !!text?.trim())
                  .map(([id, text]) => {
                    const found = ALL_ATHKAR_LIST.find(a => a.id === id);
                    return {
                      id,
                      text,
                      category: found?.category || 'morning',
                      categoryLabel: found?.categoryLabel || 'أذكار',
                      athkarText: found?.text || '',
                      athkarItem: found || { id, text: '', count: 1, virtue: '' }
                    };
                  })
                  .filter(entry => {
                    if (notebookFilter !== 'all' && entry.category !== notebookFilter) return false;
                    if (notebookSearch.trim()) {
                      const q = notebookSearch.trim().toLowerCase();
                      return entry.text.toLowerCase().includes(q) || entry.athkarText.toLowerCase().includes(q);
                    }
                    return true;
                  });

                if (entries.length === 0) {
                  return (
                    <div className="text-center py-12 px-4 space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <NotebookPen className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-black text-slate-700 header-font">لا توجد تدبرات مطابقة مسجلة اليوم</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
                        اضغط على زر <span className="font-bold text-amber-800">"تدبر الذكر"</span> في بطاقة أي ذكر لتدوين فتوحات المعاني ونيل درجات التدبر المباركة (+15 نقطة لكل تدبر).
                      </p>
                    </div>
                  );
                }

                return entries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2.5 transition-all hover:bg-amber-50/70"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                        {entry.categoryLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleShareReflection(entry.athkarItem, entry.text, e)}
                          className="text-amber-800 hover:text-amber-950 flex items-center gap-1 font-bold"
                          title="مشاركة"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>مشاركة</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowAllNotebookModal(false);
                            setActiveTab(entry.category as any);
                            setOpenReflectionId(entry.id);
                            setReflectionInputs(prev => ({ ...prev, [entry.id]: entry.text }));
                          }}
                          className="text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200 hover:bg-amber-100 font-bold transition-all shadow-2xs"
                        >
                          تعديل بالبطاقة
                        </button>
                      </div>
                    </div>
                    {entry.athkarText && (
                      <p className="text-xs font-bold text-slate-700 leading-relaxed font-sans bg-white/80 p-2.5 rounded-xl border border-amber-100/70">
                        «{entry.athkarText}»
                      </p>
                    )}
                    <div className="p-3 bg-white rounded-xl border border-amber-200/70 text-slate-800 text-xs leading-relaxed font-sans whitespace-pre-wrap select-text">
                      <div className="flex items-center gap-1 text-[11px] font-black text-amber-900 mb-1 header-font">
                        <Quote className="w-3 h-3 text-amber-600 rotate-180" />
                        <span>التدبر الموثق:</span>
                      </div>
                      {entry.text}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* إشعار عائم بالحفظ والتأكيد */}
      {notice && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
};

export default AthkarRead;
