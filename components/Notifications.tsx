import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Sparkles,
  Clock,
  Target,
  Heart,
  Activity,
  Smile,
  BellRing,
  History,
  Palette,
  Trophy,
  User,
  BookOpen,
  WifiOff,
  FileText,
  Calendar,
  ScrollText,
  Shield,
  Compass,
  Wrench,
  CheckCheck,
} from 'lucide-react';
import { ScheduledRemindersManager } from './ScheduledRemindersManager';
import { useScheduledReminders } from '../hooks/useScheduledReminders';
import {
  APP_CHANGELOG,
  ChangelogCategory,
  ChangelogIconName,
  CURRENT_APP_VERSION,
  getLastSeenChangelogId,
  markAllChangelogAsSeen,
} from '../data/changelog';

interface NotificationsProps {
  onBack: () => void;
  remindersManager?: ReturnType<typeof useScheduledReminders>;
  initialTab?: 'reminders' | 'changelog';
  unreadUpdatesCount?: number;
  onMarkUpdatesSeen?: () => void;
}

const ICON_MAP: Record<ChangelogIconName, React.ReactNode> = {
  sparkles: <Sparkles className="w-5 h-5 text-emerald-600" />,
  palette: <Palette className="w-5 h-5 text-emerald-600" />,
  trophy: <Trophy className="w-5 h-5 text-amber-500" />,
  user: <User className="w-5 h-5 text-blue-600" />,
  book: <BookOpen className="w-5 h-5 text-emerald-600" />,
  wifi: <WifiOff className="w-5 h-5 text-indigo-600" />,
  fileText: <FileText className="w-5 h-5 text-indigo-600" />,
  calendar: <Calendar className="w-5 h-5 text-amber-600" />,
  scroll: <ScrollText className="w-5 h-5 text-emerald-600" />,
  bell: <BellRing className="w-5 h-5 text-emerald-600" />,
  shield: <Shield className="w-5 h-5 text-emerald-700" />,
  target: <Target className="w-5 h-5 text-indigo-500" />,
  heart: <Heart className="w-5 h-5 text-rose-500" />,
  activity: <Activity className="w-5 h-5 text-emerald-600" />,
  smile: <Smile className="w-5 h-5 text-amber-500" />,
  compass: <Compass className="w-5 h-5 text-emerald-700" />,
};

const CATEGORY_META: Record<
  ChangelogCategory,
  { label: string; badgeClass: string }
> = {
  feature: {
    label: 'ميزة جديدة',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  update: {
    label: 'تحديث',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  fix: {
    label: 'إصلاح',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

const Notifications: React.FC<NotificationsProps> = ({
  onBack,
  remindersManager: externalRemindersManager,
  initialTab = 'reminders',
  unreadUpdatesCount = 0,
  onMarkUpdatesSeen,
}) => {
  const internalRemindersManager = useScheduledReminders();
  const manager = externalRemindersManager || internalRemindersManager;

  const [activeTab, setActiveTab] = useState<'reminders' | 'changelog'>(initialTab);
  const [categoryFilter, setCategoryFilter] = useState<'all' | ChangelogCategory>('all');
  const [previousSeenId] = useState<number>(() => getLastSeenChangelogId());
  const onMarkSeenRef = React.useRef(onMarkUpdatesSeen);
  onMarkSeenRef.current = onMarkUpdatesSeen;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'changelog') {
      markAllChangelogAsSeen();
      onMarkSeenRef.current?.();
    }
  }, [activeTab]);

  const filteredChangelog = useMemo(() => {
    if (categoryFilter === 'all') return APP_CHANGELOG;
    return APP_CHANGELOG.filter((item) => item.category === categoryFilter);
  }, [categoryFilter]);

  const newItemsInSession = useMemo(
    () => APP_CHANGELOG.filter((item) => item.id > previousSeenId).length,
    [previousSeenId]
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left duration-500 pb-20 text-right" dir="rtl">
      {/* هيدر التنبيهات مع أزرار التبويب */}
      <div className="bg-white rounded-[2.5rem] p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 header-font leading-none mb-1">
                مركز التنبيهات والإشعارات
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase header-font tracking-widest">
                التذكير اليومي المجدول وسجل تحديثات التطبيق
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
            title="رجوع"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* التبديل بين التذكيرات وسجل التحديثات */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 header-font ${
              activeTab === 'reminders'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>التذكير اليومي المجدول</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {manager.reminders.filter((r) => r.enabled).length} نشط
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('changelog')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 header-font relative ${
              activeTab === 'changelog'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل التحديثات والإعلانات</span>
            {unreadUpdatesCount > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono animate-pulse">
                +{unreadUpdatesCount} جديد
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-mono">
                {APP_CHANGELOG.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* محتوى التبويب */}
      {activeTab === 'reminders' ? (
        <ScheduledRemindersManager
          reminders={manager.reminders}
          permissionStatus={manager.permissionStatus}
          inIframe={manager.inIframe}
          history={manager.history}
          nextUpcoming={manager.nextUpcoming}
          onRequestPermission={manager.requestPermission}
          onToggleReminder={manager.toggleReminder}
          onUpdateReminder={manager.updateReminder}
          onAddCustomReminder={manager.addCustomReminder}
          onDeleteReminder={manager.deleteReminder}
          onResetToDefaults={manager.resetToDefaults}
          onTestNotification={manager.testNotification}
          onClearHistory={manager.clearHistory}
          onOpenInStandalone={manager.openInStandalone}
          onRefreshPermissions={manager.refreshPermissions}
        />
      ) : (
        /* قائمة سجل التحديثات الشامل */
        <div className="space-y-4">
          {/* شريط ملخص الإصدار والفلاتر */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-[2rem] p-5 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black header-font">سجل تطوّر التطبيق الكامل</span>
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-yellow-300">
                    {CURRENT_APP_VERSION}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-bold mt-1">
                  يعرض {APP_CHANGELOG.length} تحديثاً وميزة منذ الانطلاقة الأولى وحتى الآن — يتحدث تلقائياً مع كل إضافة جديدة
                </p>
              </div>
              {newItemsInSession > 0 ? (
                <span className="text-[10px] font-black bg-amber-400 text-emerald-950 px-3 py-1 rounded-full flex items-center gap-1 header-font shrink-0">
                  <Sparkles className="w-3 h-3" />
                  <span>{newItemsInSession} تحديثات جديدة</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-white/10 text-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 header-font shrink-0">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>مُطّلع على الكل</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {(
                [
                  { id: 'all', label: `الكل (${APP_CHANGELOG.length})` },
                  {
                    id: 'feature',
                    label: `ميزات جديدة (${APP_CHANGELOG.filter((i) => i.category === 'feature').length})`,
                  },
                  {
                    id: 'update',
                    label: `تحديثات (${APP_CHANGELOG.filter((i) => i.category === 'update').length})`,
                  },
                  {
                    id: 'fix',
                    label: `إصلاحات (${APP_CHANGELOG.filter((i) => i.category === 'fix').length})`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black header-font transition-all ${
                    categoryFilter === tab.id
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* بطاقات التحديثات */}
          <div className="space-y-3">
            {filteredChangelog.map((notif) => {
              const isUnread = notif.id > previousSeenId;
              const catMeta = CATEGORY_META[notif.category];
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-[2rem] p-5 shadow-sm border transition-all group relative ${
                    isUnread ? 'border-emerald-300 bg-emerald-50/30 shadow-md' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-2xl shrink-0 group-hover:scale-105 transition-transform duration-300 ${
                        isUnread ? 'bg-emerald-100' : 'bg-slate-50'
                      }`}
                    >
                      {notif.category === 'fix' ? (
                        <Wrench className="w-5 h-5 text-amber-600" />
                      ) : (
                        ICON_MAP[notif.icon]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                            {notif.version}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-lg border header-font ${catMeta.badgeClass}`}
                          >
                            {catMeta.label}
                          </span>
                          {isUnread && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-rose-500 text-white header-font animate-pulse">
                              جديد
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold header-font">
                          {notif.dateLabel}
                        </span>
                      </div>

                      <h3
                        className={`font-bold header-font text-sm mb-1 ${
                          isUnread ? 'text-emerald-950' : 'text-slate-800'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      <p
                        className={`text-[11px] leading-relaxed font-bold header-font ${
                          isUnread ? 'text-emerald-800' : 'text-slate-500'
                        }`}
                      >
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* رسالة تشجيعية سفلية */}
          <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-center">
            <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <p className="text-[11px] text-emerald-800 font-bold header-font leading-relaxed">
              نحن مستمرون في تطوير «تطبيق إدارة العبادات والأوراد» ليكون رفيقك الأوفى في رحلتك الروحية، وستظهر لك كل الإضافات الجديدة هنا تلقائياً.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
