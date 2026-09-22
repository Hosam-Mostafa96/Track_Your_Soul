import { ScheduledReminder, ReminderHistoryItem, ReminderCategory } from '../types';

export const DEFAULT_SCHEDULED_REMINDERS: ScheduledReminder[] = [
  {
    id: 'fajr_prayer',
    title: 'صلاة الفجر وقرآن الفجر',
    category: 'fajr',
    time: '04:45',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    message: '﴿إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا﴾.. هبّ لصلاة الفجر والذكر بعدها وحافظ على الجماعة.',
    soundEnabled: true
  },
  {
    id: 'athkar_morning',
    title: 'أذكار الصباح وحصن المسلم',
    category: 'athkar_morning',
    time: '06:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    message: 'أصبحنا وأصبح الملك لله.. ابدأ يومك بدرع الحفظ الإيماني ورد أذكار الصباح.',
    soundEnabled: true
  },
  {
    id: 'duha_prayer',
    title: 'صلاة الضحى (صلاة الأوّابين)',
    category: 'duha',
    time: '09:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    message: 'ركعتا الضحى تجزئ عن صدقة ثلاثمائة وستين مفصلاً من جسدك.',
    soundEnabled: true
  },
  {
    id: 'quran_wird',
    title: 'ورد التلاوة والتدبر القرآني',
    category: 'quran',
    time: '14:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    message: '﴿أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ﴾.. وقت جلستك اليومية في روضة القرآن الكريم.',
    soundEnabled: true
  },
  {
    id: 'athkar_evening',
    title: 'أذكار المساء',
    category: 'athkar_evening',
    time: '17:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    message: 'أمسينا وأمسى الملك لله.. حان موعد أذكار المساء لتحصين النفس وانشراح الصدر.',
    soundEnabled: true
  },
  {
    id: 'sleep_athkar',
    title: 'أذكار النوم وسورة الملك',
    category: 'sleep',
    time: '22:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    message: 'باسمك ربي وضعت جنبي.. حاسب نفسك على ما مضى، واقرأ المنجية ونم على طهارة.',
    soundEnabled: true
  },
  {
    id: 'qiyam_layl',
    title: 'قيام الليل والاستغفار بالأسحار',
    category: 'qiyam',
    time: '03:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: false,
    message: '﴿وَالْمُسْتَغْفِرِينَ بِالْأَسْحَارِ﴾.. ركعات خاشعة ودعاء مستجاب في جوف الليل الآخر.',
    soundEnabled: true
  }
];

const REMINDERS_STORAGE_KEY = 'awrad_scheduled_reminders_v1';
const HISTORY_STORAGE_KEY = 'awrad_reminder_history_v1';
const LAST_TRIGGERED_PREFIX = 'awrad_reminder_last_triggered_';

export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export const getNotificationPermissionStatus = (): NotificationStatus => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

/**
 * رنة تنبيه روحية خاشعة باستخدام Web Audio API بدون أي ملفات صوتية خارجية
 */
export const playSpiritualChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    // نغمات متناسقة لطيفة: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.95);
    });
  } catch (e) {
    console.warn('Audio chime playback was blocked or unavailable:', e);
  }
};

export const sendBrowserNotification = (
  title: string,
  body: string,
  options?: { sound?: boolean; icon?: string; tag?: string }
): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (options?.sound !== false) {
    playSpiritualChime();
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: options?.icon || '/favicon.ico',
        tag: options?.tag || `reminder-${Date.now()}`,
        dir: 'rtl',
        lang: 'ar'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return true;
    } catch (e) {
      console.error('Error instantiating Notification:', e);
      return false;
    }
  }

  return false;
};

export const getStoredReminders = (): ScheduledReminder[] => {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULED_REMINDERS;
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(DEFAULT_SCHEDULED_REMINDERS));
      return DEFAULT_SCHEDULED_REMINDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SCHEDULED_REMINDERS;
  } catch {
    return DEFAULT_SCHEDULED_REMINDERS;
  }
};

export const saveStoredReminders = (reminders: ScheduledReminder[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save reminders:', e);
  }
};

export const resetRemindersToDefaults = (): ScheduledReminder[] => {
  saveStoredReminders(DEFAULT_SCHEDULED_REMINDERS);
  return DEFAULT_SCHEDULED_REMINDERS;
};

export const getReminderHistory = (): ReminderHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const addReminderToHistory = (item: ReminderHistoryItem): void => {
  if (typeof window === 'undefined') return;
  try {
    const history = getReminderHistory();
    const updated = [item, ...history].slice(0, 50); // احتفظ بآخر 50 إشعاراً
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update reminder history:', e);
  }
};

export const clearReminderHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
};

export const checkAndTriggerReminders = (
  reminders: ScheduledReminder[],
  onTriggered?: (item: ReminderHistoryItem) => void
): void => {
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMins = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMins}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentDayOfWeek = now.getDay();

  reminders.forEach(reminder => {
    if (!reminder.enabled) return;
    if (reminder.daysOfWeek && !reminder.daysOfWeek.includes(currentDayOfWeek)) return;

    if (reminder.time === currentTimeStr) {
      const lastKey = `${LAST_TRIGGERED_PREFIX}${reminder.id}`;
      const lastDate = localStorage.getItem(lastKey);
      if (lastDate === todayStr) {
        return; // أُرسل بالفعل في هذه الدقيقة من اليوم
      }

      localStorage.setItem(lastKey, todayStr);

      sendBrowserNotification(
        `⏰ تذكير: ${reminder.title}`,
        reminder.message,
        { sound: reminder.soundEnabled, tag: reminder.id }
      );

      const historyItem: ReminderHistoryItem = {
        id: `${reminder.id}_${Date.now()}`,
        reminderId: reminder.id,
        title: reminder.title,
        message: reminder.message,
        triggeredAt: Date.now(),
        time: reminder.time
      };

      addReminderToHistory(historyItem);
      onTriggered?.(historyItem);
    }
  });
};

export const getNextUpcomingReminder = (reminders: ScheduledReminder[]): { reminder: ScheduledReminder; minutesLeft: number } | null => {
  const activeReminders = reminders.filter(r => r.enabled);
  if (activeReminders.length === 0) return null;

  const now = new Date();
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();

  let closest: { reminder: ScheduledReminder; minutesLeft: number } | null = null;
  let minDiff = Infinity;

  activeReminders.forEach(r => {
    const [h, m] = r.time.split(':').map(Number);
    const rMins = h * 60 + m;
    let diff = rMins - currentTotalMins;
    if (diff <= 0) {
      diff += 24 * 60; // للغد
    }
    if (diff < minDiff) {
      minDiff = diff;
      closest = { reminder: r, minutesLeft: diff };
    }
  });

  return closest;
};
