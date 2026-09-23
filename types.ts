
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

export interface User {
  name: string;
  email: string;
  age: string;
  country: string;
  city: string;
  qualification: string;
  method: 'google' | 'email';
}

export interface Book {
  id: string;
  title: string;
  totalPages: number;
  currentPages: number;
  startDate: string;
  finishDate?: string;
  isFinished: boolean;
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

export interface ReflectionNote {
  id: string;
  text: string;
  timestamp: number;
}

export interface AthkarReflectionEntry {
  id: string;
  athkarId: string;
  athkarTextSnippet: string;
  category: 'morning' | 'evening' | 'sleep' | 'travel';
  text: string;
  date: string;
  timestamp: number;
}

export interface TadabburNote {
  id: string;
  date: string; // YYYY-MM-DD
  surahNumber: number;
  surahName: string;
  ayahNumber: string; // e.g. "152" or "152-153"
  ayahText?: string;
  reflection: string; // الخاطرة والتأمل الإيماني
  practicalApplication?: string; // العمل بالآية والتطبيق السلوكي
  duaFromAyah?: string; // دعاء ومناجاة مستنبطة من الآية
  theme: string; // تصنيف الموضوع
  isFavorite?: boolean;
  timestamp: number;
}

export interface SleepSession {
  id: string;
  start: string;
  end: string;
}

export interface SinDefinition {
  id: string;
  categoryId: 'kabair' | 'tongue' | 'senses' | 'neglect' | 'custom';
  name: string;
  defaultPenalty: number;
  description?: string;
}

export interface LoggedSinEntry {
  sinId: string;
  count: number;
  customPenalty?: number;
  note?: string;
}

export interface SinsState {
  entries: LoggedSinEntry[];
  repented?: boolean;
  notes?: string;
}

export interface AppWeights {
  fardCongregation: number;
  fardSolo: number;
  sunnahRawatib: number;
  surroundingSunnahs: Record<string, number>;
  quranHifz: number;
  quranRevision: number;
  quranPageRepetition: number;
  quranRubRepetition: number;
  knowledgeShari: number;
  knowledgeGeneral: number;
  athkarChecklist: number;
  athkarCounter: number;
  nawafilPerMin: number;
  fastingDay: number;
  burdenDeduction: number;
  sinPenalties?: Record<string, number>;
  customSins?: SinDefinition[];
  customSunnahs: CustomSunnah[];
  pointsPerPage: number;
  heartDeedPoint: number; 
  pointsPerDua: number;
}

export interface QuranWardPlan {
  mode: 'pages' | 'juz';
  targetPagesCount: number;
  startPage: number;
  endPage: number;
  selectedJuz?: number;
  completedPages?: number[];
  isCompleted?: boolean;
}

export interface QuranKhatmaRecord {
  id: string;
  khatmaNumber: number;
  title: string;
  completionDate: string; // YYYY-MM-DD
  startDate?: string;     // YYYY-MM-DD
  durationDays?: number;  // بالأيام
  type: 'tilawah' | 'hifz' | 'tadabbur' | 'murajaah';
  totalAjza: number;      // 30
  dedication?: string;    // إهداء الختمة
  notes?: string;         // ملاحظات أو خواطر الختمة
  createdAt: number;
}

export interface DailyLog {
  date: string;
  prayers: Record<string, PrayerEntry>;
  quran: { 
    hifzRub: number; 
    revisionRub: number;
    todayPortion?: string; 
    todayReps?: number; 
    tasksCompleted?: string[];
    khatmaNumber?: number; // حقل جديد
    surahName?: string;    // حقل جديد
    readPages?: number[];   // الصفحات المقروءة اليوم من المصحف التفاعلي
    wardPlan?: QuranWardPlan; // مخطط الورد اليومي
  };
  knowledge: { shariDuration: number; readingDuration: number; readingPages?: number };
  athkar: {
    checklists: { morning: boolean; evening: boolean; sleep: boolean; travel?: boolean };
    counters: Record<string, number>;
    completedDetailedAthkar?: Record<string, number>;
    reflections?: Record<string, string>;
  };
  nawafil: { duhaDuration: number; witrDuration: number; qiyamDuration: number; fasting: boolean; custom: Array<{ id: string; value: number }> };
  sleep: { sessions: SleepSession[]; hours?: number; bedtime?: string; wakeTime?: string };
  sins?: SinsState;
  heartStates: {
    deeds: Record<string, string[]>; 
    diseases: Record<string, string[]>; 
  };
  mood?: number; // 1 to 5
  customSunnahIds: string[];
  duaIdsCompleted: string[];
  jihadFactor: number;
  hasBurden: boolean;
  isRepented: boolean;
  isSupplicatingAloud: boolean;
  notes?: string;
  reflections: ReflectionNote[];
  tadabburNotes?: TadabburNote[];
}

export interface PrayerEntry {
  performed: boolean;
  inCongregation: boolean;
  tranquility: TranquilityLevel;
  internalSunnahPackage: 'none' | 'basic' | 'good' | 'excellent';
  surroundingSunnahIds: string[];
}

export interface FortyDayChallenge {
  id: string;
  habitTitle: string;
  habitCategory?: string;
  habitDescription?: string;
  startDate: string; // YYYY-MM-DD
  completedDays: string[]; // dates of completed days (YYYY-MM-DD)
  targetDays: number; // 40
  isCompleted?: boolean;
  notes?: string;
  createdAt: number;
}

export type ReminderCategory = 
  | 'fajr' 
  | 'athkar_morning' 
  | 'duha' 
  | 'quran' 
  | 'athkar_evening' 
  | 'sleep' 
  | 'qiyam' 
  | 'custom';

export interface ScheduledReminder {
  id: string;
  title: string;
  category: ReminderCategory;
  time: string; // HH:mm format e.g. "04:45"
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  enabled: boolean;
  message: string;
  soundEnabled: boolean;
  isCustom?: boolean;
  createdAt?: number;
}

export interface ReminderHistoryItem {
  id: string;
  reminderId: string;
  title: string;
  message: string;
  triggeredAt: number;
  time: string;
}

export type WorshipGoalCategory = 
  | 'prayer' 
  | 'quran' 
  | 'athkar' 
  | 'nawafil' 
  | 'knowledge' 
  | 'heart'
  | 'dua'
  | 'custom';

export interface WeeklyWorshipGoalItem {
  id: string;
  title: string;
  category: WorshipGoalCategory;
  unit: string;
  target: number;
  min: number;
  max: number;
  step: number;
  enabled: boolean;
  description: string;
  iconName: string;
  tabTarget?: string; // Tab to navigate to in the app
  isCustom?: boolean; // هل هو هدف مضاف يدوياً من المستخدم
  sourceType?: string; // نوع العبادة المرتبطة في صفحة تسجيل العبادات
  sourceDetailId?: string; // معرف تفصيلي إضافي (لسنة مخصصة أو ذكر مخصص)
}

export interface WeeklyGoalsConfig {
  version: number;
  preset: 'balanced' | 'high' | 'pacesetter' | 'custom';
  goals: WeeklyWorshipGoalItem[];
}

export interface WeeklyGoalDailyBreakdown {
  dateStr: string;
  dayName: string;
  value: number;
  isToday: boolean;
  isPastOrToday: boolean;
}

export interface WeeklyGoalProgress {
  goal: WeeklyWorshipGoalItem;
  current: number;
  target: number;
  percentage: number;
  remaining: number;
  isCompleted: boolean;
  dailyValues: WeeklyGoalDailyBreakdown[];
  paceStatus: 'ahead' | 'on_track' | 'behind';
}

export interface WeeklyGoalsSummary {
  weekRangeLabel: string;
  sunday: Date;
  saturday: Date;
  daysElapsed: number;
  totalGoalsCount: number;
  completedGoalsCount: number;
  overallCompletionPct: number;
  goalsProgress: WeeklyGoalProgress[];
  bestPerformingGoal?: WeeklyGoalProgress;
  mostNeededGoal?: WeeklyGoalProgress;
}

