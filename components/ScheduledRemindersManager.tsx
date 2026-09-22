import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Clock,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  BookOpen,
  Calendar,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { ScheduledReminder, ReminderCategory, ReminderHistoryItem } from '../types';
import { NotificationStatus } from '../utils/reminderManager';
import { TestNotificationOutcome } from '../hooks/useScheduledReminders';

interface ScheduledRemindersManagerProps {
  reminders: ScheduledReminder[];
  permissionStatus: NotificationStatus;
  inIframe?: boolean;
  history: ReminderHistoryItem[];
  nextUpcoming: { reminder: ScheduledReminder; minutesLeft: number } | null;
  onRequestPermission: () => Promise<any>;
  onToggleReminder: (id: string) => void;
  onUpdateReminder: (id: string, updates: Partial<ScheduledReminder>) => void;
  onAddCustomReminder: (newReminder: Omit<ScheduledReminder, 'id' | 'isCustom' | 'createdAt'>) => void;
  onDeleteReminder: (id: string) => void;
  onResetToDefaults: () => void;
  onTestNotification: (reminder?: ScheduledReminder) => Promise<TestNotificationOutcome>;
  onClearHistory: () => void;
  onOpenInStandalone?: () => void;
  onRefreshPermissions?: () => void;
}

const DAYS_NAMES = [
  { day: 0, label: 'الأحد' },
  { day: 1, label: 'الاثنين' },
  { day: 2, label: 'الثلاثاء' },
  { day: 3, label: 'الأربعاء' },
  { day: 4, label: 'الخميس' },
  { day: 5, label: 'الجمعة' },
  { day: 6, label: 'السبت' },
];

export const ScheduledRemindersManager: React.FC<ScheduledRemindersManagerProps> = ({
  reminders,
  permissionStatus,
  inIframe = false,
  history,
  nextUpcoming,
  onRequestPermission,
  onToggleReminder,
  onUpdateReminder,
  onAddCustomReminder,
  onDeleteReminder,
  onResetToDefaults,
  onTestNotification,
  onClearHistory,
  onOpenInStandalone,
  onRefreshPermissions,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [lastTestOutcome, setLastTestOutcome] = useState<TestNotificationOutcome | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // New Reminder State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ReminderCategory>('custom');
  const [newTime, setNewTime] = useState('12:00');
  const [newMessage, setNewMessage] = useState('');
  const [newDays, setNewDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [newSound, setNewSound] = useState(true);

  const getCategoryIcon = (category: ReminderCategory) => {
    switch (category) {
      case 'fajr':
        return <Sunrise className="w-5 h-5 text-amber-500" />;
      case 'athkar_morning':
      case 'duha':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'athkar_evening':
        return <Sunset className="w-5 h-5 text-orange-500" />;
      case 'sleep':
      case 'qiyam':
        return <Moon className="w-5 h-5 text-indigo-500" />;
      case 'quran':
        return <BookOpen className="w-5 h-5 text-emerald-500" />;
      default:
        return <BellRing className="w-5 h-5 text-emerald-600" />;
    }
  };

  const formatMinutesRemaining = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0 && remainingMins > 0) {
      return `${hours} ساعة و ${remainingMins} دقيقة`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتان' : 'ساعات'}`;
    } else {
      return `${remainingMins} ${remainingMins === 1 ? 'دقيقة' : 'دقائق'}`;
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddCustomReminder({
      title: newTitle.trim(),
      category: newCategory,
      time: newTime,
      daysOfWeek: newDays.length > 0 ? newDays : [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
      message: newMessage.trim() || `تذكير بموعد ${newTitle.trim()}`,
      soundEnabled: newSound,
    });

    // Reset Form
    setNewTitle('');
    setNewCategory('custom');
    setNewTime('12:00');
    setNewMessage('');
    setNewDays([0, 1, 2, 3, 4, 5, 6]);
    setNewSound(true);
    setShowAddModal(false);
  };

  const toggleDayInNew = (day: number) => {
    if (newDays.includes(day)) {
      if (newDays.length > 1) {
        setNewDays(newDays.filter(d => d !== day));
      }
    } else {
      setNewDays([...newDays, day]);
    }
  };

  const toggleDayInReminder = (reminder: ScheduledReminder, day: number) => {
    const current = reminder.daysOfWeek || [];
    let updated: number[];
    if (current.includes(day)) {
      if (current.length > 1) {
        updated = current.filter(d => d !== day);
      } else {
        return; // لا تلغِ كل الأيام
      }
    } else {
      updated = [...current, day].sort();
    }
    onUpdateReminder(reminder.id, { daysOfWeek: updated });
  };

  const handleTest = async (reminder?: ScheduledReminder) => {
    setIsTesting(true);
    try {
      const outcome = await onTestNotification(reminder);
      setLastTestOutcome(outcome);
      setTimeout(() => {
        setLastTestOutcome(null);
      }, 7000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. بطاقة إذن الإشعارات وحالتها في المتصفح */}
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all ${
        permissionStatus === 'granted'
          ? 'bg-emerald-50/80 border-emerald-200'
          : inIframe
          ? 'bg-sky-50/80 border-sky-200'
          : permissionStatus === 'denied'
          ? 'bg-rose-50 border-rose-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-3 rounded-2xl shrink-0 ${
              permissionStatus === 'granted'
                ? 'bg-emerald-500 text-white shadow-sm'
                : inIframe
                ? 'bg-sky-600 text-white shadow-sm'
                : permissionStatus === 'denied'
                ? 'bg-rose-500 text-white'
                : 'bg-amber-500 text-white animate-bounce'
            }`}>
              {permissionStatus === 'granted' ? (
                <BellRing className="w-6 h-6" />
              ) : inIframe ? (
                <ExternalLink className="w-6 h-6" />
              ) : permissionStatus === 'denied' ? (
                <BellOff className="w-6 h-6" />
              ) : (
                <Bell className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-800 header-font">
                  {permissionStatus === 'granted'
                    ? 'إشعارات المتصفح مفعلة ونشطة'
                    : inIframe
                    ? 'التنبيهات المدمجة تعمل (وضع المعاينة)'
                    : permissionStatus === 'denied'
                    ? 'تم حظر الإشعارات في متصفحك'
                    : 'تفعيل إشعارات المتصفح المجدولة'}
                </h3>
                {permissionStatus === 'granted' ? (
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> متصل
                  </span>
                ) : inIframe ? (
                  <span className="text-[10px] font-black bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-600" /> تنبيهات مدمجة نشطة
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-600 font-bold mt-1 leading-relaxed">
                {permissionStatus === 'granted'
                  ? 'ستصلك تنبيهات الصلوات والأذكار في مواعيدها المحددة مع نغمة روحية هادئة وإشعار نظام.'
                  : inIframe
                  ? 'تنبيهات الصوت ورسائل التذكير التفاعلية داخل التطبيق تعمل الآن. لإرسال إشعارات نظام التشغيل المنبثقة، افتح التطبيق في نافذة مستقلة.'
                  : permissionStatus === 'denied'
                  ? 'تم حظر الإشعارات مسبقاً في إعدادات المتصفح لهذا الموقع. انقر على زر الدليل بالأسفل لمعرفة طريقة فك الحظر.'
                  : 'اضغط على الزر أدناه لمنح المتصفح صلاحية إرسال التنبيهات في مواعيد أورادك وصلواتك.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            {inIframe && onOpenInStandalone && (
              <button
                type="button"
                onClick={onOpenInStandalone}
                className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 header-font"
              >
                <ExternalLink className="w-4 h-4" />
                فتح في نافذة مستقلة
              </button>
            )}

            {!inIframe && permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={onRequestPermission}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 header-font"
              >
                <BellRing className="w-4 h-4" />
                تفعيل التنبيهات الآن
              </button>
            )}

            <button
              type="button"
              onClick={() => handleTest()}
              disabled={isTesting}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 header-font disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              إرسال إشعار تجريبي
            </button>
          </div>
        </div>

        {/* نتيجة الاختبار */}
        {lastTestOutcome && (
          <div className={`mt-3 p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in duration-200 ${
            lastTestOutcome.systemSent
              ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
              : 'bg-amber-100/90 text-amber-900 border-amber-200'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold leading-relaxed">
              {lastTestOutcome.systemSent ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              )}
              <span>{lastTestOutcome.message}</span>
            </div>

            {lastTestOutcome.inIframe && onOpenInStandalone && (
              <button
                type="button"
                onClick={onOpenInStandalone}
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-black rounded-xl transition-all flex items-center gap-1 shrink-0 header-font"
              >
                <ExternalLink className="w-3 h-3" />
                فتح في تبويب مستقل الآن
              </button>
            )}
          </div>
        )}

        {/* زر إرشادات حل مشكلة الإشعارات المحظورة */}
        {permissionStatus === 'denied' && (
          <div className="mt-3 pt-3 border-t border-rose-200/80">
            <button
              type="button"
              onClick={() => setShowHelpGuide(!showHelpGuide)}
              className="text-xs font-black text-rose-700 hover:text-rose-800 flex items-center gap-1.5 header-font"
            >
              <HelpCircle className="w-4 h-4" />
              <span>كيف أسمح بالإشعارات في إعدادات المتصفح؟</span>
              {showHelpGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showHelpGuide && (
              <div className="mt-2.5 p-3.5 bg-white rounded-2xl border border-rose-200 text-xs text-slate-700 font-bold space-y-2 leading-relaxed">
                <p className="text-slate-800 font-black">خطوات السماح بالإشعارات في متصفح Google Chrome / Edge:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>اضغط على أيقونة الإعدادات أو القفل 🔒 بجانب رابط الموقع في شريط العنوان بالأعلى.</li>
                  <li>انقر على «أذونات الموقع» أو «Site Settings».</li>
                  <li>ابحث عن «الإشعارات» (Notifications) وغيّرها من (حظر / Block) إلى (سماح / Allow).</li>
                  <li>أعد تحميل الصفحة أو اضغط على زر التحديث أدناه.</li>
                </ol>

                <div className="pt-2 flex items-center gap-2">
                  {onRefreshPermissions && (
                    <button
                      type="button"
                      onClick={onRefreshPermissions}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 header-font"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      إعادة فحص حالة الإذن الآن
                    </button>
                  )}
                  {onOpenInStandalone && (
                    <button
                      type="button"
                      onClick={onOpenInStandalone}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 header-font"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      فتح في نافذة جديدة
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. شريط التذكير القادم */}
      {nextUpcoming && (
        <div className="bg-gradient-to-l from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Clock className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 header-font">
                  التذكير القادم
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                  خلال {formatMinutesRemaining(nextUpcoming.minutesLeft)}
                </span>
              </div>
              <h4 className="text-base font-black header-font text-white mt-0.5">
                {nextUpcoming.reminder.title}
              </h4>
              <p className="text-xs text-emerald-100/80 font-bold line-clamp-1">
                {nextUpcoming.reminder.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto relative z-10">
            <div className="text-left bg-white/10 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-sm">
              <span className="text-[9px] font-black text-emerald-200 block">الموعد المحدد</span>
              <span className="text-base font-black font-mono text-yellow-300">{nextUpcoming.reminder.time}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. شريط التحكم وزر إضافة تذكير جديد */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-black text-slate-800 header-font">
            مواعيد التذكيرات اليومية
          </h3>
          <p className="text-xs text-slate-400 font-bold">
            اضبط مواعيد تنبيهات أورادك وصلواتك لتصلك في موعدها الدقيق
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetToDefaults}
            title="استعادة المواعيد الافتراضية"
            className="p-2.5 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-sm transition-all flex items-center gap-2 header-font"
          >
            <Plus className="w-4 h-4" />
            إضافة تذكير مخصص
          </button>
        </div>
      </div>

      {/* 4. قائمة التذكيرات المجدولة */}
      <div className="space-y-3">
        {reminders.map(reminder => {
          const isExpanded = activeEditingId === reminder.id;

          return (
            <div
              key={reminder.id}
              className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all ${
                reminder.enabled
                  ? 'border-slate-200 shadow-xs hover:border-emerald-300'
                  : 'border-slate-100 bg-slate-50/60 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* الأيقونة والنصوص */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className="p-3 bg-slate-50 rounded-2xl shrink-0 border border-slate-100">
                    {getCategoryIcon(reminder.category)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm sm:text-base font-black header-font leading-tight ${
                        reminder.enabled ? 'text-slate-800' : 'text-slate-500'
                      }`}>
                        {reminder.title}
                      </h4>
                      {reminder.isCustom && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          مخصص
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-bold mt-1 line-clamp-1">
                      {reminder.message}
                    </p>
                  </div>
                </div>

                {/* التحكم بالوقت والأيام والتفعيل */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* محدد الوقت */}
                  <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-2xl transition-all border border-slate-200/60">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="time"
                      value={reminder.time}
                      onChange={e => onUpdateReminder(reminder.id, { time: e.target.value })}
                      disabled={!reminder.enabled}
                      className="bg-transparent text-sm font-black font-mono text-slate-800 focus:outline-none cursor-pointer disabled:opacity-50"
                    />
                  </div>

                  {/* زر النغمة الصوتية */}
                  <button
                    type="button"
                    onClick={() => onUpdateReminder(reminder.id, { soundEnabled: !reminder.soundEnabled })}
                    title={reminder.soundEnabled ? 'تنبيه بنغمة صوتية' : 'تنبيه صامت'}
                    className={`p-2 rounded-xl transition-all ${
                      reminder.soundEnabled
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {reminder.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {/* زر تجربة الإشعار */}
                  <button
                    type="button"
                    onClick={() => handleTest(reminder)}
                    title="تجربة إرسال هذا التذكير الآن"
                    className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  {/* زر توسيع تفاصيل الأيام */}
                  <button
                    type="button"
                    onClick={() => setActiveEditingId(isExpanded ? null : reminder.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* التبديل تفعيل / إيقاف */}
                  <button
                    type="button"
                    onClick={() => onToggleReminder(reminder.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      reminder.enabled ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        reminder.enabled ? '-translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* قسم تفاصيل الأيام ونصوص الرسالة عند التوسيع */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="text-xs font-black text-slate-600 header-font block mb-1.5">
                      أيام التكرار الأسبوعي:
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {DAYS_NAMES.map(item => {
                        const isSelected = (reminder.daysOfWeek || []).includes(item.day);
                        return (
                          <button
                            key={item.day}
                            type="button"
                            onClick={() => toggleDayInReminder(reminder, item.day)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all header-font ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-600 header-font block mb-1">
                      نص رسالة التذكير:
                    </label>
                    <input
                      type="text"
                      value={reminder.message}
                      onChange={e => onUpdateReminder(reminder.id, { message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {reminder.isCustom && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onDeleteReminder(reminder.id)}
                        className="text-xs font-black text-rose-600 hover:text-rose-700 flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف هذا التذكير
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. نافذة إضافة تذكير مخصص */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800 header-font">
                  إضافة تذكير يومي مخصص
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                  عنوان التذكير <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سنة الضحى، صيام الاثنين، مراجعة سورة الكهف..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    الوقت المحدد
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-black font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                    التصنيف
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ReminderCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-black text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="custom">تذكير عام</option>
                    <option value="fajr">صلاة الفجر</option>
                    <option value="athkar_morning">أذكار الصباح</option>
                    <option value="duha">صلاة الضحى</option>
                    <option value="quran">ورد القرآن</option>
                    <option value="athkar_evening">أذكار المساء</option>
                    <option value="sleep">أذكار النوم</option>
                    <option value="qiyam">قيام الليل والوتر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                  نص التنبيه الإيماني
                </label>
                <textarea
                  rows={2}
                  placeholder="رسالة تظهر في إشعار المتصفح لحثك على العمل الصالح..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 header-font mb-1.5">
                  أيام التكرار
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DAYS_NAMES.map(item => {
                    const isSelected = newDays.includes(item.day);
                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => toggleDayInNew(item.day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all header-font ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-700 header-font">
                    تشغيل نغمة روحية عند وصول التنبيه
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newSound}
                  onChange={e => setNewSound(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md transition-all header-font"
                >
                  حفظ التذكير المجدول
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-2xl transition-all header-font"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. سجل التنبيهات المرسلة مؤخراً */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs font-black text-slate-700 header-font hover:text-emerald-700 transition-all"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>سجل الإشعارات المرسلة مؤخراً ({history.length})</span>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[11px] font-black text-slate-400 hover:text-rose-600 transition-all"
            >
              مسح السجل
            </button>
          )}
        </div>

        {showHistory && (
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold text-center py-3">
                لم يتم إرسال أي إشعارات بعد. ستظهر الإشعارات عند حلول مواعيدها.
              </p>
            ) : (
              history.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <BellRing className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-black text-slate-800 header-font block">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block line-clamp-1">
                        {item.message}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black font-mono text-slate-400 shrink-0">
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
