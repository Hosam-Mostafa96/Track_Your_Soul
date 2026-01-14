export enum PrayerName {
  FAJR = 'الفجر',
  DHUHR = 'الظهر',
  ASR = 'العصر',
  MAGHRIB = 'المغرب',
  ISHA = 'العشاء'
}

export enum TranquilityLevel {
  NONE = 0,
  VERY_LOW = 1,
  MINIMUM = 2,
  GOOD = 3,
  CLEAR = 4,
  HIGH = 5
}

export enum JihadFactor {
  NORMAL = 1.0,
  STRUGGLE = 1.05,
  HIGH_STRUGGLE = 1.1
}

export interface CustomSunnah {
  id: string;
  name: string;
  points: number;
}

export interface SurroundingSunnah {
  id: string;
  label: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  rank?: number;
}

export interface ActiveActivity {
  id: string;
  label: string;
  count: number;
}

export interface AppWeights {
  fardCongregation: number;
  fardSolo: number;
  sunnahRawatib: number;
  surroundingSunnahs: Record<string, number>;
  quranHifz: number;
  quranRevision: number;
  knowledgeShari: number;
  knowledgeGeneral: number;
  athkarChecklist: number;
  athkarCounter: number;
  nawafilPerMin: number;
  fastingDay: number;
  supplicationAloud: number; // وزن خاصية الجؤار بالدعاء
  customSunnahs: CustomSunnah[];
}

export interface DailyLog {
  date: string;
  prayers: Record<string, PrayerEntry>;
  quran: { hifzRub: number; revisionRub: number };
  knowledge: { shariDuration: number; readingDuration: number };
  athkar: {
    checklists: { morning: boolean; evening: boolean; sleep: boolean; travel: boolean };
    counters: { salawat: number; hawqalah: number; tahlil: number; baqiyat: number; istighfar: number };
  };
  nawafil: { duhaDuration: number; witrDuration: number; qiyamDuration: number; fasting: boolean; custom: Array<{ id: string; value: number }> };
  customSunnahIds: string[];
  jihadFactor: number;
  hasBurden: boolean;
  isRepented: boolean;
  isSupplicatingAloud: boolean; // هل قام بالجؤار بالدعاء اليوم؟
  notes?: string;
}

export interface PrayerEntry {
  performed: boolean;
  inCongregation: boolean;
  tranquility: TranquilityLevel;
  internalSunnahPackage: 'none' | 'basic' | 'good' | 'excellent';
  surroundingSunnahIds: string[];
}