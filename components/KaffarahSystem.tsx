import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Coins,
  Flame,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Heart,
  BookOpen,
  Award,
  ChevronLeft,
  X,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface KaffarahItem {
  id: string;
  cause: string; // سبب الكفارة (فوات صلاة الفجر، زلة لسان، تضييع وقت...)
  type: 'charity' | 'fasting' | 'tawbah_prayer' | 'quran_juz' | 'istighfar_100';
  targetLabel: string;
  isFulfilled: boolean;
  assignedDate: string; // YYYY-MM-DD
  fulfilledDate?: string; // YYYY-MM-DD
  notes?: string;
}

const STORAGE_KEY = 'worship_kaffarah_system_v1';

const INITIAL_KAFFARAT: KaffarahItem[] = [
  {
    id: 'k1',
    cause: 'فوات تكبيرة الإحرام في الفجر',
    type: 'charity',
    targetLabel: 'الصدقة بمبلغ يسير لإطعام مسكين',
    isFulfilled: false,
    assignedDate: '2026-10-02'
  },
  {
    id: 'k2',
    cause: 'إطلاق لسان أو لغو وقت الذكر',
    type: 'istighfar_100',
    targetLabel: '100 استغفار وصلاة على النبي ﷺ بتدبر',
    isFulfilled: true,
    assignedDate: '2026-09-29',
    fulfilledDate: '2026-09-29'
  }
];

interface KaffarahSystemProps {
  onClose?: () => void;
}

export const KaffarahSystem: React.FC<KaffarahSystemProps> = ({ onClose }) => {
  const [items, setItems] = useState<KaffarahItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_KAFFARAT;
  });

  const [activeTab, setActiveTab] = useState<'pending' | 'fulfilled'>('pending');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newCause, setNewCause] = useState('');
  const [newType, setNewType] = useState<KaffarahItem['type']>('charity');
  const [newCustomLabel, setNewCustomLabel] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  const pendingItems = useMemo(() => items.filter(i => !i.isFulfilled), [items]);
  const fulfilledItems = useMemo(() => items.filter(i => i.isFulfilled), [items]);

  const handleFulfill = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isFulfilled: true,
          fulfilledDate: today
        };
      }
      return item;
    }));

    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.7 }
    });
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleAddKaffarah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCause.trim()) return;

    let targetLabel = newCustomLabel.trim();
    if (!targetLabel) {
      switch (newType) {
        case 'charity': targetLabel = 'إخراج صدقة نافلة بنيّة تأديب النفس'; break;
        case 'fasting': targetLabel = 'صيام يوم تطوع بديل (إثنين أو خميس)'; break;
        case 'tawbah_prayer': targetLabel = 'ركعتا توبة واستغفار خاشعتان في خلوة'; break;
        case 'quran_juz': targetLabel = 'تلاوة جزء كامل من القرآن بتدبر'; break;
        case 'istighfar_100': targetLabel = '100 استغفار وصلاة على النبي ﷺ'; break;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const newItem: KaffarahItem = {
      id: `kaffarah_${Date.now()}`,
      cause: newCause.trim(),
      type: newType,
      targetLabel,
      isFulfilled: false,
      assignedDate: today
    };

    setItems(prev => [newItem, ...prev]);
    setShowAddModal(false);
    setNewCause('');
    setNewCustomLabel('');
  };

  const renderTypeIcon = (type: KaffarahItem['type']) => {
    switch (type) {
      case 'charity': return <Coins className="w-4 h-4 text-amber-600" />;
      case 'fasting': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'tawbah_prayer': return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'quran_juz': return <BookOpen className="w-4 h-4 text-teal-600" />;
      case 'istighfar_100': return <Heart className="w-4 h-4 text-pink-500" />;
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100 relative text-right" dir="rtl">
      {/* الترويسة العلوية */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 header-font text-base sm:text-lg leading-tight">
                عقوبة النفس بالطاعات البديلة (Kaffarah System)
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
                تأديب النفس
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              منهج الصحابة في محاسبة النفس ومشارطتها ومعاقبتها بالصدقة والصيام والاستغفار عند التقصير
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-black header-font flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>إلزام النفس بكفارة</span>
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

      {/* حكمة الأثر الإيماني */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4 text-xs text-slate-600 leading-relaxed">
        <p className="font-medium text-[11px]">
          📌 <span className="font-bold text-slate-800">أثر السلف:</span> لما فات عمر بن الخطاب رضي الله عنه صلاة العصر في جماعة، تصدق بأرض قيمتها مائتا ألف درهم عقوبة لنفسه وتأديباً لها حتى لا تعود للفتور.
        </p>
      </div>

      {/* التبديل بين الكفارات قيد الوفاء والموفّى بها */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'pending' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500'
          }`}
        >
          كفارات قيد الوفاء ({pendingItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fulfilled')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'fulfilled' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
          }`}
        >
          تم الوفاء بها وتأديب النفس ({fulfilledItems.length})
        </button>
      </div>

      {/* قائمة الكفارات */}
      <div className="space-y-3">
        {(activeTab === 'pending' ? pendingItems : fulfilledItems).length === 0 ? (
          <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-xs sm:text-sm font-black text-slate-800 header-font">
              {activeTab === 'pending'
                ? 'لا توجد كفارات معلقة؛ ذمتك بريئة والحمد لله 🌿'
                : 'لا توجد كفارات موفّى بها مسجلة'}
            </h4>
          </div>
        ) : (
          (activeTab === 'pending' ? pendingItems : fulfilledItems).map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.isFulfilled
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-white border-rose-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                    {renderTypeIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-slate-800 text-sm header-font">
                        {item.targetLabel}
                      </h4>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        السبب: {item.cause}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      تاريخ الإلزام: {item.assignedDate}
                      {item.fulfilledDate && ` • تم الوفاء بتاريخ: ${item.fulfilledDate}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  {!item.isFulfilled ? (
                    <button
                      type="button"
                      onClick={() => handleFulfill(item.id)}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-xs flex items-center gap-1 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>وفيت بها اليوم ✓</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                      موفّى بها ومثاب عليها 🌟
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* نافذة إضافة كفارة جديدة */}
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
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base header-font">
                  إلزام النفس بكفارة طاعة بديلة
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                  معاتبة النفس ومشارطتها بالطاعات البديلة
                </p>
              </div>
            </div>

            <form onSubmit={handleAddKaffarah} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  سبب الكفارة والتقصير *
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: فوات صلاة الفجر في جماعة، لغو لسان، تضييع وقت..."
                  value={newCause}
                  onChange={(e) => setNewCause(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  نوع الكفارة المقترحة
                </label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                >
                  <option value="charity">💰 صدقة بديلة (إطعام مسكين أو مبلغ يسير)</option>
                  <option value="fasting">🌾 صيام يوم تطوع بديل (إثنين أو خميس)</option>
                  <option value="tawbah_prayer">🧎 ركعتا توبة خاشعتان في خلوة</option>
                  <option value="quran_juz">📖 ورد استدراك قرآني (تلاوة جزء كامل)</option>
                  <option value="istighfar_100">📿 100 استغفار وصلاة على النبي ﷺ</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  تخصيص الكفارة (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="اتركه فارغاً للاعتماد التلقائي..."
                  value={newCustomLabel}
                  onChange={(e) => setNewCustomLabel(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black header-font shadow-xs transition-all"
                >
                  تأكيد إلزام النفس 🛡️
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
