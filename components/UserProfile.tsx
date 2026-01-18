
import React, { useState } from 'react';
import { 
  User, ShieldCheck, LogOut, CheckCircle, 
  Settings2, ChevronDown, ChevronUp, Save, RotateCcw,
  Star, Users, Clock, Book, GraduationCap, Zap, 
  LockKeyhole, Globe, Flame, BookOpen, ListChecks,
  Activity, Mail, MapPin, Calendar, Sparkles, Skull,
  Moon, Sun
} from 'lucide-react';
import { AppWeights, User as UserType } from '../types';
import { DEFAULT_WEIGHTS } from '../constants';

interface UserProfileProps {
  user: UserType | null;
  weights: AppWeights;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isGlobalSync: boolean;
  onToggleSync: (enabled: boolean) => void;
  onUpdateUser: (user: UserType | null) => void;
  onUpdateWeights: (weights: AppWeights) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, weights, isDarkMode, onToggleDarkMode, isGlobalSync, onToggleSync, onUpdateUser, onUpdateWeights 
}) => {
  const [localWeights, setLocalWeights] = useState<AppWeights>({ ...weights });
  const [showWeights, setShowWeights] = useState(false);
  const [isSavedWeights, setIsSavedWeights] = useState(false);

  const handleSaveWeights = () => {
    onUpdateWeights(localWeights);
    setIsSavedWeights(true);
    setTimeout(() => setIsSavedWeights(false), 3000);
  };

  const resetWeights = () => {
    if (window.confirm('هل تريد استعادة الأوزان الافتراضية للنظام؟')) {
      const resetW = { ...DEFAULT_WEIGHTS };
      setLocalWeights(resetW);
      onUpdateWeights(resetW);
    }
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد الخروج؟ سيتم مسح بيانات الجلسة من هذا المتصفح.')) {
      onUpdateUser(null);
      localStorage.removeItem('worship_user');
      window.location.reload();
    }
  };

  const weightInput = (label: string, value: number, onChange: (val: number) => void, icon?: any) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
      <div className="flex items-center gap-2">
        {icon && <span className="text-emerald-500 dark:text-emerald-400">{icon}</span>}
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 header-font">{label}</span>
      </div>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-20 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 text-center focus:outline-none"
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-top duration-300 pb-12">
      {/* بطاقة المستخدم الشخصية */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-slate-800 shadow-xl relative">
            <User className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            <div className="absolute bottom-1 right-1 bg-emerald-500 p-1.5 rounded-full border-2 border-white dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white header-font">{user?.name}</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black header-font uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
               {user?.method === 'google' ? 'موثق عبر جوجل' : 'موثق عبر الإيميل'}
             </span>
          </div>

          <div className="grid grid-cols-1 gap-3 w-full mt-8">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">{user?.email}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{user?.age} سنة</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{user?.country}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 w-full">
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-2xl font-bold text-xs header-font transition-all flex items-center justify-center gap-2 border border-dashed border-rose-200 dark:border-rose-900 hover:bg-rose-100"
            >
              <LogOut className="w-4 h-4" /> تسجيل الخروج ومسح الجلسة
            </button>
          </div>
        </div>
      </div>

      {/* خيار الوضع الليلي الجديد */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
              {isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white header-font">الوضع الليلي</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold header-font uppercase tracking-widest">تغيير مظهر التطبيق</p>
            </div>
          </div>
          <button 
            onClick={onToggleDarkMode}
            className={`w-14 h-8 rounded-full transition-all relative ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm flex items-center justify-center ${isDarkMode ? 'left-1' : 'left-7'}`}>
                {isDarkMode ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Sun className="w-3 h-3 text-slate-300" />}
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 group transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all ${isGlobalSync ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white header-font">المزامنة مع المحراب العالمي</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold header-font uppercase">مشاركة التنافس مع أمة الإسلام</p>
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

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <button 
          onClick={() => setShowWeights(!showWeights)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Settings2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-slate-800 dark:text-white header-font">تخصيص أوزان النظام</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold header-font">تحكم في قيمة كل عبادة بدقة</p>
            </div>
          </div>
          {showWeights ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
        </button>

        {showWeights && (
          <div className="mt-6 space-y-8 animate-in slide-in-from-top duration-300">
            {/* قسم الصلوات */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest header-font">الصلوات والفرائض</h4>
              </div>
              {weightInput('صلاة الجماعة', localWeights.fardCongregation, (val) => setLocalWeights({ ...localWeights, fardCongregation: val }), <Users className="w-4 h-4" />)}
              {weightInput('صلاة منفردة', localWeights.fardSolo, (val) => setLocalWeights({ ...localWeights, fardSolo: val }), <User className="w-4 h-4" />)}
            </div>

            {/* قسم الذنوب والمجاهدة */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Skull className="w-4 h-4 text-rose-500" />
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest header-font">الذنوب والمجاهدة</h4>
              </div>
              {weightInput('نسبة خصم الذنوب (%)', localWeights.burdenDeduction, (val) => setLocalWeights({ ...localWeights, burdenDeduction: val }), <Skull className="w-4 h-4" />)}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={resetWeights}
                className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl font-bold header-font text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <RotateCcw className="w-4 h-4" /> استعادة الافتراضي
              </button>
              <button 
                onClick={handleSaveWeights}
                className={`flex-1 py-3 rounded-2xl font-bold header-font text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${isSavedWeights ? 'bg-emerald-500 text-white' : 'bg-slate-800 dark:bg-emerald-600 text-white hover:bg-slate-900 active:scale-95'}`}
              >
                {isSavedWeights ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSavedWeights ? 'تم الحفظ' : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex gap-4 shadow-sm">
        <LockKeyhole className="w-6 h-6 text-emerald-600 dark:text-emerald-500 shrink-0" />
        <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold leading-relaxed header-font">
          تطبيق "ميزان" يوثق رحلتك الروحية. بياناتك الأساسية تُرسل للمحراب العالمي لتمكين المنافسة، بينما تظل تفاصيل أورادك اليومية محفوظة بخصوصية تامة على جهازك.
        </p>
      </div>
    </div>
  );
};

export default UserProfile;
