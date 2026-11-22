import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Calendar,
  Flame,
  CheckCircle2,
  Filter,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  Briefcase,
  Home,
  BookOpen,
  Heart,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Compass,
  ArrowRight,
  Smile,
  X,
  RotateCw,
  Gift,
  HelpCircle,
  Quote,
  Feather,
  Eye,
  Award,
  ListTodo,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getIslamicDateString } from '../utils/prayerTimes';

export type TaskCategory = 'faith' | 'work' | 'family' | 'growth';
export type PrayerWindow = 'fajr_ishraq' | 'duha_dhuhr' | 'dhuhr_maghrib' | 'maghrib_isha' | 'night' | 'anytime';
export type PriorityLevel = 'urgent' | 'important' | 'routine';
export type RecurrenceType = 'once' | 'daily' | 'mondays_thursdays' | 'fridays';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  category: TaskCategory;
  prayerWindow: PrayerWindow;
  priority: PriorityLevel;
  intention?: string;
  isCompleted: boolean;
  completedAt?: string;
  date: string;
  recurrence: RecurrenceType;
  points: number;
  subTasks?: SubTask[];
}

export interface RecurringHabit {
  id: string;
  title: string;
  category: TaskCategory;
  prayerWindow: PrayerWindow;
  intention?: string;
  streak: number;
  lastCompletedDate?: string;
  history: Record<string, boolean>; // date -> completed
  createdAt: string;
  points: number;
}

export interface GratitudeEntry {
  id: string;
  date: string;
  blessings: string[];
  reflection?: string;
  category: 'health' | 'family' | 'faith' | 'provision' | 'peace';
  createdAt: string;
}

interface DailyTasksPlannerProps {
  currentDate: string;
  onAddBonusScore?: (points: number, reason: string) => void;
  onNavigateTab?: (tab: string) => void;
}

const CATEGORIES_CONFIG: Record<TaskCategory, { label: string; icon: any; color: string; bg: string; border: string }> = {
  faith: {
    label: 'إيمانية وروحية',
    icon: Sparkles,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  work: {
    label: 'عمل ودراسة',
    icon: Briefcase,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  family: {
    label: 'أسرة ومسؤوليات',
    icon: Home,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  growth: {
    label: 'صحة وتطوير',
    icon: Heart,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  }
};

const PRAYER_WINDOWS_CONFIG: Record<PrayerWindow, { label: string; sub: string; icon: any; color: string; badgeBg: string }> = {
  fajr_ishraq: {
    label: 'البكور (الفجر - الشروق)',
    sub: 'وقت البركة وصفاء الذهن',
    icon: Sunrise,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  duha_dhuhr: {
    label: 'الضحى والظهيرة',
    sub: 'ذروة السعي والإنتاجية',
    icon: Sun,
    color: 'text-orange-500',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-200'
  },
  dhuhr_maghrib: {
    label: 'العصر ومساء النهار',
    sub: 'قضاء الحوائج وأذكار المساء',
    icon: Sunset,
    color: 'text-teal-600',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-200'
  },
  maghrib_isha: {
    label: 'المغرب والعشاء',
    sub: 'جلسات الأهل والصلة والراحة',
    icon: Moon,
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  night: {
    label: 'الليل والأسحار',
    sub: 'محاسبة النفس والاستعداد لقيام الليل',
    icon: Compass,
    color: 'text-slate-700',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200'
  },
  anytime: {
    label: 'أي وقت خلال اليوم',
    sub: 'مرن بدون تقييد بمحطة محددة',
    icon: Clock,
    color: 'text-slate-500',
    badgeBg: 'bg-slate-50 text-slate-600 border-slate-200'
  }
};

const INTENTION_PRESETS = [
  'إعفاف النفس والنفقة على العيال بالحلال 🌾',
  'إدخال السرور على قلب مسلم أو تفريج كربة 🤍',
  'بر الوالدين وصلة الأرحام طلباً لرضا الرحمن 🌸',
  'نفع المسلمين بالعلم والعمل المتقن 💼',
  'التقوّي بالصحة والرياضة على طاعة الله ⚡',
  'صدقة سرية ابتغاء مرضاة الله ومغفرته 🌙'
];

const GRATITUDE_SUGGESTIONS = [
  'عافية البدن وسلامة الحواس والتنفس دون جهاز 🫀',
  'ستر الله الجميل على عيوبي وذنوبي 🛡️',
  'لقمة طعام هنيئة وماء بارد يروي العطش 🍞',
  'مأوى دافئ آمن يجمع شمل الأسرة 🏡',
  'راحة البال ونعمة الأمن في الأوطان 🕊️',
  'التوفيق لصلاة الفجر وأداء الفرائض في وقتها 🕌',
  'صحة الوالدين والاجتماع بهما على طاعة الله 🌸',
  'انشراح الصدر بعد تلاوة آيات القرآن 📖'
];

const RECURRING_HABITS_PRESETS = [
  {
    title: 'شرب ٢ لتر ماء وترطيب البدن',
    category: 'growth' as TaskCategory,
    prayerWindow: 'anytime' as PrayerWindow,
    intention: 'حفظ نعمة الصحة للتقوي على طاعة الله 💧'
  },
  {
    title: 'تلاوة صفحة من المصحف بتدبر وتفسير آية',
    category: 'faith' as TaskCategory,
    prayerWindow: 'fajr_ishraq' as PrayerWindow,
    intention: 'عمارة القلب بالقرآن وطلب شفاعته يوم القيامة 📖'
  },
  {
    title: 'رياضة خفيفة أو مشي ٢٠ دقيقة لنشاط الجسد',
    category: 'growth' as TaskCategory,
    prayerWindow: 'duha_dhuhr' as PrayerWindow,
    intention: 'المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف 🏃'
  },
  {
    title: 'مكالمة أو رسالة بر للوالدين أو تفقد قريب',
    category: 'family' as TaskCategory,
    prayerWindow: 'maghrib_isha' as PrayerWindow,
    intention: 'صلة الرحم طلباً للبركة وطول الأجل وبسط الرزق 🌸'
  },
  {
    title: 'جلسة هدوء واستغفار ومحاسبة قبل النوم',
    category: 'faith' as TaskCategory,
    prayerWindow: 'night' as PrayerWindow,
    intention: 'تطهير القلب من الغل وتجديد التوبة الصادقة 🌙'
  }
];

export const DailyTasksPlanner: React.FC<DailyTasksPlannerProps> = ({
  currentDate,
  onAddBonusScore,
  onNavigateTab
}) => {
  // Main sub-tabs
  const [plannerSubTab, setPlannerSubTab] = useState<'tasks' | 'recurring' | 'gratitude'>('tasks');

  // --- 1. DAILY TASKS STATE ---
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    try {
      const saved = localStorage.getItem('worship_daily_tasks_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 't-1',
        title: 'قراءة ورد الحفظ الجديد بتركيز',
        category: 'faith',
        prayerWindow: 'fajr_ishraq',
        priority: 'urgent',
        intention: 'تثبيت كلام الله في الصدر ونيل شفاعة القرآن',
        isCompleted: false,
        date: currentDate,
        recurrence: 'daily',
        points: 25,
        subTasks: [
          { id: 'st-1-1', title: 'الاستماع لتلاوة الصفحة المتقنة ٣ مرات', isCompleted: false },
          { id: 'st-1-2', title: 'قراءة التفسير الميسر لمعرفة معاني الكلمات', isCompleted: false },
          { id: 'st-1-3', title: 'تكرار الآيات غيباً ٥ مرات بتأنٍ', isCompleted: false }
        ]
      },
      {
        id: 't-2',
        title: 'إنجاز المهمة الأكثر أهمية في العمل أو الدراسة',
        category: 'work',
        prayerWindow: 'duha_dhuhr',
        priority: 'urgent',
        intention: 'إعفاف النفس والنفقة على العيال بالحلال 🌾',
        isCompleted: false,
        date: currentDate,
        recurrence: 'daily',
        points: 20,
        subTasks: [
          { id: 'st-2-1', title: 'إغلاق المشتتات وتجهيز مساحة العمل', isCompleted: false },
          { id: 'st-2-2', title: 'جلسة تركيز عميق لمدة ٤٠ دقيقة متواصلة', isCompleted: false }
        ]
      },
      {
        id: 't-3',
        title: 'اتصال تفقد بوالدتي / والدي أو قريب',
        category: 'family',
        prayerWindow: 'maghrib_isha',
        priority: 'important',
        intention: 'بر الوالدين وصلة الأرحام طلباً لرضا الرحمن 🌸',
        isCompleted: false,
        date: currentDate,
        recurrence: 'daily',
        points: 15
      }
    ];
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [activeWindowFilter, setActiveWindowFilter] = useState<'all' | PrayerWindow>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('faith');
  const [newWindow, setNewWindow] = useState<PrayerWindow>('duha_dhuhr');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('important');
  const [newIntention, setNewIntention] = useState('');
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceType>('once');
  const [newSubTasks, setNewSubTasks] = useState<string[]>([]);
  const [currentSubTaskInput, setCurrentSubTaskInput] = useState('');
  const [quickSubTaskInputs, setQuickSubTaskInputs] = useState<Record<string, string>>({});
  const [expandedSubTasks, setExpandedSubTasks] = useState<Record<string, boolean>>({});

  // --- 2. RECURRING HABITS STATE (مهام متكررة يومياً) ---
  const [recurringHabits, setRecurringHabits] = useState<RecurringHabit[]>(() => {
    try {
      const saved = localStorage.getItem('worship_recurring_habits_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'h-1',
        title: 'شرب ٢ لتر ماء للحفاظ على نشاط البدن',
        category: 'growth',
        prayerWindow: 'anytime',
        intention: 'حفظ نعمة الصحة للتقوي على طاعة الله 💧',
        streak: 5,
        lastCompletedDate: undefined,
        history: {},
        createdAt: '2026-10-01',
        points: 15
      },
      {
        id: 'h-2',
        title: 'تلاوة صفحة من المصحف بتدبر وتفسير آية',
        category: 'faith',
        prayerWindow: 'fajr_ishraq',
        intention: 'عمارة القلب بالقرآن وطلب شفاعته يوم القيامة 📖',
        streak: 12,
        lastCompletedDate: undefined,
        history: {},
        createdAt: '2026-10-01',
        points: 20
      },
      {
        id: 'h-3',
        title: 'مكالمة هاتفية أو رسالة بر للوالدين والأهل',
        category: 'family',
        prayerWindow: 'maghrib_isha',
        intention: 'صلة الرحم طلباً للبركة وطول الأجل وبسط الرزق 🌸',
        streak: 8,
        lastCompletedDate: undefined,
        history: {},
        createdAt: '2026-10-01',
        points: 20
      }
    ];
  });

  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<TaskCategory>('growth');
  const [newHabitWindow, setNewHabitWindow] = useState<PrayerWindow>('anytime');
  const [newHabitIntention, setNewHabitIntention] = useState('');

  // --- 3. DAILY GRATITUDE STATE (دفتر شكر النعم والامتنان) ---
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>(() => {
    try {
      const saved = localStorage.getItem('worship_gratitude_entries_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'g-1',
        date: currentDate,
        blessings: [
          'عافية البدن وسلامة الحواس والتنفس بغير مشقة',
          'اجتماع شمل الأسرة على مائدة طعام هنيئة وضحكات طيبة',
          'التوفيق لصلاة الفجر في وقتها والشعور بانشراح الصدر طوال اليوم'
        ],
        reflection: 'الحمد لله حمداً كثيراً طيباً مباركاً فيه ملء السماوات وملء الأرض.',
        category: 'peace',
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Current day's gratitude form
  const todayGratitude = useMemo(() => {
    return gratitudeEntries.find(g => g.date === currentDate);
  }, [gratitudeEntries, currentDate]);

  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [b3, setB3] = useState('');
  const [gratitudeReflection, setGratitudeReflection] = useState('');
  const [gratitudeCategory, setGratitudeCategory] = useState<'health' | 'family' | 'faith' | 'provision' | 'peace'>('peace');
  const [isSavedGratitudeToday, setIsSavedGratitudeToday] = useState(false);

  // Sync inputs with existing today gratitude
  useEffect(() => {
    if (todayGratitude) {
      setB1(todayGratitude.blessings[0] || '');
      setB2(todayGratitude.blessings[1] || '');
      setB3(todayGratitude.blessings[2] || '');
      setGratitudeReflection(todayGratitude.reflection || '');
      setGratitudeCategory(todayGratitude.category || 'peace');
      setIsSavedGratitudeToday(true);
    } else {
      setB1('');
      setB2('');
      setB3('');
      setGratitudeReflection('');
      setIsSavedGratitudeToday(false);
    }
  }, [todayGratitude, currentDate]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('worship_daily_tasks_v1', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('worship_recurring_habits_v1', JSON.stringify(recurringHabits));
  }, [recurringHabits]);

  useEffect(() => {
    localStorage.setItem('worship_gratitude_entries_v1', JSON.stringify(gratitudeEntries));
  }, [gratitudeEntries]);

  // Today's tasks (taking recurrence into account)
  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.date === currentDate) return true;
      if (task.recurrence === 'daily') return true;
      return false;
    });
  }, [tasks, currentDate]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return todayTasks.filter(task => {
      if (activeCategoryFilter !== 'all' && task.category !== activeCategoryFilter) return false;
      if (activeWindowFilter !== 'all' && task.prayerWindow !== activeWindowFilter) return false;
      if (activeStatusFilter === 'pending' && task.isCompleted) return false;
      if (activeStatusFilter === 'completed' && !task.isCompleted) return false;
      return true;
    });
  }, [todayTasks, activeCategoryFilter, activeWindowFilter, activeStatusFilter]);

  // Task Stats
  const stats = useMemo(() => {
    const total = todayTasks.length;
    const completed = todayTasks.filter(t => t.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalPointsEarned = todayTasks
      .filter(t => t.isCompleted)
      .reduce((acc, t) => acc + (t.points || 10), 0);
    return { total, completed, percentage, totalPointsEarned };
  }, [todayTasks]);

  // Recurring Habit completion for today
  const isHabitDoneToday = (habit: RecurringHabit) => {
    return Boolean(habit.history && habit.history[currentDate]);
  };

  const toggleHabit = (habitId: string) => {
    setRecurringHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          const wasDone = Boolean(h.history && h.history[currentDate]);
          const newHistory = { ...(h.history || {}) };
          let newStreak = h.streak || 0;

          if (wasDone) {
            delete newHistory[currentDate];
            newStreak = Math.max(0, newStreak - 1);
          } else {
            newHistory[currentDate] = true;
            newStreak = newStreak + 1;
            confetti({
              particleCount: 30,
              spread: 60,
              origin: { y: 0.75 }
            });
            if (onAddBonusScore) {
              onAddBonusScore(h.points || 20, `إنجاز عادة يومية متكررة: ${h.title}`);
            }
          }

          return {
            ...h,
            streak: newStreak,
            lastCompletedDate: wasDone ? undefined : currentDate,
            history: newHistory
          };
        }
        return h;
      })
    );
  };

  const deleteHabit = (habitId: string) => {
    setRecurringHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const newHabit: RecurringHabit = {
      id: `habit-${Date.now()}`,
      title: newHabitTitle.trim(),
      category: newHabitCategory,
      prayerWindow: newHabitWindow,
      intention: newHabitIntention.trim() || undefined,
      streak: 0,
      history: {},
      createdAt: currentDate,
      points: 20
    };

    setRecurringHabits(prev => [newHabit, ...prev]);
    setNewHabitTitle('');
    setNewHabitIntention('');
    setShowAddHabitModal(false);
  };

  const handleSaveGratitude = (e: React.FormEvent) => {
    e.preventDefault();
    const blessingsList = [b1.trim(), b2.trim(), b3.trim()].filter(Boolean);
    if (blessingsList.length === 0) return;

    const entry: GratitudeEntry = {
      id: todayGratitude ? todayGratitude.id : `gratitude-${Date.now()}`,
      date: currentDate,
      blessings: blessingsList,
      reflection: gratitudeReflection.trim() || undefined,
      category: gratitudeCategory,
      createdAt: new Date().toISOString()
    };

    setGratitudeEntries(prev => {
      const filtered = prev.filter(g => g.date !== currentDate);
      return [entry, ...filtered];
    });

    setIsSavedGratitudeToday(true);
    confetti({
      particleCount: 35,
      spread: 70,
      origin: { y: 0.7 }
    });

    if (onAddBonusScore) {
      onAddBonusScore(25, 'شكر النعم والامتنان اليومي (لئن شكرتم لأزيدنكم)');
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const willComplete = !task.isCompleted;
          if (willComplete) {
            confetti({
              particleCount: 25,
              spread: 50,
              origin: { y: 0.8 }
            });
            if (onAddBonusScore) {
              const pts = task.points || 15;
              onAddBonusScore(pts, `إنجاز مهمة: ${task.title}`);
            }
          }
          // تحديث جميع الخطوات الفرعية بالتزامن مع المهمة الرئيسية
          const updatedSubTasks = (task.subTasks || []).map(st => ({
            ...st,
            isCompleted: willComplete
          }));
          return {
            ...task,
            isCompleted: willComplete,
            subTasks: updatedSubTasks.length > 0 ? updatedSubTasks : task.subTasks,
            completedAt: willComplete ? new Date().toISOString() : undefined
          };
        }
        return task;
      })
    );
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const currentSubTasks = task.subTasks || [];
          const updatedSubTasks = currentSubTasks.map(st =>
            st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
          );
          const allCompleted = updatedSubTasks.length > 0 && updatedSubTasks.every(st => st.isCompleted);
          const wasCompleted = task.isCompleted;

          if (allCompleted && !wasCompleted) {
            confetti({
              particleCount: 25,
              spread: 50,
              origin: { y: 0.8 }
            });
            if (onAddBonusScore) {
              const pts = task.points || 15;
              onAddBonusScore(pts, `إنجاز جميع خطوات: ${task.title}`);
            }
          }

          return {
            ...task,
            subTasks: updatedSubTasks,
            isCompleted: allCompleted,
            completedAt: allCompleted ? new Date().toISOString() : undefined
          };
        }
        return task;
      })
    );
  };

  const addSubTaskToTask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newSubTask: SubTask = {
            id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: title.trim(),
            isCompleted: false
          };
          return {
            ...task,
            subTasks: [...(task.subTasks || []), newSubTask],
            isCompleted: false
          };
        }
        return task;
      })
    );
    setQuickSubTaskInputs(prev => ({ ...prev, [taskId]: '' }));
    setExpandedSubTasks(prev => ({ ...prev, [taskId]: true }));
  };

  const deleteSubTaskFromTask = (taskId: string, subTaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const updatedSubTasks = (task.subTasks || []).filter(st => st.id !== subTaskId);
          const allCompleted = updatedSubTasks.length > 0 && updatedSubTasks.every(st => st.isCompleted);
          return {
            ...task,
            subTasks: updatedSubTasks,
            isCompleted: updatedSubTasks.length > 0 ? allCompleted : task.isCompleted
          };
        }
        return task;
      })
    );
  };

  const toggleExpandSubTasks = (taskId: string) => {
    setExpandedSubTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subTasksList: SubTask[] = newSubTasks
      .filter(t => t.trim().length > 0)
      .map((title, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title: title.trim(),
        isCompleted: false
      }));

    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      prayerWindow: newWindow,
      priority: newPriority,
      intention: newIntention.trim() || undefined,
      isCompleted: false,
      date: currentDate,
      recurrence: newRecurrence,
      points: newIntention ? 25 : 15,
      subTasks: subTasksList.length > 0 ? subTasksList : undefined
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTitle('');
    setNewIntention('');
    setNewSubTasks([]);
    setCurrentSubTaskInput('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-28 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-amber-300 shadow-inner">
                {plannerSubTab === 'tasks' && <CheckSquare className="w-6 h-6" />}
                {plannerSubTab === 'recurring' && <RotateCw className="w-6 h-6" />}
                {plannerSubTab === 'gratitude' && <Gift className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block mb-1">
                  عمارة الوقت والبركة
                </span>
                <h2 className="text-xl font-black header-font leading-tight text-white">
                  {plannerSubTab === 'tasks' && 'مخطط اليوم وجدولة الصلوات 🌿'}
                  {plannerSubTab === 'recurring' && 'العادات والمهام المتكررة يومياً 🔁'}
                  {plannerSubTab === 'gratitude' && 'دفتر شكر النعم والامتنان 🤲'}
                </h2>
              </div>
            </div>

            {plannerSubTab === 'tasks' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl font-black text-xs header-font shadow-lg transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>مهمة جديدة</span>
              </button>
            )}

            {plannerSubTab === 'recurring' && (
              <button
                onClick={() => setShowAddHabitModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-xs header-font shadow-lg transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>عادة متكررة</span>
              </button>
            )}
          </div>

          <p className="text-xs text-emerald-200/90 leading-relaxed font-bold">
            {plannerSubTab === 'tasks' && '«بُورِكَ لأُمَّتِي فِي بُكُورِهَا» — نظّم مسؤولياتك حول الصلوات واقرن كل عمل دنيوي بنية صالحة.'}
            {plannerSubTab === 'recurring' && '«أحبّ الأعمال إلى الله أدومها وإن قلّ» — عادات يومية ثابتة تصنع شخصيتك وترفع درجاتك باستمرار.'}
            {plannerSubTab === 'gratitude' && '«وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ» — استشعر نعم الله عليك كل ليلة قبل النوم لتدوم وتزيد.'}
          </p>

          {/* Sub-tab Switcher inside Header */}
          <div className="grid grid-cols-3 gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
            <button
              onClick={() => setPlannerSubTab('tasks')}
              className={`py-2 px-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-1.5 ${
                plannerSubTab === 'tasks'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>مخطط اليوم</span>
            </button>

            <button
              onClick={() => setPlannerSubTab('recurring')}
              className={`py-2 px-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-1.5 ${
                plannerSubTab === 'recurring'
                  ? 'bg-emerald-400 text-slate-950 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <RotateCw className="w-4 h-4" />
              <span>مهام متكررة</span>
            </button>

            <button
              onClick={() => setPlannerSubTab('gratitude')}
              className={`py-2 px-3 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-1.5 ${
                plannerSubTab === 'gratitude'
                  ? 'bg-teal-300 text-slate-950 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>شكر النعم</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== SUB-TAB 1: DAILY TASKS ==================== */}
      {plannerSubTab === 'tasks' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Progress Card */}
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-bold">نسبة إنجاز مهام اليوم:</span>
                <span className="text-emerald-700 font-mono text-sm font-black">
                  {stats.completed} من {stats.total} ({stats.percentage}%)
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>+{stats.totalPointsEarned} نقطة بركة ونية</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* المحطات الخمس للصلوات (Prayer-Anchored Times Grid) */}
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800 header-font">
                  محطات اليوم الخمس (الجدولة حول الصلاة)
                </h3>
              </div>
              {activeWindowFilter !== 'all' && (
                <button
                  onClick={() => setActiveWindowFilter('all')}
                  className="text-[11px] text-emerald-600 font-bold hover:underline"
                >
                  عرض جميع المحطات
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['fajr_ishraq', 'duha_dhuhr', 'dhuhr_maghrib', 'maghrib_isha', 'night'] as PrayerWindow[]).map(winKey => {
                const conf = PRAYER_WINDOWS_CONFIG[winKey];
                const Icon = conf.icon;
                const count = todayTasks.filter(t => t.prayerWindow === winKey).length;
                const isSelected = activeWindowFilter === winKey;

                return (
                  <button
                    key={winKey}
                    type="button"
                    onClick={() => setActiveWindowFilter(isSelected ? 'all' : winKey)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`p-1.5 rounded-xl bg-white border border-slate-100 ${conf.color}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-white/80 px-2 py-0.5 rounded-full border text-slate-600">
                        {count} مهام
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 header-font leading-tight">
                        {conf.label}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold truncate">
                        {conf.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
              <button
                onClick={() => setActiveStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeStatusFilter === 'all'
                    ? 'bg-white text-emerald-800 shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                الكل ({todayTasks.length})
              </button>
              <button
                onClick={() => setActiveStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeStatusFilter === 'pending'
                    ? 'bg-white text-emerald-800 shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                قيد الإنجاز ({todayTasks.filter(t => !t.isCompleted).length})
              </button>
              <button
                onClick={() => setActiveStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeStatusFilter === 'completed'
                    ? 'bg-white text-emerald-800 shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                المنجزة ({todayTasks.filter(t => t.isCompleted).length})
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['faith', 'work', 'family', 'growth'] as TaskCategory[]).map(catKey => {
                const conf = CATEGORIES_CONFIG[catKey];
                const isSel = activeCategoryFilter === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => setActiveCategoryFilter(isSel ? 'all' : catKey)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all whitespace-nowrap ${
                      isSel
                        ? `${conf.bg} ${conf.color} ${conf.border} font-black shadow-sm`
                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-8 text-center border-2 border-dashed border-slate-200">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800 header-font mb-1">
                  {activeStatusFilter === 'completed'
                    ? 'لم تنجز أي مهام حتى الآن'
                    : 'لا توجد مهام في هذا التصنيف'}
                </h4>
                <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto mb-4">
                  أضف مهمتك الأولى وحدد نيتها الشرعية لتبدأ يومك ببركة ونشاط.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black header-font shadow-md hover:bg-emerald-700 transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مهمة جديدة</span>
                </button>
              </div>
            ) : (
              filteredTasks.map(task => {
                const catConf = CATEGORIES_CONFIG[task.category];
                const winConf = PRAYER_WINDOWS_CONFIG[task.prayerWindow];
                const WinIcon = winConf.icon;
                const hasSubTasks = Boolean(task.subTasks && task.subTasks.length > 0);
                const totalSub = task.subTasks?.length || 0;
                const completedSub = task.subTasks?.filter(st => st.isCompleted).length || 0;
                const subPercent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;
                const isExpanded = Boolean(expandedSubTasks[task.id]);

                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-[1.8rem] p-4 sm:p-5 border transition-all duration-300 ${
                      task.isCompleted
                        ? 'border-emerald-100 bg-emerald-50/20 opacity-80'
                        : 'border-slate-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={`p-1.5 rounded-xl transition-all shrink-0 mt-0.5 active:scale-90 ${
                          task.isCompleted
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                        ) : (
                          <Square className="w-6 h-6 stroke-[2]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-sm font-black header-font leading-snug transition-all ${
                              task.isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </h4>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors shrink-0"
                            title="حذف المهمة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {task.intention && (
                          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-2 flex items-center gap-2 text-[11px] text-amber-900 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">
                              <strong className="text-amber-700">نية العمل:</strong> {task.intention}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${winConf.badgeBg}`}>
                            <WinIcon className="w-3 h-3" />
                            <span>{winConf.label}</span>
                          </span>

                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${catConf.bg} ${catConf.color} ${catConf.border}`}>
                            <span>{catConf.label}</span>
                          </span>

                          {task.priority === 'urgent' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                              عاجل وأساسي
                            </span>
                          )}

                          <span className="text-[10px] font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                            +{task.points} ن بركة
                          </span>

                          {/* زر إظهار أو إضافة خطوات فرعية */}
                          {hasSubTasks ? (
                            <button
                              type="button"
                              onClick={() => toggleExpandSubTasks(task.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                            >
                              <ListTodo className="w-3 h-3 text-indigo-600" />
                              <span>{completedSub}/{totalSub} خطوات فرعية</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleExpandSubTasks(task.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-dashed border-slate-200 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>خطوات فرعية</span>
                            </button>
                          )}
                        </div>

                        {/* قسم الخطوات الفرعية القابلة للتقسيم والإنجاز */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/70 p-3 rounded-2xl animate-in fade-in">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="flex items-center gap-1.5 font-black text-slate-700">
                                <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
                                <span>الخطوات الفرعية المجزأة</span>
                                {hasSubTasks && <span className="font-mono text-emerald-700">({completedSub}/{totalSub})</span>}
                              </span>
                              {hasSubTasks && (
                                <span className="text-[10px] text-emerald-700 font-mono font-bold">{subPercent}% إنجاز</span>
                              )}
                            </div>

                            {hasSubTasks && (
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                                  style={{ width: `${subPercent}%` }}
                                />
                              </div>
                            )}

                            {/* قائمة الخطوات الفرعية */}
                            <div className="space-y-1.5 pt-1">
                              {task.subTasks?.map(st => (
                                <div
                                  key={st.id}
                                  className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white border border-slate-100 hover:border-emerald-200 transition-all group/sub"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleSubTask(task.id, st.id)}
                                    className="flex items-center gap-2 text-right flex-1 min-w-0"
                                  >
                                    <span
                                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                                        st.isCompleted
                                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                          : 'border-slate-300 bg-white hover:border-emerald-500'
                                      }`}
                                    >
                                      {st.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                                    </span>
                                    <span
                                      className={`text-xs font-bold truncate transition-all ${
                                        st.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                                      }`}
                                    >
                                      {st.title}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => deleteSubTaskFromTask(task.id, st.id)}
                                    className="text-slate-300 hover:text-rose-500 p-1 rounded-md opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0"
                                    title="حذف هذه الخطوة"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* حقل إضافة خطوة فرعية سريعة */}
                            <div className="flex items-center gap-1.5 pt-1.5">
                              <input
                                type="text"
                                value={quickSubTaskInputs[task.id] || ''}
                                onChange={(e) => setQuickSubTaskInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addSubTaskToTask(task.id, quickSubTaskInputs[task.id] || '');
                                  }
                                }}
                                placeholder="أضف خطوة فرعية سريعة..."
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold outline-none focus:border-emerald-500 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => addSubTaskToTask(task.id, quickSubTaskInputs[task.id] || '')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-xs transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: RECURRING HABITS (مهام متكررة يومياً) ==================== */}
      {plannerSubTab === 'recurring' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Motivation Box */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 rounded-[2rem] p-5 border border-emerald-100/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
                <RotateCw className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 header-font leading-tight">
                  العادات والمهام اليومية المتكررة
                </h3>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                  تتجدد تلقائياً كل يوم، وتزيد شعلة التزامك المتواصل (Streak) يوماً بعد يوم 🔥
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddHabitModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-sm active:scale-95 transition-all shrink-0"
            >
              إضافة عادة +
            </button>
          </div>

          {/* Habits List */}
          <div className="space-y-3">
            {recurringHabits.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-8 text-center border-2 border-dashed border-slate-200">
                <RotateCw className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 header-font mb-1">
                  لا توجد عادات متكررة مسجلة
                </h4>
                <p className="text-xs text-slate-400 font-bold mb-4">
                  أضف عاداتك الصباحية أو المسائية لتتابع التزامك اليومي المستمر.
                </p>
                <button
                  onClick={() => setShowAddHabitModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  إضافة عادة جديدة
                </button>
              </div>
            ) : (
              recurringHabits.map(habit => {
                const isDone = isHabitDoneToday(habit);
                const catConf = CATEGORIES_CONFIG[habit.category];
                const winConf = PRAYER_WINDOWS_CONFIG[habit.prayerWindow];

                return (
                  <div
                    key={habit.id}
                    className={`bg-white rounded-[2rem] p-5 border transition-all duration-300 ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/20 shadow-sm'
                        : 'border-slate-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleHabit(habit.id)}
                        className={`p-2 rounded-2xl transition-all shrink-0 active:scale-90 ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                        ) : (
                          <Square className="w-7 h-7 stroke-[2]" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4
                              className={`text-sm font-black header-font leading-tight ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {habit.title}
                            </h4>
                            {habit.intention && (
                              <p className="text-[10px] text-amber-700 font-bold mt-1">
                                🌱 {habit.intention}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Streak badge */}
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-black font-mono shadow-inner">
                              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{habit.streak} أيام</span>
                            </div>

                            <button
                              onClick={() => deleteHabit(habit.id)}
                              className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${catConf.bg} ${catConf.color} ${catConf.border}`}>
                            {catConf.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${winConf.badgeBg}`}>
                            {winConf.label}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                            +{habit.points} ن يومياً
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* مقترحات عادات يومية جاهزة */}
          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 space-y-3">
            <h4 className="text-xs font-black text-slate-800 header-font">
              💡 مقترحات عادات مباركة ننصحك بإضافتها:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RECURRING_HABITS_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const newH: RecurringHabit = {
                      id: `habit-${Date.now()}-${idx}`,
                      title: p.title,
                      category: p.category,
                      prayerWindow: p.prayerWindow,
                      intention: p.intention,
                      streak: 0,
                      history: {},
                      createdAt: currentDate,
                      points: 20
                    };
                    setRecurringHabits(prev => [newH, ...prev]);
                  }}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 text-right flex items-center justify-between gap-2 group transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-emerald-700">
                      {p.title}
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold block truncate mt-0.5">
                      {p.intention}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-125 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: DAILY GRATITUDE (دفتر شكر النعم والامتنان) ==================== */}
      {plannerSubTab === 'gratitude' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Card: Add/Edit Today's Gratitude */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
                  <Heart className="w-6 h-6 fill-amber-100" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 header-font">
                    وقفة شكر اليوم (٣ نعم استشعرتها)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    تأمل في لطف الله الخفي بك اليوم، فالشكر قيد النعم ومزيدها
                  </p>
                </div>
              </div>
              {isSavedGratitudeToday && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تم التوثيق اليوم
                </span>
              )}
            </div>

            <form onSubmit={handleSaveGratitude} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ١. النعمة الأولى *
                </label>
                <input
                  type="text"
                  value={b1}
                  onChange={e => setB1(e.target.value)}
                  placeholder="مثال: عافية في بدني وأني مشيت وصليت بدون ألم..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-amber-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ٢. النعمة الثانية *
                </label>
                <input
                  type="text"
                  value={b2}
                  onChange={e => setB2(e.target.value)}
                  placeholder="مثال: ستر الله الجميل على ذنوبي وإمهاله لي..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-amber-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ٣. النعمة الثالثة
                </label>
                <input
                  type="text"
                  value={b3}
                  onChange={e => setB3(e.target.value)}
                  placeholder="مثال: مأوى آمن ورزق اليوم ولقمة هنيئة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-amber-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  أثر النعمة في نفسي (مناجاة أو دعاء شكر)
                </label>
                <textarea
                  rows={2}
                  value={gratitudeReflection}
                  onChange={e => setGratitudeReflection(e.target.value)}
                  placeholder="«اللهم ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر»..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-amber-400 transition-all"
                />
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] text-slate-400 font-bold">
                  💡 نعم جاهزة للتأمل والإضافة السريعة:
                </p>
                <div className="flex flex-wrap gap-1">
                  {GRATITUDE_SUGGESTIONS.slice(0, 4).map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!b1) setB1(s);
                        else if (!b2) setB2(s);
                        else if (!b3) setB3(s);
                      }}
                      className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-900 px-2 py-1 rounded-lg border border-amber-200/60 font-bold transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl font-black text-xs header-font shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-3"
              >
                <Heart className="w-4 h-4 fill-slate-950" />
                <span>{isSavedGratitudeToday ? 'تحديث شكر اليوم' : 'حفظ شكر اليوم (+25 ن أجر)'}</span>
              </button>
            </form>
          </div>

          {/* أرشيف النعم المسجلة (Gratitude History Ledger) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 header-font flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>أرشيف النعم والامتنان المسجلة</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-bold font-mono">
                {gratitudeEntries.length} يوم موثق
              </span>
            </div>

            <div className="space-y-3">
              {gratitudeEntries.map(entry => (
                <div
                  key={entry.id}
                  className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                    <span className="text-xs font-black text-slate-700 header-font flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{entry.date}</span>
                    </span>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                      شكر موثق 🤲
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-700 font-bold">
                    {entry.blessings.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {entry.reflection && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-600 font-bold italic leading-relaxed">
                      💬 «{entry.reflection}»
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Daily Task */}
      {showAddModal && createPortal(
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          dir="rtl"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 relative text-right"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-4 sm:px-6 pt-4 pb-3 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-emerald-50 rounded-2xl text-emerald-700 shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 header-font truncate">
                    إضافة مهمة جديدة للمخطط
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold truncate">
                    اربط عملك بنية صالحة ومحطة صلاة محددة
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 space-y-4">
                <div className="min-w-0">
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    عنوان المهمة *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="مثال: تسليم تقرير العمل، إحضار طلبات البيت..."
                    required
                    className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    التصنيف
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['faith', 'work', 'family', 'growth'] as TaskCategory[]).map(catKey => {
                      const conf = CATEGORIES_CONFIG[catKey];
                      const isSel = newCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setNewCategory(catKey)}
                          className={`min-w-0 p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isSel
                              ? `${conf.bg} ${conf.color} ${conf.border} font-black shadow-sm ring-1 ring-emerald-500/20`
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{conf.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    المحطة الزمنية (حول الصلاة)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['fajr_ishraq', 'duha_dhuhr', 'dhuhr_maghrib', 'maghrib_isha', 'night', 'anytime'] as PrayerWindow[]).map(winKey => {
                      const conf = PRAYER_WINDOWS_CONFIG[winKey];
                      const isSel = newWindow === winKey;
                      return (
                        <button
                          key={winKey}
                          type="button"
                          onClick={() => setNewWindow(winKey)}
                          className={`min-w-0 p-2 rounded-xl border text-[11px] font-bold transition-all text-right leading-snug ${
                            isSel
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-black'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {conf.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    نيّة العمل (احتساب الأجر) ✨
                  </label>
                  <input
                    type="text"
                    value={newIntention}
                    onChange={e => setNewIntention(e.target.value)}
                    placeholder="مثال: إعفاف النفس، بر الوالدين، إدخال السرور..."
                    className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-amber-400 transition-all mb-2"
                  />

                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400 font-bold">
                      أو اختر نية جاهزة مباركة:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {INTENTION_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewIntention(preset)}
                          className={`max-w-full text-right text-[10px] px-2.5 py-1 rounded-xl border font-bold transition-colors leading-snug ${
                            newIntention === preset
                              ? 'bg-amber-100 text-amber-950 border-amber-400'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200/60'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* الخطوات الفرعية في المودال */}
                <div className="min-w-0">
                  <label className="text-xs font-black text-slate-700 header-font mb-1.5 flex items-center justify-between gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <ListTodo className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>تقسيم المهمة إلى خطوات فرعية (اختياري)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">
                      {newSubTasks.length} خطوات مضافة
                    </span>
                  </label>

                  <div className="flex items-center gap-1.5 mb-2 w-full min-w-0">
                    <input
                      type="text"
                      value={currentSubTaskInput}
                      onChange={e => setCurrentSubTaskInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (currentSubTaskInput.trim()) {
                            setNewSubTasks(prev => [...prev, currentSubTaskInput.trim()]);
                            setCurrentSubTaskInput('');
                          }
                        }
                      }}
                      placeholder="اكتب خطوة فرعية واضغط إضافة..."
                      className="flex-1 min-w-0 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (currentSubTaskInput.trim()) {
                          setNewSubTasks(prev => [...prev, currentSubTaskInput.trim()]);
                          setCurrentSubTaskInput('');
                        }
                      }}
                      className="shrink-0 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-xs transition-all active:scale-95 whitespace-nowrap"
                    >
                      + إضافة
                    </button>
                  </div>

                  {newSubTasks.length > 0 && (
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 max-h-36 overflow-y-auto no-scrollbar">
                      {newSubTasks.map((st, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-xl border border-slate-100 text-xs font-bold text-slate-700 min-w-0">
                          <span className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{st}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewSubTasks(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-300 hover:text-rose-500 p-1 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="min-w-0">
                    <label className="block text-[11px] font-black text-slate-700 header-font mb-1">
                      الأولوية
                    </label>
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value as PriorityLevel)}
                      className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="urgent">🔴 عاجل وأساسي</option>
                      <option value="important">🟡 مهم ومركزي</option>
                      <option value="routine">🟢 يسير وروتيني</option>
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[11px] font-black text-slate-700 header-font mb-1">
                      التكرار
                    </label>
                    <select
                      value={newRecurrence}
                      onChange={e => setNewRecurrence(e.target.value as RecurrenceType)}
                      className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="once">اليوم فقط</option>
                      <option value="daily">يتكرر يومياً</option>
                      <option value="mondays_thursdays">إثنين وخميس</option>
                      <option value="fridays">كل جمعة</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs header-font shadow-md transition-all active:scale-95"
                >
                  حفظ المهمة في المخطط
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl font-bold text-xs header-font transition-all shrink-0"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Add Recurring Habit */}
      {showAddHabitModal && createPortal(
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          dir="rtl"
          onClick={() => setShowAddHabitModal(false)}
        >
          <div
            className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 relative text-right"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-4 sm:px-6 pt-4 pb-3 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-emerald-50 rounded-2xl text-emerald-700 shrink-0">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 header-font truncate">
                    إضافة عادة أو مهمة متكررة يومياً
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold truncate">
                    تتجدد كل يوم لتتبع استمرارية التزامك (Streak)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHabitModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 space-y-4">
                <div className="min-w-0">
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    عنوان العادة اليومية *
                  </label>
                  <input
                    type="text"
                    value={newHabitTitle}
                    onChange={e => setNewHabitTitle(e.target.value)}
                    placeholder="مثال: شرب الماء، قراءة صفحة تفسير، رياضة الصباح..."
                    required
                    className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    التصنيف
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['faith', 'work', 'family', 'growth'] as TaskCategory[]).map(catKey => {
                      const conf = CATEGORIES_CONFIG[catKey];
                      const isSel = newHabitCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setNewHabitCategory(catKey)}
                          className={`min-w-0 p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isSel
                              ? `${conf.bg} ${conf.color} ${conf.border} font-black shadow-sm ring-1 ring-emerald-500/20`
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{conf.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    المحطة المفضلة
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['fajr_ishraq', 'duha_dhuhr', 'dhuhr_maghrib', 'maghrib_isha', 'night', 'anytime'] as PrayerWindow[]).map(winKey => {
                      const conf = PRAYER_WINDOWS_CONFIG[winKey];
                      const isSel = newHabitWindow === winKey;
                      return (
                        <button
                          key={winKey}
                          type="button"
                          onClick={() => setNewHabitWindow(winKey)}
                          className={`min-w-0 p-2 rounded-xl border text-[11px] font-bold transition-all text-right leading-snug ${
                            isSel
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-black'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {conf.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    النية الصالحة
                  </label>
                  <input
                    type="text"
                    value={newHabitIntention}
                    onChange={e => setNewHabitIntention(e.target.value)}
                    placeholder="مثال: التقوي على العبادة، بر الوالدين، حفظ الصحة..."
                    className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs header-font shadow-md transition-all active:scale-95"
                >
                  حفظ العادة المتكررة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddHabitModal(false)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl font-bold text-xs header-font transition-all shrink-0"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DailyTasksPlanner;
