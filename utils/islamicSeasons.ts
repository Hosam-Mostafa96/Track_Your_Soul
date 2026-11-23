import { addDays } from 'date-fns';

export const HIJRI_OFFSET_STORAGE_KEY = 'worship_hijri_offset';
export const SEASONAL_TASKS_STORAGE_KEY = 'worship_seasonal_tasks_v1';

export type HijriOffset = -1 | 0 | 1;

export interface HijriDateParts {
  day: number;
  month: number;
  year: number;
  monthNameAr: string;
  formattedAr: string;
}

export interface SeasonalTask {
  id: string;
  label: string;
  description: string;
  targetTab?: string;
}

export interface ActiveIslamicSeason {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  virtue: string;
  themeGradient: string;
  accentBg: string;
  accentText: string;
  borderColor: string;
  isFastingRecommended: boolean;
  isFastingForbidden?: boolean;
  fastingNote?: string;
  tasks: SeasonalTask[];
}

export interface UpcomingSeasonInfo {
  id: string;
  title: string;
  hijriLabel: string;
  daysLeft: number;
  badge: string;
}

export function getSavedHijriOffset(): HijriOffset {
  try {
    const raw = localStorage.getItem(HIJRI_OFFSET_STORAGE_KEY);
    if (raw === '-1') return -1;
    if (raw === '1') return 1;
  } catch {
    // ignore
  }
  return 0;
}

export function saveHijriOffset(offset: HijriOffset): void {
  try {
    localStorage.setItem(HIJRI_OFFSET_STORAGE_KEY, String(offset));
  } catch {
    // ignore
  }
}

export function getHijriDateParts(baseDate: Date = new Date(), offsetDays: HijriOffset = getSavedHijriOffset()): HijriDateParts {
  const shiftedDate = offsetDays !== 0 ? addDays(baseDate, offsetDays) : baseDate;

  try {
    const numFmt = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const arFmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const numParts = numFmt.formatToParts(shiftedDate);
    let day = 1;
    let month = 1;
    let year = 1448;
    numParts.forEach((p) => {
      if (p.type === 'day') day = parseInt(p.value, 10) || 1;
      if (p.type === 'month') month = parseInt(p.value, 10) || 1;
      if (p.type === 'year') year = parseInt(p.value.replace(/\D/g, ''), 10) || 1448;
    });

    const arParts = arFmt.formatToParts(shiftedDate);
    let dAr = '';
    let mAr = '';
    let yAr = '';
    arParts.forEach((p) => {
      if (p.type === 'day') dAr = p.value;
      if (p.type === 'month') mAr = p.value;
      if (p.type === 'year') yAr = p.value;
    });

    return {
      day,
      month,
      year,
      monthNameAr: mAr || 'رمضان',
      formattedAr: `${dAr} ${mAr} ${yAr}هـ`,
    };
  } catch {
    return {
      day: 1,
      month: 1,
      year: 1448,
      monthNameAr: 'محرم',
      formattedAr: '١ محرم ١٤٤٨هـ',
    };
  }
}

export function detectActiveSeasons(
  baseDate: Date = new Date(),
  offsetDays: HijriOffset = getSavedHijriOffset()
): { hijri: HijriDateParts; seasons: ActiveIslamicSeason[]; prepAlerts: string[] } {
  const hijri = getHijriDateParts(baseDate, offsetDays);
  const weekday = baseDate.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const { day, month } = hijri;

  const seasons: ActiveIslamicSeason[] = [];
  const prepAlerts: string[] = [];

  const isEidAlFitr = month === 10 && day === 1;
  const isEidAlAdhaOrTashreeq = month === 12 && day >= 10 && day <= 13;
  const isFastingForbiddenDay = isEidAlFitr || isEidAlAdhaOrTashreeq;

  // 1. العشر الأواخر من رمضان أو شهر رمضان المبارك
  if (month === 9 && day >= 21) {
    const isOddNight = day % 2 === 1;
    seasons.push({
      id: 'ramadan_last_ten',
      title: isOddNight ? `ليلة ${day} الوترية — العشر الأواخر` : `اليوم ${day} — العشر الأواخر من رمضان`,
      badge: isOddNight ? 'ليلة وترية مرجوة 🌟' : 'العشر الأواخر 🌙',
      subtitle: 'موسم العتق من النيران وتحرّي ليلة القدر خيرٌ من ألف شهر',
      virtue: 'قال ﷺ: «تحرّوا ليلة القدر في الوتر من العشر الأواخر من رمضان» — وكان ﷺ يشدّ مئزره ويحيي ليله.',
      themeGradient: 'from-amber-900 via-emerald-950 to-slate-950',
      accentBg: 'bg-amber-400/20',
      accentText: 'text-amber-300',
      borderColor: 'border-amber-400/40',
      isFastingRecommended: true,
      fastingNote: 'صيام فريضة شهر رمضان',
      tasks: [
        { id: 'laylatul_qadr_dua', label: 'دعاء ليلة القدر ١٠٠ مرة', description: '«اللهم إنك عفو تحب العفو فاعف عني»', targetTab: 'subha' },
        { id: 'qiyam_tahajjud', label: 'صلاة القيام والتهجد', description: 'إحياء الليل بخشوع ولو بركعات طوال', targetTab: 'entry' },
        { id: 'daily_sadaqah', label: 'صدقة يومية ولو باليسير', description: 'حتى تصادف ليلة القدر فتكون كصدقة ٨٣ عاماً', targetTab: 'tasks' },
        { id: 'quran_khatm_ward', label: 'تكثيف ورد القرآن الكريم', description: 'ختم التلاوة والتدبر في هذه الأيام الفاضلة', targetTab: 'quran' },
      ],
    });
  } else if (month === 9) {
    seasons.push({
      id: 'ramadan_month',
      title: `رمضان المبارك — اليوم ${day}`,
      badge: 'شهر القرآن 🌙',
      subtitle: 'مضاعفة الأجور وتصفيد الشياطين وباب الريان للصائمين',
      virtue: 'قال ﷺ: «من صام رمضان إيماناً واحتساباً غُفر له ما تقدم من ذنبه».',
      themeGradient: 'from-emerald-900 via-teal-900 to-emerald-950',
      accentBg: 'bg-emerald-400/20',
      accentText: 'text-emerald-200',
      borderColor: 'border-emerald-400/30',
      isFastingRecommended: true,
      fastingNote: 'صيام فريضة رمضان',
      tasks: [
        { id: 'tarawih', label: 'صلاة التراويح والقيام', description: 'من قام رمضان إيماناً واحتساباً غفر له', targetTab: 'entry' },
        { id: 'quran_juz', label: 'قراءة جزء القرآن اليومي', description: 'مدارسة كتاب الله في شهر القرآن', targetTab: 'quran' },
        { id: 'iftar_dua', label: 'الدعاء عند الإفطار', description: 'للصائم عند فطره دعوة لا تُرد', targetTab: 'athkar' },
        { id: 'suhoor_blessing', label: 'بركة السحور وتأخيره', description: 'تسحروا فإن في السحور بركة', targetTab: 'tasks' },
      ],
    });
  }

  // 2. ذو الحجة: يوم عرفة / العشر الأوائل / عيد الأضحى والتشريق
  if (month === 12 && day === 9) {
    seasons.push({
      id: 'arafah_day',
      title: 'يوم عرفة المبارك (٩ ذو الحجة)',
      badge: 'خير يوم طلعت عليه الشمس ✨',
      subtitle: 'يوم العتق من النيران والمباهاة بأهل الأرض ومضاعفة الدعاء',
      virtue: 'قال ﷺ: «صيام يوم عرفة أحتسب على الله أن يكفر السنة التي قبله والسنة التي بعده»، و«خير الدعاء دعاء يوم عرفة».',
      themeGradient: 'from-amber-800 via-orange-900 to-emerald-950',
      accentBg: 'bg-amber-300/20',
      accentText: 'text-amber-200',
      borderColor: 'border-amber-300/50',
      isFastingRecommended: true,
      fastingNote: 'صيام يوم عرفة لغير الحاج (يكفّر سنتين)',
      tasks: [
        { id: 'arafah_tahlil', label: 'ترديد ذكر يوم عرفة (١٠٠+)', description: '«لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير»', targetTab: 'subha' },
        { id: 'arafah_dua', label: 'التفرغ للدعاء قبل المغرب', description: 'استحضار الحاجات والإلحاح على الله بيقين الإجابة', targetTab: 'athkar' },
        { id: 'arafah_takbir', label: 'التكبير المقيد بعد الصلوات', description: 'من فجر عرفة إلى عصر آخر أيام التشريق', targetTab: 'subha' },
      ],
    });
  } else if (month === 12 && day >= 1 && day <= 8) {
    seasons.push({
      id: 'dhul_hijjah_ten',
      title: `عشر ذي الحجة المباركة — اليوم ${day}`,
      badge: 'أحب الأيام إلى الله 🕋',
      subtitle: 'الأيام العشر التي أقسم الله بها ولا يعدل العمل فيها جهاد',
      virtue: 'قال ﷺ: «ما من أيام العمل الصالح فيهن أحب إلى الله من هذه الأيام العشر» — فأكثروا فيهن من التهليل والتكبير والتحميد.',
      themeGradient: 'from-emerald-900 via-amber-950 to-slate-900',
      accentBg: 'bg-amber-400/20',
      accentText: 'text-amber-300',
      borderColor: 'border-amber-400/35',
      isFastingRecommended: true,
      fastingNote: 'يُستحب صيام أيام ١ إلى ٨ (وبالأخص عرفة)',
      tasks: [
        { id: 'takbir_mutlaq', label: 'التكبير والتهليل المطلق', description: 'الله أكبر الله أكبر لا إله إلا الله، الله أكبر ولله الحمد', targetTab: 'subha' },
        { id: 'nawafil_extra', label: 'المسارعة في النوافل والصدقة', description: 'اجعل كل يوم فيها أفضل مما قبله حتى عرفة', targetTab: 'entry' },
        { id: 'quran_dhulhijjah', label: 'زيادة ورد التلاوة اليومي', description: 'استثمار أفضل أيام الدنيا في كلام الله', targetTab: 'quran' },
      ],
    });
  } else if (month === 12 && day === 10) {
    seasons.push({
      id: 'eid_al_adha',
      title: 'عيد الأضحى المبارك (١٠ ذو الحجة)',
      badge: 'عيد مبارك 🐏',
      subtitle: 'يوم النحر وأعظم الأيام عند الله — يوم شكر وفرح وصلة',
      virtue: '«إن أعظم الأيام عند الله تبارك وتعالى يوم النحر ثم يوم القر».',
      themeGradient: 'from-teal-800 via-emerald-900 to-slate-900',
      accentBg: 'bg-emerald-300/20',
      accentText: 'text-emerald-200',
      borderColor: 'border-emerald-300/40',
      isFastingRecommended: false,
      isFastingForbidden: true,
      fastingNote: 'يحرم صيام يوم العيد وأيام التشريق',
      tasks: [
        { id: 'eid_takbir', label: 'التكبير المقيد والمطلق', description: 'إظهار شعيرة التكبير طوال اليوم', targetTab: 'subha' },
        { id: 'silat_rahim', label: 'صلة الرحم وإدخال السرور', description: 'معايدة الوالدين والأقارب والجيران', targetTab: 'tasks' },
      ],
    });
  } else if (month === 12 && day >= 11 && day <= 13) {
    seasons.push({
      id: 'tashreeq_days',
      title: `أيام التشريق المباركة (${day} ذو الحجة)`,
      badge: 'أيام أكل وشرب وذكر 🌿',
      subtitle: 'تُختم بها شعائر الحج بالتكبير وشكر الله على نعمه',
      virtue: 'قال ﷺ: «أيام التشريق أيام أكل وشرب وذكر لله عز وجل».',
      themeGradient: 'from-emerald-800 via-teal-900 to-slate-900',
      accentBg: 'bg-emerald-300/20',
      accentText: 'text-emerald-200',
      borderColor: 'border-emerald-300/30',
      isFastingRecommended: false,
      isFastingForbidden: true,
      fastingNote: 'لا يُصام في أيام التشريق (١١-١٣ ذو الحجة)',
      tasks: [
        { id: 'tashreeq_takbir', label: 'التكبير دُبر الصلوات المفروضة', description: 'حتى عصر اليوم الثالث عشر من ذي الحجة', targetTab: 'subha' },
        { id: 'tashreeq_dhikr', label: 'شكر الله وصلة الأرحام', description: 'ترديد دعاء: ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة', targetTab: 'athkar' },
      ],
    });
  }

  // 3. عيد الفطر والست من شوال
  if (month === 10 && day === 1) {
    seasons.push({
      id: 'eid_al_fitr',
      title: 'عيد الفطر المبارك (١ شوال)',
      badge: 'تقبل الله منا ومنكم 🎉',
      subtitle: 'يوم الجائزة والفرحة بإتمام نعمة الصيام والقيام',
      virtue: '«للصائم فرحتان يفرحهما: إذا أفطر فرح بفطره، وإذا لقي ربه فرح بصومه».',
      themeGradient: 'from-emerald-800 via-teal-900 to-amber-900',
      accentBg: 'bg-amber-300/20',
      accentText: 'text-amber-200',
      borderColor: 'border-amber-300/40',
      isFastingRecommended: false,
      isFastingForbidden: true,
      fastingNote: 'يحرم صيام يوم عيد الفطر',
      tasks: [
        { id: 'fitr_prayer', label: 'صلاة العيد والتكبير', description: 'الاغتسال والتطيب وحضور صلاة العيد', targetTab: 'tasks' },
        { id: 'fitr_silah', label: 'صلة الأرحام وتهنئة الأهل', description: 'إدخال السرور على أهل البيت والأقارب', targetTab: 'tasks' },
      ],
    });
  } else if (month === 10 && day >= 2) {
    seasons.push({
      id: 'shawwal_six',
      title: 'أيام الست من شوال',
      badge: 'أجر صيام الدهر ✨',
      subtitle: 'مواصلة العهد مع الطاعة بعد رمضان بصيام ستة أيام من شوال',
      virtue: 'قال ﷺ: «من صام رمضان ثم أتبعه ستاً من شوال كان كصيام الدهر».',
      themeGradient: 'from-teal-800 via-emerald-900 to-slate-900',
      accentBg: 'bg-teal-300/20',
      accentText: 'text-teal-200',
      borderColor: 'border-teal-300/35',
      isFastingRecommended: true,
      fastingNote: 'احتساب اليوم من الست من شوال',
      tasks: [
        { id: 'shawwal_keep_quran', label: 'المحافظة على ورد القرآن بعد رمضان', description: 'أحب الأعمال إلى الله أدومها وإن قل', targetTab: 'quran' },
        { id: 'shawwal_fasting', label: 'متابعة صيام الست من شوال', description: 'يمكن صيامها متتابعة أو متفرقة خلال الشهر', targetTab: 'entry' },
      ],
    });
  }

  // 4. محرم (تاسوعاء وعاشوراء)
  if (month === 1 && (day === 9 || day === 10 || day === 11)) {
    const label = day === 9 ? 'يوم تاسوعاء (٩ محرم)' : day === 10 ? 'يوم عاشوراء (١٠ محرم)' : 'الحادي عشر من محرم';
    seasons.push({
      id: 'ashura_season',
      title: label,
      badge: 'كفارة سنة ماضية 🌿',
      subtitle: 'يوم نجّى الله فيه موسى عليه السلام وقومه — يوم شكر وصيام',
      virtue: 'قال ﷺ: «صيام يوم عاشوراء أحتسب على الله أن يكفر السنة التي قبله»، وقال: «لئن بقيت إلى قابل لأصومن التاسع».',
      themeGradient: 'from-sky-900 via-emerald-900 to-slate-900',
      accentBg: 'bg-sky-300/20',
      accentText: 'text-sky-200',
      borderColor: 'border-sky-300/35',
      isFastingRecommended: true,
      fastingNote: day === 10 ? 'صيام عاشوراء يكفّر السنة الماضية' : 'صيام تاسوعاء أو الحادي عشر مع عاشوراء',
      tasks: [
        { id: 'ashura_fast', label: 'صيام يوم من أيام عاشوراء', description: 'اغتنام أجر تكفير ذنوب سنة كاملة', targetTab: 'entry' },
        { id: 'ashura_shukr', label: 'الذكر والحمد والتوسعة على الأهل', description: 'شكر الله على نجاة أنبيائه ونعمه', targetTab: 'athkar' },
      ],
    });
  }

  // 5. الأيام البيض (١٣، ١٤، ١٥) - باستثناء ١٣ ذي الحجة
  const isWhiteDay = (day === 13 || day === 14 || day === 15) && !(month === 12 && day === 13) && month !== 9;
  if (isWhiteDay) {
    seasons.push({
      id: 'white_days',
      title: `الأيام البيض — ${day} ${hijri.monthNameAr}`,
      badge: 'الأيام البيض 🌕',
      subtitle: 'الليالي المقمرة المباركة التي يُسنّ صيامها في منتصف كل شهر هجري',
      virtue: 'أوصى النبي ﷺ أبا هريرة رضي الله عنه بـ: «صيام ثلاثة أيام من كل شهر» — وقال: «صيام ثلاثة أيام من كل شهر صيام الدهر كله».',
      themeGradient: 'from-indigo-900 via-slate-900 to-emerald-950',
      accentBg: 'bg-indigo-300/20',
      accentText: 'text-indigo-200',
      borderColor: 'border-indigo-300/35',
      isFastingRecommended: true,
      fastingNote: 'اليوم من الأيام البيض (١٣، ١٤، ١٥ هـ)',
      tasks: [
        { id: 'white_fast', label: 'تسجيل صيام اليوم البيض', description: 'نيل أجر صيام الشهر كله بصيام ٣ أيام', targetTab: 'entry' },
        { id: 'white_qiyam', label: 'ركعتا قيام ووتر بالليل', description: 'مناجاة في الليالي المقمرة الساكنة', targetTab: 'entry' },
      ],
    });
  } else if (day === 12 && month !== 9 && month !== 12) {
    prepAlerts.push(`غداً بإذن الله أول الأيام البيض (١٣، ١٤، ١٥ ${hijri.monthNameAr}) — بيّت النية لصيام ثلاثة أيام كصيام الدهر 🌕`);
  }

  // 6. صيام الإثنين والخميس
  if ((weekday === 1 || weekday === 4) && !isFastingForbiddenDay && month !== 9) {
    const dayTitle = weekday === 1 ? 'الإثنين' : 'الخميس';
    seasons.push({
      id: `mon_thu_${weekday}`,
      title: `سنة صيام يوم ${dayTitle}`,
      badge: `عرض الأعمال (${dayTitle}) 🤲`,
      subtitle: 'تُعرض فيه الأعمال على رب العالمين — طوبى لمن عُرض عمله وهو صائم',
      virtue: 'قال ﷺ: «تُعرض الأعمال يوم الإثنين والخميس فأحب أن يُعرض عملي وأنا صائم».',
      themeGradient: 'from-emerald-900 via-cyan-950 to-slate-900',
      accentBg: 'bg-cyan-300/20',
      accentText: 'text-cyan-200',
      borderColor: 'border-cyan-300/30',
      isFastingRecommended: true,
      fastingNote: `صيام تطوع يوم ${dayTitle}`,
      tasks: [
        { id: 'mon_thu_fast', label: `صيام سنة يوم ${dayTitle}`, description: 'تبييت النية واحتساب الأجر في عرض الأعمال', targetTab: 'entry' },
        { id: 'mon_thu_istighfar', label: 'الاستغفار والذكر قبل المغرب', description: 'دعوة الصائم لا تُرد بإذن الله', targetTab: 'subha' },
      ],
    });
  } else if ((weekday === 0 || weekday === 3) && !isFastingForbiddenDay && month !== 9) {
    const tomorrowName = weekday === 0 ? 'الإثنين' : 'الخميس';
    prepAlerts.push(`تذكير: غداً يوم ${tomorrowName} — سنة صيام وتُعرض فيه الأعمال، هيّئ نيتك وسحورك 🌙`);
  }

  // 7. يوم الجمعة المبارك
  if (weekday === 5) {
    seasons.push({
      id: 'friday_sunnah',
      title: 'سنن يوم الجمعة المبارك',
      badge: 'خير يوم طلعت عليه الشمس 🕌',
      subtitle: 'عيد الأسبوع وفيه ساعة لا يوافقها عبد مسلم يسأل الله شيئاً إلا أعطاه',
      virtue: 'قال ﷺ: «من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين» وأكثروا من الصلاة على النبي ﷺ.',
      themeGradient: 'from-emerald-900 via-teal-950 to-slate-900',
      accentBg: 'bg-emerald-400/20',
      accentText: 'text-emerald-200',
      borderColor: 'border-emerald-400/35',
      isFastingRecommended: false,
      tasks: [
        { id: 'kahf', label: 'قراءة سورة الكهف', description: 'نور ما بين الجمعتين (ص ٢٩٣ في مصحف المدينة)', targetTab: 'quran' },
        { id: 'salawat_friday', label: 'الإكثار من الصلاة على النبي ﷺ (١٠٠+)', description: 'إن صلاتكم معروضة عليّ يوم الجمعة', targetTab: 'subha' },
        { id: 'friday_hour', label: 'تحرّي ساعة الإجابة قبل المغرب', description: 'آخر ساعة بعد العصر للابتهال والدعاء', targetTab: 'athkar' },
      ],
    });
  }

  // 8. شهر شعبان
  if (month === 8 && seasons.length === 0) {
    seasons.push({
      id: 'shaban_month',
      title: `شهر شعبان المبارك — اليوم ${day}`,
      badge: 'الاستعداد لرمضان 🌿',
      subtitle: 'شهر يغفل الناس عنه بين رجب ورمضان، وتُرفع فيه الأعمال إلى رب العالمين',
      virtue: 'قال ﷺ: «ذاك شهر يغفل الناس عنه بين رجب ورمضان، وهو شهر تُرفع فيه الأعمال إلى رب العالمين فأحب أن يرفع عملي وأنا صائم».',
      themeGradient: 'from-teal-900 via-emerald-950 to-slate-900',
      accentBg: 'bg-amber-300/15',
      accentText: 'text-amber-200',
      borderColor: 'border-teal-400/30',
      isFastingRecommended: true,
      fastingNote: 'يُستحب الإكثار من الصيام في شعبان',
      tasks: [
        { id: 'shaban_quran', label: 'توطين النفس على ورد القرآن', description: 'شعبان شهر القراء لتهيئة القلب قبل رمضان', targetTab: 'quran' },
        { id: 'shaban_hearts', label: 'تصفية القلب من الشحناء', description: 'استقبال المواسم بقلب سليم خالٍ من التنازع', targetTab: 'heart' },
      ],
    });
  }

  // إذا لم تصادف أي حالة موسمية خاصة، نقدم تذكيراً لطيفاً بالمحطة القادمة
  if (seasons.length === 0 && month === 1 && day > 11) {
    seasons.push({
      id: 'muharram_month',
      title: `شهر الله المحرم — اليوم ${day}`,
      badge: 'شهر الله المحرم 🌙',
      subtitle: 'أحد الأشهر الحرم وأفضل شهر للصيام بعد رمضان',
      virtue: 'قال ﷺ: «أفضل الصيام بعد رمضان شهر الله المحرم، وأفضل الصلاة بعد الفريضة صلاة الليل».',
      themeGradient: 'from-slate-900 via-emerald-950 to-slate-900',
      accentBg: 'bg-emerald-400/15',
      accentText: 'text-emerald-200',
      borderColor: 'border-emerald-500/30',
      isFastingRecommended: true,
      fastingNote: 'التنفل بالصيام في شهر الله المحرم',
      tasks: [
        { id: 'muharram_qiyam', label: 'ركعتا قيام ليل ولو قصيرتان', description: 'أفضل الصلاة بعد الفريضة صلاة الليل', targetTab: 'entry' },
      ],
    });
  }

  return { hijri, seasons, prepAlerts };
}

export function getUpcomingSeasons(
  baseDate: Date = new Date(),
  offsetDays: HijriOffset = getSavedHijriOffset()
): UpcomingSeasonInfo[] {
  const hijri = getHijriDateParts(baseDate, offsetDays);
  const { day, month } = hijri;

  const daysUntilHijri = (targetMonth: number, targetDay: number): number => {
    const currentDayIndex = (month - 1) * 29.53 + day;
    let targetDayIndex = (targetMonth - 1) * 29.53 + targetDay;
    if (targetDayIndex < currentDayIndex) {
      targetDayIndex += 354.36;
    }
    return Math.max(0, Math.round(targetDayIndex - currentDayIndex));
  };

  // Next White Day 13
  let daysToWhite = 0;
  if (day < 13) {
    daysToWhite = 13 - day;
  } else if (day <= 15) {
    daysToWhite = 0;
  } else {
    daysToWhite = Math.max(1, Math.round(29.53 - day + 13));
  }

  const upcoming: UpcomingSeasonInfo[] = [
    {
      id: 'next_white',
      title: 'الأيام البيض القادمة',
      hijriLabel: day >= 13 && day <= 15 ? 'جارية الآن' : `١٣-١٥ من الشهر`,
      daysLeft: daysToWhite,
      badge: '🌕',
    },
    {
      id: 'ramadan',
      title: 'شهر رمضان المبارك',
      hijriLabel: '١ رمضان',
      daysLeft: month === 9 ? 0 : daysUntilHijri(9, 1),
      badge: '🌙',
    },
    {
      id: 'arafah',
      title: 'يوم عرفة المبارك',
      hijriLabel: '٩ ذو الحجة',
      daysLeft: month === 12 && day === 9 ? 0 : daysUntilHijri(12, 9),
      badge: '🕋',
    },
    {
      id: 'ashura',
      title: 'يوم عاشوراء',
      hijriLabel: '١٠ محرم',
      daysLeft: month === 1 && day === 10 ? 0 : daysUntilHijri(1, 10),
      badge: '🌿',
    },
  ];

  return upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
}

export function loadSeasonalCompletedTasks(dateStr: string): string[] {
  try {
    const raw = localStorage.getItem(SEASONAL_TASKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed[dateStr]) ? parsed[dateStr] : [];
  } catch {
    return [];
  }
}

export function toggleSeasonalTask(dateStr: string, taskId: string): string[] {
  try {
    const raw = localStorage.getItem(SEASONAL_TASKS_STORAGE_KEY);
    const all: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const current = Array.isArray(all[dateStr]) ? all[dateStr] : [];
    const next = current.includes(taskId)
      ? current.filter((id) => id !== taskId)
      : [...current, taskId];
    all[dateStr] = next;
    localStorage.setItem(SEASONAL_TASKS_STORAGE_KEY, JSON.stringify(all));
    return next;
  } catch {
    return [];
  }
}
