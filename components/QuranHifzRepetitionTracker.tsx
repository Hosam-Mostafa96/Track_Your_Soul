import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Award,
  ChevronLeft,
  X,
  Star,
  Check,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface HifzItem {
  id: string;
  surahName: string;
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
  portionType: 'ayahs' | 'page' | 'rub' | 'surah';
  pageNumber?: number;
  stage: 'new' | 'recent' | 'stable'; // الجديد، الماضي القريب، الماضي البعيد الراسخ
  intervalDays: number; // 1, 3, 7, 14, 30
  repetitionCount: number;
  lastReviewedDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  strength: 'excellent' | 'good' | 'weak';
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = 'worship_hifz_spaced_repetition_v1';

const INITIAL_ITEMS: HifzItem[] = [
  {
    id: 'h1',
    surahName: 'الملك',
    surahNumber: 67,
    fromAyah: 1,
    toAyah: 30,
    portionType: 'surah',
    stage: 'stable',
    intervalDays: 14,
    repetitionCount: 6,
    lastReviewedDate: '2026-09-25',
    nextDueDate: '2026-10-02',
    strength: 'excellent',
    createdAt: '2026-08-01'
  },
  {
    id: 'h2',
    surahName: 'الكهف',
    surahNumber: 18,
    fromAyah: 1,
    toAyah: 10,
    portionType: 'ayahs',
    stage: 'recent',
    intervalDays: 7,
    repetitionCount: 4,
    lastReviewedDate: '2026-09-27',
    nextDueDate: '2026-10-04',
    strength: 'good',
    createdAt: '2026-09-01'
  },
  {
    id: 'h3',
    surahName: 'يس',
    surahNumber: 36,
    fromAyah: 1,
    toAyah: 20,
    portionType: 'ayahs',
    stage: 'new',
    intervalDays: 1,
    repetitionCount: 1,
    lastReviewedDate: '2026-10-03',
    nextDueDate: '2026-10-04',
    strength: 'weak',
    createdAt: '2026-10-03'
  }
];

interface QuranHifzRepetitionTrackerProps {
  onClose?: () => void;
  onNavigateMushaf?: (page: number) => void;
}

export const QuranHifzRepetitionTracker: React.FC<QuranHifzRepetitionTrackerProps> = ({
  onClose,
  onNavigateMushaf
}) => {
  const [items, setItems] = useState<HifzItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ITEMS;
  });

  const [activeTab, setActiveTab] = useState<'due_today' | 'all' | 'new_hifz'>('due_today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add form state
  const [newSurah, setNewSurah] = useState('البقرة');
  const [newSurahNum, setNewSurahNum] = useState(2);
  const [newFromAyah, setNewFromAyah] = useState('1');
  const [newToAyah, setNewToAyah] = useState('10');
  const [newPortionType, setNewPortionType] = useState<'ayahs' | 'page' | 'rub' | 'surah'>('ayahs');
  const [newPageNum, setNewPageNum] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // الحصص المستحقة للمراجعة اليوم (أو المتأخرة)
  const dueTodayItems = useMemo(() => {
    return items.filter(item => item.nextDueDate <= todayStr);
  }, [items, todayStr]);

  // تسجيل نتيجة المراجعة بالتكرار المتباعد
  const handleReviewResult = (id: string, strength: 'excellent' | 'good' | 'weak') => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;

      let nextInterval = 1;
      let newStage: 'new' | 'recent' | 'stable' = item.stage;

      if (strength === 'excellent') {
        // إذا كان متقناً يتقدم في الفاصل الزمني (1 -> 3 -> 7 -> 14 -> 30)
        if (item.intervalDays === 1) nextInterval = 3;
        else if (item.intervalDays === 3) nextInterval = 7;
        else if (item.intervalDays === 7) nextInterval = 14;
        else nextInterval = 30;

        if (nextInterval >= 14) newStage = 'stable';
        else if (nextInterval >= 7) newStage = 'recent';
      } else if (strength === 'good') {
        // تقدم معتدل
        nextInterval = Math.min(14, item.intervalDays + 2);
        if (nextInterval >= 7) newStage = 'recent';
      } else {
        // ضعيف أو يحتاج تثبيت: إعادة إلى مراجعة الغد للتكرار والتثبيت
        nextInterval = 1;
        newStage = 'new';
      }

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextInterval);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      return {
        ...item,
        lastReviewedDate: todayStr,
        nextDueDate: nextDateStr,
        intervalDays: nextInterval,
        repetitionCount: item.repetitionCount + 1,
        strength,
        stage: newStage
      };
    }));

    if (strength === 'excellent') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  // حذف مقطع
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // إضافة مقطع جديد
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurah) return;

    const fromA = Number(newFromAyah) || 1;
    const toA = Number(newToAyah) || 1;
    const pageNum = Number(newPageNum) || undefined;

    // المقطع الجديد يبدأ بفاصل يوم واحد (غداً)
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDueDate = nextDate.toISOString().split('T')[0];

    const newItem: HifzItem = {
      id: `hifz_${Date.now()}`,
      surahName: newSurah.trim(),
      surahNumber: newSurahNum,
      fromAyah: fromA,
      toAyah: toA,
      portionType: newPortionType,
      pageNumber: pageNum,
      stage: 'new',
      intervalDays: 1,
      repetitionCount: 1,
      lastReviewedDate: todayStr,
      nextDueDate,
      strength: 'good',
      notes: newNotes.trim() || undefined,
      createdAt: todayStr
    };

    setItems(prev => [newItem, ...prev]);
    setShowAddModal(false);
    setNewNotes('');

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeTab === 'due_today') {
      list = dueTodayItems;
    } else if (activeTab === 'new_hifz') {
      list = items.filter(i => i.stage === 'new');
    }

    if (searchTerm.trim()) {
      list = list.filter(i => i.surahName.includes(searchTerm.trim()));
    }
    return list;
  }, [items, dueTodayItems, activeTab, searchTerm]);

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100 relative text-right" dir="rtl">
      {/* الترويسة العلوية */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg leading-tight">
                متابعة الحفظ والمراجعة التكرارية
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Spaced Repetition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              منهجية علمية لتثبيت القرآن الكريم (الجديد • الماضي القريب • الماضي البعيد الراسخ)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black header-font flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>حفظ جديد</span>
          </button>

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
      </div>

      {/* لوحة الإحصائيات السريعة */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80">
          <span className="text-[10px] text-amber-800 font-bold block">مستحق اليوم</span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-900">
            {dueTodayItems.length} مقاطع
          </span>
        </div>
        <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80">
          <span className="text-[10px] text-emerald-800 font-bold block">الراسخ والمثبت</span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-900">
            {items.filter(i => i.stage === 'stable').length} مقاطع
          </span>
        </div>
        <div className="bg-teal-50/80 p-3 rounded-2xl border border-teal-200/80">
          <span className="text-[10px] text-teal-800 font-bold block">إجمالي المقاطع</span>
          <span className="text-base sm:text-lg font-black font-mono text-teal-900">
            {items.length}
          </span>
        </div>
      </div>

      {/* شريط التبويبات والبحث */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('due_today')}
            className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'due_today' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            المستحق اليوم ({dueTodayItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            كافة المحفوظات ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new_hifz')}
            className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'new_hifz' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            الحفظ الجديد ({items.filter(i => i.stage === 'new').length})
          </button>
        </div>

        <div className="relative w-full sm:w-48">
          <input
            type="text"
            placeholder="بحث عن سورة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-1.5 pr-8 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* قائمة بطاقات المراجعة التكرارية */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-xs sm:text-sm font-black text-slate-800 header-font">
              {activeTab === 'due_today' ? 'هنيئاً لك! أتممت مراجعات اليوم المقررة 🎉' : 'لا توجد مقاطع محفوظة هنا'}
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              أضف مقاطع جديدة أو راجع خطتك لبناء حفظ متقن كالجبال الرواسي.
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isDue = item.nextDueDate <= todayStr;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDue
                    ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                    : 'bg-white border-slate-100 hover:border-emerald-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      item.stage === 'stable'
                        ? 'bg-emerald-600 text-white'
                        : item.stage === 'recent'
                        ? 'bg-teal-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {item.surahName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-800 text-sm header-font">
                          سورة {item.surahName}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          الآيات {item.fromAyah} - {item.toAyah}
                        </span>
                        {item.pageNumber && (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            ص {item.pageNumber}
                          </span>
                        )}
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          item.stage === 'stable'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.stage === 'recent'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {item.stage === 'stable' ? 'ماضٍ بعيد راسخ' : item.stage === 'recent' ? 'ماضٍ قريب' : 'حفظ جديد'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        التكرار: {item.repetitionCount} مرات • الفاصل الزمني: كل {item.intervalDays} أيام • الموعد القادم: {item.nextDueDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.pageNumber && onNavigateMushaf && (
                      <button
                        type="button"
                        onClick={() => onNavigateMushaf(item.pageNumber!)}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                      >
                        فتح بالمصحف
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                      title="حذف المقطع"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* أزرار تقييم المراجعة (Spaced Repetition Feedback) */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>قيّم جودة التسميع لجدولة الموعد القادم:</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleReviewResult(item.id, 'excellent')}
                      className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black header-font border border-emerald-200 flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                      <span>راسخ ومتقن</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReviewResult(item.id, 'good')}
                      className="py-1 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold header-font border border-teal-200 flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Check className="w-3 h-3 text-teal-600" />
                      <span>جيد</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReviewResult(item.id, 'weak')}
                      className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold header-font border border-rose-200 flex items-center gap-1 transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3 h-3 text-rose-600" />
                      <span>يحتاج تثبيت (غداً)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* نافذة إضافة مقطع حفظ جديد */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-6 shadow-2xl relative border border-slate-100 text-right">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 left-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base header-font">
                  إضافة مقطع حفظ ومراجعة جديد
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                  سيتم جدولته تلقائياً وفق التكرار المتباعد
                </p>
              </div>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  اسم السورة *
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: الكهف، مريم، البقرة..."
                  value={newSurah}
                  onChange={(e) => setNewSurah(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    من آية
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newFromAyah}
                    onChange={(e) => setNewFromAyah(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    إلى آية
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newToAyah}
                    onChange={(e) => setNewToAyah(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  رقم الصفحة في المصحف (اختياري)
                </label>
                <input
                  type="number"
                  min="1"
                  max="604"
                  placeholder="مثلاً: 293"
                  value={newPageNum}
                  onChange={(e) => setNewPageNum(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  ملاحظات أو متشابهات
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات حول المتشابهات أو مواضع التثبيت..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-xs transition-all"
                >
                  حفظ في خطة المراجعة 📖
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold header-font"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
