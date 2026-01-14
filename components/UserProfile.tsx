import React, { useState } from 'react';
import { 
  User, Mail, ShieldCheck, LogOut, CheckCircle, 
  Settings2, ChevronDown, ChevronUp, Save, RotateCcw,
  Star, Users, Clock, Book, GraduationCap, Zap, Plus, Trash2, Tags, AlertCircle, BookOpen, LayoutList,
  LockKeyhole,
  Globe,
  ToggleRight,
  ToggleLeft
} from 'lucide-react';
import { AppWeights, CustomSunnah } from '../types';
import { DEFAULT_WEIGHTS } from '../constants';

interface UserProfileProps {
  user: { name: string; email: string } | null;
  weights: AppWeights;
  isGlobalSync: boolean;
  onToggleSync: (enabled: boolean) => void;
  onUpdateUser: (user: { name: string; email: string } | null) => void;
  onUpdateWeights: (weights: AppWeights) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, weights, isGlobalSync, onToggleSync, onUpdateUser, onUpdateWeights }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavedUser, setIsSavedUser] = useState(false);
  
  const [localWeights, setLocalWeights] = useState<AppWeights>({ ...weights });
  const [showWeights, setShowWeights] = useState(false);
  const [isSavedWeights, setIsSavedWeights] = useState(false);

  const [newSunnahName, setNewSunnahName] = useState('');
  const [newSunnahPoints, setNewSunnahPoints] = useState(50);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onUpdateUser({ name, email });
      setIsSavedUser(true);
      setTimeout(() => setIsSavedUser(false), 3000);
    }
  };

  const handleSaveWeights = () => {
    onUpdateWeights(localWeights);
    setIsSavedWeights(true);
    setTimeout(() => setIsSavedWeights(false), 3000);
  };

  const resetWeights = () => {
    if (window.confirm('هل تريد استعادة الأوزان الافتراضية للنظام؟')) {
      setLocalWeights(DEFAULT_WEIGHTS);
    }
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد مسح بيانات الحساب من هذا الجهاز؟')) {
      onUpdateUser(null);
      setName('');
      setEmail('');
    }
  };

  const addCustomSunnah = () => {
    if (!newSunnahName.trim()) return;
    const newSunnah: CustomSunnah = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSunnahName,
      points: newSunnahPoints
    };
    setLocalWeights({
      ...localWeights,
      customSunnahs: [...(localWeights.customSunnahs || []), newSunnah]
    });
    setNewSunnahName('');
    setNewSunnahPoints(50);
  };

  const deleteCustomSunnah = (id: string) => {
    setLocalWeights({
      ...localWeights,
      customSunnahs: (localWeights.customSunnahs || []).filter(s => s.id !== id)
    });
  };

  const weightInput = (label: string, value: number, onChange: (val: number) => void, icon?: any) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
      <div className="flex items-center gap-2">
        {icon && <span className="text-emerald-500">{icon}</span>}
        <span className="text-[11px] font-bold text-slate-700 header-font">{label}</span>
      </div>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-20 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-emerald-700 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-top duration-300 pb-12">
      {/* 1. Profile Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
            <User className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 header-font">{user ? user.name : 'حساب محلي'}</h2>
          <p className="text-xs text-slate-400 font-bold header-font">بياناتك محفوظة على هذا الجهاز فقط</p>
        </div>

        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1 header-font">الاسم التعريفي</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ادخل اسمك"
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none transition-all font-bold header-font text-sm text-right"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1 header-font">البريد الإلكتروني (اختياري)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none transition-all font-bold header-font text-sm text-right"
              />
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full py-4 rounded-2xl font-bold header-font transition-all flex items-center justify-center gap-2 shadow-lg ${
              isSavedUser ? 'bg-emerald-500 text-white' : 
              'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]'
            }`}
          >
            {isSavedUser ? (
              <><CheckCircle className="w-5 h-5" /> تم حفظ الملف الشخصي</>
            ) : (
              <><Save className="w-5 h-5" /> حفظ البيانات محلياً</>
            )}
          </button>
        </form>

        {user && (
          <button 
            onClick={handleLogout}
            className="w-full mt-4 py-3 text-slate-400 hover:text-rose-500 font-bold text-xs header-font flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> مسح بيانات المتصفح
          </button>
        )}
      </div>

      {/* 2. Global Sync Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-1 h-full transition-all ${isGlobalSync ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all ${isGlobalSync ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font">الارتباط بالمحراب العالمي</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">رؤية أعداد المصلين الحقيقية الآن</p>
            </div>
          </div>
          <button 
            onClick={() => onToggleSync(!isGlobalSync)}
            className={`w-14 h-8 rounded-full transition-all relative ${isGlobalSync ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm flex items-center justify-center ${isGlobalSync ? 'left-1' : 'left-7'}`}>
                {isGlobalSync ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <ShieldCheck className="w-3 h-3 text-slate-300" />}
            </div>
          </button>
        </div>
      </div>

      {/* 3. Settings Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <button 
          onClick={() => setShowWeights(!showWeights)}
          className="w-full flex items-center justify-between mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Settings2 className="w-5 h-5 text-slate-600" />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-slate-800 header-font">إعدادات الميزان</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">تخصيص أوزان العبادات والسنن</p>
            </div>
          </div>
          {showWeights ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
        </button>

        {showWeights && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-top duration-300">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">أوزان الفرائض والرواتب</h4>
              </div>
              {weightInput('صلاة الجماعة', localWeights.fardCongregation, (val) => setLocalWeights({ ...localWeights, fardCongregation: val }), <Users className="w-4 h-4" />)}
              {weightInput('صلاة منفردة', localWeights.fardSolo, (val) => setLocalWeights({ ...localWeights, fardSolo: val }), <User className="w-4 h-4" />)}
              {weightInput('السنن الرواتب', localWeights.sunnahRawatib, (val) => setLocalWeights({ ...localWeights, sunnahRawatib: val }), <Zap className="w-4 h-4" />)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Book className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">القرآن والعلم الشرعي</h4>
              </div>
              {weightInput('حفظ ربع جديد', localWeights.quranHifz, (val) => setLocalWeights({ ...localWeights, quranHifz: val }))}
              {weightInput('مراجعة ربع', localWeights.quranRevision, (val) => setLocalWeights({ ...localWeights, quranRevision: val }))}
              {weightInput('طلب علم شرعي (دقيقة)', localWeights.knowledgeShari, (val) => setLocalWeights({ ...localWeights, knowledgeShari: val }), <GraduationCap className="w-4 h-4" />)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">النوافل والأذكار</h4>
              </div>
              {weightInput('دقيقة قيام/نوافل', localWeights.nawafilPerMin, (val) => setLocalWeights({ ...localWeights, nawafilPerMin: val }))}
              {weightInput('أذكار (الواحد)', localWeights.athkarCounter, (val) => setLocalWeights({ ...localWeights, athkarCounter: val }))}
              {weightInput('يوم صيام نفل', localWeights.fastingDay, (val) => setLocalWeights({ ...localWeights, fastingDay: val }))}
              {weightInput('أذكار القائمة (الواحد)', localWeights.athkarChecklist, (val) => setLocalWeights({ ...localWeights, athkarChecklist: val }), <LayoutList className="w-4 h-4" />)}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Tags className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">إضافة سنن مخصصة</h4>
              </div>
              
              <div className="space-y-3 mb-6">
                {(localWeights.customSunnahs || []).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 header-font">{s.name}</span>
                      <span className="text-[10px] text-emerald-500 font-bold block">+{s.points} نقطة</span>
                    </div>
                    <button onClick={() => deleteCustomSunnah(s.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSunnahName}
                  onChange={(e) => setNewSunnahName(e.target.value)}
                  placeholder="اسم السنة"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold header-font outline-none focus:border-emerald-300"
                />
                <input 
                  type="number" 
                  value={newSunnahPoints}
                  onChange={(e) => setNewSunnahPoints(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold font-mono text-center outline-none focus:border-emerald-300"
                />
                <button 
                  onClick={addCustomSunnah}
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-90 shadow-md shadow-emerald-100"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={resetWeights}
                className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold header-font text-xs flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> استعادة الافتراضي
              </button>
              <button 
                onClick={handleSaveWeights}
                className={`flex-1 py-3 rounded-2xl font-bold header-font text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${isSavedWeights ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'}`}
              >
                {isSavedWeights ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSavedWeights ? 'تم الحفظ' : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4 shadow-sm">
        <LockKeyhole className="w-6 h-6 text-emerald-600 shrink-0" />
        <p className="text-[11px] text-emerald-800 font-bold leading-relaxed header-font">
          تطبيق الميزان يحترم خصوصيتك المطلقة؛ بياناتك وعباداتك تُحفظ محلياً على جهازك فقط، بينما تساهم المزامنة العالمية في إحصائيات الأمة دون كشف أسرارك مع الله.
        </p>
      </div>
    </div>
  );
};

export default UserProfile;