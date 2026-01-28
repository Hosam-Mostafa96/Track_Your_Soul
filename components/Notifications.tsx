
import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Zap, 
  Trophy, 
  Clock,
  Settings,
  Target,
  Globe,
  PlusCircle,
  Smartphone,
  CalendarDays,
  FileText,
  Heart,
  Activity,
  Smile
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NotificationsProps {
  onBack: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onBack }) => {
  const [lastSeenId, setLastSeenId] = useState<number>(0);

  // سجل التحديثات الشامل
  const notifications = [
    {
      id: 5,
      type: 'feature',
      title: 'إعادة تنظيم الواجهة الرئيسية',
      message: 'تم إعادة ترتيب بطاقات الصفحة الرئيسية (المستشار، الهدف، القراءة، الأوسمة، الطمأنينة) لتناسب تدفقك اليومي بشكل أفضل.',
      time: new Date(),
      icon: <Settings className="w-5 h-5 text-blue-500" />
    },
    {
      id: 4,
      type: 'feature',
      title: 'ثمار القلوب: المحبة والمراقبة',
      message: 'أضفنا مقامات "المحبة" و "الخشية والمراقبة" إلى قسم التزكية مع خطوات عملية محددة لكل مقام للارتقاء بحال قلبك.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: <Heart className="w-5 h-5 text-rose-500" />
    },
    {
      id: 3,
      type: 'feature',
      title: 'مؤشر الطمأنينة والسكينة',
      message: 'يمكنك الآن تتبع حالتك النفسية والقلبية يومياً في نهاية الصفحة الرئيسية وربطها بمدى التزامك بأورادك.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 5),
      icon: <Smile className="w-5 h-5 text-amber-500" />
    },
    {
      id: 2,
      type: 'update',
      title: 'فلاتر ذكية في الإحصائيات',
      message: 'تم إضافة فلاتر "العبء الروحي"، "تكبيرة الإحرام"، و"الحالة القلبية" في خريطة الالتزام لتحليل أدق لأنماط عبادتك.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: <Activity className="w-5 h-5 text-emerald-500" />
    },
    {
      id: 1,
      type: 'update',
      title: 'تطوير مخطط الاستمرارية',
      message: 'المخطط الأسبوعي أصبح يدعم خط الهدف (Target Line) لمعرفة مدى اقترابك أو تجاوزك لهدفك اليومي بوضوح.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 48),
      icon: <Target className="w-5 h-5 text-indigo-500" />
    }
  ];

  useEffect(() => {
    // جلب آخر معرف تم رؤيته
    const savedId = localStorage.getItem('last_seen_notification_id');
    if (savedId) setLastSeenId(parseInt(savedId));

    // تحديث المعرف ليكون الأحدث عند الفتح (بمعنى تم القراءة)
    const latestId = Math.max(...notifications.map(n => n.id));
    localStorage.setItem('last_seen_notification_id', latestId.toString());
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left duration-500 pb-20 text-right" dir="rtl">
      {/* هيدر التنبيهات */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <Bell className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 header-font leading-none mb-1">سجل التحديثات</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase header-font tracking-widest">تطورات تطبيقك الإيماني</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* قائمة التنبيهات */}
      <div className="space-y-3">
        {notifications.map((notif) => {
          const isUnread = notif.id > lastSeenId;
          return (
            <div 
              key={notif.id}
              className={`bg-white rounded-[2rem] p-5 shadow-sm border transition-all group relative ${isUnread ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-50'}`}
            >
              {isUnread && (
                <div className="absolute top-5 left-5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
              )}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300 ${isUnread ? 'bg-emerald-100' : 'bg-slate-50'}`}>
                  {notif.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold header-font text-sm ${isUnread ? 'text-emerald-900' : 'text-slate-800'}`}>{notif.title}</h3>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(notif.time, { addSuffix: true, locale: ar } as any)}</span>
                    </div>
                  </div>
                  <p className={`text-[11px] leading-relaxed font-bold header-font ${isUnread ? 'text-emerald-700' : 'text-slate-500'}`}>
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
        <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
        <p className="text-[11px] text-emerald-800 font-bold header-font leading-relaxed">
          نحن مستمرون في تطوير "تطبيق إدارة العبادات والأوراد" ليكون رفيقك الأوفى في رحلتك الروحية.
        </p>
      </div>
    </div>
  );
};

export default Notifications;
