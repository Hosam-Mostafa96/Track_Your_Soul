export type ChangelogCategory = 'feature' | 'update' | 'fix';

export type ChangelogIconName =
  | 'sparkles'
  | 'palette'
  | 'trophy'
  | 'user'
  | 'book'
  | 'wifi'
  | 'fileText'
  | 'calendar'
  | 'scroll'
  | 'bell'
  | 'shield'
  | 'target'
  | 'heart'
  | 'activity'
  | 'smile'
  | 'compass';

export interface AppChangelogEntry {
  id: number;
  version: string;
  dateLabel: string;
  category: ChangelogCategory;
  title: string;
  message: string;
  icon: ChangelogIconName;
}

export const LAST_SEEN_CHANGELOG_KEY = 'last_seen_notification_id';

/**
 * السجل الكامل لتحديثات تطبيق "أوراد" منذ التأسيس وحتى أحدث إصدار.
 * أي إضافة جديدة بأعلى القائمة برقم id أكبر تُفعّل تلقائياً إشعار "جديد" في أيقونة الجرس ومركز الإشعارات.
 */
export const APP_CHANGELOG: AppChangelogEntry[] = [
  {
    id: 20,
    version: 'v4.5',
    dateLabel: 'التحديث الحالي',
    category: 'feature',
    title: 'سجل التحديثات التلقائي في الإشعارات',
    message:
      'أصبح مركز الإشعارات يضم السجل الكامل لتطوير التطبيق منذ انطلاقته الأولى، مع تنبيه تلقائي على زر الجرس عند إضافة أي ميزة أو تعديل جديد لتكون دائماً على اطلاع بكل جديد.',
    icon: 'sparkles',
  },
  {
    id: 19,
    version: 'v4.4',
    dateLabel: 'حديثاً',
    category: 'feature',
    title: 'تخصيص لون التميز (Accent Color)',
    message:
      'أُضيف خيار في الملف الشخصي لتغيير لون التميز للتطبيق بين الأخضر والأزرق والذهبي والبنفسجي، ليُطبَّق فوراً على الترويسة والأزرار والتبويبات والعناصر الرئيسية.',
    icon: 'palette',
  },
  {
    id: 18,
    version: 'v4.3',
    dateLabel: 'حديثاً',
    category: 'update',
    title: 'تنبيه احتساب الرتبة في قائمة المتصدرين',
    message:
      'تظهر الآن رسالة لطيفة داخل بطاقة رتبتك في المتصدرين تطلب الانتظار ٣ ثوانٍ حتى يتم احتساب ترتيبك الحالي بين المتنافسين في الطريق إلى الله.',
    icon: 'trophy',
  },
  {
    id: 17,
    version: 'v4.2',
    dateLabel: 'حديثاً',
    category: 'feature',
    title: 'عرض وتعديل بيانات المستخدم في الملف الشخصي',
    message:
      'تم إبراز حقلي الاسم والبريد الإلكتروني بوضوح في الملف الشخصي مع إتاحة تعديل الإيميل والاسم مباشرة والتحقق من صحتهما وحفظهما فوراً.',
    icon: 'user',
  },
  {
    id: 16,
    version: 'v4.1',
    dateLabel: 'حديثاً',
    category: 'update',
    title: 'اعتماد الشعار الجديد لتطبيق «أوراد»',
    message:
      'تحديث الهوية البصرية والشعار الرسمي للتطبيق في الترويسة، شاشة الترحيب، وأيقونات التثبيت على الأجهزة (PWA).',
    icon: 'sparkles',
  },
  {
    id: 15,
    version: 'v4.0',
    dateLabel: 'حديثاً',
    category: 'fix',
    title: 'إصلاح تحميل وحفظ مصحف الشمرلي والمدينة بدون إنترنت',
    message:
      'معالجة مشكلة تلف صور الصفحات المخزنة مسبقاً عبر التحقق الفعلي من بيانات الصور (PNG/JPEG) وتحديث مصادر التحميل الاحتياطية لضمان قراءة سلسة دون إنترنت.',
    icon: 'book',
  },
  {
    id: 14,
    version: 'v3.9',
    dateLabel: 'المرحلة الرابعة',
    category: 'feature',
    title: 'العمل الكامل بدون إنترنت (PWA Offline)',
    message:
      'دعم تثبيت التطبيق على الهاتف والعمل التام دون إنترنت مع تخزين صفحات المصحف والأذكار محلياً ومؤشر ذكي لحالة الاتصال.',
    icon: 'wifi',
  },
  {
    id: 13,
    version: 'v3.8',
    dateLabel: 'المرحلة الرابعة',
    category: 'feature',
    title: 'التقرير الشهري الشامل (PDF) والنسخ الاحتياطي (JSON v2)',
    message:
      'إتاحة استخراج بطاقة إنجاز شهرية قابلة للطباعة أو الحفظ كصورة، مع تصدير واستيراد نسخة احتياطية شاملة للسجلات والتدبرات والفواصل والختمات.',
    icon: 'fileText',
  },
  {
    id: 12,
    version: 'v3.7',
    dateLabel: 'المرحلة الرابعة',
    category: 'feature',
    title: 'وضع المواسم الإيمانية الذكي',
    message:
      'متابعة تلقائية لمواسم الطاعة حسب التاريخ الهجري (رمضان، العشر الأواخر، ذو الحجة، يوم عرفة، الأيام البيض، الإثنين والخميس) مع أوراد وتذكيرات مخصصة.',
    icon: 'calendar',
  },
  {
    id: 11,
    version: 'v3.6',
    dateLabel: 'المرحلة الرابعة',
    category: 'feature',
    title: 'الاحتساب التلقائي للورد من المصحف التفاعلي',
    message:
      'ربط تقليب الصفحات في المصحف الشريف مباشرة بمتتبع الورد اليومي والختمة بحيث تُسجَّل الصفحات المقروءة تلقائياً دون إدخال يدوي.',
    icon: 'book',
  },
  {
    id: 10,
    version: 'v3.5',
    dateLabel: 'المرحلة الثالثة',
    category: 'update',
    title: 'تحديث أذكار الصباح والمساء وذكر السيدة جويرية',
    message:
      'تبسيط عرض الأذكار بإزالة العناوين المكررة، إضافة زر إكمال سريع لأذكار المئة، وجمع التسبيحات في الختام مع فضل «سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته».',
    icon: 'scroll',
  },
  {
    id: 9,
    version: 'v3.4',
    dateLabel: 'المرحلة الثالثة',
    category: 'feature',
    title: 'مصحف الشمرلي والمدينة، التدبر، وسجل الختمات',
    message:
      'إطلاق قارئ المصحف بروايتي المدينة والشمرلي مع الفواصل المرجعية، قسم تدوين التدبرات القرآنية، سجل الختمات، ومتتبع الحفظ والمراجعة التكرارية.',
    icon: 'book',
  },
  {
    id: 8,
    version: 'v3.3',
    dateLabel: 'المرحلة الثالثة',
    category: 'feature',
    title: 'قلعة الإيمان، تحدي الأربعين، والأهداف الأسبوعية',
    message:
      'إضافة برامج الثبات لمدة ٤٠ يوماً، التحديات الإيمانية الجماعية، الأهداف الأسبوعية المخصصة مع بطاقة الحصاد الأسبوعي للمشاركة.',
    icon: 'shield',
  },
  {
    id: 7,
    version: 'v3.2',
    dateLabel: 'المرحلة الثانية',
    category: 'feature',
    title: 'نظام الكفارات والمهام اليومية ومؤقت العبادة',
    message:
      'إضافة جدول المهام اليومية والعادات المتكررة، نظام الكفارات بالطاعات البديلة، ومؤقت بومودورو لطلب العلم والقراءة والسبحة الإلكترونية.',
    icon: 'target',
  },
  {
    id: 6,
    version: 'v3.0',
    dateLabel: 'المرحلة الثانية',
    category: 'feature',
    title: 'إطلاق ميزة التذكير اليومي المجدول',
    message:
      'ضبط تنبيهات في أوقات محددة (صلاة الفجر، أذكار الصباح والمساء، الضحى، وورد القرآن) ليصلك إشعار متصفح دقيق مع نغمة هادئة.',
    icon: 'bell',
  },
  {
    id: 5,
    version: 'v2.5',
    dateLabel: 'المرحلة الثانية',
    category: 'feature',
    title: 'إضافة خاصية نشاط العابدين في المحراب العالمي',
    message:
      'عرض ما أنجزه المتنافسون من الطاعات مؤخراً لتحفيز الهمم، مع الحجب التام لأي تفاصيل تتعلق بالذنوب أو محاسبة النفس صوناً للستر والخصوصية.',
    icon: 'trophy',
  },
  {
    id: 4,
    version: 'v2.2',
    dateLabel: 'المرحلة الثانية',
    category: 'feature',
    title: 'ثمار القلوب: المحبة والمراقبة والتزكية',
    message:
      'إضافة مقامات «المحبة» و«الخشية والمراقبة» وأعمال القلوب إلى قسم التزكية مع خطوات عملية محددة للارتقاء بحال القلب.',
    icon: 'heart',
  },
  {
    id: 3,
    version: 'v2.0',
    dateLabel: 'المرحلة الأولى',
    category: 'feature',
    title: 'مؤشر الطمأنينة وتحليل أثر العبادة على النفس',
    message:
      'إتاحة تتبع الحالة النفسية والقلبية يومياً وربطها بمدى الالتزام بالأوراد والصلوات في مخطط تحليلي متكامل.',
    icon: 'smile',
  },
  {
    id: 2,
    version: 'v1.5',
    dateLabel: 'المرحلة الأولى',
    category: 'update',
    title: 'فلاتر ذكية في الإحصائيات ومخطط الاستمرارية',
    message:
      'إضافة فلاتر «العبء الروحي» و«تكبيرة الإحرام» و«الحالة القلبية» مع خط الهدف اليومي ومكتبة الكتب لمتابعة القراءة.',
    icon: 'activity',
  },
  {
    id: 1,
    version: 'v1.0',
    dateLabel: 'الإنشاء الأول',
    category: 'feature',
    title: 'انطلاقة تطبيق إدارة العبادات والأوراد',
    message:
      'تأسيس نواة التطبيق لمتابعة الصلوات الخمس والخشوع والسنن الرواتب، ورد القرآن، الأذكار اليومية، أوزان النقاط المخصصة، وحاسبة المواقيت وبداية اليوم الشرعي من المغرب.',
    icon: 'compass',
  },
];

export const LATEST_CHANGELOG_ID = APP_CHANGELOG.reduce(
  (maxId, item) => (item.id > maxId ? item.id : maxId),
  0
);

export const CURRENT_APP_VERSION = APP_CHANGELOG[0]?.version || 'v1.0';

export function getLastSeenChangelogId(): number {
  try {
    const raw = localStorage.getItem(LAST_SEEN_CHANGELOG_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

export function getUnreadChangelogCount(): number {
  const lastSeen = getLastSeenChangelogId();
  return APP_CHANGELOG.filter((entry) => entry.id > lastSeen).length;
}

export function markAllChangelogAsSeen(): void {
  try {
    localStorage.setItem(LAST_SEEN_CHANGELOG_KEY, String(LATEST_CHANGELOG_ID));
  } catch {
    // ignore storage issues
  }
}
