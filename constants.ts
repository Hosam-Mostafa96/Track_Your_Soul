
import { SurroundingSunnah, AppWeights } from './types';

// الرابط الموحد للمزامنة والمحراب العالمي
export const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzhgKQ2nTI6hN1TSCLZdFpnpGfNAxAO8jHGwHGs5VlU7oWjv1H3E0pZiQp-y0ZcKBJIVQ/exec";

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
  quranHifz: 30, // ورد السماع (لكل ربع) - تم التعديل
  quranRevision: 15, // ورد القراءة (لكل ربع) - تم التعديل
  quranPageRepetition: 8, // تم التعديل
  quranRubRepetition: 15, // تم التعديل
  knowledgeShari: 10, 
  knowledgeGeneral: 2, 
  athkarChecklist: 100,
  athkarCounter: 1,
  nawafilPerMin: 10, // تم التعديل
  fastingDay: 1500, // تم التعديل
  burdenDeduction: 30,
  customSunnahs: [],
  pointsPerPage: 2,
  heartDeedPoint: 200,
  pointsPerDua: 10 // القيمة الافتراضية
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
