import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Share2,
  Sparkles,
  Heart,
  Layers,
  Flame,
  FileText,
  X,
  Scroll,
  TrendingUp,
  BookmarkCheck
} from 'lucide-react';
import { DailyLog, QuranKhatmaRecord } from '../types';

interface QuranKhatmatHistoryProps {
  log: DailyLog;
  logs: Record<string, DailyLog>;
  onUpdateLog: (log: DailyLog) => void;
}

const KHATMAT_STORAGE_KEY = 'worship_quran_khatmat_history';

// نص دعاء ختم القرآن الكريم المأثور والمستحب
const DUA_KHATMA_TEXT = `اللهم ارحمني بالقرآن واجعله لي إماماً ونوراً وهدىً ورحمة.
اللهم ذكّرني منه ما نسيت، وعلّمني منه ما جهلت، وارزقني تلاوته آناء الليل وأطراف النهار، واجعله لي حجة يا رب العالمين.
اللهم أصلح لي ديني الذي هو عصمة أمري، وأصلح لي دنياي التي فيها معاشي، وأصلح لي آخرتي التي فيها معادي، واجعل الحياة زيادة لي في كل خير، واجعل الموت راحة لي من كل شر.
اللهم اجعل خير عمري آخره وخير عملي خواتمه وخير أيامي يوم ألقاك فيه.
اللهم إنا نسألك عيشة هنية وميتة سوية ومردّاً غير مخزٍ ولا فاضح.
اللهم إنا نسألك خير المسألة وخير الدعاء وخير النجاح وخير العلم وخير العمل وخير الثواب وخير الحياة وخير الممات.
اللهم لا تدع لنا ذنباً إلا غفرته، ولا هماً إلا فرجته، ولا دَيناً إلا قضيته، ولا حاجة من حوائج الدنيا والآخرة هي لك رضى ولنا فيها صلاح إلا قضيتها يا أرحم الراحمين.`;

export const QuranKhatmatHistory: React.FC<QuranKhatmatHistoryProps> = ({
  log,
  logs,
  onUpdateLog
}) => {
  // استرجاع سجل الختمات المخزنة
  const [khatmat, setKhatmat] = useState<QuranKhatmaRecord[]>(() => {
    try {
      const saved = localStorage.getItem(KHATMAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading khatmat:', e);
    }
    return [];
  });

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDuaModal, setShowDuaModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // حقول نموذج إضافة ختمة جديدة
  const nextKhatmaNum = useMemo(() => {
    if (khatmat.length === 0) return 1;
    const maxNum = Math.max(...khatmat.map(k => k.khatmaNumber || 0));
    return maxNum + 1;
  }, [khatmat]);

  const [formData, setFormData] = useState<{
    khatmaNumber: number;
    title: string;
    completionDate: string;
    startDate: string;
    type: 'tilawah' | 'hifz' | 'tadabbur' | 'murajaah';
    dedication: string;
    notes: string;
  }>({
    khatmaNumber: nextKhatmaNum,
    title: `الختمة المباركة رقم ${nextKhatmaNum}`,
    completionDate: log.date || new Date().toISOString().split('T')[0],
    startDate: '',
    type: 'tilawah',
    dedication: '',
    notes: ''
  });

  // تحديث رقم الختمة في النموذج إذا تغيرت الختمات
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      khatmaNumber: nextKhatmaNum,
      title: prev.title.startsWith('الختمة المباركة رقم')
        ? `الختمة المباركة رقم ${nextKhatmaNum}`
        : prev.title
    }));
  }, [nextKhatmaNum]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveKhatmat = (newKhatmat: QuranKhatmaRecord[]) => {
    setKhatmat(newKhatmat);
    try {
      localStorage.setItem(KHATMAT_STORAGE_KEY, JSON.stringify(newKhatmat));
    } catch (e) {
      console.error('Error saving khatmat:', e);
    }
  };

  // ----------------------------------------------------
  // حسابات الإحصائيات الإجمالية للأجزاء والصفحات المنجزة
  // ----------------------------------------------------
  const stats = useMemo(() => {
    // 1. الأجزاء المنجزة من الختمات السابقة المكتملة
    const ajzaFromCompletedKhatmat = khatmat.reduce((acc, k) => acc + (k.totalAjza || 30), 0);

    // 2. إحصاء الصفحات والأرباع المقروءة عبر جميع السجلات اليومية (logs)
    const allLogsList = Object.values(logs || {});
    
    // مجموع الصفحات المقروءة من المصحف التفاعلي عبر الأيام
    let totalReadPagesLogged = 0;
    // مجموع أرباع الحفظ والمراجعة
    let totalHifzRub = 0;
    let totalRevisionRub = 0;

    allLogsList.forEach(dayLog => {
      if (dayLog.quran) {
        if (Array.isArray(dayLog.quran.readPages)) {
          totalReadPagesLogged += dayLog.quran.readPages.length;
        }
        totalHifzRub += dayLog.quran.hifzRub || 0;
        totalRevisionRub += dayLog.quran.revisionRub || 0;
      }
    });

    // تحويل الصفحات اليومية إلى أجزاء (الجزء القرآني = 20 صفحة تقريباً)
    const ajzaFromDailyPages = Math.floor(totalReadPagesLogged / 20);
    const remainderPages = totalReadPagesLogged % 20;

    // تحويل أرباع الحفظ والمراجعة إلى أجزاء (الجزء = 8 أرباع)
    const ajzaFromHifzAndRevision = Math.floor((totalHifzRub + totalRevisionRub) / 8);

    // الإجمالي الكلي للأجزاء المنجزة (الختمات الكاملة + أي أجزاء إضافية مقروءة في الأوراد اليومية)
    const grandTotalAjza = ajzaFromCompletedKhatmat + ajzaFromDailyPages;

    // إجمالي الصفحات الكلي المعادل
    const grandTotalPages = (ajzaFromCompletedKhatmat * 20) + totalReadPagesLogged;

    // نسبة التقدم في الختمة الحالية (0 إلى 100%)
    const currentKhatmaProgressPercent = Math.min(100, Math.round((remainderPages / 20) * 100));

    return {
      completedKhatmatCount: khatmat.length,
      ajzaFromCompletedKhatmat,
      totalReadPagesLogged,
      ajzaFromDailyPages,
      remainderPages,
      ajzaFromHifzAndRevision,
      grandTotalAjza,
      grandTotalPages,
      currentKhatmaProgressPercent
    };
  }, [khatmat, logs]);

  // إضافة ختمة جديدة
  const handleAddKhatma = (e: React.FormEvent) => {
    e.preventDefault();

    let calculatedDays: number | undefined = undefined;
    if (formData.startDate && formData.completionDate) {
      const start = new Date(formData.startDate).getTime();
      const end = new Date(formData.completionDate).getTime();
      if (end >= start) {
        calculatedDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    const newRecord: QuranKhatmaRecord = {
      id: 'khatma_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      khatmaNumber: formData.khatmaNumber,
      title: formData.title.trim() || `الختمة المباركة رقم ${formData.khatmaNumber}`,
      completionDate: formData.completionDate,
      startDate: formData.startDate || undefined,
      durationDays: calculatedDays,
      type: formData.type,
      totalAjza: 30,
      dedication: formData.dedication.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: Date.now()
    };

    // ترتيب السجل تنازلياً حسب تاريخ الإتمام ثم رقم الختمة
    const updatedList = [newRecord, ...khatmat].sort((a, b) => {
      return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
    });

    saveKhatmat(updatedList);

    // تحديث رقم الختمة في سجل اليوم الحالي إذا كان أقل
    if ((log.quran?.khatmaNumber || 1) <= formData.khatmaNumber) {
      onUpdateLog({
        ...log,
        quran: {
          ...log.quran,
          khatmaNumber: formData.khatmaNumber + 1
        }
      });
    }

    setShowAddModal(false);
    showToast(`مبارك! تم توثيق «${newRecord.title}» بنجاح في سجلك القرآني 🌿`);

    // عرض دعاء الختمة احتفاءً بالإنجاز
    setShowDuaModal(true);
  };

  // حذف ختمة
  const handleDeleteKhatma = (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف سجل "${title}"؟`)) {
      const filtered = khatmat.filter(k => k.id !== id);
      saveKhatmat(filtered);
      showToast('تم حذف الختمة من السجل');
    }
  };

  // مشاركة بطاقة الختمة
  const handleShareKhatma = async (record: QuranKhatmaRecord) => {
    const text = `🌸 بفضل الله وتوفيقه، تم إتمام:
📖 ${record.title}
📅 تاريخ الإتمام: ${record.completionDate}
✨ عدد الأجزاء: ٣٠ جزءاً كاملاً (٦٠٤ صفحة)
${record.durationDays ? `⏱️ المدة: أُنجزت في ${record.durationDays} يوماً\n` : ''}${record.dedication ? `💝 الإهداء: ${record.dedication}\n` : ''}
«اللهم اجعل القرآن العظيم ربيع قلوبنا وجلاء أحزاننا وشفيعاً لنا يوم القيامة»`;

    if (navigator.share) {
      try {
        await navigator.share({ title: record.title, text });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast('تم نسخ تقرير الختمة بنجاح للمشاركة 📋');
      } catch (e) {}
    }
  };

  // تسميات أنواع الختمات
  const getTypeBadge = (type: QuranKhatmaRecord['type']) => {
    switch (type) {
      case 'hifz':
        return { label: 'ختمة حفظ وإتقان', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'tadabbur':
        return { label: 'ختمة تدبر وتفكر', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'murajaah':
        return { label: 'ختمة مراجعة وتثبيت', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: 'ختمة تلاوة ومدارسة', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-right" dir="rtl">
      {/* ---------------------------------------------------- */}
      {/* البطاقة الإحصائية الكبرى: إجمالي الأجزاء والختمات */}
      {/* ---------------------------------------------------- */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/40">
        {/* زخارف نورانية ناعمة في الخلفية */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-y-28 translate-x-28 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl translate-y-24 -translate-x-24 pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* الترويسة الرئيسية */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-amber-300 shadow-inner">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg sm:text-xl font-black header-font leading-tight">
                    سجل الختمات وإحصائية الأجزاء
                  </h3>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-emerald-950 header-font shadow-xs">
                    {stats.completedKhatmatCount} {stats.completedKhatmatCount === 1 ? 'ختمة' : 'ختمات'}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 font-bold mt-1">
                  متابعة موثقة لختمات كتاب الله وتراكم الأجزاء المنجزة المباركة
                </p>
              </div>
            </div>

            {/* أزرار الإجراءات في الترويسة */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDuaModal(true)}
                className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-200 border border-white/15 text-xs font-black header-font transition-all flex items-center gap-1.5"
                title="قراءة دعاء ختم القرآن"
              >
                <Scroll className="w-4 h-4" />
                <span>دعاء الختم</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-emerald-950 font-black header-font text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>توثيق ختمة مباركة</span>
              </button>
            </div>
          </div>

          {/* شبكة المؤشرات والإحصائيات الرئيسية */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. إجمالي الأجزاء المنجزة إجمالياً (الطلب المحوري للمستخدم) */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 relative overflow-hidden group">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-bold mb-2">
                <span>إجمالي الأجزاء المنجزة</span>
                <Layers className="w-4 h-4 text-amber-300" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300">
                  {stats.grandTotalAjza}
                </span>
                <span className="text-xs text-emerald-200 font-bold">جزءاً</span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-bold mt-2">
                {stats.ajzaFromCompletedKhatmat} جزءاً بالختمات + {stats.ajzaFromDailyPages} بالأوراد
              </p>
            </div>

            {/* 2. عدد الختمات التامة */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-bold mb-2">
                <span>الختمات المكتملة</span>
                <BookmarkCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                  {stats.completedKhatmatCount}
                </span>
                <span className="text-xs text-emerald-200 font-bold">ختمة تامة</span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-bold mt-2">
                {stats.completedKhatmatCount > 0 ? `بإجمالي ${stats.completedKhatmatCount * 30} جزءاً قرآنياً` : 'ابدأ بتوثيق أول ختمة'}
              </p>
            </div>

            {/* 3. إجمالي الصفحات المقروءة */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-bold mb-2">
                <span>إجمالي الصفحات الموثقة</span>
                <BookOpen className="w-4 h-4 text-teal-300" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                  {stats.grandTotalPages}
                </span>
                <span className="text-xs text-emerald-200 font-bold">صفحة</span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-bold mt-2">
                تعادل {stats.grandTotalAjza} جزءاً و {stats.remainderPages} صفحة
              </p>
            </div>

            {/* 4. رصيد البركة والثواب المقدر */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-bold mb-2">
                <span>الختمة الحالية الجارية</span>
                <Flame className="w-4 h-4 text-yellow-300" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                  الختمة {nextKhatmaNum}
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-bold mt-2">
                {stats.remainderPages} / 20 صفحة في الجزء الحالي
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* قائمة وسجل الختمات السابقة (Timeline / History) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-100 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-sm sm:text-base font-black text-slate-800 header-font">
                سجل الختمات السابقة ({khatmat.length})
              </h4>
              <p className="text-[11px] text-slate-400 font-bold">
                تاريخ إتمام كل ختمة مع تفاصيل المدة والإهداء
              </p>
            </div>
          </div>

          {khatmat.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black header-font transition-all flex items-center gap-1.5 border border-emerald-200/60"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ختمة أخرى</span>
            </button>
          )}
        </div>

        {/* إذا لم يكن هناك ختمات مسجلة بعد */}
        {khatmat.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-4 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h5 className="text-sm font-black text-slate-800 header-font">
                لم يتم تسجيل أي ختمة سابقة حتى الآن
              </h5>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                قم بتوثيق ختماتك السابقة التي أتممتها بفضل الله لحفظ تاريخ إتمامها واحتساب أجزائها تلقائياً ضمن إحصائياتك الإجمالية.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black header-font transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>توثيق أول ختمة مباركة</span>
            </button>
          </div>
        ) : (
          /* عرض بطاقات الختمات السابقة */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {khatmat.map((record, index) => {
              const typeInfo = getTypeBadge(record.type);

              return (
                <div
                  key={record.id}
                  className="bg-slate-50/60 hover:bg-slate-50 rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-4 relative group shadow-2xs"
                >
                  {/* رأس بطاقة الختمة */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black header-font text-sm shadow-xs shrink-0">
                        {record.khatmaNumber || index + 1}
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-slate-900 header-font leading-tight">
                          {record.title}
                        </h5>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${typeInfo.bg}`}>
                            {typeInfo.label}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            ٣٠ جزءاً كاملاً
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* زر الحذف السريع */}
                    <button
                      onClick={() => handleDeleteKhatma(record.id, record.title)}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-80 group-hover:opacity-100"
                      title="حذف هذا السجل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* تفاصيل التواريخ والمدة */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white rounded-xl p-3 border border-slate-100">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold block">تاريخ الإتمام:</span>
                      <div className="flex items-center gap-1 font-mono font-black text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{record.completionDate}</span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold block">المدة المستغرقة:</span>
                      <div className="flex items-center gap-1 font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {record.durationDays
                            ? `${record.durationDays} يوماً`
                            : record.startDate
                            ? `من ${record.startDate}`
                            : 'غير محددة'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* الإهداء والملاحظات */}
                  {(record.dedication || record.notes) && (
                    <div className="space-y-1.5 text-xs text-slate-600 bg-emerald-50/40 rounded-xl p-3 border border-emerald-100/60">
                      {record.dedication && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 font-bold">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                          <span>إهداء: {record.dedication}</span>
                        </div>
                      )}
                      {record.notes && (
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          «{record.notes}»
                        </p>
                      )}
                    </div>
                  )}

                  {/* تذييل البطاقة ومشاركتها */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold">
                      أُنجز ٣٠ جزءاً (٦٠٤ صفحة)
                    </span>
                    <button
                      onClick={() => handleShareKhatma(record)}
                      className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      title="مشاركة إنجاز الختمة"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>مشاركة</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* نافذة منبثقة: نموذج توثيق ختمة مباركة جديدة */}
      {/* ---------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-200 text-right">
            {/* رأس النافذة */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 header-font">
                    توثيق ختمة مباركة في السجل
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bold">
                    أدخل تاريخ الإتمام والتفاصيل لاحتساب الأجزاء إجمالياً
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* النموذج */}
            <form onSubmit={handleAddKhatma} className="space-y-4">
              {/* رقم وعنوان الختمة */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 header-font block">
                    رقم الختمة:
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.khatmaNumber}
                    onChange={e => setFormData({ ...formData, khatmaNumber: parseInt(e.target.value, 10) || 1 })}
                    className="w-full text-center font-mono font-black text-sm p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-black text-slate-700 header-font block">
                    عنوان أو مناسبة الختمة:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: ختمة رمضان المبارك، ختمة التدبر..."
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50"
                  />
                </div>
              </div>

              {/* نوع الختمة */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 header-font block">
                  نوع الختمة:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'tilawah', label: 'تلاوة ومدارسة' },
                    { id: 'hifz', label: 'حفظ وإتقان' },
                    { id: 'tadabbur', label: 'تدبر وتفكر' },
                    { id: 'murajaah', label: 'مراجعة وتثبيت' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.id as any })}
                      className={`p-2 rounded-xl text-xs font-black header-font border transition-all ${
                        formData.type === t.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* تواريخ الإتمام والبدء */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 header-font block">
                    تاريخ إتمام الختمة: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.completionDate}
                    onChange={e => setFormData({ ...formData, completionDate: e.target.value })}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 header-font block">
                    تاريخ البدء (اختياري لحساب الأيام):
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50"
                  />
                </div>
              </div>

              {/* الإهداء */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 header-font block">
                  إهداء أو نية الختمة (اختياري):
                </label>
                <input
                  type="text"
                  value={formData.dedication}
                  onChange={e => setFormData({ ...formData, dedication: e.target.value })}
                  placeholder="مثال: لوالديّ الكريمين رحمهما الله، أو نصرة لإخواننا..."
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50"
                />
              </div>

              {/* خواطر أو ملاحظات */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 header-font block">
                  خواطر أو ملاحظات حول الختمة:
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أثر هذه الختمة في نفسك، أو آية أثرت في قلبك..."
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50 resize-none"
                ></textarea>
              </div>

              {/* أزرار الإرسال والإلغاء */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وتوثيق الختمة (+٣٠ جزءاً)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* نافذة منبثقة: دعاء ختم القرآن الكريم المأثور */}
      {/* ---------------------------------------------------- */}
      {showDuaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Scroll className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 header-font">
                    دعاء ختم القرآن الكريم
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bold">
                    دعاء جامع مبارك عند إتمام كتاب الله
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDuaModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/70">
              <p className="quran-font text-base sm:text-lg leading-loose text-slate-800 whitespace-pre-line text-center">
                {DUA_KHATMA_TEXT}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(DUA_KHATMA_TEXT);
                    showToast('تم نسخ دعاء الختم المبارك 📋');
                  } catch (e) {}
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>نسخ الدعاء</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDuaModal(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* إشعار منبثق سريع */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
