
import { DailyLog, PrayerEntry, TranquilityLevel, AppWeights } from '../types';
import { 
  TRANQUILITY_MULTIPLIERS,
  DEFAULT_WEIGHTS
} from '../constants';

export const calculatePrayerScore = (entry: PrayerEntry, hasBurden: boolean, weights: AppWeights = DEFAULT_WEIGHTS) => {
  if (!entry.performed) return 0;
  
  const base = entry.inCongregation ? weights.fardCongregation : weights.fardSolo;
  let tranqMult = TRANQUILITY_MULTIPLIERS[entry.tranquility as TranquilityLevel];
  if (hasBurden && tranqMult > 0) tranqMult = 0;
  
  const fardScore = base * (1 + tranqMult);
  
  const sunnahScore = (entry.surroundingSunnahIds || []).reduce((acc, id) => {
    const weight = weights.surroundingSunnahs[id] || weights.sunnahRawatib;
    return acc + weight;
  }, 0);
  
  return fardScore + sunnahScore;
};

export const calculateTotalScore = (log: DailyLog, weights: AppWeights = DEFAULT_WEIGHTS) => {
  const prayers = Object.values(log.prayers).reduce((sum, p) => sum + calculatePrayerScore(p as PrayerEntry, log.hasBurden, weights), 0);
  
  // نقاط الحفظ الجديد: نقاط الحفظ الأساسية + (عدد التكرارات * وزن الصفحة)
  // الربع يعتبر وجهين (صفحتين)
  const hifzBasePoints = (log.quran.hifzRub * weights.quranHifz);
  const repsPoints = (log.quran.todayReps || 0) * weights.pointsPerPage;
  const quranHifzPoints = hifzBasePoints + repsPoints;

  // نقاط مراجعة الورد (الأرباع المختارة يدوياً في صفحة القرآن)
  const manualRevisionPoints = (log.quran.tasksCompleted || [])
    .filter(id => id.startsWith('rabt_') || id.startsWith('mur_'))
    .length * weights.quranRevision;

  // نقاط الورد المسجل في صفحة التسجيل
  const revisionRubPoints = (log.quran.revisionRub * weights.quranRevision);
  
  // إضافة نقاط مقابل كل مهمة قرآنية مكتملة (استماع، تسجيل، إلخ)
  const quranTasksPoints = (log.quran.tasksCompleted || []).filter(id => !id.startsWith('rabt_') && !id.startsWith('mur_')).length * 50; 
  
  const knowledge = (log.knowledge.shariDuration * weights.knowledgeShari) + 
                    (log.knowledge.readingDuration * weights.knowledgeGeneral) +
                    ((log.knowledge.readingPages || 0) * (weights.pointsPerPage || 0));
  
  const athkarCheck = Object.values(log.athkar.checklists).filter(Boolean).length * weights.athkarChecklist;
  const athkarCount = Object.values(log.athkar.counters).reduce((sum, count) => sum + ((count as number) * weights.athkarCounter), 0);
  
  const nawafilPrayers = (log.nawafil.duhaDuration + log.nawafil.witrDuration + log.nawafil.qiyamDuration) * weights.nawafilPerMin;
  const fasting = log.nawafil.fasting ? weights.fastingDay : 0;
  
  const customSunnahPoints = (log.customSunnahIds || []).reduce((sum, id) => {
    const sunnah = (weights.customSunnahs || []).find(s => s.id === id);
    return sum + (sunnah ? sunnah.points : 0);
  }, 0);
  
  const deductionMultiplier = 1 - (weights.burdenDeduction / 100);
  
  const total = (prayers + quranHifzPoints + manualRevisionPoints + revisionRubPoints + quranTasksPoints + knowledge + athkarCheck + athkarCount + nawafilPrayers + fasting + customSunnahPoints) * (log.hasBurden ? deductionMultiplier : log.jihadFactor);

  return Math.round(total);
};
