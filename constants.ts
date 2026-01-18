
import { SurroundingSunnah, AppWeights } from './types';

// الرابط الموحد للمزامنة والمحراب العالمي
export const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbxXTYoO7FpVvGSNWJu2ruMZO3ksc6WS4XujNIBH5X70B9QZvqn3uGoLrhKz3P8j30nZEQ/exec";

export const DEFAULT_WEIGHTS: AppWeights = {
  fardCongregation: 2700,
  fardSolo: 100,
  sunnahRawatib: 50,
  surroundingSunnahs: {
    adhan: 50,
    dua_adhan: 50,
    early: 100,
    first_row: 100,
    takbir: 150,
    adhkar_after: 100,
    wudu: 50
  },
  quranHifz: 40,
  quranRevision: 15,
  knowledgeShari: 2,
  knowledgeGeneral: 1,
  athkarChecklist: 100,
  athkarCounter: 1,
  nawafilPerMin: 5,
  fastingDay: 1000,
  burdenDeduction: 30, // خصم 30% افتراضياً
  customSunnahs: []
};

export const TRANQUILITY_MULTIPLIERS = {
  0: -0.30,
  1: -0.15,
  2: 0.0,
  3: 0.05,
  4: 0.10,
  5: 0.20,
};

export const SURROUNDING_SUNNAH_LIST: SurroundingSunnah[] = [
  { id: 'adhan', label: 'ترديد الأذان' },
  { id: 'dua_adhan', label: 'الدعاء (بين الأذان والإقامة)' },
  { id: 'early', label: 'التبكير للمسجد' },
  { id: 'first_row', label: 'الصف الأول' },
  { id: 'takbir', label: 'تكبيرة الإحرام' },
  { id: 'adhkar_after', label: 'ختم الصلاة (الأذكار)' },
  { id: 'wudu', label: 'إسباغ الوضوء' },
];
