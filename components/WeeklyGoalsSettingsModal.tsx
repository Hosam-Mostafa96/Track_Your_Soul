import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Target,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  Users,
  Moon,
  BookOpen,
  Bookmark,
  Sun,
  RotateCw,
  Sunrise,
  UtensilsCrossed,
  GraduationCap,
  Heart,
  Flame,
  Award,
  Trash2,
  PlusCircle,
  Filter,
  ChevronDown,
  Info
} from 'lucide-react';
import { WeeklyGoalsConfig, WeeklyWorshipGoalItem, AppWeights, WorshipGoalCategory } from '../types';
import {
  getDefaultWeeklyGoalsConfig,
  PRESET_TARGETS,
  saveWeeklyGoalsConfig,
  LINKED_WORSHIP_TEMPLATES,
  LinkedWorshipTemplate
} from '../utils/weeklyGoals';
import confetti from 'canvas-confetti';

interface WeeklyGoalsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WeeklyGoalsConfig;
  onSave: (newConfig: WeeklyGoalsConfig) => void;
  weights?: AppWeights;
}

export const renderGoalIcon = (iconName: string, className: string = 'w-5 h-5') => {
  switch (iconName) {
    case 'Users':
      return <Users className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Moon':
      return <Moon className={className} />;
    case 'Sunrise':
      return <Sunrise className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Bookmark':
      return <Bookmark className={className} />;
    case 'Sun':
      return <Sun className={className} />;
    case 'RotateCw':
      return <RotateCw className={className} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    default:
      return <Target className={className} />;
  }
};

const CATEGORY_NAMES: Record<string, string> = {
  prayer: 'الصلوات والسنن',
  quran: 'القرآن الكريم',
  athkar: 'الأذكار والتحصين',
  nawafil: 'النوافل والقيام',
  knowledge: 'العلم والقراءة',
  dua: 'ورد الدعاء',
  heart: 'التزكية والمجاهدة',
  custom: 'الأعمال المخصصة'
};

export const WeeklyGoalsSettingsModal: React.FC<WeeklyGoalsSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  weights
}) => {
  const [currentConfig, setCurrentConfig] = useState<WeeklyGoalsConfig>(() => ({
    ...config,
    goals: config.goals.map(g => ({ ...g }))
  }));

  // حالة نموذج إضافة هدف جديد
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTemplateSource, setSelectedTemplateSource] = useState<string>('');
  const [customGoalTitle, setCustomGoalTitle] = useState<string>('');
  const [customGoalDesc, setCustomGoalDesc] = useState<string>('');
  const [customGoalTarget, setCustomGoalTarget] = useState<number>(7);
  const [customGoalDetailId, setCustomGoalDetailId] = useState<string>('');

  // استرجاع الأذكار المخصصة للمستخدم
  const [userCustomDhikrs, setUserCustomDhikrs] = useState<Array<{ id: string; label: string; key: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      setCurrentConfig({
        ...config,
        goals: config.goals.map(g => ({ ...g }))
      });
      setIsAddingGoal(false);

      try {
        const savedDhikrs = localStorage.getItem('worship_custom_dhikrs');
        if (savedDhikrs) {
          setUserCustomDhikrs(JSON.parse(savedDhikrs));
        }
      } catch (e) {
        console.error('Failed to load custom dhikrs', e);
      }
    }
  }, [isOpen, config]);

  // دمج القوالب الثابتة مع أي سنن أو أذكار مخصصة أنشأها المستخدم
  const allAvailableTemplates: LinkedWorshipTemplate[] = useMemo(() => {
    const list: LinkedWorshipTemplate[] = [...LINKED_WORSHIP_TEMPLATES];

    // إضافة السنن المخصصة للمستخدم
    if (weights?.customSunnahs && weights.customSunnahs.length > 0) {
      weights.customSunnahs.forEach(cs => {
        list.push({
          sourceType: 'custom_sunnah_specific',
          title: `[عملك المخصص] ${cs.name}`,
          category: 'custom',
          unit: 'مرة',
          defaultTarget: 3,
          min: 1,
          max: 35,
          step: 1,
          description: `المحافظة على عمل "${cs.name}" خلال الأسبوع`,
          iconName: 'Award',
          tabTarget: 'entry',
          sourceSectionName: 'أعمالك المخصصة المسجلة'
        });
      });
    }

    // إضافة الأذكار المخصصة للمستخدم
    if (userCustomDhikrs && userCustomDhikrs.length > 0) {
      userCustomDhikrs.forEach(cd => {
        list.push({
          sourceType: 'custom_dhikr_specific',
          title: `[ذكرك المخصص] ${cd.label}`,
          category: 'athkar',
          unit: 'تسبيحة',
          defaultTarget: 700,
          min: 50,
          max: 10000,
          step: 50,
          description: `المحافظة على ورد "${cd.label}" في العدادات`,
          iconName: 'RotateCw',
          tabTarget: 'entry',
          sourceSectionName: 'أذكارك المخصصة المسجلة'
        });
      });
    }

    return list;
  }, [weights?.customSunnahs, userCustomDhikrs]);

  // تصفية القوالب حسب التصنيف المختار
  const filteredTemplates = useMemo(() => {
    if (selectedCategoryFilter === 'all') return allAvailableTemplates;
    return allAvailableTemplates.filter(t => t.category === selectedCategoryFilter);
  }, [allAvailableTemplates, selectedCategoryFilter]);

  // عند اختيار قالب من القائمة
  const handleSelectTemplate = (templateKey: string) => {
    setSelectedTemplateSource(templateKey);
    const tmpl = allAvailableTemplates.find(t => t.sourceType === templateKey);
    if (tmpl) {
      setCustomGoalTitle(tmpl.title.replace(/^\[.*?\]\s*/, ''));
      setCustomGoalDesc(tmpl.description);
      setCustomGoalTarget(tmpl.defaultTarget);

      // إذا كان عمل أو ذكر مخصص محدد
      if (tmpl.sourceType === 'custom_sunnah_specific') {
        const found = weights?.customSunnahs?.find(s => `[عملك المخصص] ${s.name}` === tmpl.title);
        if (found) setCustomGoalDetailId(found.id);
      } else if (tmpl.sourceType === 'custom_dhikr_specific') {
        const found = userCustomDhikrs.find(d => `[ذكرك المخصص] ${d.label}` === tmpl.title);
        if (found) setCustomGoalDetailId(found.key || found.id);
      } else {
        setCustomGoalDetailId('');
      }
    }
  };

  // فتح نموذج الإضافة وتحديد أول عنصر تلقائياً
  const handleOpenAddForm = () => {
    setIsAddingGoal(true);
    if (!selectedTemplateSource && allAvailableTemplates.length > 0) {
      const first = allAvailableTemplates[0];
      setSelectedTemplateSource(first.sourceType);
      setCustomGoalTitle(first.title);
      setCustomGoalDesc(first.description);
      setCustomGoalTarget(first.defaultTarget);
      setCustomGoalDetailId('');
    }
  };

  // إضافة الهدف الجديد إلى الأهداف
  const handleConfirmAddGoal = () => {
    if (!customGoalTitle.trim()) return;

    const tmpl = allAvailableTemplates.find(t => t.sourceType === selectedTemplateSource) || allAvailableTemplates[0];
    const newId = `custom_goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newGoal: WeeklyWorshipGoalItem = {
      id: newId,
      title: customGoalTitle.trim(),
      category: tmpl ? tmpl.category : 'custom',
      unit: tmpl ? tmpl.unit : 'مرة',
      target: customGoalTarget > 0 ? customGoalTarget : (tmpl?.defaultTarget || 7),
      min: tmpl ? tmpl.min : 1,
      max: tmpl ? tmpl.max : 1000,
      step: tmpl ? tmpl.step : 1,
      enabled: true,
      description: customGoalDesc.trim() || tmpl?.description || 'هدف عبادة مخصص من صفحة التسجيل',
      iconName: tmpl ? tmpl.iconName : 'Target',
      tabTarget: tmpl ? tmpl.tabTarget : 'entry',
      isCustom: true,
      sourceType: tmpl?.sourceType || 'custom_sunnah_all',
      sourceDetailId: customGoalDetailId || undefined
    };

    setCurrentConfig(prev => ({
      ...prev,
      preset: 'custom',
      goals: [newGoal, ...prev.goals]
    }));

    setIsAddingGoal(false);
  };

  // حذف هدف مخصص
  const handleDeleteGoal = (goalId: string) => {
    setCurrentConfig(prev => ({
      ...prev,
      preset: 'custom',
      goals: prev.goals.filter(g => g.id !== goalId)
    }));
  };

  if (!isOpen) return null;

  const handleApplyPreset = (preset: 'balanced' | 'high' | 'pacesetter') => {
    const targets = PRESET_TARGETS[preset];
    const updatedGoals = currentConfig.goals.map(goal => {
      const newTarget = targets[goal.id] !== undefined ? targets[goal.id] : goal.target;
      return {
        ...goal,
        target: newTarget,
        enabled: true
      };
    });

    setCurrentConfig({
      version: currentConfig.version,
      preset,
      goals: updatedGoals
    });
  };

  const handleTargetChange = (goalId: string, delta: number) => {
    setCurrentConfig(prev => {
      const goals = prev.goals.map(g => {
        if (g.id !== goalId) return g;
        const nextVal = Math.min(g.max, Math.max(g.min, g.target + delta));
        return { ...g, target: nextVal };
      });
      return {
        ...prev,
        preset: 'custom',
        goals
      };
    });
  };

  const handleToggleGoal = (goalId: string) => {
    setCurrentConfig(prev => {
      const goals = prev.goals.map(g => {
        if (g.id !== goalId) return g;
        return { ...g, enabled: !g.enabled };
      });
      return {
        ...prev,
        preset: 'custom',
        goals
      };
    });
  };

  const handleResetToDefaults = () => {
    const def = getDefaultWeeklyGoalsConfig();
    setCurrentConfig(def);
  };

  const handleSave = () => {
    saveWeeklyGoalsConfig(currentConfig);
    onSave(currentConfig);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    onClose();
  };

  const presetLabels: Record<string, { title: string; subtitle: string; icon: string }> = {
    balanced: {
      title: 'همة متوازنة',
      subtitle: 'أهداف مستدامة وميسّرة للمحافظة على الأساسيات',
      icon: '🌿'
    },
    high: {
      title: 'همة عالية',
      subtitle: 'ارتقاء في الطاعات ونوافل الصلوات والقرآن',
      icon: '🔥'
    },
    pacesetter: {
      title: 'سابق بالخيرات',
      subtitle: 'أعلى مستويات المجاهدة والسبق في ميادين العبادة',
      icon: '🌟'
    }
  };

  const currentTemplate = allAvailableTemplates.find(t => t.sourceType === selectedTemplateSource);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-[2.5rem] max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col text-right animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <Sliders className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-800 header-font leading-none">
                  تحديد الأهداف الأسبوعية المخصصة
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-bold mt-1">
                حدد مستهدفاتك الأسبوعية أو أضف أهدافاً جديدة مرتبطة بعبادات صفحة التسجيل
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 pl-1">
          {/* Presets Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black text-slate-700 header-font flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                اختر خطة مسبقة الإعداد
              </span>
              {currentConfig.preset === 'custom' && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  خطة مخصصة لك
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['balanced', 'high', 'pacesetter'] as const).map(presetKey => {
                const info = presetLabels[presetKey];
                const isSelected = currentConfig.preset === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => handleApplyPreset(presetKey)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between relative overflow-hidden group ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">{info.icon}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-black header-font text-slate-800 leading-tight">
                      {info.title}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold mt-1 line-clamp-2 leading-tight">
                      {info.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Goal Creation Panel */}
          {isAddingGoal ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 border-2 border-emerald-300 shadow-md animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-3 border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-800 header-font">
                      إضافة هدف أسبوعي جديد مرتبط بالعبادات
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold">
                      اختر عبادة من صفحة التسجيل وسيتم رصدها تلقائياً طوال الأسبوع
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* فلتر الأقسام */}
              <div className="mb-3">
                <label className="text-[10px] font-black text-slate-600 mb-1.5 block header-font">
                  تصفية الأقسام:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-right no-scrollbar">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'prayer', label: 'الصلوات والسنن' },
                    { id: 'nawafil', label: 'النوافل والقيام' },
                    { id: 'quran', label: 'القرآن' },
                    { id: 'athkar', label: 'الأذكار' },
                    { id: 'knowledge', label: 'العلم' },
                    { id: 'dua', label: 'الدعاء' },
                    { id: 'custom', label: 'أعمال مخصصة' },
                    { id: 'heart', label: 'التزكية' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${
                        selectedCategoryFilter === cat.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* اختيار العبادة المرتبطة */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block header-font">
                    اختر العبادة المرتبطة:
                  </label>
                  <select
                    value={selectedTemplateSource}
                    onChange={e => handleSelectTemplate(e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {filteredTemplates.map(tmpl => (
                      <option key={tmpl.sourceType} value={tmpl.sourceType}>
                        {tmpl.title} ({tmpl.sourceSectionName} - {tmpl.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* عنوان الهدف */}
                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block header-font">
                    عنوان الهدف الأسبوعي:
                  </label>
                  <input
                    type="text"
                    value={customGoalTitle}
                    onChange={e => setCustomGoalTitle(e.target.value)}
                    placeholder="مثال: صلاة الفجر في جماعة المسجد"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* المستهدف الأسبوعي مع وحدة القياس */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-slate-700 mb-1 block header-font">
                      المستهدف الأسبوعي المطلوب:
                    </label>
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setCustomGoalTarget(prev => Math.max(1, prev - (currentTemplate?.step || 1)))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 active:scale-95 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="flex-1 text-center">
                        <input
                          type="number"
                          value={customGoalTarget}
                          onChange={e => setCustomGoalTarget(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full text-center text-xs font-black font-mono text-emerald-800 focus:outline-hidden bg-transparent"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setCustomGoalTarget(prev => prev + (currentTemplate?.step || 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-700 mb-1 block header-font">
                      وحدة الإنجاز:
                    </label>
                    <div className="bg-slate-100/80 rounded-xl px-3 py-2 border border-slate-200 flex items-center justify-between text-xs font-black text-slate-700">
                      <span>{currentTemplate?.unit || 'مرة'} في الأسبوع</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {CATEGORY_NAMES[currentTemplate?.category || 'custom']}
                      </span>
                    </div>
                  </div>
                </div>

                {/* وصف توجيهي للهدف */}
                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block header-font">
                    الوصف أو التذكير الإيماني (اختياري):
                  </label>
                  <input
                    type="text"
                    value={customGoalDesc}
                    onChange={e => setCustomGoalDesc(e.target.value)}
                    placeholder="نصيحة أو فضل متعلق بهذه العبادة"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* أزرار الحفظ والإلغاء للإضافة */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmAddGoal}
                    disabled={!customGoalTitle.trim()}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black header-font text-xs rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>إضافة الهدف إلى خطتي الأسبوعية</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(false)}
                    className="px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-600 font-bold header-font text-xs rounded-xl border border-slate-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="w-full p-3.5 rounded-2xl border-2 border-dashed border-emerald-400/80 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 text-emerald-800 transition-all flex items-center justify-center gap-2 group shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-black header-font">
                إضافة هدف أسبوعي جديد مرتبط بصفحة تسجيل العبادات
              </span>
            </button>
          )}

          {/* Goals List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-700 header-font flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                قائمة الأهداف الأسبوعية ({currentConfig.goals.filter(g => g.enabled).length} مفعل من أصل {currentConfig.goals.length})
              </span>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="text-[10px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                استعادة الافتراضي
              </button>
            </div>

            <div className="space-y-2.5">
              {currentConfig.goals.map(goal => {
                return (
                  <div
                    key={goal.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      goal.enabled
                        ? 'bg-white border-slate-200/80 shadow-2xs hover:border-emerald-300'
                        : 'bg-slate-50/70 border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Icon & Title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleGoal(goal.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            goal.enabled
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                          title={goal.enabled ? 'تعطيل هذا الهدف' : 'تفعيل هذا الهدف'}
                        >
                          {renderGoalIcon(goal.iconName, 'w-4 h-4')}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-800 header-font truncate">
                              {goal.title}
                            </span>
                            {goal.isCustom && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-md">
                                مخصص
                              </span>
                            )}
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded-md">
                              {CATEGORY_NAMES[goal.category] || goal.category}
                            </span>
                            {!goal.enabled && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded-md">
                                معطّل
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                            {goal.description}
                          </p>
                        </div>
                      </div>

                      {/* Stepper Controls & Delete button */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {goal.enabled ? (
                          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/70">
                            <button
                              type="button"
                              onClick={() => handleTargetChange(goal.id, -goal.step)}
                              disabled={goal.target <= goal.min}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all shadow-2xs"
                            >
                              <Minus className="w-3 h-3 stroke-[3]" />
                            </button>

                            <div className="min-w-[4.5rem] text-center px-1">
                              <span className="text-xs font-black font-mono text-emerald-800 leading-none">
                                {goal.target.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                                {goal.unit}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleTargetChange(goal.id, goal.step)}
                              disabled={goal.target >= goal.max}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all shadow-2xs"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleGoal(goal.id)}
                            className="px-3 py-1.5 text-[11px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                          >
                            تفعيل
                          </button>
                        )}

                        {/* زر حذف إذا كان هدفاً مخصصاً أضافه المستخدم */}
                        {goal.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف هذا الهدف المخصص"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 pt-4 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black header-font text-sm rounded-2xl shadow-lg shadow-emerald-700/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            حفظ الأهداف وتطبيقها الآن
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold header-font text-xs rounded-2xl transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
