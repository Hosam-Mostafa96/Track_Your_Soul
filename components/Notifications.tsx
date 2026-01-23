import React from 'react';
import { 
  Bell, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Zap, 
  Trophy, 
  Clock 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NotificationsProps {
  onBack: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onBack }) => {
  // بيانات تجريبية للإشعارات
  const notifications = [
    {
      id: 1,
      type: 'motivation',
      title: 'أحسنت الاستمرار!',
      message: 'لقد سجلت 5 أيام متتالية من صلاة الفجر في وقتها، استمر في هذا الارتقاء.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2), // منذ ساعتين
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />
    },
    {
      id: 2,
      type: 'info',
      title: 'تحديث جديد متوفر',
      message: 'تمت إضافة ميزة "تحليل كثافة العبادة" في قسم الإحصائيات، جربها الآن.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24), // منذ يوم
      icon: <Info className="w-5 h-5 text-blue-500" />
    },
    {
      id: 3,
      type: 'reminder',
      title: 'ورد القرآن يناديك',
      message: 'لم تسجل ورد القرآن اليوم بعد، تذكر أن "خيركم من تعلم القرآن وعلمه".',
      time: new Date(Date.now() - 1000 * 60 * 60 * 5), // منذ 5 ساعات
      icon: <Zap className="w-5 h-5 text-emerald-500" />
    },
    {
        id: 4,
        type: 'rank',
        title: 'تقدم ملحوظ في المنافسة',
        message: 'لقد صعدت 3 مراكز في قائمة فرسان اليوم، مبروك!',
        time: new Date(Date.now() - 1000 * 60 * 60 * 12), // منذ 12 ساعة
        icon: <Trophy className="w-5 h-5 text-orange-500" />
      }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left duration-500 pb-20">
      {/* هيدر التنبيهات */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <Bell className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 header-font leading-none mb-1">تنبيهات المحراب</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase header-font tracking-widest">رسائل وتوجيهات لك</p>
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
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-50 hover:border-emerald-100 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                {notif.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800 header-font text-sm">{notif.title}</h3>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                    <Clock className="w-3 h-3" />
                    {/* Fixed: Bypassing potential missing 'locale' property in FormatDistanceToNowOptions via 'as any' */}
                    <span>{formatDistanceToNow(notif.time, { addSuffix: true, locale: ar } as any)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-bold header-font">
                  {notif.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* رسالة تشجيعية سفلية */}
      <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-center">
        <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
        <p className="text-[11px] text-emerald-800 font-bold header-font leading-relaxed">
          نحن نراقب تقدمك لنرسل لك أفضل النصائح التي تعينك على طريق العبادة.
        </p>
      </div>
    </div>
  );
};

export default Notifications;