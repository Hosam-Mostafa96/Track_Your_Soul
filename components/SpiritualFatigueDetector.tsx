import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Compass,
  Smile,
  ShieldCheck,
  RefreshCw,
  Sun
} from 'lucide-react';
import { DailyLog } from '../types';
import { calculateTotalScore } from '../utils/scoring';
import { DEFAULT_WEIGHTS } from '../constants';

interface SpiritualFatigueDetectorProps {
  currentScore: number;
  targetScore: number;
  currentLog: DailyLog;
  logs: Record<string, DailyLog>;
  onNavigateTab?: (tab: string) => void;
  onQuickPrayer?: () => void;
}

export const SpiritualFatigueDetector: React.FC<SpiritualFatigueDetectorProps> = ({
  currentScore,
  targetScore,
  currentLog,
  logs,
  onNavigateTab,
  onQuickPrayer
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // تخزين الإغلاق لليوم الحالي فقط حتى لا يزعج المستخدم
  const todayKey = currentLog.date || new Date().toISOString().split('T')[0];
  const storageDismissKey = `spiritual_fatigue_dismissed_${todayKey}`;

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageDismissKey);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [storageDismissKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(storageDismissKey, 'true');
    } catch (e) {
      console.error(e);
    }
  };

  // فحص ما إذا كان هناك انخفاض أو فتور في وتيرة العبادة لليوم:
  // 1. الرصيد سالب أو أقل من 20% من الهدف اليومي.
  // 2. أو انخفاض ملحوظ مقارنة بمتوسط الأيام السابقة.
  // 3. أو لم يتم تسجيل صلوات الفريضة في وقتها حتى منتصف اليوم.
  const isFatigued = React.useMemo(() => {
    if (isDismissed) return false;

    // إذا كان الرصيد سالباً بسبب ذنب أو تقصير
    if (currentScore < 0) return true;

    // احتساب متوسط الأيام السابقة
    const pastScores: number[] = [];
    const dates = Object.keys(logs).filter(d => d !== todayKey).sort().slice(-5);
    dates.forEach(d => {
      if (logs[d]) {
        const sc = calculateTotalScore(logs[d], DEFAULT_WEIGHTS);
        pastScores.push(sc);
      }
    });

    const avgPastScore = pastScores.length > 0 
      ? pastScores.reduce((a, b) => a + b, 0) / pastScores.length 
      : targetScore;

    // إذا كان رصيد اليوم منخفضاً جداً مقارنة بالأيام السابقة بعد مضي جزء من اليوم
    const targetHalf = targetScore > 0 ? targetScore * 0.25 : 50;
    if (currentScore < targetHalf && avgPastScore > 100) {
      return true;
    }

    return false;
  }, [currentScore, targetScore, logs, todayKey, isDismissed]);

  if (!isFatigued) return null;

  return (
    <div className="mx-2 sm:mx-4 my-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-gradient-to-r from-amber-500/20 via-emerald-600/20 to-teal-500/20 backdrop-blur-xl border border-amber-300/40 rounded-2xl p-3.5 sm:p-4 text-white shadow-lg relative overflow-hidden">
        {/* خلفية ضوئية دافئة */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-amber-400/25 text-amber-200 rounded-xl border border-amber-300/30 shrink-0">
                <Sun className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-amber-200 header-font leading-tight">
                    وقفة رفق وطمأنينة • لقلبك اليوم 🌿
                  </h4>
                  <span className="text-[9px] bg-white/15 px-2 py-0.5 rounded-full text-emerald-100 font-bold border border-white/10">
                    الفتور يعرض لكل عابد
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-medium mt-0.5 leading-relaxed">
                  رويدك يا عبد الله، لا تثقل على نفسك إن شعرت بفتور اليوم، فالقلوب تقبل وتدبر، والموفق من لا ينقطع.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-200 hover:text-white transition-all text-xs flex items-center gap-0.5 font-bold"
                title={isExpanded ? 'طي التفاصيل' : 'قراءة النصيحة النبوية والدعاء'}
              >
                <span>{isExpanded ? 'طي' : 'الوصية'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/15 rounded-lg text-amber-200 hover:text-white transition-all"
                title="إخفاء التنبيه لليوم"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* النصيحة النبوية والدعاء (موسعة أو قابلة للعرض) */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-white/15 space-y-2.5 animate-in fade-in duration-200 text-right">
              {/* الحديث النبوي الشريف في علاج الفتور */}
              <div className="bg-black/25 p-3 rounded-xl border border-white/10">
                <p className="text-xs font-bold text-amber-100 header-font leading-relaxed">
                  «إِنَّ لِكُلِّ عَمَلٍ شِرَّةً (أي نشاط وقوة)، وَلِكُلِّ شِرَّةٍ فَتْرَةً (أي فتور وضعف)، فَمَنْ كَانَتْ فَتْرَتُهُ إِلَى سُنَّتِي فَقَدِ اهْتَدَى»
                </p>
                <span className="text-[9px] text-amber-300/80 font-mono block mt-1">
                  — مسند الإمام أحمد وصحيح ابن حبان
                </span>
              </div>

              {/* دعاء شحذ الهمة وتثبيت القلب */}
              <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-400/20 text-[11px] text-emerald-100 leading-relaxed font-bold">
                🤲 <span className="text-amber-200">دعاء اليوم:</span> «اللَّهُمَّ يَا مُقَلِّبَ القُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ، اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ، وَلا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ».
              </div>

              {/* خطوة عملية يسيرة دون إثقال */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <p className="text-[10px] text-emerald-200/90 font-medium">
                  💡 <span className="text-white font-bold">وصية عملية:</span> يكفيك الآن ركعتان خفيفتان أو صفحة قرآن واحدة بتدبر، فـ «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ».
                </p>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('entry')}
                      className="py-1 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-black header-font shadow-xs transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-slate-950" />
                      <span>ركعتان خفيفتان 🕌</span>
                    </button>
                  )}

                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('quran')}
                      className="py-1 px-3 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      صفحة قرآن 📖
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
