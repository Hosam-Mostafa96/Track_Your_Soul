import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  MessageSquareX, 
  EyeOff, 
  ClockAlert, 
  AlertOctagon, 
  Plus, 
  Trash2, 
  Sliders, 
  HeartHandshake, 
  Check, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  X
} from 'lucide-react';
import { DailyLog, AppWeights, SinDefinition, LoggedSinEntry } from '../types';
import { SIN_CATEGORIES, DEFAULT_SINS, getSinById, getSinPenalty } from '../data/sinsData';
import { calculateSinsDeduction } from '../utils/scoring';

interface SinsAccountabilityProps {
  log: DailyLog;
  weights: AppWeights;
  onUpdate: (updatedLog: DailyLog, activityLabel?: string, activityType?: string) => void;
  onUpdateWeights?: (updatedWeights: AppWeights) => void;
}

export const SinsAccountability: React.FC<SinsAccountabilityProps> = ({
  log,
  weights,
  onUpdate,
  onUpdateWeights
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showCustomSinModal, setShowCustomSinModal] = useState<boolean>(false);
  const [showWeightSettingsModal, setShowWeightSettingsModal] = useState<boolean>(false);

  // حالة إضافة ذنب مخصص
  const [customName, setCustomName] = useState('');
  const [customPenalty, setCustomPenalty] = useState('150');
  const [customCategory, setCustomCategory] = useState<'kabair' | 'tongue' | 'senses' | 'neglect' | 'custom'>('custom');

  // جميع الذنوب (الافتراضية + المخصصة من الأوزان)
  const allSins = useMemo(() => {
    const list = [...DEFAULT_SINS];
    if (weights.customSins && weights.customSins.length > 0) {
      weights.customSins.forEach(cs => {
        if (!list.some(s => s.id === cs.id)) {
          list.push(cs);
        }
      });
    }
    return list;
  }, [weights.customSins]);

  // الذنوب المسجلة اليوم
  const loggedEntries: LoggedSinEntry[] = useMemo(() => {
    return log.sins?.entries || [];
  }, [log.sins?.entries]);

  // إجمالي النقاط المخصومة اليوم
  const totalDeduction = useMemo(() => {
    return calculateSinsDeduction(log, weights);
  }, [log, weights]);

  // فلترة الذنوب المعروضة
  const filteredSins = useMemo(() => {
    if (activeCategory === 'all') return allSins;
    return allSins.filter(s => s.categoryId === activeCategory);
  }, [allSins, activeCategory]);

  // تحديث عدد مرات ارتكاب ذنب معين
  const handleUpdateSinCount = (sinId: string, delta: number) => {
    const existing = loggedEntries.find(e => e.sinId === sinId);
    let newEntries: LoggedSinEntry[];

    if (!existing) {
      if (delta <= 0) return;
      newEntries = [...loggedEntries, { sinId, count: 1 }];
    } else {
      const newCount = existing.count + delta;
      if (newCount <= 0) {
        newEntries = loggedEntries.filter(e => e.sinId !== sinId);
      } else {
        newEntries = loggedEntries.map(e => e.sinId === sinId ? { ...e, count: newCount } : e);
      }
    }

    const sinDef = getSinById(sinId, weights.customSins || []);
    const sinName = sinDef?.name || 'ذنب';

    // خصوصية تامة وستر للذنوب والعيوب: لا يتم تمرير أي وسم نشاط (activityLabel) حتى لا يظهر في نشاط العابدين العام
    onUpdate({
      ...log,
      hasBurden: newEntries.length > 0, // توافق مع النظام السابق
      isRepented: newEntries.length === 0,
      sins: {
        ...(log.sins || {}),
        entries: newEntries,
        repented: false
      }
    });
  };

  // تعديل وزن ذنب مخصص
  const handleSaveSinWeight = (sinId: string, newPenalty: number) => {
    if (!onUpdateWeights) return;
    const currentPenalties = weights.sinPenalties || {};
    const updatedWeights: AppWeights = {
      ...weights,
      sinPenalties: {
        ...currentPenalties,
        [sinId]: Math.max(10, newPenalty)
      }
    };
    onUpdateWeights(updatedWeights);
    localStorage.setItem('worship_weights', JSON.stringify(updatedWeights));
  };

  // إضافة ذنب مخصص جديد
  const handleAddCustomSin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newSin: SinDefinition = {
      id: `custom_sin_${Date.now()}`,
      categoryId: customCategory,
      name: customName.trim(),
      defaultPenalty: Math.max(10, parseInt(customPenalty) || 100),
      description: 'ذنب أو تقصير مخصص أضافه المستخدم'
    };

    if (onUpdateWeights) {
      const updatedCustomSins = [...(weights.customSins || []), newSin];
      const updatedWeights: AppWeights = {
        ...weights,
        customSins: updatedCustomSins
      };
      onUpdateWeights(updatedWeights);
      localStorage.setItem('worship_weights', JSON.stringify(updatedWeights));
    }

    setCustomName('');
    setCustomPenalty('150');
    setShowCustomSinModal(false);
  };

  // تجديد التوبة والاستغفار
  const handleRepent = () => {
    // خصوصية تامة وستر: محاسبة النفس شأن بين العبد وربه ولا تنشر في نشاط العابدين العام
    onUpdate({
      ...log,
      isRepented: true,
      sins: {
        ...(log.sins || { entries: [] }),
        repented: true
      }
    });
  };

  // تفريغ الذنوب المسجلة لليوم بعد التوبة الصادقة
  const handleClearTodaySins = () => {
    // خصوصية تامة وستر: محاسبة النفس شأن بين العبد وربه ولا تنشر في نشاط العابدين العام
    onUpdate({
      ...log,
      hasBurden: false,
      isRepented: true,
      sins: {
        entries: [],
        repented: true
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
      {/* الرأس والإحصائية العلوية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl shadow-xs">
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-800 header-font text-base sm:text-lg leading-tight">
                محاسبة النفس والذنوب
              </h3>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 header-font">
                خصم من الرصيد
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
              رصد التقصير والسيئات لخصم أوزانها من الرصيد الروحي وحث النفس على التوبة
            </p>
          </div>
        </div>

        {/* أزرار الإجراءات السريعة */}
        <div className="flex items-center gap-2 mr-auto sm:mr-0">
          <button
            type="button"
            onClick={() => setShowWeightSettingsModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-all"
            title="تعديل أوزان خصم الذنوب"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">أوزان الذنوب</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCustomSinModal(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-rose-600" />
            <span>ذنب مخصص</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* لوحة حالة الخصم لليوم وتجديد التوبة */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        totalDeduction > 0 
          ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 text-white border-rose-800/50 shadow-md' 
          : log.sins?.repented && loggedEntries.length > 0
          ? 'bg-gradient-to-br from-emerald-900 via-teal-950 to-emerald-900 text-white border-emerald-700/60 shadow-md'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
              {totalDeduction > 0 ? 'مجموع خصم الذنوب والتقصير لليوم' : log.sins?.repented && loggedEntries.length > 0 ? 'حالة التوبة والاستغفار' : 'حالة النفس والمحاسبة'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black font-mono ${
                totalDeduction > 0 
                  ? 'text-rose-400' 
                  : log.sins?.repented && loggedEntries.length > 0
                  ? 'text-emerald-300'
                  : 'text-emerald-700'
              }`}>
                {totalDeduction > 0 
                  ? `-${totalDeduction.toLocaleString()}` 
                  : log.sins?.repented && loggedEntries.length > 0
                  ? 'مغفور وممحو'
                  : 'طاهر ومحفوظ'}
              </span>
              <span className="text-xs font-bold opacity-80">
                {totalDeduction > 0 
                  ? 'نقطة مخصومة من رصيدك الروحي' 
                  : log.sins?.repented && loggedEntries.length > 0
                  ? 'مُحي أثر الخصم كاملاً ببركة التوبة 🌿'
                  : 'لا ذنوب مسجلة اليوم بحمد الله 🌿'}
              </span>
            </div>
            {totalDeduction > 0 ? (
              <p className="text-[11px] text-rose-200/90 font-bold leading-tight">
                قال تعالى: ﴿إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ﴾.. استغفر وتب فوراً لمحو الخصم.
              </p>
            ) : log.sins?.repented && loggedEntries.length > 0 ? (
              <p className="text-[11px] text-emerald-200/90 font-bold leading-tight">
                قال النبي ﷺ: «التائب من الذنب كمن لا ذنب له».. ثبتك الله وغفر لك.
              </p>
            ) : null}
          </div>

          {/* أزرار الاستغفار والتوبة */}
          {totalDeduction > 0 ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRepent}
                className="px-3 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-amber-300" />
                <span>جدد التوبة 🤲</span>
              </button>
              <button
                type="button"
                onClick={handleClearTodaySins}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                title="تفريغ الزلات بعد التوبة"
              >
                مسح السجل بعد التوبة
              </button>
            </div>
          ) : log.sins?.repented && loggedEntries.length > 0 ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearTodaySins}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                تفريغ سجل اليوم
              </button>
            </div>
          ) : (
            <div className="text-left">
              <span className="inline-block px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                سليم القلب والجوارح 🛡️
              </span>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* تبويبات تصنيف الذنوب */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black header-font whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({allSins.length})
            </button>
            {SIN_CATEGORIES.map(cat => {
              const countInCat = allSins.filter(s => s.categoryId === cat.id).length;
              const hasActiveInCat = loggedEntries.some(e => {
                const s = allSins.find(x => x.id === e.sinId);
                return s && s.categoryId === cat.id;
              });

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black header-font whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? `${cat.bgColor} ${cat.color} ring-2 ring-current font-black`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70 font-mono">({countInCat})</span>
                  {hasActiveInCat && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* قائمة الذنوب القابلة للتسجيل */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredSins.map(sin => {
              const entry = loggedEntries.find(e => e.sinId === sin.id);
              const count = entry ? entry.count : 0;
              const penalty = getSinPenalty(sin.id, weights.sinPenalties, weights.customSins || []);
              const sinDeduction = count * penalty;

              return (
                <div
                  key={sin.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    count > 0
                      ? 'bg-rose-50/90 border-rose-300 shadow-xs ring-1 ring-rose-400/30'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-black header-font ${count > 0 ? 'text-rose-950 font-black' : 'text-slate-800'}`}>
                          {sin.name}
                        </span>
                      </div>
                      {sin.description && (
                        <p className="text-[10px] text-slate-400 font-bold line-clamp-1">
                          {sin.description}
                        </p>
                      )}
                    </div>

                    {/* وزن الذنب المخصوم */}
                    <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-lg shrink-0 ${
                      count > 0 
                        ? 'bg-rose-200 text-rose-900 border border-rose-300' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      -{penalty} ن
                    </span>
                  </div>

                  {/* أزرار التحكم في العدد */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {count > 0 ? `إجمالي الخصم: -${sinDeduction.toLocaleString()} نقطة` : 'لم يُسجل'}
                    </span>

                    <div className="flex items-center gap-1">
                      {count > 0 ? (
                        <div className="flex items-center gap-1 bg-white rounded-xl border border-rose-300 p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateSinCount(sin.id, -1)}
                            className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-black text-xs flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xs font-black font-mono px-2 text-rose-900 min-w-[2rem] text-center">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateSinCount(sin.id, 1)}
                            className="w-6 h-6 rounded-lg bg-rose-600 text-white hover:bg-rose-500 font-black text-xs flex items-center justify-center transition-colors shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateSinCount(sin.id, 1)}
                          className="px-3 py-1 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-xs font-bold transition-all"
                        >
                          + تسجيل
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* نافذة إضافة ذنب مخصص */}
      {showCustomSinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-right animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-800 text-base header-font">
                إضافة ذنب أو تقصير مخصص
              </h4>
              <button
                type="button"
                onClick={() => setShowCustomSinModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomSin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  اسم الذنب أو التقصير:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سهر مفيد بغير فائدة حتى ضاع الفجر"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    التصنيف:
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e: any) => setCustomCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="kabair">الكبائر</option>
                    <option value="tongue">اللسان</option>
                    <option value="senses">الجوارح</option>
                    <option value="neglect">التقصير</option>
                    <option value="custom">مخصص</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    النقاط المخصومة:
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={customPenalty}
                    onChange={(e) => setCustomPenalty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none focus:border-rose-500 text-center"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs transition-all shadow-sm"
                >
                  إضافة الذنب واعتماده
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomSinModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة ضبط أوزان خصم الذنوب */}
      {showWeightSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto text-right animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-slate-700" />
                <h4 className="font-black text-slate-800 text-base header-font">
                  ضبط أوزان خصم الذنوب والسيئات
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowWeightSettingsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              يمكنك هنا تعديل عدد النقاط التي تُخصم من رصيدك الروحي عند تسجيل أي ذنب؛ كلما عظُم الذنب في عينك زاد وزنه المخصوم لردع النفس.
            </p>

            <div className="space-y-2.5">
              {allSins.map(sin => {
                const currentWeight = getSinPenalty(sin.id, weights.sinPenalties, weights.customSins || []);

                return (
                  <div key={sin.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 border border-slate-100">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-black text-slate-800 header-font block truncate">
                        {sin.name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold block">
                        الافتراضي: {sin.defaultPenalty} نقطة
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="10"
                        step="10"
                        value={currentWeight}
                        onChange={(e) => handleSaveSinWeight(sin.id, parseInt(e.target.value) || 0)}
                        className="w-20 p-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-black text-center text-rose-700 outline-none focus:border-rose-500"
                      />
                      <span className="text-xs font-bold text-slate-400">ن</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowWeightSettingsModal(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all"
              >
                حفظ وإغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
