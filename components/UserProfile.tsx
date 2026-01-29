
import React, { useState } from 'react';
import { 
  User, ShieldCheck, LogOut, CheckCircle, 
  Settings2, ChevronDown, ChevronUp, Save, RotateCcw,
  Star, Users, Clock, Book, GraduationCap, Zap, 
  LockKeyhole, Globe, Flame, BookOpen, ListChecks,
  Activity, Mail, MapPin, Calendar, Sparkles, Skull,
  Repeat, Database, AlertTriangle, FileJson, Check,
  Smartphone, Download, Share, X
} from 'lucide-react';
import { AppWeights, User as UserType, DailyLog } from '../types';
import { DEFAULT_WEIGHTS } from '../constants';
import confetti from 'canvas-confetti';

interface UserProfileProps {
  user: UserType | null;
  weights: AppWeights;
  isGlobalSync: boolean;
  onToggleSync: (enabled: boolean) => void;
  onUpdateUser: (user: UserType | null) => void;
  onUpdateWeights: (weights: AppWeights) => void;
  installPrompt: any;
  onClearInstallPrompt: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, weights, isGlobalSync, onToggleSync, onUpdateUser, onUpdateWeights, installPrompt, onClearInstallPrompt }) => {
  const [localWeights, setLocalWeights] = useState<AppWeights>({ ...weights });
  const [showWeights, setShowWeights] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isSavedWeights, setIsSavedWeights] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showiOSInstructions, setShowiOSInstructions] = useState(false);

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowiOSInstructions(true);
      return;
    }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      onClearInstallPrompt();
      confetti({ particleCount: 150, spread: 90 });
    }
  };

  const handleSaveWeights = () => {
    onUpdateWeights(localWeights);
    setIsSavedWeights(true);
    setTimeout(() => setIsSavedWeights(false), 3000);
  };

  const handleManualImport = () => {
    try {
      const parsedLogs = JSON.parse(importJson);
      const firstKey = Object.keys(parsedLogs)[0];
      if (typeof parsedLogs !== 'object' || (firstKey && !firstKey.match(/^\d{4}-\d{2}-\d{2}$/))) {
        throw new Error("Invalid format");
      }

      const existingLogs = JSON.parse(localStorage.getItem('worship_logs') || '{}');
      const mergedLogs = { ...parsedLogs, ...existingLogs };
      
      localStorage.setItem('worship_logs', JSON.stringify(mergedLogs));
      setImportStatus('success');
      setImportJson('');
      setTimeout(() => {
        setImportStatus('idle');
        window.location.reload();
      }, 2000);
    } catch (e) {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
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
      {/* بطاقة المستخدم الشخصية */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-xl relative">
            <User className="w-12 h-12 text-emerald-600" />
            <div className="absolute bottom-1 right-1 bg-emerald-500 p-1.5 rounded-full border-2 border-white">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 header-font text-center">{user?.name}</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] text-emerald-600 font-black header-font uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
               {user?.method === 'google' ? 'موثق عبر جوجل' : 'موثق عبر الإيميل'}
             </span>
          </div>

          <div className="grid grid-cols-1 gap-3 w-full mt-8">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 truncate">{user?.email}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">{user?.age} سنة</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">{user?.country}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-600">{user?.city || 'المدينة غير محددة'}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-slate-600">{user?.qualification || 'المؤهل غير محدد'}</span>
            </div>
          </div>
          
          <div className="mt-8 w-full">
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl font-bold text-xs header-font transition-all flex items-center justify-center gap-2 border border-dashed border-rose-200 hover:bg-rose-100"
            >
              <LogOut className="w-4 h-4" /> تسجيل الخروج ومسح الجلسة
            </button>
          </div>
        </div>
      </div>

      {/* خيار تثبيت التطبيق - يظهر فقط إذا لم يكن مثبتاً بالفعل */}
      {(!isStandalone && (installPrompt || isIOS)) && (
        <div className="bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl p-6 shadow-lg text-white animate-in zoom-in duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold header-font leading-tight">ثبّت التطبيق على هاتفك</h3>
              <p className="text-[10px] text-amber-50 font-bold opacity-90">لسهولة الوصول، إشعارات أسرع، وتجربة أفضل 🌙</p>
            </div>
          </div>
          <button 
            onClick={handleInstallClick}
            className="w-full py-4 bg-white text-orange-600 rounded-2xl font-black header-font text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isIOS ? 'عرض تعليمات التثبيت' : 'تثبيت التطبيق الآن'}
          </button>
        </div>
      )}

      {/* المزامنة السحابية */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all ${isGlobalSync ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font">المزامنة مع المحراب العالمي</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">مشاركة التنافس مع أمة الإسلام</p>
            </div>
          </div>
          <button 
            onClick={() => onToggleSync(!isGlobalSync)}
            className={`w-14 h-8 rounded-full transition-all relative ${isGlobalSync ? 'bg-emerald-50' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm flex items-center justify-center ${isGlobalSync ? 'left-1' : 'left-7'}`}>
                {isGlobalSync ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <ShieldCheck className="w-3 h-3 text-slate-300" />}
            </div>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
        <button 
          onClick={() => setShowRecovery(!showRecovery)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Database className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-slate-800 header-font">أدوات استعادة البيانات</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">استرداد السجلات عبر كود JSON</p>
            </div>
          </div>
          {showRecovery ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
        </button>

        {showRecovery && (
          <div className="mt-6 space-y-4 animate-in slide-in-from-top duration-300">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                هذه الخاصية مخصصة لاستعادة بياناتك إذا حصل تداخل في السحابة. قم بلصق كود السجلات (JSON) في المربع أدناه ثم اضغط استيراد. سيتم دمجها مع بياناتك الحالية.
              </p>
            </div>
            
            <div className="relative">
              <textarea 
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="الصق كود السجلات هنا (JSON)..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-[10px] font-mono focus:border-emerald-300 transition-all resize-none"
              />
              <FileJson className="absolute bottom-3 left-3 w-4 h-4 text-slate-300" />
            </div>

            <button 
              onClick={handleManualImport}
              disabled={!importJson.trim()}
              className={`w-full py-4 rounded-2xl font-black header-font text-xs shadow-lg flex items-center justify-center gap-2 transition-all ${
                importStatus === 'success' ? 'bg-emerald-500 text-white' : 
                importStatus === 'error' ? 'bg-rose-500 text-white' :
                importJson.trim() ? 'bg-slate-900 text-white active:scale-95' : 'bg-slate-100 text-slate-300'
              }`}
            >
              {importStatus === 'success' ? <Check className="w-4 h-4" /> : <Database className="w-4 h-4" />}
              {importStatus === 'success' ? 'تم استيراد البيانات بنجاح' : 
               importStatus === 'error' ? 'خطأ في تنسيق الكود!' : 'استيراد السجلات الآن'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <button 
          onClick={() => setShowWeights(!showWeights)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Settings2 className="w-5 h-5 text-slate-600" />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-slate-800 header-font">تخصيص أوزان النظام</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">تحكم في قيمة كل عبادة بدقة</p>
            </div>
          </div>
          {showWeights ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
        </button>

        {showWeights && (
          <div className="mt-6 space-y-8 animate-in slide-in-from-top duration-300">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">الصلوات والفرائض</h4>
              </div>
              {weightInput('صلاة الجماعة', localWeights.fardCongregation, (val) => setLocalWeights({ ...localWeights, fardCongregation: val }), <Users className="w-4 h-4" />)}
              {weightInput('صلاة منفردة', localWeights.fardSolo, (val) => setLocalWeights({ ...localWeights, fardSolo: val }), <User className="w-4 h-4" />)}
              {weightInput('السنة الراتبة (للواحدة)', localWeights.sunnahRawatib, (val) => setLocalWeights({ ...localWeights, sunnahRawatib: val }), <Sparkles className="w-4 h-4" />)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">ورد القرآن</h4>
              </div>
              {weightInput('الحفظ الجديد (ربع)', localWeights.quranHifz, (val) => setLocalWeights({ ...localWeights, quranHifz: val }), <Zap className="w-4 h-4" />)}
              {weightInput('المراجعة (ربع)', localWeights.quranRevision, (val) => setLocalWeights({ ...localWeights, quranRevision: val }), <Activity className="w-4 h-4" />)}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={resetWeights}
                className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold header-font text-xs flex items-center justify-center gap-2 border border-slate-200"
              >
                <RotateCcw className="w-4 h-4" /> استعادة الافتراضي
              </button>
              <button 
                onClick={handleSaveWeights}
                className={`flex-1 py-3 rounded-2xl font-bold header-font text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${isSavedWeights ? 'bg-emerald-50 text-white' : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'}`}
              >
                {isSavedWeights ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSavedWeights ? 'تم الحفظ' : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showiOSInstructions && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-500 text-right" dir="rtl">
              <button onClick={() => setShowiOSInstructions(false)} className="absolute top-6 left-6 p-2 text-slate-400"><X className="w-5 h-5" /></button>
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="p-4 bg-emerald-50 rounded-3xl"><Smartphone className="w-10 h-10 text-emerald-600" /></div>
                 <h3 className="text-xl font-black text-slate-800 header-font">تثبيت على آيفون</h3>
                 <div className="space-y-4 text-right w-full">
                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                       <div className="bg-white p-2 rounded-lg shadow-sm font-bold text-emerald-600 shrink-0">١</div>
                       <p className="text-sm font-bold text-slate-600 leading-relaxed">اضغط على زر المشاركة <Share className="w-4 h-4 inline text-blue-500 mx-1" /> في متصفح Safari.</p>
                    </div>
                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                       <div className="bg-white p-2 rounded-lg shadow-sm font-bold text-emerald-600 shrink-0">٢</div>
                       <p className="text-sm font-bold text-slate-600 leading-relaxed">اختر <b>"إضافة إلى الشاشة الرئيسية"</b> أو <b>"Add to Home Screen"</b>.</p>
                    </div>
                 </div>
                 <button onClick={() => setShowiOSInstructions(false)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black header-font">فهمت ذلك</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
