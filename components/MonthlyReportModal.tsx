import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format, subMonths } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';
import {
  X,
  Printer,
  Image as ImageIcon,
  Calendar,
  BookOpen,
  Award,
  Flame,
  Sparkles,
  CheckCircle2,
  Loader2,
  Sun,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { DailyLog, AppWeights, User } from '../types';
import { computeMonthlyReport } from '../utils/backupAndReport';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  user: User | null;
  targetScore: number;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  logs,
  weights,
  user,
  targetScore,
}) => {
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    set.add(format(now, 'yyyy-MM'));
    set.add(format(subMonths(now, 1), 'yyyy-MM'));
    Object.keys(logs || {}).forEach((dateStr) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        set.add(dateStr.slice(0, 7));
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [logs]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => format(new Date(), 'yyyy-MM'));
  const [isExportingPng, setIsExportingPng] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const report = useMemo(
    () => computeMonthlyReport(logs, weights, selectedMonth, targetScore),
    [logs, weights, selectedMonth, targetScore]
  );

  if (!isOpen) return null;

  const prayerPct =
    report.prayersPossible > 0
      ? Math.round((report.prayersPerformed / report.prayersPossible) * 100)
      : 0;
  const congPct =
    report.prayersPerformed > 0
      ? Math.round((report.prayersInCongregation / report.prayersPerformed) * 100)
      : 0;

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsExportingPng(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `awrad_monthly_report_${selectedMonth}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export report PNG:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const formatMonthLabel = (ym: string) => {
    try {
      const [y, m] = ym.split('-').map(Number);
      return format(new Date(y, m - 1, 1), 'MMMM yyyy', { locale: ar });
    } catch {
      return ym;
    }
  };

  const reportBody = (forPrint = false) => (
    <div
      className={`bg-white text-slate-900 text-right ${
        forPrint ? 'p-6 max-w-3xl mx-auto' : 'p-5 sm:p-7 rounded-3xl border border-slate-200'
      }`}
      dir="rtl"
    >
      {/* ترويسة التقرير */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-emerald-700 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/1795470897746_dc9063b4.jpg"
            alt="شعار أوراد"
            className="w-12 h-12 rounded-2xl object-cover border border-emerald-200 shrink-0"
          />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-emerald-950 header-font">
              التقرير الشهري لحصاد العبادات والأوراد
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              {user?.name ? `المستخدم: ${user.name} • ` : ''}شهر {report.monthLabel}
            </p>
          </div>
        </div>
        <div className="text-left">
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl block">
            تاريخ التقرير: {format(new Date(), 'yyyy/MM/dd')}
          </span>
          <span className="text-[10px] font-bold text-slate-400 block mt-1">
            الهدف اليومي: {targetScore.toLocaleString()} نقطة
          </span>
        </div>
      </div>

      {/* الملخص التنفيذي */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3.5 rounded-2xl bg-emerald-900 text-white">
          <span className="text-[10px] text-emerald-200 font-bold block">إجمالي النقاط</span>
          <span className="text-xl font-black font-mono mt-1 block">
            {report.totalScore.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-200/90 font-bold">
            المتوسط اليومي: {report.avgScore.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 font-bold block">الأيام النشطة</span>
          <span className="text-xl font-black font-mono text-slate-900 mt-1 block">
            {report.loggedDaysCount} / {report.daysInMonth}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold">
            تحقيق الهدف: {report.targetHitDays} يوم
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 font-bold block">الصلوات المفروضة</span>
          <span className="text-xl font-black font-mono text-emerald-800 mt-1 block">
            {report.prayersPerformed} ({prayerPct}%)
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            جماعة: {report.prayersInCongregation} ({congPct}%)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
          <span className="text-[10px] text-amber-800 font-bold block">القرآن الكريم</span>
          <span className="text-xl font-black font-mono text-amber-900 mt-1 block">
            {report.quranReadPages} صفحة
          </span>
          <span className="text-[10px] text-amber-800 font-bold">
            حفظ: {report.quranHifzRub} ربع • تدبر: {report.tadabburCount}
          </span>
        </div>
      </div>

      {/* تفاصيل الأركان الأربعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-black text-emerald-900 header-font flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>الصلاة والسنن والقيام</span>
          </h4>
          <div className="grid grid-cols-2 gap-y-1.5 text-xs">
            <span className="text-slate-500 font-bold">صلاة الفجر:</span>
            <span className="font-mono font-black text-slate-800">{report.fajrCount} يوم</span>
            <span className="text-slate-500 font-bold">الرواتب الكاملة:</span>
            <span className="font-mono font-black text-slate-800">{report.rawatibDays} يوم</span>
            <span className="text-slate-500 font-bold">أيام صلاة الضحى:</span>
            <span className="font-mono font-black text-slate-800">{report.duhaDays} يوم</span>
            <span className="text-slate-500 font-bold">القيام والوتر:</span>
            <span className="font-mono font-black text-slate-800">{report.qiyamMinutes} دقيقة</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-black text-amber-900 header-font flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>الأذكار والصيام وطلب العلم</span>
          </h4>
          <div className="grid grid-cols-2 gap-y-1.5 text-xs">
            <span className="text-slate-500 font-bold">أذكار الصباح / المساء:</span>
            <span className="font-mono font-black text-slate-800">
              {report.morningAthkarDays} / {report.eveningAthkarDays} يوم
            </span>
            <span className="text-slate-500 font-bold">مجموع التسبيح والذكر:</span>
            <span className="font-mono font-black text-slate-800">
              {report.totalCountersDhikr.toLocaleString()}
            </span>
            <span className="text-slate-500 font-bold">أيام الصيام:</span>
            <span className="font-mono font-black text-slate-800">{report.fastingDays} يوم</span>
            <span className="text-slate-500 font-bold">العلم والقراءة:</span>
            <span className="font-mono font-black text-slate-800">
              {report.knowledgeMinutes} د • {report.booksPagesRead} ص
            </span>
          </div>
        </div>
      </div>

      {/* التفصيل الأسبوعي */}
      <div className="mb-5">
        <h4 className="text-xs font-black text-slate-800 header-font mb-2 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>ملخص أسابيع الشهر</span>
        </h4>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100 text-slate-700 font-black header-font">
              <tr>
                <th className="p-2.5">الفترة</th>
                <th className="p-2.5">أيام نشطة</th>
                <th className="p-2.5">متوسط النقاط</th>
                <th className="p-2.5">الصلوات</th>
                <th className="p-2.5">صفحات القرآن</th>
                <th className="p-2.5">الذكر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {report.weeklyBreakdown.map((w) => (
                <tr key={w.weekLabel} className="bg-white">
                  <td className="p-2.5 text-slate-800">{w.weekLabel}</td>
                  <td className="p-2.5 font-mono">{w.activeDays}</td>
                  <td className="p-2.5 font-mono text-emerald-700">{w.avgScore.toLocaleString()}</td>
                  <td className="p-2.5 font-mono">{w.prayersCount}</td>
                  <td className="p-2.5 font-mono">{w.quranPages}</td>
                  <td className="p-2.5 font-mono">{w.dhikrTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* أفضل يوم + نقاء السجل */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="text-xs">
            <span className="font-black text-emerald-950 block">أعلى يوم همّةً في الشهر</span>
            <span className="text-emerald-800 font-bold">
              {report.bestDay
                ? `${report.bestDay.date} — ${report.bestDay.score.toLocaleString()} نقطة`
                : 'لم يُسجَّل بعد'}
            </span>
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-black text-slate-900 block">نقاء السجل والمحاسبة</span>
            <span className="text-slate-600 font-bold">
              {report.pureDaysCount} يوم نقي • خصم الزلات: {report.sinsDeductionTotal.toLocaleString()} ن
            </span>
          </div>
        </div>
      </div>

      {/* مختارات من خواطر التدبر */}
      {report.topTadabburSnippets.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
          <h4 className="text-xs font-black text-amber-950 header-font flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>قطوف من تدبرات الشهر</span>
          </h4>
          <div className="space-y-1.5">
            {report.topTadabburSnippets.map((item, idx) => (
              <p key={idx} className="text-[11px] text-slate-700 font-bold leading-relaxed">
                • <b>[{item.surah}: {item.ayah}]</b> {item.text}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-200 text-center text-[10px] font-bold text-slate-400">
        «أحب الأعمال إلى الله أدومها وإن قل» — تطبيق أوراد لإدارة العبادات اليومية
      </div>
    </div>
  );

  return (
    <>
      {createPortal(
        <div
          className="no-print fixed inset-0 z-[10000] bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          dir="rtl"
          onClick={onClose}
        >
          <div
            className="bg-slate-50 rounded-[2rem] max-w-3xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* شريط التحكم العلوي */}
            <div className="p-4 sm:p-5 bg-emerald-900 text-white flex items-center justify-between gap-3 flex-wrap shrink-0">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-sm sm:text-base font-black header-font">
                    التقرير الشهري للعبادات (PDF / صورة)
                  </h3>
                  <p className="text-[10px] text-emerald-200 font-bold">
                    اختر الشهر وصدّره للطباعة كـ PDF أو احفظه كبطاقة صورة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white/15 border border-white/25 rounded-xl px-3 py-1.5 text-xs font-black text-white outline-none header-font"
                >
                  {availableMonths.map((ym) => (
                    <option key={ym} value={ym} className="text-slate-900">
                      {formatMonthLabel(ym)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-xl text-emerald-100 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* معاينة التقرير */}
            <div className="p-3 sm:p-5 overflow-y-auto flex-1">
              <div ref={cardRef}>{reportBody(false)}</div>
            </div>

            {/* أزرار التصدير */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrintPdf}
                className="flex-1 min-w-[160px] py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black header-font flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>تصدير / طباعة PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                className="flex-1 min-w-[160px] py-3 px-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-2xl text-xs font-black header-font flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-60"
              >
                {isExportingPng ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span>حفظ كصورة PNG</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* نسخة الطباعة المخصصة لـ window.print() */}
      {createPortal(
        <div className="print-only-container hidden">{reportBody(true)}</div>,
        document.body
      )}
    </>
  );
};
