import { DailyLog, WeeklyGoalsConfig, WeeklyGoalsSummary, WeeklyGoalProgress, WeeklyWorshipGoalItem, WorshipGoalCategory } from '../types';
import { format } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';

export const WEEKLY_GOALS_STORAGE_KEY = 'worship_weekly_custom_goals_v1';

export const ARABIC_WEEKDAYS_SHORT = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export const DEFAULT_WEEKLY_GOALS: WeeklyWorshipGoalItem[] = [
  {
    id: 'congregation_prayers',
    title: 'الصلوات المفروضة في جماعة',
    category: 'prayer',
    unit: 'صلاة',
    target: 20,
    min: 5,
    max: 35,
    step: 1,
    enabled: true,
    description: 'المحافظة على أداء الصلوات المكتوبة جماعة في المسجد',
    iconName: 'Users',
    tabTarget: 'entry'
  },
  {
    id: 'sunnah_prayers',
    title: 'السنن الرواتب والمؤكدة',
    category: 'prayer',
    unit: 'صلاة',
    target: 20,
    min: 5,
    max: 35,
    step: 1,
    enabled: true,
    description: 'الحرص على أداء السنن الرواتب التابعة للصلوات',
    iconName: 'Sparkles',
    tabTarget: 'entry'
  },
  {
    id: 'qiyam_nights',
    title: 'ليالي قيام الليل والتهجد',
    category: 'nawafil',
    unit: 'ليلة',
    target: 3,
    min: 1,
    max: 7,
    step: 1,
    enabled: true,
    description: 'إحياء ليالي الأسبوع ولو بركعتين في جوف الليل والأسحار',
    iconName: 'Moon',
    tabTarget: 'entry'
  },
  {
    id: 'duha_witr_days',
    title: 'صلاة الضحى والوتر',
    category: 'nawafil',
    unit: 'يوم',
    target: 5,
    min: 1,
    max: 7,
    step: 1,
    enabled: true,
    description: 'صلاة الأوابين بالضحى وإيتار الليل قبل النوم أو بآخره',
    iconName: 'Sunrise',
    tabTarget: 'entry'
  },
  {
    id: 'quran_pages',
    title: 'تلاوة القرآن الكريم',
    category: 'quran',
    unit: 'صفحة',
    target: 70,
    min: 10,
    max: 604,
    step: 10,
    enabled: true,
    description: 'قراءة ورد ثابت من كتاب الله (70 صفحة = نحو نصف حزب يومياً أو 3.5 أجزاء)',
    iconName: 'BookOpen',
    tabTarget: 'quran'
  },
  {
    id: 'quran_hifz_revision',
    title: 'حفظ ومراجعة القرآن',
    category: 'quran',
    unit: 'ربع حزب',
    target: 7,
    min: 1,
    max: 35,
    step: 1,
    enabled: true,
    description: 'تثبيت الحفظ والمراجعة التراكمية اليومية',
    iconName: 'Bookmark',
    tabTarget: 'quran'
  },
  {
    id: 'athkar_routine',
    title: 'أذكار الصباح والمساء',
    category: 'athkar',
    unit: 'مرة',
    target: 10,
    min: 2,
    max: 14,
    step: 1,
    enabled: true,
    description: 'المحافظة على الحصن اليومي (صباحاً ومساءً - الإجمالي 14)',
    iconName: 'Sun',
    tabTarget: 'athkar'
  },
  {
    id: 'subha_tasbeeh',
    title: 'الاستغفار والتسبيح بالسبحة',
    category: 'athkar',
    unit: 'تسبيحة',
    target: 3500,
    min: 500,
    max: 50000,
    step: 500,
    enabled: true,
    description: 'عمارة الأوقات بالأذكار والتهليل والحوقلة والاستغفار',
    iconName: 'RotateCw',
    tabTarget: 'subha'
  },
  {
    id: 'fasting_days',
    title: 'صيام التطوع',
    category: 'nawafil',
    unit: 'يوم',
    target: 1,
    min: 1,
    max: 7,
    step: 1,
    enabled: true,
    description: 'صيام الإثنين أو الخميس أو الأيام البيض المستحبة',
    iconName: 'UtensilsCrossed',
    tabTarget: 'entry'
  },
  {
    id: 'knowledge_minutes',
    title: 'طلب العلم والقراءة النافعة',
    category: 'knowledge',
    unit: 'دقيقة',
    target: 90,
    min: 15,
    max: 600,
    step: 15,
    enabled: true,
    description: 'مدارسة العلوم الشرعية، الاستماع للشروح وقراءة الكتب',
    iconName: 'GraduationCap',
    tabTarget: 'library'
  },
  {
    id: 'heart_deeds',
    title: 'أعمال القلوب والتزكية',
    category: 'heart',
    unit: 'عمل قلبي',
    target: 7,
    min: 1,
    max: 35,
    step: 1,
    enabled: true,
    description: 'محاسبة النفس على الصدق، الإخلاص، الخشوع، والتوبة',
    iconName: 'Heart',
    tabTarget: 'heart'
  }
];

export interface LinkedWorshipTemplate {
  sourceType: string;
  title: string;
  category: WorshipGoalCategory;
  unit: string;
  defaultTarget: number;
  min: number;
  max: number;
  step: number;
  description: string;
  iconName: string;
  tabTarget: string;
  sourceSectionName: string; // اسم القسم في صفحة تسجيل العبادات
}

export const LINKED_WORSHIP_TEMPLATES: LinkedWorshipTemplate[] = [
  // 1. الصلوات والفرائض
  {
    sourceType: 'prayer_fajr_congregation',
    title: 'صلاة الفجر في جماعة المسجد',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'المحافظة على صلاة الصبح في بيت من بيوت الله مع المسلمين',
    iconName: 'Sunrise',
    tabTarget: 'entry',
    sourceSectionName: 'الصلوات والفرائض'
  },
  {
    sourceType: 'prayer_fajr_performed',
    title: 'أداء صلاة الفجر في وقتها',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'أداء صلاة الفجر في وقتها المشروع قبل طلوع الشمس',
    iconName: 'Sunrise',
    tabTarget: 'entry',
    sourceSectionName: 'الصلوات والفرائض'
  },
  {
    sourceType: 'prayer_all_congregation',
    title: 'مجموع الصلوات في جماعة',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 25,
    min: 5,
    max: 35,
    step: 1,
    description: 'المحافظة على الصلوات المفروضة الخمس جماعة في المسجد',
    iconName: 'Users',
    tabTarget: 'entry',
    sourceSectionName: 'الصلوات والفرائض'
  },
  {
    sourceType: 'prayer_all_fard',
    title: 'جميع الصلوات الخمس في أوقاتها',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 35,
    min: 10,
    max: 35,
    step: 1,
    description: 'إقامة الفرائض الخمس كاملة دون تفريط',
    iconName: 'CheckCircle2',
    tabTarget: 'entry',
    sourceSectionName: 'الصلوات والفرائض'
  },
  {
    sourceType: 'prayer_dhuhr_congregation',
    title: 'صلاة الظهر جماعة',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'المحافظة على فريضة الظهر جماعة',
    iconName: 'Sun',
    tabTarget: 'entry',
    sourceSectionName: 'الصلوات والفرائض'
  },
  {
    sourceType: 'prayer_asr_congregation',
    title: 'صلاة العصر جماعة',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'المحافظة على الصلاة الوسطى (العصر) جماعة',
    iconName: 'Sun',
    tabTarget: 'entry',
    sourceSectionName: 'الصلوات والفرائض'
  },
  {
    sourceType: 'prayer_maghrib_congregation',
    title: 'صلاة المغرب جماعة',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'المحافظة على صلاة المغرب جماعة بالمسجد',
    iconName: 'Moon',
    tabTarget: 'entry',
    sourceSectionName: 'الصلوات والفرائض'
  },
  {
    sourceType: 'prayer_isha_congregation',
    title: 'صلاة العشاء جماعة',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'المحافظة على صلاة العشاء جماعة (كنور تام يوم القيامة)',
    iconName: 'Moon',
    tabTarget: 'entry',
    sourceSectionName: 'الصلوات والفرائض'
  },

  // 2. السنن والرواتب والمحيطة
  {
    sourceType: 'sunnah_fajr',
    title: 'سنة الفجر القبلية (ركعتا الفجر)',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'ركعتا الفجر خير من الدنيا وما فيها',
    iconName: 'Sparkles',
    tabTarget: 'entry',
    sourceSectionName: 'السنن والرواتب'
  },
  {
    sourceType: 'sunnah_dhuhr',
    title: 'سنن الظهر القبلية والبعدية',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 14,
    step: 1,
    description: 'أربع ركعات قبل الظهر وركعتان بعدها',
    iconName: 'Sparkles',
    tabTarget: 'entry',
    sourceSectionName: 'السنن والرواتب'
  },
  {
    sourceType: 'sunnah_asr',
    title: 'سنة العصر القبلية',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'رحم الله امرأً صلى قبل العصر أربعاً',
    iconName: 'Sparkles',
    tabTarget: 'entry',
    sourceSectionName: 'السنن والرواتب'
  },
  {
    sourceType: 'sunnah_maghrib',
    title: 'سنة المغرب البعدية',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'ركعتان راتبة بعد صلاة المغرب',
    iconName: 'Sparkles',
    tabTarget: 'entry',
    sourceSectionName: 'السنن والرواتب'
  },
  {
    sourceType: 'sunnah_isha',
    title: 'سنة العشاء البعدية',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'ركعتان راتبة بعد صلاة العشاء',
    iconName: 'Sparkles',
    tabTarget: 'entry',
    sourceSectionName: 'السنن والرواتب'
  },
  {
    sourceType: 'sunnah_rawatib_total',
    title: 'مجموع السنن الرواتب المؤكدة',
    category: 'prayer',
    unit: 'صلاة',
    defaultTarget: 25,
    min: 5,
    max: 50,
    step: 1,
    description: 'اثنتا عشرة ركعة في اليوم والليلة يبني الله له بها بيتاً في الجنة',
    iconName: 'Sparkles',
    tabTarget: 'entry',
    sourceSectionName: 'السنن والرواتب'
  },
  {
    sourceType: 'sunnah_surrounding_all',
    title: 'السنن المحيطة بالصلاة',
    category: 'prayer',
    unit: 'سنة',
    defaultTarget: 25,
    min: 5,
    max: 60,
    step: 1,
    description: 'إجابة المؤذن، التبكير، الصف الأول، تكبيرة الإحرام، أذكار الصلاة، إسباغ الوضوء',
    iconName: 'Sparkles',
    tabTarget: 'entry',
    sourceSectionName: 'السنن والرواتب'
  },

  // 3. نوافل الصلاة والقيام والصيام
  {
    sourceType: 'nawafil_qiyam_nights',
    title: 'ليالي قيام الليل والتهجد',
    category: 'nawafil',
    unit: 'ليلة',
    defaultTarget: 3,
    min: 1,
    max: 7,
    step: 1,
    description: 'إحياء ليالي الأسبوع ولو بركعتين في السحر',
    iconName: 'Moon',
    tabTarget: 'entry',
    sourceSectionName: 'نوافل الصلاة والقيام'
  },
  {
    sourceType: 'nawafil_qiyam_minutes',
    title: 'دقائق قيام الليل الأسبوعية',
    category: 'nawafil',
    unit: 'دقيقة',
    defaultTarget: 120,
    min: 15,
    max: 600,
    step: 15,
    description: 'مجموع الدقائق المقضية في الصلاة والتهجد بين يدي الله ليلاً',
    iconName: 'Moon',
    tabTarget: 'entry',
    sourceSectionName: 'نوافل الصلاة والقيام'
  },
  {
    sourceType: 'nawafil_duha_days',
    title: 'صلاة الضحى (صلاة الأوابين)',
    category: 'nawafil',
    unit: 'يوم',
    defaultTarget: 5,
    min: 1,
    max: 7,
    step: 1,
    description: 'صدقة عن كل مَفصل من مفاصل الجسد',
    iconName: 'Sunrise',
    tabTarget: 'entry',
    sourceSectionName: 'نوافل الصلاة والقيام'
  },
  {
    sourceType: 'nawafil_duha_minutes',
    title: 'دقائق صلاة الضحى',
    category: 'nawafil',
    unit: 'دقيقة',
    defaultTarget: 60,
    min: 10,
    max: 300,
    step: 10,
    description: 'إطالة الركوع والسجود في صلاة الضحى',
    iconName: 'Sunrise',
    tabTarget: 'entry',
    sourceSectionName: 'نوافل الصلاة والقيام'
  },
  {
    sourceType: 'nawafil_witr_days',
    title: 'المحافظة على صلاة الوتر',
    category: 'nawafil',
    unit: 'يوم',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'إن الله وتر يحب الوتر فأوتروا يا أهل القرآن',
    iconName: 'Moon',
    tabTarget: 'entry',
    sourceSectionName: 'نوافل الصلاة والقيام'
  },
  {
    sourceType: 'nawafil_fasting_days',
    title: 'صيام التطوع (الإثنين والخميس أو البيض)',
    category: 'nawafil',
    unit: 'يوم',
    defaultTarget: 1,
    min: 1,
    max: 7,
    step: 1,
    description: 'الصيام جنة ومباعدة للوجه عن النار سبعين خريفاً',
    iconName: 'UtensilsCrossed',
    tabTarget: 'entry',
    sourceSectionName: 'نوافل الصلاة والقيام'
  },

  // 4. ورد القرآن الكريم
  {
    sourceType: 'quran_reading_rub',
    title: 'ورد القراءة والتلاوة (أرباع)',
    category: 'quran',
    unit: 'ربع حزب',
    defaultTarget: 14,
    min: 1,
    max: 100,
    step: 1,
    description: 'المداومة على التلاوة اليومية (14 ربع = ختمة في الشهر)',
    iconName: 'BookOpen',
    tabTarget: 'quran',
    sourceSectionName: 'ورد القرآن'
  },
  {
    sourceType: 'quran_hearing_rub',
    title: 'ورد السماع والإنصات القرآني',
    category: 'quran',
    unit: 'ربع حزب',
    defaultTarget: 7,
    min: 1,
    max: 60,
    step: 1,
    description: 'الاستماع الخاشع لكتاب الله وتدبر آياته',
    iconName: 'BookOpen',
    tabTarget: 'quran',
    sourceSectionName: 'ورد القرآن'
  },
  {
    sourceType: 'quran_pages',
    title: 'صفحات تلاوة القرآن المقروءة',
    category: 'quran',
    unit: 'صفحة',
    defaultTarget: 70,
    min: 10,
    max: 604,
    step: 10,
    description: 'قراءة صفحات المصحف الشريف بانتظام',
    iconName: 'BookOpen',
    tabTarget: 'quran',
    sourceSectionName: 'ورد القرآن'
  },

  // 5. الأذكار والتحصين
  {
    sourceType: 'athkar_morning',
    title: 'المحافظة على أذكار الصباح',
    category: 'athkar',
    unit: 'مرة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'حصنك الإيماني المنيع مع إشراقة كل صباح',
    iconName: 'Sun',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },
  {
    sourceType: 'athkar_evening',
    title: 'المحافظة على أذكار المساء',
    category: 'athkar',
    unit: 'مرة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'سكينة المساء وحفظ من كل سوء حتى تصبح',
    iconName: 'Moon',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },
  {
    sourceType: 'athkar_sleep',
    title: 'أذكار النوم وسورة الملك',
    category: 'athkar',
    unit: 'مرة',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'تسليم النفس لله تعالى قبل النوم وتحصين المضجع',
    iconName: 'Moon',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },
  {
    sourceType: 'athkar_travel',
    title: 'أذكار السفر والخروج',
    category: 'athkar',
    unit: 'مرة',
    defaultTarget: 1,
    min: 1,
    max: 7,
    step: 1,
    description: 'الدعاء المأثور عند السفر وركوب الدابة',
    iconName: 'Sparkles',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },
  {
    sourceType: 'dhikr_salawat',
    title: 'الصلاة على النبي ﷺ',
    category: 'athkar',
    unit: 'تسبيحة',
    defaultTarget: 1000,
    min: 100,
    max: 20000,
    step: 100,
    description: 'من صلى علي صلاة صلى الله عليه بها عشراً ويكفى همه',
    iconName: 'RotateCw',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },
  {
    sourceType: 'dhikr_istighfar',
    title: 'الاستغفار وسيد الاستغفار',
    category: 'athkar',
    unit: 'استغفار',
    defaultTarget: 1000,
    min: 100,
    max: 20000,
    step: 100,
    description: 'طوبى لمن وجد في صحيفته استغفاراً كثيراً',
    iconName: 'RotateCw',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },
  {
    sourceType: 'dhikr_hawqalah',
    title: 'الحوقلة (لا حول ولا قوة إلا بالله)',
    category: 'athkar',
    unit: 'مرة',
    defaultTarget: 500,
    min: 100,
    max: 10000,
    step: 100,
    description: 'كنز من كنوز الجنة وباب لرفع الكروب ودفع الهموم',
    iconName: 'RotateCw',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },
  {
    sourceType: 'dhikr_tahlil',
    title: 'التهليل (لا إله إلا الله)',
    category: 'athkar',
    unit: 'مرة',
    defaultTarget: 500,
    min: 100,
    max: 10000,
    step: 100,
    description: 'أفضل ما قلت أنا والنبيون من قبلي: لا إله إلا الله',
    iconName: 'RotateCw',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },
  {
    sourceType: 'dhikr_baqiyat',
    title: 'الباقيات الصالحات (التسبيح والتحميد)',
    category: 'athkar',
    unit: 'تسبيحة',
    defaultTarget: 500,
    min: 100,
    max: 10000,
    step: 100,
    description: 'سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر',
    iconName: 'RotateCw',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },
  {
    sourceType: 'athkar_total_counter',
    title: 'مجموع تسبيحات العدادات والسبحة',
    category: 'athkar',
    unit: 'تسبيحة',
    defaultTarget: 3500,
    min: 500,
    max: 50000,
    step: 500,
    description: 'تعمير الأوقات بذكر الله بالأوراد والسبحة الإلكترونية',
    iconName: 'RotateCw',
    tabTarget: 'athkar',
    sourceSectionName: 'الأذكار والتحصين'
  },

  // 6. طلب العلم والقراءة
  {
    sourceType: 'knowledge_shari_mins',
    title: 'دقائق العلم الشرعي والمدارسة',
    category: 'knowledge',
    unit: 'دقيقة',
    defaultTarget: 60,
    min: 15,
    max: 600,
    step: 15,
    description: 'سماع الدروس الشرعية وتفقه الدين وتدارس الوحيين',
    iconName: 'GraduationCap',
    tabTarget: 'entry',
    sourceSectionName: 'طلب العلم والقراءة'
  },
  {
    sourceType: 'knowledge_reading_mins',
    title: 'دقائق القراءة العامة والمطالعة',
    category: 'knowledge',
    unit: 'دقيقة',
    defaultTarget: 60,
    min: 15,
    max: 600,
    step: 15,
    description: 'تغذية العقل بالقراءة النافعة والكتب المفيدة',
    iconName: 'GraduationCap',
    tabTarget: 'entry',
    sourceSectionName: 'طلب العلم والقراءة'
  },
  {
    sourceType: 'knowledge_total_mins',
    title: 'إجمالي دقائق العلم والمطالعة',
    category: 'knowledge',
    unit: 'دقيقة',
    defaultTarget: 120,
    min: 30,
    max: 1000,
    step: 15,
    description: 'مجموع الوقت المستثمر في طلب العلم والقراءة',
    iconName: 'GraduationCap',
    tabTarget: 'entry',
    sourceSectionName: 'طلب العلم والقراءة'
  },
  {
    sourceType: 'knowledge_pages',
    title: 'عدد صفحات الكتب المقروءة',
    category: 'knowledge',
    unit: 'صفحة',
    defaultTarget: 50,
    min: 5,
    max: 500,
    step: 5,
    description: 'إنجاز القراءة في الكتب والمراجع الهادفة',
    iconName: 'GraduationCap',
    tabTarget: 'entry',
    sourceSectionName: 'طلب العلم والقراءة'
  },

  // 7. ورد الدعاء والابتهال
  {
    sourceType: 'dua_completed',
    title: 'أدعية منجزة من ورد الدعاء',
    category: 'dua',
    unit: 'دعاء',
    defaultTarget: 7,
    min: 1,
    max: 50,
    step: 1,
    description: 'اللهج بالأدعية الخاصة والمأثورة المسجلة في ورد الدعاء',
    iconName: 'Heart',
    tabTarget: 'entry',
    sourceSectionName: 'ورد الدعاء'
  },
  {
    sourceType: 'dua_days',
    title: 'أيام المحافظة على ورد الدعاء',
    category: 'dua',
    unit: 'يوم',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'صلة يومية بالدعاء والافتقار إلى الله',
    iconName: 'Heart',
    tabTarget: 'entry',
    sourceSectionName: 'ورد الدعاء'
  },

  // 8. الأعمال المخصصة
  {
    sourceType: 'custom_sunnah_all',
    title: 'إنجاز الأعمال والسنن المخصصة',
    category: 'custom',
    unit: 'عمل',
    defaultTarget: 7,
    min: 1,
    max: 50,
    step: 1,
    description: 'الصدقة، صلة الرحم، بر الوالدين، تفريج الكرب، وسائر القربات',
    iconName: 'Award',
    tabTarget: 'entry',
    sourceSectionName: 'الأعمال المخصصة'
  },

  // 9. أعمال القلوب والتزكية
  {
    sourceType: 'heart_deeds',
    title: 'أعمال القلوب والتزكية والمحاسبة',
    category: 'heart',
    unit: 'عمل',
    defaultTarget: 7,
    min: 1,
    max: 35,
    step: 1,
    description: 'مجاهدة النفس في الإخلاص، الخشوع، اليقين، والرضا',
    iconName: 'Heart',
    tabTarget: 'heart',
    sourceSectionName: 'أعمال القلوب'
  },

  // 10. المجاهدة
  {
    sourceType: 'jihad_days',
    title: 'أيام تفعيل معامل المجاهدة والمغالبة',
    category: 'heart',
    unit: 'يوم',
    defaultTarget: 3,
    min: 1,
    max: 7,
    step: 1,
    description: 'مغالبة النفس والشيطان في مواسم الفتور والمشقة',
    iconName: 'Flame',
    tabTarget: 'entry',
    sourceSectionName: 'المجاهدة ومغالبة النفس'
  },

  // 11. ساعات النوم
  {
    sourceType: 'sleep_logged_days',
    title: 'أيام تسجيل النوم والانضباط',
    category: 'heart',
    unit: 'يوم',
    defaultTarget: 7,
    min: 1,
    max: 7,
    step: 1,
    description: 'النوم المبكر وضبط ساعات الراحة للاستعانة بها على الطاعة',
    iconName: 'Moon',
    tabTarget: 'entry',
    sourceSectionName: 'ساعات النوم والراحة'
  }
];

export const PRESET_TARGETS: Record<'balanced' | 'high' | 'pacesetter', Record<string, number>> = {
  balanced: {
    congregation_prayers: 20,
    sunnah_prayers: 20,
    qiyam_nights: 3,
    duha_witr_days: 5,
    quran_pages: 70,
    quran_hifz_revision: 7,
    athkar_routine: 10,
    subha_tasbeeh: 3500,
    fasting_days: 1,
    knowledge_minutes: 90,
    heart_deeds: 7
  },
  high: {
    congregation_prayers: 28,
    sunnah_prayers: 28,
    qiyam_nights: 5,
    duha_witr_days: 7,
    quran_pages: 140,
    quran_hifz_revision: 14,
    athkar_routine: 12,
    subha_tasbeeh: 7000,
    fasting_days: 2,
    knowledge_minutes: 150,
    heart_deeds: 14
  },
  pacesetter: {
    congregation_prayers: 35,
    sunnah_prayers: 35,
    qiyam_nights: 7,
    duha_witr_days: 7,
    quran_pages: 210,
    quran_hifz_revision: 21,
    athkar_routine: 14,
    subha_tasbeeh: 14000,
    fasting_days: 3,
    knowledge_minutes: 240,
    heart_deeds: 21
  }
};

export const getDefaultWeeklyGoalsConfig = (): WeeklyGoalsConfig => ({
  version: 1,
  preset: 'balanced',
  goals: DEFAULT_WEEKLY_GOALS
});

export const loadWeeklyGoalsConfig = (): WeeklyGoalsConfig => {
  try {
    const raw = localStorage.getItem(WEEKLY_GOALS_STORAGE_KEY);
    if (!raw) return getDefaultWeeklyGoalsConfig();
    const parsed = JSON.parse(raw) as WeeklyGoalsConfig;
    if (!parsed || !Array.isArray(parsed.goals)) return getDefaultWeeklyGoalsConfig();

    // Ensure all default goals exist in loaded config
    const existingIds = new Set(parsed.goals.map(g => g.id));
    const mergedGoals = [...parsed.goals];
    for (const def of DEFAULT_WEEKLY_GOALS) {
      if (!existingIds.has(def.id)) {
        mergedGoals.push(def);
      }
    }

    return {
      version: parsed.version || 1,
      preset: parsed.preset || 'custom',
      goals: mergedGoals
    };
  } catch (err) {
    console.error('Error loading weekly goals config:', err);
    return getDefaultWeeklyGoalsConfig();
  }
};

export const saveWeeklyGoalsConfig = (config: WeeklyGoalsConfig): void => {
  try {
    localStorage.setItem(WEEKLY_GOALS_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving weekly goals config:', err);
  }
};

/**
 * دالة استخراج القيمة اليومية لكل هدف من سجل اليوم
 * تدعم الأهداف الافتراضية وكافة الأهداف المخصصة المرتبطة بصفحة تسجيل العبادات
 */
export const extractGoalValueFromDailyLog = (
  goalOrId: WeeklyWorshipGoalItem | string,
  log?: DailyLog
): number => {
  if (!log) return 0;

  const key = typeof goalOrId === 'string' ? goalOrId : (goalOrId.sourceType || goalOrId.id);
  const detailId = typeof goalOrId === 'object' ? goalOrId.sourceDetailId : undefined;

  switch (key) {
    // 1. الصلوات المفروضة والجماعة
    case 'congregation_prayers':
    case 'prayer_all_congregation': {
      if (!log.prayers) return 0;
      return Object.values(log.prayers).filter(p => p.performed && p.inCongregation).length;
    }

    case 'prayer_all_fard': {
      if (!log.prayers) return 0;
      return Object.values(log.prayers).filter(p => p.performed).length;
    }

    case 'prayer_fajr_congregation': {
      return (log.prayers?.Fajr?.performed && log.prayers?.Fajr?.inCongregation) ? 1 : 0;
    }

    case 'prayer_fajr_performed': {
      return log.prayers?.Fajr?.performed ? 1 : 0;
    }

    case 'prayer_dhuhr_congregation': {
      return (log.prayers?.Dhuhr?.performed && log.prayers?.Dhuhr?.inCongregation) ? 1 : 0;
    }

    case 'prayer_asr_congregation': {
      return (log.prayers?.Asr?.performed && log.prayers?.Asr?.inCongregation) ? 1 : 0;
    }

    case 'prayer_maghrib_congregation': {
      return (log.prayers?.Maghrib?.performed && log.prayers?.Maghrib?.inCongregation) ? 1 : 0;
    }

    case 'prayer_isha_congregation': {
      return (log.prayers?.Isha?.performed && log.prayers?.Isha?.inCongregation) ? 1 : 0;
    }

    // 2. السنن والرواتب والمحيطة
    case 'sunnah_prayers':
    case 'sunnah_rawatib_total': {
      if (!log.prayers) return 0;
      const rawatibKeys = ['fajr_pre', 'dhuhr_pre', 'dhuhr_post', 'asr_pre', 'maghrib_post', 'isha_post'];
      let count = 0;
      Object.values(log.prayers).forEach(p => {
        if (p.surroundingSunnahIds) {
          p.surroundingSunnahIds.forEach(sid => {
            if (rawatibKeys.includes(sid)) count++;
          });
        }
      });
      // فحص الباقة السنية إذا لم تسجل بالمعرفات
      if (count === 0) {
        count = Object.values(log.prayers).filter(
          p => p.performed && p.internalSunnahPackage && p.internalSunnahPackage !== 'none'
        ).length;
      }
      return count;
    }

    case 'sunnah_fajr': {
      return log.prayers?.Fajr?.surroundingSunnahIds?.includes('fajr_pre') ? 1 : 0;
    }

    case 'sunnah_dhuhr': {
      const p = log.prayers?.Dhuhr;
      let c = 0;
      if (p?.surroundingSunnahIds?.includes('dhuhr_pre')) c++;
      if (p?.surroundingSunnahIds?.includes('dhuhr_post')) c++;
      return c;
    }

    case 'sunnah_asr': {
      return log.prayers?.Asr?.surroundingSunnahIds?.includes('asr_pre') ? 1 : 0;
    }

    case 'sunnah_maghrib': {
      return log.prayers?.Maghrib?.surroundingSunnahIds?.includes('maghrib_post') ? 1 : 0;
    }

    case 'sunnah_isha': {
      return log.prayers?.Isha?.surroundingSunnahIds?.includes('isha_post') ? 1 : 0;
    }

    case 'sunnah_surrounding_all': {
      if (!log.prayers) return 0;
      const rawatibKeys = ['fajr_pre', 'dhuhr_pre', 'dhuhr_post', 'asr_pre', 'maghrib_post', 'isha_post'];
      let count = 0;
      Object.values(log.prayers).forEach(p => {
        p.surroundingSunnahIds?.forEach(sid => {
          if (!rawatibKeys.includes(sid)) count++;
        });
      });
      return count;
    }

    // 3. نوافل الصلاة والقيام والصيام
    case 'qiyam_nights':
    case 'nawafil_qiyam_nights': {
      return (log.nawafil?.qiyamDuration || 0) > 0 ? 1 : 0;
    }

    case 'nawafil_qiyam_minutes': {
      return log.nawafil?.qiyamDuration || 0;
    }

    case 'nawafil_duha_days': {
      return (log.nawafil?.duhaDuration || 0) > 0 ? 1 : 0;
    }

    case 'nawafil_duha_minutes': {
      return log.nawafil?.duhaDuration || 0;
    }

    case 'nawafil_witr_days': {
      return (log.nawafil?.witrDuration || 0) > 0 ? 1 : 0;
    }

    case 'duha_witr_days': {
      const hasDuha = (log.nawafil?.duhaDuration || 0) > 0;
      const hasWitr = (log.nawafil?.witrDuration || 0) > 0;
      return (hasDuha || hasWitr) ? 1 : 0;
    }

    case 'fasting_days':
    case 'nawafil_fasting_days': {
      return log.nawafil?.fasting ? 1 : 0;
    }

    // 4. ورد القرآن الكريم
    case 'quran_pages': {
      const readPagesCount = log.quran?.readPages?.length || 0;
      const hifzPages = ((log.quran?.hifzRub || 0) + (log.quran?.revisionRub || 0)) * 4;
      return Math.max(readPagesCount, hifzPages);
    }

    case 'quran_hifz_revision': {
      return (log.quran?.hifzRub || 0) + (log.quran?.revisionRub || 0);
    }

    case 'quran_reading_rub': {
      return log.quran?.revisionRub || 0;
    }

    case 'quran_hearing_rub': {
      return log.quran?.hifzRub || 0;
    }

    // 5. الأذكار والتحصين
    case 'athkar_routine': {
      let count = 0;
      if (log.athkar?.checklists?.morning) count++;
      if (log.athkar?.checklists?.evening) count++;
      return count;
    }

    case 'athkar_morning': {
      return log.athkar?.checklists?.morning ? 1 : 0;
    }

    case 'athkar_evening': {
      return log.athkar?.checklists?.evening ? 1 : 0;
    }

    case 'athkar_sleep': {
      return log.athkar?.checklists?.sleep ? 1 : 0;
    }

    case 'athkar_travel': {
      return log.athkar?.checklists?.travel ? 1 : 0;
    }

    case 'dhikr_salawat': {
      return log.athkar?.counters?.salawat || 0;
    }

    case 'dhikr_istighfar': {
      return log.athkar?.counters?.istighfar || 0;
    }

    case 'dhikr_hawqalah': {
      return log.athkar?.counters?.hawqalah || 0;
    }

    case 'dhikr_tahlil': {
      return log.athkar?.counters?.tahlil || 0;
    }

    case 'dhikr_baqiyat': {
      return log.athkar?.counters?.baqiyat || 0;
    }

    case 'subha_tasbeeh':
    case 'athkar_total_counter': {
      if (!log.athkar?.counters) return 0;
      return Object.values(log.athkar.counters).reduce(
        (sum, v) => sum + (typeof v === 'number' ? v : 0),
        0
      );
    }

    case 'custom_dhikr_specific': {
      if (!detailId || !log.athkar?.counters) return 0;
      return log.athkar.counters[detailId] || 0;
    }

    // 6. طلب العلم والقراءة
    case 'knowledge_minutes':
    case 'knowledge_total_mins': {
      const shari = log.knowledge?.shariDuration || 0;
      const reading = log.knowledge?.readingDuration || 0;
      return shari + reading;
    }

    case 'knowledge_shari_mins': {
      return log.knowledge?.shariDuration || 0;
    }

    case 'knowledge_reading_mins': {
      return log.knowledge?.readingDuration || 0;
    }

    case 'knowledge_pages': {
      return log.knowledge?.readingPages || 0;
    }

    // 7. ورد الدعاء
    case 'dua_completed': {
      return log.duaIdsCompleted?.length || 0;
    }

    case 'dua_days': {
      return (log.duaIdsCompleted?.length || 0) > 0 ? 1 : 0;
    }

    // 8. الأعمال المخصصة
    case 'custom_sunnah_all': {
      return log.customSunnahIds?.length || 0;
    }

    case 'custom_sunnah_specific': {
      if (!detailId || !log.customSunnahIds) return 0;
      return log.customSunnahIds.includes(detailId) ? 1 : 0;
    }

    // 9. أعمال القلوب والتزكية
    case 'heart_deeds': {
      if (!log.heartStates?.deeds) return 0;
      return Object.values(log.heartStates.deeds).reduce(
        (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
        0
      );
    }

    // 10. المجاهدة
    case 'jihad_days': {
      return (log.jihadFactor || 1) > 1 ? 1 : 0;
    }

    // 11. ساعات النوم
    case 'sleep_logged_days': {
      return ((log.sleep?.hours || 0) > 0 || (log.sleep?.sessions && log.sleep.sessions.length > 0)) ? 1 : 0;
    }

    default:
      // إذا كان هدفاً مخصصاً مسجلاً مباشرة برقم العداد أو العمل
      if (log.athkar?.counters?.[key] !== undefined) {
        return log.athkar.counters[key];
      }
      if (log.customSunnahIds?.includes(key)) {
        return 1;
      }
      return 0;
  }
};

/**
 * حساب تفاصيل تقدم الأهداف الأسبوعية للأسبوع الحالي
 */
export const calculateWeeklyGoalsProgress = (
  logs: Record<string, DailyLog>,
  config: WeeklyGoalsConfig,
  currentDateStr: string
): WeeklyGoalsSummary => {
  // حساب بداية الأسبوع (الأحد) ونهايته (السبت)
  const refDate = new Date(currentDateStr.replace(/-/g, '/'));
  const dayOfWeek = refDate.getDay(); // 0: Sunday ... 6: Saturday

  const sunday = new Date(refDate);
  sunday.setDate(refDate.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  // إعداد أيام الأسبوع السبعة
  interface WeekDayItem {
    index: number;
    date: Date;
    dateStr: string;
    dayName: string;
    isToday: boolean;
    isPastOrToday: boolean;
  }

  const weekDays: WeekDayItem[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const isToday = dateStr === currentDateStr;
    const isPastOrToday = i <= dayOfWeek;
    weekDays.push({
      index: i,
      date: d,
      dateStr,
      dayName: ARABIC_WEEKDAYS_SHORT[i],
      isToday,
      isPastOrToday
    });
  }

  const daysElapsed = dayOfWeek + 1; // كم يوماً انقضى من الأسبوع (1 إلى 7)
  const enabledGoals = config.goals.filter(g => g.enabled);

  const goalsProgress: WeeklyGoalProgress[] = enabledGoals.map(goal => {
    let weekTotal = 0;
    const dailyValues = weekDays.map(wDay => {
      const dayLog = logs[wDay.dateStr];
      const val = extractGoalValueFromDailyLog(goal, dayLog);
      if (wDay.isPastOrToday) {
        weekTotal += val;
      }
      return {
        dateStr: wDay.dateStr,
        dayName: wDay.dayName,
        value: val,
        isToday: wDay.isToday,
        isPastOrToday: wDay.isPastOrToday
      };
    });

    const target = goal.target || 1;
    const percentage = Math.round((weekTotal / target) * 100);
    const remaining = Math.max(0, target - weekTotal);
    const isCompleted = weekTotal >= target;

    // وتيرة الإنجاز مقارنة باليوم المنقضي من الأسبوع
    const expectedPaceSoFar = (daysElapsed / 7) * target;
    let paceStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
    if (weekTotal >= target || weekTotal >= expectedPaceSoFar * 1.1) {
      paceStatus = 'ahead';
    } else if (weekTotal < expectedPaceSoFar * 0.75) {
      paceStatus = 'behind';
    }

    return {
      goal,
      current: weekTotal,
      target,
      percentage,
      remaining,
      isCompleted,
      dailyValues,
      paceStatus
    };
  });

  const totalGoalsCount = goalsProgress.length;
  const completedGoalsCount = goalsProgress.filter(g => g.isCompleted).length;

  const totalPercentages = goalsProgress.reduce((sum, g) => sum + Math.min(100, g.percentage), 0);
  const overallCompletionPct = totalGoalsCount > 0 ? Math.round(totalPercentages / totalGoalsCount) : 0;

  // أفضل هدف أداءً والهدف الأكثر احتياجاً للهمة
  const sortedByPct = [...goalsProgress].sort((a, b) => b.percentage - a.percentage);
  const bestPerformingGoal = sortedByPct[0];
  const mostNeededGoal = [...goalsProgress].sort((a, b) => a.percentage - b.percentage)[0];

  const weekRangeLabel = `من الأحد ${format(sunday, 'd MMMM', { locale: ar })} إلى السبت ${format(saturday, 'd MMMM', { locale: ar })}`;

  return {
    weekRangeLabel,
    sunday,
    saturday,
    daysElapsed,
    totalGoalsCount,
    completedGoalsCount,
    overallCompletionPct,
    goalsProgress,
    bestPerformingGoal,
    mostNeededGoal
  };
};
