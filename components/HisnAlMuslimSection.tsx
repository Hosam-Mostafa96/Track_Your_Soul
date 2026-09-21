import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  Check, 
  Copy, 
  Search, 
  Sparkles, 
  BookOpen, 
  RotateCcw, 
  Heart, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Volume2,
  Info,
  Layers,
  Award,
  Sun,
  Home,
  Landmark,
  Shirt,
  Droplets,
  Utensils,
  Compass,
  ShieldAlert,
  HeartPulse,
  CloudRain,
  Users,
  Moon,
  Filter
} from 'lucide-react';
import { DailyLog } from '../types';
import { HISN_DUAS_DATA, HISN_CATEGORIES, HisnDuaItem, HisnCategoryKey } from '../data/hisnAlMuslimData';
import confetti from 'canvas-confetti';

interface HisnAlMuslimSectionProps {
  log: DailyLog;
  onUpdateLog?: (log: DailyLog, activityLabel?: string, activityType?: string) => void;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Sun,
  Home,
  Landmark,
  Shirt,
  Droplets,
  Utensils,
  Compass,
  ShieldAlert,
  HeartPulse,
  CloudRain,
  Users,
  Moon
};

export const HisnAlMuslimSection: React.FC<HisnAlMuslimSectionProps> = ({ log, onUpdateLog }) => {
  const [selectedCategory, setSelectedCategory] = useState<HisnCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'read'>('all');

  const completedIds = useMemo(() => {
    return new Set<string>(log.duaIdsCompleted || []);
  }, [log.duaIdsCompleted]);

  // إجمالي الأدعية المقروءة من حصن المسلم اليوم
  const hisnReadCount = useMemo(() => {
    return HISN_DUAS_DATA.filter(item => completedIds.has(item.id)).length;
  }, [completedIds]);

  const hisnTotalCount = HISN_DUAS_DATA.length;
  const hisnProgressPercent = Math.round((hisnReadCount / hisnTotalCount) * 100);

  // تبديل حالة "تمت القراءة" للدعاء
  const handleToggleDua = (dua: HisnDuaItem) => {
    if (!onUpdateLog) return;
    const currentCompleted = log.duaIdsCompleted || [];
    const isCurrentlyRead = currentCompleted.includes(dua.id);

    let updatedList: string[];
    if (isCurrentlyRead) {
      updatedList = currentCompleted.filter(id => id !== dua.id);
    } else {
      updatedList = [...currentCompleted, dua.id];
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b']
      });
    }

    const updatedLog: DailyLog = {
      ...log,
      duaIdsCompleted: updatedList
    };

    onUpdateLog(
      updatedLog,
      !isCurrentlyRead ? `قرأ دعاء: ${dua.title} (من حصن المسلم)` : undefined,
      'dua'
    );
  };

  // نسخ نص الدعاء
  const handleCopyDua = (dua: HisnDuaItem) => {
    if (navigator.clipboard) {
      const text = `${dua.title}\n\n${dua.arabic}\n\nالمصدر: ${dua.source}${dua.virtue ? `\nالفضل: ${dua.virtue}` : ''}`;
      navigator.clipboard.writeText(text);
      setCopiedId(dua.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // تحديد جميع أدعية الفئة المحددة كمقروءة
  const handleMarkCategoryAllRead = () => {
    if (!onUpdateLog) return;
    const targetDuas = HISN_DUAS_DATA.filter(d => selectedCategory === 'all' || d.category === selectedCategory);
    const targetIds = targetDuas.map(d => d.id);
    
    const combined = Array.from(new Set([...(log.duaIdsCompleted || []), ...targetIds]));
    const updatedLog: DailyLog = {
      ...log,
      duaIdsCompleted: combined
    };

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.75 }
    });

    onUpdateLog(
      updatedLog,
      `أتم قراءة جميع أدعية (${HISN_CATEGORIES.find(c => c.key === selectedCategory)?.label || 'المناسبة'}) من حصن المسلم`,
      'dua'
    );
  };

  // تصفير مقروءات الفئة
  const handleResetCategoryRead = () => {
    if (!onUpdateLog) return;
    const targetDuas = HISN_DUAS_DATA.filter(d => selectedCategory === 'all' || d.category === selectedCategory);
    const targetIds = new Set(targetDuas.map(d => d.id));

    const remaining = (log.duaIdsCompleted || []).filter(id => !targetIds.has(id));
    const updatedLog: DailyLog = {
      ...log,
      duaIdsCompleted: remaining
    };

    onUpdateLog(updatedLog, undefined, 'dua');
  };

  // تصفية الأدعية المعروضة
  const filteredDuas = useMemo(() => {
    return HISN_DUAS_DATA.filter(item => {
      // فلتر الفئة
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // فلتر حالة القراءة
      const isRead = completedIds.has(item.id);
      if (filterMode === 'read' && !isRead) return false;
      if (filterMode === 'unread' && isRead) return false;

      // فلتر البحث النصي
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const inTitle = item.title.toLowerCase().includes(query);
        const inArabic = item.arabic.toLowerCase().includes(query);
        const inSource = item.source.toLowerCase().includes(query);
        const inVirtue = (item.virtue || '').toLowerCase().includes(query);
        return inTitle || inArabic || inSource || inVirtue;
      }

      return true;
    });
  }, [selectedCategory, filterMode, searchQuery, completedIds]);

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6 text-right" dir="rtl">
      {/* 1. رأس القسم والتعريف الروحي */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-lg shadow-emerald-600/20 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 header-font">
                أدعية حصن المسلم والمناسبات اليومية
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100 hidden sm:inline-block">
                مأثور صحيح
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5 leading-relaxed">
              الأدعية والتحصينات النبوية في تقلبات اليوم والليلة، صالحة للقراءة الفورية مع حفظ إنجاز اليوم
            </p>
          </div>
        </div>

        {/* إحصائية التقدم السريع في حصن المسلم */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between sm:justify-start gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">مقروء اليوم من الحصن</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black font-mono text-emerald-700">{hisnReadCount}</span>
              <span className="text-xs text-slate-400 font-mono">/ {hisnTotalCount}</span>
            </div>
          </div>
          <div className="w-16 sm:w-20">
            <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
              <span>الإنجاز</span>
              <span className="font-mono">{hisnProgressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${hisnProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. شريط البحث والتبويب */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* مربع البحث */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في أدعية حصن المسلم (مثل: استيقاظ، خروج، كرب، مسجد)..."
              className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-slate-400 hover:text-slate-600 absolute left-3 top-1/2 -translate-y-1/2"
              >
                مسح
              </button>
            )}
          </div>

          {/* فلتر حالة القراءة */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              الكل ({HISN_DUAS_DATA.length})
            </button>
            <button
              onClick={() => setFilterMode('unread')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'unread' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              المتبقي ({hisnTotalCount - hisnReadCount})
            </button>
            <button
              onClick={() => setFilterMode('read')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'read' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              المقروء اليوم ({hisnReadCount})
            </button>
          </div>
        </div>

        {/* 3. تصنيفات المناسبات (Category Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {HISN_CATEGORIES.map(category => {
            const IconComp = CATEGORY_ICONS[category.iconName] || Sparkles;
            const isSelected = selectedCategory === category.key;
            const catDuas = category.key === 'all' 
              ? HISN_DUAS_DATA 
              : HISN_DUAS_DATA.filter(d => d.category === category.key);
            const catRead = catDuas.filter(d => completedIds.has(d.id)).length;

            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                <span>{category.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {catRead > 0 ? `${catRead}/${catDuas.length}` : catDuas.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* تفاصيل الفئة المحددة والإجراءات السريعة */}
      {selectedCategory !== 'all' && (
        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-emerald-950 header-font">
              {HISN_CATEGORIES.find(c => c.key === selectedCategory)?.label}
            </h4>
            <p className="text-[11px] text-emerald-700/90 font-medium">
              {HISN_CATEGORIES.find(c => c.key === selectedCategory)?.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkCategoryAllRead}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold header-font transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تحديد كل أدعية المناسبة كمقروءة</span>
            </button>

            <button
              onClick={handleResetCategoryRead}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-[11px] font-bold transition-all"
              title="إلغاء قراءة أدعية هذه الفئة"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 4. قائمة كروت الأدعية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDuas.map(dua => {
          const isRead = completedIds.has(dua.id);
          const categoryMeta = HISN_CATEGORIES.find(c => c.key === dua.category);
          const IconComp = categoryMeta ? (CATEGORY_ICONS[categoryMeta.iconName] || Sparkles) : Sparkles;

          return (
            <div
              key={dua.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between text-right relative group ${
                isRead
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                  : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {/* الرأس: المناسبة والعنوان والتكرار */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-white text-emerald-700 border border-slate-100 shadow-2xs">
                      <IconComp className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-black text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-100">
                      {categoryMeta?.label || 'مناسبة'}
                    </span>
                    {dua.count > 1 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-mono">
                        تكرار {dua.count} مرات
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* زر نسخ الدعاء */}
                    <button
                      onClick={() => handleCopyDua(dua)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-white transition-colors"
                      title="نسخ نص الدعاء"
                    >
                      {copiedId === dua.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-black text-slate-900 header-font leading-snug">
                  {dua.title}
                </h4>

                {/* نص الدعاء العربي المشكول */}
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                  <p className="text-sm sm:text-base font-bold text-slate-800 leading-loose font-serif text-justify select-text">
                    {dua.arabic}
                  </p>
                </div>

                {/* الفضل والتخريج */}
                <div className="space-y-1 text-xs">
                  {dua.virtue && (
                    <p className="text-[11px] text-emerald-800/90 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/60">
                      <span className="font-bold text-emerald-900">الفضل والأثر: </span>
                      {dua.virtue}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium pr-1">
                    المصدر: {dua.source}
                  </p>
                </div>
              </div>

              {/* أسفل الكرت: خيار "تمت القراءة" */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-slate-400">
                  {isRead ? 'محسوب في أوراد يومك (+10 نقاط) ✨' : 'اضغط للتسجيل في الورد'}
                </span>

                <button
                  onClick={() => handleToggleDua(dua)}
                  className={`px-4 py-2 rounded-xl text-xs font-black header-font transition-all flex items-center gap-1.5 active:scale-95 shadow-xs ${
                    isRead
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isRead ? 'text-white' : 'text-slate-300'}`} />
                  <span>{isRead ? 'تمت القراءة اليوم ✓' : 'تمت القراءة'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDuas.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-500 header-font">لم يتم العثور على أدعية مطابقة للبحث أو التصنيف</p>
          <button 
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setFilterMode('all'); }}
            className="text-xs text-emerald-600 font-bold underline"
          >
            عرض كافة الأدعية
          </button>
        </div>
      )}
    </div>
  );
};
