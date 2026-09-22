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
  NotificationStatus,
  isInsideIframe,
  openInStandaloneWindow,
  RequestPermissionResult
} from '../utils/reminderManager';

export interface TestNotificationOutcome {
  success: boolean;
  systemSent: boolean;
  soundPlayed: boolean;
  inAppShown: boolean;
  inIframe: boolean;
  status: NotificationStatus;
  message: string;
}

export const useScheduledReminders = () => {
  const [reminders, setReminders] = useState<ScheduledReminder[]>(() => getStoredReminders());
  const [permissionStatus, setPermissionStatus] = useState<NotificationStatus>(() => getNotificationPermissionStatus());
  const [history, setHistory] = useState<ReminderHistoryItem[]>(() => getReminderHistory());
  const [lastTriggeredItem, setLastTriggeredItem] = useState<ReminderHistoryItem | null>(null);
  const [activeAlert, setActiveAlert] = useState<ReminderHistoryItem | null>(null);
  const [inIframe, setInIframe] = useState<boolean>(() => isInsideIframe());

  // تحديث حالة الإذن
  const updatePermissionState = useCallback(() => {
    setPermissionStatus(getNotificationPermissionStatus());
    setInIframe(isInsideIframe());
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
  const requestPermission = useCallback(async (): Promise<RequestPermissionResult> => {
    const result = await requestNotificationPermission();
    updatePermissionState();
    return result;
  }, [updatePermissionState]);

  // إغلاق التنبيه التفاعلي داخل التطبيق
  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  // إرسال إشعار تجريبي
  const testNotification = useCallback(async (customReminder?: ScheduledReminder): Promise<TestNotificationOutcome> => {
    const title = customReminder 
      ? `🔔 تجربة: ${customReminder.title}`
      : '🔔 إشعار تجريبي: إدارة العبادات والأوراد';
    
    const body = customReminder
      ? customReminder.message
      : 'هكذا ستصلك تنبيهات الصلوات والأذكار وأورادك اليومية في مواعيدها بإذن الله.';

    const soundEnabled = customReminder ? customReminder.soundEnabled : true;
    const nowTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    // إنشاء عنصر التنبيه التجريبي داخل التطبيق دائماً
    const testItem: ReminderHistoryItem = {
      id: `test_${Date.now()}`,
      reminderId: customReminder?.id || 'test',
      title,
      message: body,
      triggeredAt: Date.now(),
      time: nowTime
    };

    // إظهار التنبيه التفاعلي داخل التطبيق فوراً
    setActiveAlert(testItem);

    // إذا لم يكن الإذن ممنوحاً وكنا خارج iframe، نحاول طلب الإذن
    let currentStatus = getNotificationPermissionStatus();
    const currentlyInIframe = isInsideIframe();

    if (currentStatus !== 'granted' && !currentlyInIframe) {
      const permResult = await requestNotificationPermission();
      currentStatus = permResult.status;
      updatePermissionState();
    }

    // إرسال إشعار النظام (المتصفح)
    const sendResult = await sendBrowserNotification(title, body, {
      sound: soundEnabled,
      tag: 'test-notification'
    });

    setHistory(getReminderHistory());

    let message = '';
    if (sendResult.systemSent) {
      message = 'تم إرسال إشعار المتصفح وتشغيل التنبيه الصوتي بنجاح!';
    } else if (currentlyInIframe) {
      message = 'تم تشغيل التنبيه الصوتي ونافذة التذكير داخل التطبيق بنجاح. لتلقي إشعارات النظام في خلفية جهازك، افتح التطبيق في نافذة مستقلة.';
    } else if (currentStatus === 'denied') {
      message = 'تم تشغيل التنبيه داخل التطبيق. المتصفح يحظر إشعارات النظام، يرجى السماح بالإشعارات من إعدادات الموقع 🔒.';
    } else {
      message = 'تم تشغيل التنبيه الصوتي ونافذة التذكير داخل التطبيق بنجاح.';
    }

    return {
      success: true, // التجربة تنجح دائماً عبر التنبيه المدمج والرنة الصوتية
      systemSent: sendResult.systemSent,
      soundPlayed: sendResult.soundPlayed,
      inAppShown: true,
      inIframe: currentlyInIframe,
      status: currentStatus,
      message
    };
  }, [updatePermissionState]);

  // مسح السجل
  const handleClearHistory = useCallback(() => {
    clearReminderHistory();
    setHistory([]);
  }, []);

  // فتح التطبيق في تبويب مستقل
  const handleOpenInStandalone = useCallback(() => {
    openInStandaloneWindow();
  }, []);

  // الفحص الدوري الدقيق للتنبيهات كل 10 ثوانٍ
  useEffect(() => {
    const handleCheck = () => {
      checkAndTriggerReminders(reminders, (triggeredItem) => {
        setLastTriggeredItem(triggeredItem);
        setActiveAlert(triggeredItem);
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
    inIframe,
    history,
    lastTriggeredItem,
    activeAlert,
    nextUpcoming,
    requestPermission,
    dismissAlert,
    toggleReminder,
    updateReminder,
    addCustomReminder,
    deleteReminder,
    resetToDefaults,
    testNotification,
    openInStandalone: handleOpenInStandalone,
    clearHistory: handleClearHistory,
    refreshPermissions: updatePermissionState
  };
};
