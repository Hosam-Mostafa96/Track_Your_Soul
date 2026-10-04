import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  Clock,
  Sparkles,
  CheckCircle2,
  ListChecks,
  ChevronLeft,
  X,
  Plus,
  HelpCircle,
  Apple,
  ExternalLink
} from 'lucide-react';
import { NextPrayerWidget } from './NextPrayerWidget';

interface PwaWidgetManagerProps {
  onClose?: () => void;
  installPrompt?: any;
  onClearInstallPrompt?: () => void;
  dailyScore?: number;
  remainingTasksCount?: number;
}

export const PwaWidgetManager: React.FC<PwaWidgetManagerProps> = ({
  onClose,
  installPrompt,
  onClearInstallPrompt,
  dailyScore = 240,
  remainingTasksCount = 3
}) => {
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('android');
  const [widgetSize, setWidgetSize] = useState<'medium' | 'small'>('medium');

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => {
        if (onClearInstallPrompt) onClearInstallPrompt();
      });
    } else {
      alert('لتثبيت التطبيق وإضافة الودجت، استخدم خيار "إضافة إلى الشاشة الرئيسية" من قائمة المتصفح.');
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100 relative text-right" dir="rtl">
      {/* الترويسة العلوية */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg leading-tight">
                ودجت الشاشة الرئيسية وشاشة القفل
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                PWA Widgets
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              ابقَ على اتصال دائم بمواقيت الصلاة ووردك اليومي بلمحة سريعة من شاشة هاتفك
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* معاينة حية لشكل الودجت في الشاشة الرئيسية (Live Simulation) */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 my-4 text-white relative overflow-hidden flex flex-col items-center justify-center">
        <div className="text-[10px] font-mono font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>معاينة حية للودجت على هاتفك:</span>
        </div>

        {/* نموذج الودجت المصغر */}
        <div className="w-full max-w-sm bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 rounded-[2rem] p-4 border border-emerald-400/30 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-xs">
                م
              </div>
              <span className="text-xs font-black text-white header-font">المحراب • اليوم</span>
            </div>
            <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
              الرصيد: {dailyScore}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-300 font-bold">الصلاة القادمة:</span>
              <span className="text-xs font-black font-mono text-yellow-300">
                العصر (بعد 42 دقيقة)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-300 font-bold">مهام اليوم المتبقية:</span>
              <span className="text-xs font-black text-amber-300">
                {remainingTasksCount} أهداف متبقية
              </span>
            </div>
          </div>

          {/* اختصارات سريعة في الودجت */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-white/10 text-center">
            <div className="bg-white/10 p-1.5 rounded-xl text-[10px] font-bold text-white">
              📖 المصحف
            </div>
            <div className="bg-white/10 p-1.5 rounded-xl text-[10px] font-bold text-white">
              📿 الأذكار
            </div>
            <div className="bg-white/10 p-1.5 rounded-xl text-[10px] font-bold text-white">
              🕌 الصلوات
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {installPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs header-font rounded-xl shadow-md active:scale-95 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>تثبيت الودجت والتطبيق الآن</span>
            </button>
          )}
        </div>
      </div>

      {/* خطوات تفعيل الودجت على الشاشة بحسب نظام التشغيل */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActivePlatform('android')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
              activePlatform === 'android' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            نظام أندرويد (Android / Chrome)
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('ios')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
              activePlatform === 'ios' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            آيفون وآيباد (iOS / Safari)
          </button>
        </div>

        {activePlatform === 'android' ? (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-700">
            <h4 className="font-black text-slate-800 header-font text-xs">
              طريقة التثبيت وإضافة الودجت على أندرويد:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed font-medium">
              <li>افتح قائمة المتصفح (زر النقاط الثلاث ⋮ في أعلى أو أسفل الشاشة).</li>
              <li>اختر <span className="font-bold text-emerald-800">«تثبيت التطبيق»</span> أو <span className="font-bold text-emerald-800">«إضافة إلى الشاشة الرئيسية»</span>.</li>
              <li>بعد التثبيت، اضغط مطولاً على مساحة فارغة في شاشتك الرئيسية، ثم اختر <span className="font-bold text-emerald-800">«الأدوات / Widgets»</span>.</li>
              <li>ابحث عن تطبيق <span className="font-bold text-emerald-800">«إدارة العبادات والأوراد»</span> واسحب الودجت إلى شاشتك!</li>
            </ol>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-700">
            <h4 className="font-black text-slate-800 header-font text-xs flex items-center gap-1.5">
              طريقة التثبيت وشاشة القفل على أجهزة Apple (iOS):
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed font-medium">
              <li>في متصفح Safari، اضغط على زر المشاركة في الأسفل (<Share2 className="w-3.5 h-3.5 inline text-blue-500" />).</li>
              <li>مرر للأسفل واختر <span className="font-bold text-emerald-800">«إضافة إلى الشاشة الرئيسية (Add to Home Screen ➕)»</span>.</li>
              <li>لتخصيص شاشة القفل (Lock Screen): اضغط مطولاً على شاشة القفل، اختر «تخصيص»، وأضف اختصار المحراب للوصول السريع بلمسة واحدة.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
