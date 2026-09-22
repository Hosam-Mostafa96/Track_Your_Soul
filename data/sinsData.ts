import { SinDefinition } from '../types';

export interface SinCategoryMeta {
  id: 'kabair' | 'tongue' | 'senses' | 'neglect' | 'custom';
  name: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const SIN_CATEGORIES: SinCategoryMeta[] = [
  {
    id: 'kabair',
    name: 'الكبائر',
    title: 'كبائر الذنوب والمهلكات',
    icon: 'Flame',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'الذنوب العظام التي توجب المقت والتوبة النصوح العاجلة'
  },
  {
    id: 'tongue',
    name: 'اللسان',
    title: 'ذنوب اللسان والكلام',
    icon: 'MessageSquareX',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'حصائد الألسن من غيبة ونميمة وكذب وفحش'
  },
  {
    id: 'senses',
    name: 'الجوارح',
    title: 'ذنوب الحواس والجوارح',
    icon: 'EyeOff',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'إطلاق البصر وسماع المحرمات والخلوات غير الشرعية'
  },
  {
    id: 'neglect',
    name: 'التقصير',
    title: 'التقصير في الفرائض والواجبات',
    icon: 'ClockAlert',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'تأخير الصلوات، التثاقل عن الفجر، وضياع الأوقات'
  },
  {
    id: 'custom',
    name: 'مخصص',
    title: 'ذنوب وزلات خاصة',
    icon: 'AlertOctagon',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    description: 'زلات وذنوب مخصصة يحددها المستخدم ويضبط وزنها'
  }
];

export const DEFAULT_SINS: SinDefinition[] = [
  // 1. الكبائر
  {
    id: 'sin_abandon_prayer',
    categoryId: 'kabair',
    name: 'ترك صلاة مفروضة حتى خرج وقتها',
    defaultPenalty: 1000,
    description: 'إضاعة الصلاة المكتوبة عمداً أعظم الموبقات بعد الشرك'
  },
  {
    id: 'sin_parents_disobey',
    categoryId: 'kabair',
    name: 'عقوق الوالدين أو قطيعة الرحم',
    defaultPenalty: 800,
    description: 'إغضاب الوالدين أو هجران الأرحام الواجب وصلها'
  },
  {
    id: 'sin_haram_income',
    categoryId: 'kabair',
    name: 'أكل مال حرام أو معاملة غير مشروعة',
    defaultPenalty: 800,
    description: 'الرشوة، الربا، أكل أموال الناس بالباطل'
  },
  {
    id: 'sin_oppression',
    categoryId: 'kabair',
    name: 'ظلم الناس أو البغي والإيذاء',
    defaultPenalty: 700,
    description: 'الظلم ظلمات يوم القيامة في الأعراض أو الأموال'
  },
  {
    id: 'sin_kabira_general',
    categoryId: 'kabair',
    name: 'كبيرة أخرى أو معصية فادحة',
    defaultPenalty: 600,
    description: 'الوقوع في حد من حدود الله تعالى يستوجب التوبة'
  },

  // 2. ذنوب اللسان
  {
    id: 'sin_gheebah',
    categoryId: 'tongue',
    name: 'الغيبة والنميمة',
    defaultPenalty: 250,
    description: 'ذكر المسلم بما يكره، أو نقل الكلام للإفساد'
  },
  {
    id: 'sin_lying',
    categoryId: 'tongue',
    name: 'الكذب وخلف الوعد',
    defaultPenalty: 300,
    description: 'عدم تحري الصدق أو التزوير وتزييف الحقائق'
  },
  {
    id: 'sin_foul_language',
    categoryId: 'tongue',
    name: 'السب أو الشتم أو اللعن',
    defaultPenalty: 200,
    description: 'بذاءة اللسان والتلفظ بما لا يرضي الله'
  },
  {
    id: 'sin_mockery',
    categoryId: 'tongue',
    name: 'السخرية والاستهزاء والتنمر',
    defaultPenalty: 150,
    description: 'احتقار المسلم والضحك على عيوبه'
  },
  {
    id: 'sin_idle_talk',
    categoryId: 'tongue',
    name: 'الخوض في الباطل والجدال العقيم',
    defaultPenalty: 100,
    description: 'إضاعة المجالس في اللغو والكلام المحرم أو المشبوه'
  },

  // 3. ذنوب الجوارح والحواس
  {
    id: 'sin_unlawful_gaze',
    categoryId: 'senses',
    name: 'إطلاق البصر في المحرمات (شاشات/شارع)',
    defaultPenalty: 200,
    description: 'خيانة الأعين، والنظر إلى ما حرم الله تعالى'
  },
  {
    id: 'sin_unlawful_hearing',
    categoryId: 'senses',
    name: 'استماع المحرمات (موسيقى/غيبة/فحش)',
    defaultPenalty: 150,
    description: 'تلويث الأسماع بما يصد عن ذكر الله والقرآن'
  },
  {
    id: 'sin_khalwa_chat',
    categoryId: 'senses',
    name: 'محادثات أو خلوات غير شرعية',
    defaultPenalty: 350,
    description: 'الاستدراج في محادثات محرّمة تكسر حاجز الحياء'
  },
  {
    id: 'sin_screen_sin',
    categoryId: 'senses',
    name: 'الاستغراق في ذنوب الشاشات والإنترنت',
    defaultPenalty: 250,
    description: 'تصفح المواقع المشبوهة أو متابعة الحسابات الفاسقة'
  },

  // 4. التقصير في الفرائض والواجبات
  {
    id: 'sin_fajr_missed',
    categoryId: 'neglect',
    name: 'التثاقل عن صلاة الفجر حتى طلوع الشمس',
    defaultPenalty: 300,
    description: 'النوم عن الفريضة والاستهانة بالاستيقاظ لها'
  },
  {
    id: 'sin_prayer_delayed',
    categoryId: 'neglect',
    name: 'تأخير الصلاة عن وقتها المختار كسلاً',
    defaultPenalty: 200,
    description: 'المماطلة حتى يضيق وقت الفريضة لغير عذر شرعي'
  },
  {
    id: 'sin_prayer_pecking',
    categoryId: 'neglect',
    name: 'نقر الصلاة والسهو الشديد بلا خشوع',
    defaultPenalty: 150,
    description: 'أداء الصلاة كعادات جسدية سريعة بلا روح ولا طمأنينة'
  },
  {
    id: 'sin_breach_trust',
    categoryId: 'neglect',
    name: 'إضاعة الأمانة أو الإخلال بمهام العمل والواجب',
    defaultPenalty: 250,
    description: 'التقصير الفادح في المسؤوليات والعهود والواجبات'
  },
  {
    id: 'sin_excessive_waste',
    categoryId: 'neglect',
    name: 'تضييع الساعات الطويلة في اللهو المفرط',
    defaultPenalty: 150,
    description: 'إهدار نعمة الوقت والعمر في ألعاب أو تفاهات متواصلة'
  }
];

export const getSinById = (id: string, customSins: SinDefinition[] = []): SinDefinition | undefined => {
  return DEFAULT_SINS.find(s => s.id === id) || customSins.find(s => s.id === id);
};

export const getSinPenalty = (
  sinId: string, 
  weightsPenalties?: Record<string, number>, 
  customSins: SinDefinition[] = []
): number => {
  if (weightsPenalties && typeof weightsPenalties[sinId] === 'number') {
    return weightsPenalties[sinId];
  }
  const sin = getSinById(sinId, customSins);
  return sin ? sin.defaultPenalty : 100;
};
