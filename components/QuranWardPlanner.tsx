import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  RotateCcw, 
  Check, 
  Plus, 
  Minus, 
  Calendar, 
  Bookmark, 
  Award, 
  Layers, 
  FileText, 
  Share2, 
  ArrowRight,
  Flame,
  Clock,
  Settings2
} from 'lucide-react';
import { DailyLog, QuranWardPlan } from '../types';
import { QURAN_30_JUZ, QURAN_114_SURAHS, getSurahAtPage, getJuzAtPage } from '../utils/quranData';

interface QuranWardPlannerProps {
  log: DailyLog;
  onUpdateLog: (log: DailyLog) => void;
}

const PAGE_PRESETS = [
  { count: 5, label: '٥ صفحات', sub: 'ختمة كل ٤ أشهر' },
  { count: 10, label: '١٠ صفحات', sub: 'ختمة كل شهرين' },
  { count: 20, label: '٢٠ صفحة', sub: 'جزء كامل (ختمة شهرية)' },
  { count: 40, label: '٤٠ صفحة', sub: 'جزآن (ختمتان شهرياً)' }
];

const LOCAL_STORAGE_KEY = 'worship_quran_ward_plan';

export const QuranWardPlanner: React.FC<QuranWardPlannerProps> = ({ log, onUpdateLog }) => {
  const existingPlan = log.quran?.wardPlan;
  const currentReadPages = useMemo(() => new Set(log.quran?.readPages || []), [log.quran?.readPages]);

  // استرجاع الإعدادات المسبقة من localStorage لو لم تكن محددة في سجل اليوم
  const [mode, setMode] = useState<'pages' | 'juz'>(() => {
    if (existingPlan?.mode) return existingPlan.mode;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode) return parsed.mode;
      }
    } catch (e) {}
    return 'pages';
  });

  const [targetPagesCount, setTargetPagesCount] = useState<number>(() => {
    if (existingPlan?.targetPagesCount) return existingPlan.targetPagesCount;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.targetPagesCount) return parsed.targetPagesCount;
      }
    } catch (e) {}
    return 20; // الافتراضي: 20 صفحة (جزء كامل)
  });

  const [startPage, setStartPage] = useState<number>(() => {
    if (existingPlan?.startPage) return existingPlan.startPage;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.startPage) return parsed.startPage;
      }
    } catch (e) {}
    return 1;
  });

  const [selectedJuzId, setSelectedJuzId] = useState<number>(() => {
    if (existingPlan?.selectedJuz) return existingPlan.selectedJuz;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedJuz) return parsed.selectedJuz;
      }
    } catch (e) {}
    return 1;
  });

  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // حساب البداية والنهاية بناء على النمط المحدد
  const { effectiveStart, effectiveEnd, effectiveTotal } = useMemo(() => {
    if (mode === 'juz') {
      const juz = QURAN_30_JUZ.find(j => j.id === selectedJuzId) || QURAN_30_JUZ[0];
      return {
        effectiveStart: juz.startPage,
        effectiveEnd: juz.endPage,
        effectiveTotal: juz.totalPages
      };
    } else {
      const start = Math.max(1, Math.min(604, startPage));
      const end = Math.min(604, start + Math.max(1, targetPagesCount) - 1);
      return {
        effectiveStart: start,
        effectiveEnd: end,
        effectiveTotal: end - start + 1
      };
    }
  }, [mode, selectedJuzId, startPage, targetPagesCount]);

  // قائمة أرقام صفحات الورد لهذا اليوم
  const wardPagesList = useMemo(() => {
    const list: number[] = [];
    for (let p = effectiveStart; p <= effectiveEnd; p++) {
      list.push(p);
    }
    return list;
  }, [effectiveStart, effectiveEnd]);

  // الصفحات المنجزة من صفحات هذا الورد
  const completedWardPages = useMemo(() => {
    return wardPagesList.filter(p => currentReadPages.has(p));
  }, [wardPagesList, currentReadPages]);

  const completedCount = completedWardPages.length;
  const progressPercent = effectiveTotal > 0 ? Math.min(100, Math.round((completedCount / effectiveTotal) * 100)) : 0;
  const isWardDone = completedCount >= effectiveTotal && effectiveTotal > 0;

  // حفظ تفضيلات الخطة ومزامنتها في DailyLog
  const syncPlanToLog = (
    newMode: 'pages' | 'juz',
    newStart: number,
    newTarget: number,
    newJuzId: number,
    updatedReadPages?: number[]
  ) => {
    const finalReadPages = updatedReadPages !== undefined 
      ? updatedReadPages 
      : (log.quran?.readPages || []);

    const updatedPlan: QuranWardPlan = {
      mode: newMode,
      startPage: newMode === 'juz' ? (QURAN_30_JUZ.find(j => j.id === newJuzId)?.startPage || 1) : newStart,
      endPage: newMode === 'juz' ? (QURAN_30_JUZ.find(j => j.id === newJuzId)?.endPage || 21) : Math.min(604, newStart + newTarget - 1),
      targetPagesCount: newMode === 'juz' ? (QURAN_30_JUZ.find(j => j.id === newJuzId)?.totalPages || 20) : newTarget,
      selectedJuz: newMode === 'juz' ? newJuzId : undefined,
      completedPages: wardPagesList.filter(p => finalReadPages.includes(p)),
      isCompleted: isWardDone
    };

    // حفظ في localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        mode: newMode,
        startPage: updatedPlan.startPage,
        targetPagesCount: updatedPlan.targetPagesCount,
        selectedJuz: newJuzId
      }));
    } catch (e) {}

    onUpdateLog({
      ...log,
      quran: {
        ...log.quran,
        readPages: finalReadPages,
        wardPlan: updatedPlan
      }
    });
  };

  // تبديل صفحة معينة (مقروءة أو غير مقروءة)
  const togglePageRead = (pageNumber: number) => {
    const current = log.quran?.readPages || [];
    let updated: number[];
    if (current.includes(pageNumber)) {
      updated = current.filter(p => p !== pageNumber);
    } else {
      updated = [...current, pageNumber];
    }

    syncPlanToLog(mode, startPage, targetPagesCount, selectedJuzId, updated);
  };

  // وضع علامة "تمت قراءة الورد كاملاً" بنقرة واحدة
  const handleCompleteAllWard = () => {
    const current = new Set(log.quran?.readPages || []);
    wardPagesList.forEach(p => current.add(p));
    const updated = Array.from(current);
    syncPlanToLog(mode, startPage, targetPagesCount, selectedJuzId, updated);
    showToast(`ما شاء الله! تمت قراءة كامل الورد (${effectiveTotal} صفحة) بنجاح 🌿`);
  };

  // إضافة صفحة تالية تلقائياً
  const handleAddNextPage = () => {
    const unread = wardPagesList.filter(p => !currentReadPages.has(p));
    if (unread.length === 0) {
      showToast('أتممت جميع صفحات هذا الورد بالفعل!');
      return;
    }
    const nextToRead = unread[0];
    const current = log.quran?.readPages || [];
    const updated = [...current, nextToRead];
    syncPlanToLog(mode, startPage, targetPagesCount, selectedJuzId, updated);
  };

  // إنقاص آخر صفحة مقروءة من الورد
  const handleRemoveLastPage = () => {
    const readInWard = wardPagesList.filter(p => currentReadPages.has(p));
    if (readInWard.length === 0) return;
    const lastPage = readInWard[readInWard.length - 1];
    const current = log.quran?.readPages || [];
    const updated = current.filter(p => p !== lastPage);
    syncPlanToLog(mode, startPage, targetPagesCount, selectedJuzId, updated);
  };

  // إعادة ضبط صفحات ورد اليوم
  const handleResetWard = () => {
    const current = log.quran?.readPages || [];
    const wardSet = new Set(wardPagesList);
    const updated = current.filter(p => !wardSet.has(p));
    syncPlanToLog(mode, startPage, targetPagesCount, selectedJuzId, updated);
    showToast('تمت إعادة ضبط صفحات الورد');
  };

  // الانتقال التلقائي للورد التالي
  const handleAdvanceToNextWard = () => {
    if (mode === 'juz') {
      const nextJuz = selectedJuzId < 30 ? selectedJuzId + 1 : 1;
      setSelectedJuzId(nextJuz);
      const juzMeta = QURAN_30_JUZ.find(j => j.id === nextJuz);
      if (juzMeta) {
        setStartPage(juzMeta.startPage);
        setTargetPagesCount(juzMeta.totalPages);
      }
      syncPlanToLog('juz', juzMeta?.startPage || 1, juzMeta?.totalPages || 20, nextJuz);
      showToast(`تم الانتقال إلى ${juzMeta?.name || 'الجزء التالي'}`);
    } else {
      const nextStart = effectiveEnd < 604 ? effectiveEnd + 1 : 1;
      setStartPage(nextStart);
      syncPlanToLog('pages', nextStart, targetPagesCount, selectedJuzId);
      showToast(`تم الانتقال للورد التالي بدءاً من صفحة ${nextStart}`);
    }
  };

  // مشاركة إنجاز الورد
  const handleShare = async () => {
    const text = `📖 وردي اليومي من القرآن الكريم:
تم إنجاز: ${completedCount} من ${effectiveTotal} صفحة (${progressPercent}%)
الموضع: من صفحة ${effectiveStart} إلى صفحة ${effectiveEnd}
✨ نسأل الله أن يجعله شاهداً لنا لا علينا وربيع قلوبنا.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'وردي القرآني اليومي', text });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast('تم نسخ تقرير الورد القرآني للمشاركة 📋');
      } catch (e) {}
    }
  };

  // معلومات السور المشمولة في الورد الحالي
  const surahsInWard = useMemo(() => {
    const surahSet = new Set<string>();
    wardPagesList.forEach(page => {
      const s = getSurahAtPage(page);
      if (s) surahSet.add(s.name);
    });
    return Array.from(surahSet);
  }, [wardPagesList]);

  // اقتراح توزيع الصفحات على الصلوات الخمس
  const prayerBreakdown = useMemo(() => {
    const base = Math.floor(effectiveTotal / 5);
    const remainder = effectiveTotal % 5;
    return [
      { prayer: 'الفجر', pages: base + (remainder > 0 ? 1 : 0) },
      { prayer: 'الظهر', pages: base + (remainder > 1 ? 1 : 0) },
      { prayer: 'العصر', pages: base + (remainder > 2 ? 1 : 0) },
      { prayer: 'المغرب', pages: base + (remainder > 3 ? 1 : 0) },
      { prayer: 'العشاء', pages: base }
    ];
  }, [effectiveTotal]);

  const startSurah = getSurahAtPage(effectiveStart);
  const endSurah = getSurahAtPage(effectiveEnd);
  const currentJuzMeta = getJuzAtPage(effectiveStart);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* بطاقة شريط التقدم والإنجاز الرئيسية */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-600/30">
        {/* خلفية زخرفية ناعمة */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-24 translate-x-24 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-yellow-400/10 rounded-full blur-2xl translate-y-20 -translate-x-20 pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          {/* ترويسة البطاقة العلوية */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-yellow-300 shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black header-font leading-tight">مخطط الورد اليومي</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-400 text-emerald-950 header-font shadow-xs">
                    {mode === 'juz' ? `جزء ${selectedJuzId}` : `${targetPagesCount} صفحات`}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 font-bold mt-0.5">
                  من صفحة {effectiveStart} إلى {effectiveEnd} • {startSurah.name === endSurah.name ? `سورة ${startSurah.name}` : `سورة ${startSurah.name} ⬅ ${endSurah.name}`}
                </p>
              </div>
            </div>

            {/* زر فتح إعدادات الخطة */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2.5 rounded-2xl transition-all border flex items-center gap-1.5 text-xs font-black header-font ${
                showConfig
                  ? 'bg-white text-emerald-900 border-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="تعديل وتخصيص الورد"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">{showConfig ? 'إخفاء الإعدادات' : 'تخصيص الورد'}</span>
            </button>
          </div>

          {/* شريط التقدم الدائري / الخطي الفاخر */}
          <div className="space-y-2 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className={`w-5 h-5 ${progressPercent === 100 ? 'text-yellow-300 animate-bounce' : 'text-emerald-300'}`} />
                <span className="text-xs font-black header-font">نسبة إنجاز الورد</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-yellow-300">{progressPercent}%</span>
                <span className="text-[10px] text-emerald-200 font-bold">
                  ({completedCount} من {effectiveTotal} صفحة)
                </span>
              </div>
            </div>

            {/* شريط التقدم الفعلي */}
            <div className="w-full bg-black/25 h-3 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                  progressPercent === 100
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-200'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-300'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* الإحصائيات السريعة ومكافأة البركة */}
            <div className="flex items-center justify-between text-[11px] pt-1 text-emerald-100 font-bold">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>الرصيد الإيماني: <b className="text-yellow-300">+{completedCount * 15}</b> نقطة بركة (+15/صفحة)</span>
              </div>
              <div className="flex items-center gap-2">
                {isWardDone ? (
                  <span className="text-yellow-300 font-black flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>تم إتمام ورد اليوم</span>
                  </span>
                ) : (
                  <span>المتبقي: {effectiveTotal - completedCount} صفحة</span>
                )}
              </div>
            </div>
          </div>

          {/* بطاقة التهنئة عند إتمام 100% */}
          {isWardDone && (
            <div className="p-4 bg-yellow-400/20 backdrop-blur-md rounded-2xl border border-yellow-300/40 text-yellow-100 flex flex-wrap items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-yellow-400 text-emerald-950 rounded-xl font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white header-font">هنيئاً لك! أتممت قراءة وردك القرآني لليوم 🌿</h4>
                  <p className="text-[10px] text-yellow-200/90 font-bold">«اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه»</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdvanceToNextWard}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 rounded-xl text-xs font-black header-font transition-all shadow-sm active:scale-95 flex items-center gap-1"
                >
                  <span>بدء الورد التالي</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* أزرار الإجراءات السريعة (قراءة سريعة، إضافة صفحة، مشاركة) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCompleteAllWard}
                disabled={isWardDone}
                className={`px-3.5 py-2 rounded-xl text-xs font-black header-font flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                  isWardDone
                    ? 'bg-white/10 text-emerald-300/60 cursor-not-allowed border border-white/10'
                    : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-white'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تمت قراءة الورد كاملاً</span>
              </button>

              <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/15">
                <button
                  onClick={handleRemoveLastPage}
                  disabled={completedCount === 0}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-all text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  title="إنقاص صفحة واحدة"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-bold font-mono text-white">{completedCount}</span>
                <button
                  onClick={handleAddNextPage}
                  disabled={isWardDone}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-all text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  title="إضافة صفحة مقروءة (+1)"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <button
                  onClick={handleResetWard}
                  className="p-2 hover:bg-white/20 text-emerald-200 hover:text-white rounded-xl transition-all"
                  title="إعادة ضبط صفحات اليوم"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleShare}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black header-font flex items-center gap-1.5 border border-white/15 transition-all active:scale-95"
                title="مشاركة إنجاز الورد"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مشاركة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* لوحة إعداد وتخصيص الورد (تظهر وتختفي أو يمكن تعديلها) */}
      {showConfig && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-black text-slate-800 header-font">تخصيص نمط الورد القرآني اليومي</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">احفظ هدفك القرآني ليتم اعتماده يومياً</span>
          </div>

          {/* تبديل نمط التحديد: بعدد الصفحات أم بجزء معين */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('pages');
                syncPlanToLog('pages', startPage, targetPagesCount, selectedJuzId);
              }}
              className={`py-2.5 rounded-xl text-xs font-black header-font flex items-center justify-center gap-2 transition-all ${
                mode === 'pages'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>تحديد بعدد الصفحات</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('juz');
                const juz = QURAN_30_JUZ.find(j => j.id === selectedJuzId) || QURAN_30_JUZ[0];
                syncPlanToLog('juz', juz.startPage, juz.totalPages, selectedJuzId);
              }}
              className={`py-2.5 rounded-xl text-xs font-black header-font flex items-center justify-center gap-2 transition-all ${
                mode === 'juz'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>تحديد بجزء معين (٣٠ جزءاً)</span>
            </button>
          </div>

          {/* إعدادات النمط الأول: بالصفحات */}
          {mode === 'pages' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* خيارات الصفحات الجاهزة */}
              <div>
                <label className="text-[11px] font-black text-slate-600 header-font block mb-2">
                  الهدف اليومي الموصى به:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAGE_PRESETS.map(preset => (
                    <button
                      key={preset.count}
                      type="button"
                      onClick={() => {
                        setTargetPagesCount(preset.count);
                        syncPlanToLog('pages', startPage, preset.count, selectedJuzId);
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                        targetPagesCount === preset.count
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black header-font">{preset.label}</span>
                      <span className="text-[10px] text-slate-400 font-bold mt-1">{preset.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* تحديد صفحة البداية وعدد الصفحات المخصص */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 header-font flex items-center justify-between">
                    <span>صفحة البداية لليوم (١ - ٦٠٤):</span>
                    <span className="text-emerald-700 font-mono font-bold text-[10px]">
                      {startSurah.name} ({currentJuzMeta.name})
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(1, startPage - 10);
                        setStartPage(next);
                        syncPlanToLog('pages', next, targetPagesCount, selectedJuzId);
                      }}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                      title="السابق ١٠ صفحات"
                    >
                      -١٠
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={startPage}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          const safe = Math.max(1, Math.min(604, val));
                          setStartPage(safe);
                          syncPlanToLog('pages', safe, targetPagesCount, selectedJuzId);
                        }
                      }}
                      className="flex-1 text-center font-mono font-black text-sm p-2 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(604, startPage + 10);
                        setStartPage(next);
                        syncPlanToLog('pages', next, targetPagesCount, selectedJuzId);
                      }}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                      title="التالي ١٠ صفحات"
                    >
                      +١٠
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 header-font flex items-center justify-between">
                    <span>عدد الصفحات المقررة:</span>
                    <span className="text-slate-400 font-bold text-[10px]">
                      النهاية: ص {effectiveEnd}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(1, targetPagesCount - 1);
                        setTargetPagesCount(next);
                        syncPlanToLog('pages', startPage, next, selectedJuzId);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={targetPagesCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          const safe = Math.max(1, Math.min(604, val));
                          setTargetPagesCount(safe);
                          syncPlanToLog('pages', startPage, safe, selectedJuzId);
                        }
                      }}
                      className="flex-1 text-center font-mono font-black text-sm p-2 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(604, targetPagesCount + 1);
                        setTargetPagesCount(next);
                        syncPlanToLog('pages', startPage, next, selectedJuzId);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* إعدادات النمط الثاني: بجزء معين */}
          {mode === 'juz' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <label className="text-[11px] font-black text-slate-600 header-font block">
                اختر الجزء القرآني لورد اليوم (من ١ إلى ٣٠):
              </label>

              {/* القائمة المنسدلة للأجزاء */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
                {QURAN_30_JUZ.map(juz => {
                  const isSelected = selectedJuzId === juz.id;
                  return (
                    <button
                      key={juz.id}
                      type="button"
                      onClick={() => {
                        setSelectedJuzId(juz.id);
                        setStartPage(juz.startPage);
                        setTargetPagesCount(juz.totalPages);
                        syncPlanToLog('juz', juz.startPage, juz.totalPages, juz.id);
                      }}
                      className={`p-2.5 rounded-xl text-right transition-all border flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black header-font">{juz.name}</span>
                        <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          ص {juz.startPage} - {juz.endPage}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {juz.popularName} • ({juz.surahsDesc})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">
              الموضع المعتمد: من صفحة <b className="text-emerald-700 font-mono">{effectiveStart}</b> إلى <b className="text-emerald-700 font-mono">{effectiveEnd}</b> ({effectiveTotal} صفحة)
            </span>
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black header-font text-xs transition-all shadow-xs"
            >
              تم واعتماد
            </button>
          </div>
        </div>
      )}

      {/* مصفوفة صفحات الورد التفاعلية (Checklist & Page Grid) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-black text-slate-800 header-font">
              صفحات الورد لليوم ({completedCount} من {effectiveTotal} منجزة)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            انقر على أي صفحة لتحديدها كمقروءة ✓
          </span>
        </div>

        {/* عرض السور المشمولة في الورد */}
        {surahsInWard.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 font-bold">
            <span className="text-slate-400">السور المشمولة:</span>
            {surahsInWard.map(sName => (
              <span key={sName} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-black header-font">
                سورة {sName}
              </span>
            ))}
          </div>
        )}

        {/* شبكة أزرار الصفحات التفاعلية */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {wardPagesList.map((pageNum) => {
            const isRead = currentReadPages.has(pageNum);
            const surah = getSurahAtPage(pageNum);

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => togglePageRead(pageNum)}
                className={`group relative p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                  isRead
                    ? 'bg-gradient-to-b from-emerald-600 to-teal-700 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
                title={`صفحة ${pageNum} - سورة ${surah.name} (${isRead ? 'مقروءة' : 'اضغط للتحديد'})`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[9px] font-bold truncate max-w-[45px] ${isRead ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {surah.name}
                  </span>
                  {isRead ? (
                    <CheckCircle2 className="w-3 h-3 text-yellow-300 shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 shrink-0" />
                  )}
                </div>
                <span className="text-base font-black font-mono leading-none my-0.5">
                  {pageNum}
                </span>
                <span className={`text-[8.5px] font-bold ${isRead ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {isRead ? 'تمت ✓' : 'صفحة'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* خطة توزيع الورد على الصلوات الخمس */}
      <div className="bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 rounded-3xl p-5 border border-emerald-100/70 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-black text-emerald-950 header-font">
            توزيع الورد المقترح بعد الصلوات الخمس (لتيسير الإنجاز)
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {prayerBreakdown.map((item, idx) => (
            <div 
              key={item.prayer}
              className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-2xs flex flex-col items-center text-center justify-between"
            >
              <span className="text-[10px] text-slate-400 font-bold mb-1">صلاة {item.prayer}</span>
              <span className="text-sm font-black font-mono text-emerald-800">{item.pages} صفحات</span>
              <span className="text-[9px] text-emerald-600 font-bold mt-1">بعد الفريضة</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
          💡 <span className="underline">نصيحة إيمانية:</span> قراءة عدد قليل من الصفحات بعد كل صلاة مكتوبة يجعل ختم الجزء اليومي يسيراً مباركاً دون إحساس بالمشقة أو ضيق الوقت.
        </p>
      </div>

      {/* الإشعار العائم */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
