import React, { useState } from 'react';
import { Download, Smartphone, Share, X, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, suppress the button
  if (isInstalled) {
    return null;
  }

  // Only show if browser supports install prompt or user is on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
      }
      return;
    }
    if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const iosGuidePortal = showIOSGuide
    ? createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
          dir="rtl"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-[2rem] p-6 sm:p-7 shadow-2xl relative animate-in slide-in-from-bottom duration-300 text-right space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Smartphone className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-lg font-black text-slate-900 header-font">تثبيت تطبيق أوراد على آيفون</h3>
              <p className="text-xs text-slate-500 font-bold">
                ليعمل كتطبيق مستقل وبكامل المزايا بدون إنترنت في المسجد والسفر
              </p>
            </div>

            <div className="space-y-2.5 text-right">
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-white shadow-xs font-black text-emerald-700 flex items-center justify-center text-xs shrink-0">
                  ١
                </span>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  اضغط على زر المشاركة <Share className="w-4 h-4 inline text-sky-600 mx-0.5" /> في شريط متصفح Safari.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-white shadow-xs font-black text-emerald-700 flex items-center justify-center text-xs shrink-0">
                  ٢
                </span>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  مرّر للأسفل واختر <b>«إضافة إلى الشاشة الرئيسية»</b> (Add to Home Screen).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs header-font shadow-md active:scale-95 transition-all"
            >
              فهمت، سأقوم بالتثبيت
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  if (variant === 'card') {
    return (
      <>
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-5 sm:p-6 shadow-lg text-white border border-emerald-500/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md shrink-0">
              <Smartphone className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base header-font leading-tight">تثبيت تطبيق أوراد على جهازك</h3>
              <p className="text-[11px] text-emerald-100/90 font-bold mt-0.5">
                وصول فوري للمصحف والأذكار والعمل بدون إنترنت في المسجد والسفر
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAction}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-2xl font-black header-font text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isIOS ? 'خطوات التثبيت على آيفون / آيباد' : 'تثبيت التطبيق الآن'}</span>
          </button>
        </div>
        {iosGuidePortal}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAction}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-[11px] font-black header-font shadow-sm active:scale-95 transition-all shrink-0"
        title="تثبيت التطبيق على الهاتف للعمل بدون إنترنت"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">{isIOS ? 'تثبيت iOS' : 'تثبيت التطبيق'}</span>
      </button>
      {iosGuidePortal}
    </>
  );
};

export const InstalledStatusBadge: React.FC = () => {
  const { isInstalled } = usePWAInstall();
  if (!isInstalled) return null;
  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span>التطبيق مثبّت ويعمل كبرنامج مستقل ✓</span>
    </div>
  );
};
