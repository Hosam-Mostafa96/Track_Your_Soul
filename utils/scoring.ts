
import { DailyLog, PrayerEntry, TranquilityLevel, AppWeights } from '../types';
import { 
  TRANQUILITY_MULTIPLIERS,
  DEFAULT_WEIGHTS
} from '../constants';
import { MORNING_ATHKAR, EVENING_ATHKAR, SLEEP_ATHKAR } from '../components/AthkarRead';
import { getSinPenalty } from '../data/sinsData';

export const calculateSinsDeduction = (log: DailyLog, weights: AppWeights = DEFAULT_WEIGHTS): number => {
  if (!log) return 0;
  // التوبة تمحو أثر الذنب في خصم الرصيد امتثالاً لحديث النبي ﷺ: «التائب من الذنب كمن لا ذنب له»
  if (log.isRepented || log.sins?.repented) {
    return 0;
  }

  let totalDeduction = 0;
  if (log.sins && Array.isArray(log.sins.entries)) {
    const customSins = weights?.customSins || [];
    const sinPenalties = weights?.sinPenalties || {};
    log.sins.entries.forEach(entry => {
      if (!entry) return;
      const penalty = entry.customPenalty 
        ?? getSinPenalty(entry.sinId, sinPenalties, customSins);
      totalDeduction += (Number(penalty) || 0) * (Number(entry.count) || 1);
    });
  }
  return isNaN(totalDeduction) ? 0 : totalDeduction;
};

export const calculatePrayerScore = (entry?: PrayerEntry, hasBurden: boolean = false, weights: AppWeights = DEFAULT_WEIGHTS) => {
  if (!entry || !entry.performed) return 0;
  
  const fardCongregation = Number(weights?.fardCongregation) || DEFAULT_WEIGHTS.fardCongregation || 2700;
  const fardSolo = Number(weights?.fardSolo) || DEFAULT_WEIGHTS.fardSolo || 100;
  const base = entry.inCongregation ? fardCongregation : fardSolo;

  // فحص دقيق لمعامل الطمأنينة لتجنب إنتاج أي قيمة NaN
  const tranqLevel = (typeof entry.tranquility === 'number' ? entry.tranquility : TranquilityLevel.MINIMUM) as TranquilityLevel;
  let tranqMult = TRANQUILITY_MULTIPLIERS[tranqLevel];
  if (typeof tranqMult !== 'number' || isNaN(tranqMult)) {
    tranqMult = 0;
  }
  if (hasBurden && tranqMult > 0) tranqMult = 0;
  
  const fardScore = base * (1 + tranqMult);
  
  const surroundingMap = weights?.surroundingSunnahs || DEFAULT_WEIGHTS.surroundingSunnahs || {};
  const sunnahRawatib = Number(weights?.sunnahRawatib) || DEFAULT_WEIGHTS.sunnahRawatib || 50;
  
  const sunnahScore = (entry.surroundingSunnahIds || []).reduce((acc, id) => {
    const weight = surroundingMap[id] !== undefined ? Number(surroundingMap[id]) : sunnahRawatib;
    return acc + (isNaN(weight) ? 0 : weight);
  }, 0);
  
  const total = fardScore + sunnahScore;
  return isNaN(total) ? 0 : Math.round(total);
};

export const calculateTotalScore = (log: DailyLog, weights: AppWeights = DEFAULT_WEIGHTS) => {
  if (!log) return 0;

  // دمج الأوزان الافتراضية لضمان عدم وجود حقول ناقصة من أجهزة المستخدمين القديمة
  const safeWeights: AppWeights = {
    ...DEFAULT_WEIGHTS,
    ...(weights || {}),
    surroundingSunnahs: {
      ...DEFAULT_WEIGHTS.surroundingSunnahs,
      ...(weights?.surroundingSunnahs || {})
    },
    sinPenalties: {
      ...(DEFAULT_WEIGHTS.sinPenalties || {}),
      ...(weights?.sinPenalties || {})
    }
  };

  const prayers = Object.values(log.prayers || {}).reduce((sum, p) => sum + calculatePrayerScore(p as PrayerEntry, log.hasBurden, safeWeights), 0);
  
  const quran = log.quran || { hifzRub: 0, revisionRub: 0, todayReps: 0, tasksCompleted: [], readPages: [] };
  const quranHifzPoints = (Number(quran.hifzRub) || 0) * (Number(safeWeights.quranHifz) || 30);
  const repsPoints = (Number(quran.todayReps) || 0) * (Number(safeWeights.quranPageRepetition) || 5);
  const manualRevisionPoints = (quran.tasksCompleted || [])
    .filter(id => id && (id.startsWith('rabt_') || id.startsWith('mur_')))
    .length * (Number(safeWeights.quranRevision) || 15);
  const revisionRubPoints = (Number(quran.revisionRub) || 0) * (Number(safeWeights.quranRevision) || 15);
  const quranTasksPoints = (quran.tasksCompleted || [])
    .filter(id => id && !id.startsWith('rabt_') && !id.startsWith('mur_')).length * 50; 
  const quranReadPagesPoints = (quran.readPages || []).length * 15; // 15 نقطة لكل صفحة مقروءة من المصحف التفاعلي
  
  const knowledgeData = log.knowledge || { shariDuration: 0, readingDuration: 0, readingPages: 0 };
  const knowledge = ((Number(knowledgeData.shariDuration) || 0) * (Number(safeWeights.knowledgeShari) || 10)) + 
                    ((Number(knowledgeData.readingDuration) || 0) * (Number(safeWeights.knowledgeGeneral) || 5)) +
                    ((Number(knowledgeData.readingPages) || 0) * (Number(safeWeights.pointsPerPage) || 20));
  
  const athkarData = log.athkar || { checklists: {}, counters: {} };
  const athkarCheck = Object.values(athkarData.checklists || {}).filter(Boolean).length * (Number(safeWeights.athkarChecklist) || 50);
  const athkarCount = Object.values(athkarData.counters || {}).reduce((sum: number, count) => sum + ((Number(count) || 0) * (Number(safeWeights.athkarCounter) || 1)), 0);
  
  // نقاط الأذكار التفصيلية المقروءة من الشاشة التفاعلية (بحد أقصى 100 لصباح كامل، و100 لمساء كامل، و100 لأذكار نوم كاملة)
  let detailedAthkarPoints = 0;
  const detailedData = log.athkar?.completedDetailedAthkar || {};
  
  if (MORNING_ATHKAR.length > 0) {
    const morningDoneCount = MORNING_ATHKAR.filter(item => (detailedData[item.id] || 0) >= item.count).length;
    detailedAthkarPoints += Math.round((morningDoneCount / MORNING_ATHKAR.length) * 100);
  }
  
  if (EVENING_ATHKAR.length > 0) {
    const eveningDoneCount = EVENING_ATHKAR.filter(item => (detailedData[item.id] || 0) >= item.count).length;
    detailedAthkarPoints += Math.round((eveningDoneCount / EVENING_ATHKAR.length) * 100);
  }

  if (SLEEP_ATHKAR.length > 0) {
    const sleepDoneCount = SLEEP_ATHKAR.filter(item => (detailedData[item.id] || 0) >= item.count).length;
    detailedAthkarPoints += Math.round((sleepDoneCount / SLEEP_ATHKAR.length) * 100);
  }

  // نقاط تدبرات الأذكار (15 نقطة لكل تدبر موثق بحد أقصى 75 نقطة)
  const athkarReflectionsCount = Object.keys(log.athkar?.reflections || {}).filter(k => !!log.athkar?.reflections?.[k]?.trim()).length;
  const athkarReflectionsPoints = Math.min(75, athkarReflectionsCount * 15);
  
  const nawafilData = log.nawafil || { duhaDuration: 0, witrDuration: 0, qiyamDuration: 0, fasting: false };
  const nawafilPrayers = ((Number(nawafilData.duhaDuration) || 0) + (Number(nawafilData.witrDuration) || 0) + (Number(nawafilData.qiyamDuration) || 0)) * (Number(safeWeights.nawafilPerMin) || 10);
  const fasting = nawafilData.fasting ? (Number(safeWeights.fastingDay) || 1500) : 0;
  
  // نقاط ورد الدعاء
  const duasPoints = (log.duaIdsCompleted || []).length * (Number(safeWeights.pointsPerDua) || 10);

  // نقاط أعمال القلوب وتزكية النفس بناءً على المهام العملية
  let heartPoints = 0;
  if (log.heartStates) {
    Object.values(log.heartStates.deeds || {}).forEach(tasks => {
      heartPoints += (tasks?.length || 0) * (Number(safeWeights.heartDeedPoint) || 200);
    });
    Object.values(log.heartStates.diseases || {}).forEach(tasks => {
      heartPoints += (tasks?.length || 0) * (Number(safeWeights.heartDeedPoint) || 200);
    });
  }

  const customSunnahPoints = (log.customSunnahIds || []).reduce((sum, id) => {
    const sunnah = (safeWeights.customSunnahs || []).find(s => s.id === id);
    return sum + (sunnah ? (Number(sunnah.points) || 0) : 0);
  }, 0);

  // نقاط التدبر القرآني (150 نقطة لكل وقفة تدبر موثقة مع نية عمل)
  const tadabburPoints = (log.tadabburNotes || []).length * 150;
  
  const jihadFactor = typeof log.jihadFactor === 'number' && !isNaN(log.jihadFactor) && log.jihadFactor > 0 ? log.jihadFactor : 1.0;
  const grossPoints = (prayers + quranHifzPoints + repsPoints + manualRevisionPoints + revisionRubPoints + quranTasksPoints + quranReadPagesPoints + knowledge + athkarCheck + athkarCount + detailedAthkarPoints + athkarReflectionsPoints + nawafilPrayers + fasting + customSunnahPoints + heartPoints + duasPoints + tadabburPoints) * jihadFactor;

  const sinsDeduction = calculateSinsDeduction(log, safeWeights);

  let finalScore = grossPoints;
  if (sinsDeduction > 0) {
    // لمنع تجميد الرصيد عند الصفر عند ارتكاب ذنب؛ نضع حداً أقصى للخصم بحيث لا يتجاوز 60% من إجمالي النقاط المكتسبة،
    // ليبقى كل تسجيل لعبادة جديدة يرفع الرصيد الروحي فعلياً ويحث العبد على مزيد من الطاعات وتجديد التوبة
    const maxAllowedDeduction = Math.round(grossPoints * 0.6);
    const effectiveDeduction = Math.min(sinsDeduction, maxAllowedDeduction);
    finalScore = Math.max(0, grossPoints - effectiveDeduction);
  } else if (log.hasBurden && !log.isRepented && !log.sins?.repented) {
    const deductionMultiplier = 1 - (((safeWeights.burdenDeduction ?? 30)) / 100);
    finalScore = grossPoints * Math.max(0, Math.min(1, deductionMultiplier));
  }

  return Math.max(0, Math.round(finalScore));
};

/**
 * التحقق مما إذا كان النشاط مرتبطاً بالذنوب أو محاسبة النفس أو التوبة أو المعاملات الشخصية،
 * لحجبها تماماً عن العرض في نشاط العابدين العام التزاماً بأدب الستر والخصوصية.
 */
export const isSinOrAccountabilityActivity = (label?: string, type?: string): boolean => {
  if (!label && !type) return false;
  const lowerType = (type || '').toLowerCase();
  const lowerLabel = (label || '').toLowerCase();

  // أنواع الإجراءات الممنوعة من العرض العام
  const forbiddenTypes = [
    'accountability',
    'sin',
    'sins',
    'repentance',
    'burden',
    'hasburden',
    'status'
  ];
  if (forbiddenTypes.some(t => lowerType === t || lowerType.includes(t))) {
    return true;
  }

  // الكلمات المفتاحية المتعلقة بالذنوب ومحاسبة النفس والتوبة والمجاهدة
  const forbiddenWords = [
    'ذنب',
    'ذنوب',
    'سيئة',
    'سيئات',
    'معصية',
    'معاصي',
    'محاسبة',
    'المحاسبة',
    'الزلات',
    'زلة',
    'توبة',
    'التوبة',
    'العبء الروحي',
    'العبء',
    'المجاهدة',
    'معامل المجاهدة'
  ];

  return forbiddenWords.some(word => lowerLabel.includes(word));
};

