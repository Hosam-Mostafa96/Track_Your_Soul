
import React, { useState } from 'react';
import { 
  User, Mail, ShieldCheck, LogOut, CheckCircle, 
  Settings2, ChevronDown, ChevronUp, Save, RotateCcw,
  Star, Users, Clock, Book, GraduationCap, Zap, LayoutList,
  LockKeyhole,
  Globe,
  Calendar,
  MapPin,
  Fingerprint
} from 'lucide-react';
import { AppWeights, User as UserType } from '../types';
import { DEFAULT_WEIGHTS } from '../constants';

interface UserProfileProps {
  user: UserType | null;
  weights: AppWeights;
  isGlobalSync: boolean;
  onToggleSync: (enabled: boolean) => void;
  onUpdateUser: (user: UserType | null) => void;
  onUpdateWeights: (weights: AppWeights) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, weights, isGlobalSync, onToggleSync, onUpdateUser, onUpdateWeights }) => {
  const [localWeights, setLocalWeights] = useState<AppWeights>({ ...weights });
  const [showWeights, setShowWeights] = useState(true);
  const [isSavedWeights, setIsSavedWeights] = useState(false);

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
    if (window.confirm('هل تريد مسح بيانات الحساب بالكامل من هذا الجهاز؟ (سيتم مسح اسمك ودولتك وأوزانك المخصصة)')) {
      onUpdateUser(null);
    }
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

  const infoItem = (label: string, value: string | undefined, icon: any) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
      <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter header-font">{label}</p>
        <p className="text-xs font-bold text-slate-700 header-font">{value || '---'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-top duration-300 pb-12">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg relative">
            <User className="w-12 h-12 text-emerald-600" />
            <div className="absolute bottom-0 right-0 bg-emerald-500 p-1.5 rounded-full border-2 border-white shadow-sm">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 header-font">{user?.name}</h2>
          <p className="text-[10px] text-emerald-600 font-black header-font uppercase tracking-widest mt-1">هوية معتمدة في المحراب</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {infoItem('البريد الإلكتروني', user?.email, <Mail className="w-4 h-4" />)}
          {infoItem('الدولة والمنطقة', user?.country, <MapPin className="w-4 h-4" />)}
          {infoItem('العمر المسجل', user?.age ? `${user.age} عاماً` : '', <Calendar className="w-4 h-4" />)}
          {infoItem('المؤهل الدراسي', user?.qualification, <Fingerprint className="w-4 h-4" />)}
        </div>

        <button 
          onClick={handleLogout}
          className="w-full py-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl font-bold text-xs header-font transition-all flex items-center justify-center gap-2 border border-dashed border-slate-200 hover:border-rose-200"
        >
          <LogOut className="w-4 h-4" /> تسجيل خروج وإعادة تعيين الحساب
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-1 h-full transition-all ${isGlobalSync ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all ${isGlobalSync ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font">الارتباط بالمحراب العالمي</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">مشاركة الإحصائيات مع الأمة الآن</p>
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
              <h3 className="font-bold text-slate-800 header-font">إعدادات أوزان النظام</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">تخصيص قيمة كل ورد وعبادة</p>
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
          تطبيق إدارة العبادات يحترم خصوصيتك؛ بياناتك تُحفظ فقط في ذاكرة متصفحك ولا تُرسل لأي خادم خارجي.
        </p>
      </div>
    </div>
  );
};

export default UserProfile;
