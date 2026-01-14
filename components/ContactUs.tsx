
import React from 'react';
import { Send, MessageSquare, Bell, LifeBuoy, Share2, ExternalLink, Globe } from 'lucide-react';

const ContactUs: React.FC = () => {
  const telegramChannel = "https://t.me/hmis_96";
  const telegramBot = "https://t.me/hmis96_bot";
  const appUrl = "https://track-your-soul.vercel.app/";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق الميزان - إدارة العبادات',
          text: 'انضم إلي في رحلة محاسبة النفس والارتقاء الروحي عبر تطبيق الميزان.',
          url: appUrl,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(appUrl);
        alert("تم نسخ رابط التطبيق بنجاح!");
      } catch (err) {
        alert("فشل نسخ الرابط، يمكنك نسخه يدوياً: " + appUrl);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* هيدر تواصل معنا */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-4 bg-white/20 rounded-full mb-4 backdrop-blur-md">
            <Send className="w-10 h-10 text-emerald-100" />
          </div>
          <h2 className="text-2xl font-bold header-font">تواصل معنا</h2>
          <p className="text-emerald-100 text-xs font-bold header-font opacity-90 mt-2">نحن هنا لنسمع منك ونتطور معاً في طريق الخير</p>
        </div>
      </div>

      {/* قناة التليجرام */}
      <a 
        href={telegramChannel} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-emerald-300 transition-all group active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font">قناة التليجرام</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font uppercase tracking-wider">لمتابعة آخر التحديثات والأخبار</p>
            </div>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-50" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-xs header-font bg-blue-50/50 p-2 rounded-xl w-fit">
          <Globe className="w-3 h-3" />
          <span>t.me/hmis_96</span>
        </div>
      </a>

      {/* بوت التواصل */}
      <a 
        href={telegramBot} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-emerald-300 transition-all group active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font">بوت التواصل المباشر</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font uppercase tracking-wider">للاقتراحات، الشكاوى أو الدعم الفني</p>
            </div>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-50" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs header-font bg-emerald-50/50 p-2 rounded-xl w-fit">
          <LifeBuoy className="w-3 h-3" />
          <span>t.me/hmis96_bot</span>
        </div>
      </a>

      <button 
        onClick={handleShare}
        className="w-full bg-slate-800 text-white rounded-3xl p-6 shadow-lg hover:bg-slate-900 transition-all active:scale-[0.98] text-right"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Share2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold header-font text-sm mb-1">ساهم في نشر الخير</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-bold header-font">
              الدال على الخير كفاعله، شارك التطبيق مع من تحب ليكون لك أجر كل عبادة تُسجل من خلاله. اضغط لمشاركة الرابط.
            </p>
          </div>
        </div>
      </button>

      <div className="text-center p-4">
        <p className="text-[10px] text-slate-400 font-bold header-font italic">
          إصدار التطبيق v2.2.0 • تم التطوير بكل حب لخدمة أمة الإسلام
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
