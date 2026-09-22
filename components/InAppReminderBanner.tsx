import React, { useEffect, useState } from 'react';
import { 
  BellRing, 
  Volume2, 
  X, 
  CheckCircle2, 
  ExternalLink,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { ReminderHistoryItem } from '../types';
import { playSpiritualChime } from '../utils/reminderManager';

interface InAppReminderBannerProps {
  alert: ReminderHistoryItem | null;
  onDismiss: () => void;
  onNavigate?: (category?: string) => void;
}

export const InAppReminderBanner: React.FC<InAppReminderBannerProps> = ({
  alert,
  onDismiss,
  onNavigate
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setIsVisible(true);
      // إغلاق تلقائي بعد 15 ثانية
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 15000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [alert, onDismiss]);

  if (!alert || !isVisible) return null;

  const handleReplayChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSpiritualChime();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div 
      className="fixed top-4 left-4 right-4 max-w-lg mx-auto z-50 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
      dir="rtl"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-emerald-500/40 text-right relative overflow-hidden ring-4 ring-emerald-500/10">
        {/* خلفية تزيينية خفيفة */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-12 translate-x-12 pointer-events-none"></div>

        <div className="flex items-start gap-3.5 relative z-10">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shrink-0 animate-pulse">
            <BellRing className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 header-font flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  حان الآن
                </span>
                <span className="text-[11px] font-bold font-mono text-slate-400">
                  {alert.time}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                title="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-sm sm:text-base font-black text-slate-800 header-font leading-snug">
              {alert.title}
            </h3>

            <p className="text-xs text-slate-600 font-bold mt-1 leading-relaxed">
              {alert.message}
            </p>

            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReplayChime}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 header-font"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>إعادة الرنة</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm header-font"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تمت بحمد الله</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
