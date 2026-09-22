import { useState, useEffect, useCallback, useMemo } from 'react';
import { ScheduledReminder, ReminderHistoryItem } from '../types';
import {
  getStoredReminders,
  saveStoredReminders,
  resetRemindersToDefaults,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendBrowserNotification,
  checkAndTriggerReminders,
  getReminderHistory,
  clearReminderHistory,
  getNextUpcomingReminder,
  NotificationStatus
} from '../utils/reminderManager';

export const useScheduledReminders = () => {
  const [reminders, setReminders] = useState<ScheduledReminder[]>(() => getStoredReminders());
  const [permissionStatus, setPermissionStatus] = useState<NotificationStatus>(() => getNotificationPermissionStatus());
  const [history, setHistory] = useState<ReminderHistoryItem[]>(() => getReminderHistory());
  const [lastTriggeredItem, setLastTriggeredItem] = useState<ReminderHistoryItem | null>(null);

  // تحديث حالة الإذن
  const updatePermissionState = useCallback(() => {
    setPermissionStatus(getNotificationPermissionStatus());
  }, []);

  useEffect(() => {
    updatePermissionState();
  }, [updatePermissionState]);

  // حفظ التعديلات في LocalStorage
  const updateReminders = useCallback((newReminders: ScheduledReminder[]) => {
    setReminders(newReminders);
    saveStoredReminders(newReminders);
  }, []);

  // تفعيل / تعطيل تذكير محدد
  const toggleReminder = useCallback((id: string) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
      saveStoredReminders(next);
      return next;
    });
  }, []);

  // تحديث بيانات تذكير
  const updateReminder = useCallback((id: string, updates: Partial<ScheduledReminder>) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      saveStoredReminders(next);
      return next;
    });
  }, []);

  // إضافة تذكير مخصص
  const addCustomReminder = useCallback((newReminder: Omit<ScheduledReminder, 'id' | 'isCustom' | 'createdAt'>) => {
    const item: ScheduledReminder = {
      ...newReminder,
      id: `custom_${Date.now()}`,
      isCustom: true,
      createdAt: Date.now()
    };
    setReminders(prev => {
      const next = [item, ...prev];
      saveStoredReminders(next);
      return next;
    });
    return item;
  }, []);

  // حذف تذكير
  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => {
      const next = prev.filter(r => r.id !== id);
      saveStoredReminders(next);
      return next;
    });
  }, []);

  // إعادة ضبط التذكيرات للوضع الافتراضي
  const resetToDefaults = useCallback(() => {
    const defaults = resetRemindersToDefaults();
    setReminders(defaults);
  }, []);

  // طلب إذن الإشعارات
  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    updatePermissionState();
    return granted;
  }, [updatePermissionState]);

  // إرسال إشعار تجريبي
  const testNotification = useCallback(async (customReminder?: ScheduledReminder) => {
    let perm = getNotificationPermissionStatus();
    if (perm !== 'granted') {
      const granted = await requestNotificationPermission();
      perm = granted ? 'granted' : 'denied';
      updatePermissionState();
      if (!granted) {
        return false;
      }
    }

    const title = customReminder 
      ? `🔔 تجربة: ${customReminder.title}`
      : '🔔 إشعار تجريبي من إدارة العبادات والأوراد';
    
    const body = customReminder
      ? customReminder.message
      : 'هكذا ستصلك تنبيهات الصلوات والأذكار وأورادك اليومية في مواعيدها بإذن الله.';

    const sent = sendBrowserNotification(title, body, {
      sound: customReminder ? customReminder.soundEnabled : true
    });

    if (sent) {
      setHistory(getReminderHistory());
    }
    return sent;
  }, [updatePermissionState]);

  // مسح السجل
  const handleClearHistory = useCallback(() => {
    clearReminderHistory();
    setHistory([]);
  }, []);

  // الفحص الدوري الدقيق للتنبيهات كل 10 ثوانٍ
  useEffect(() => {
    const handleCheck = () => {
      checkAndTriggerReminders(reminders, (triggeredItem) => {
        setLastTriggeredItem(triggeredItem);
        setHistory(getReminderHistory());
      });
    };

    // فحص أولي فوري
    handleCheck();

    const interval = setInterval(handleCheck, 10000);

    // فحص عند عودة المستخدم للتبويب
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleCheck();
        updatePermissionState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reminders, updatePermissionState]);

  const nextUpcoming = useMemo(() => {
    return getNextUpcomingReminder(reminders);
  }, [reminders]);

  return {
    reminders,
    permissionStatus,
    history,
    lastTriggeredItem,
    nextUpcoming,
    requestPermission,
    toggleReminder,
    updateReminder,
    addCustomReminder,
    deleteReminder,
    resetToDefaults,
    testNotification,
    clearHistory: handleClearHistory,
    refreshPermissions: updatePermissionState
  };
};
