
import React, { useState, useMemo } from 'react';
import { 
  User, ShieldCheck, LogOut, CheckCircle, 
  Settings2, ChevronDown, ChevronUp, Save, RotateCcw,
  Star, Users, Clock, Book, GraduationCap, Zap, 
  LockKeyhole, Globe, Flame, BookOpen, ListChecks,
  Activity, Mail, MapPin, Calendar, Sparkles, Skull,
  Repeat, Database, AlertTriangle, FileJson, Check,
  Smartphone, Download, X, Heart, ShieldAlert,
  MessageCircle, BellRing, Upload, Printer, Edit2, AlertCircle
} from 'lucide-react';
import { AppWeights, User as UserType, DailyLog } from '../types';
import { DEFAULT_WEIGHTS } from '../constants';
import confetti from 'canvas-confetti';
import { BadgesSection } from './BadgesSection';
import { PWAInstallButton, InstalledStatusBadge } from './PWAInstallButton';
import { MonthlyReportModal } from './MonthlyReportModal';
import {
  downloadFullBackupJson,
  inspectBackupJson,
  restoreBackupJson,
} from '../utils/backupAndReport';

interface UserProfileProps {
  user: UserType | null;
  weights: AppWeights;
  isGlobalSync: boolean;
  onToggleSync: (enabled: boolean) => void;
  onUpdateUser: (user: UserType | null) => void;
  onUpdateWeights: (weights: AppWeights) => void;
  installPrompt?: any;
  onClearInstallPrompt?: () => void;
  logs?: Record<string, DailyLog>;
  onOpenReminders?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  weights, 
  isGlobalSync, 
  onToggleSync, 
  onUpdateUser, 
  onUpdateWeights, 
  logs = {},
  onOpenReminders
}) => {
  const [localWeights, setLocalWeights] = useState<AppWeights>({ ...weights });
  const [showWeights, setShowWeights] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isSavedWeights, setIsSavedWeights] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importErrorMsg, setImportErrorMsg] = useState<string>('');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  const effectiveLogs = useMemo(() => {
    if (logs && Object.keys(logs).length > 0) return logs;
    try {
      return JSON.parse(localStorage.getItem('worship_logs') || '{}');
    } catch {
      return {};
    }
  }, [logs]);

  const targetScore = useMemo(() => {
    try {
      const saved = localStorage.getItem('worship_target');
      return saved ? parseInt(saved, 10) : 13500;
    } catch {
      return 13500;
    }
  }, []);

  const inspection = useMemo(() => {
    if (!importJson.trim()) return null;
    return inspectBackupJson(importJson);
  }, [importJson]);

  const handleSaveWeights = () => {
    onUpdateWeights(localWeights);
    setIsSavedWeights(true);
    setTimeout(() => setIsSavedWeights(false), 3000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleDownloadFullBackup = () => {
    const { fileName, sizeKB } = downloadFullBackupJson();
    setExportFeedback(`تم تنزيل ${fileName} (${sizeKB} ك.ب) بنجاح ✓`);
    setTimeout(() => setExportFeedback(null), 5000);
  };

  const handleBackupFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImportJson(reader.result);
        setImportStatus('idle');
        setImportErrorMsg('');
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    const res = restoreBackupJson(importJson, restoreMode);
    if (res.success) {
      setImportStatus('success');
      setImportErrorMsg('');
      setImportJson('');
      setTimeout(() => {
        setImportStatus('idle');
        window.location.reload();
      }, 1500);
    } else {
      setImportStatus('error');
      setImportErrorMsg(res.error || 'تعذر استعادة البيانات.');
      setTimeout(() => setImportStatus('idle'), 3500);
    }
  };

  const resetWeights = () => {
    if (window.confirm('هل تريد استعادة الأوزان الافتراضية للنظام؟')) {
      const resetW = { ...DEFAULT_WEIGHTS };
      setLocalWeights(resetW);
      onUpdateWeights(resetW);
    }
  };

  const handleOpenEditProfile = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setProfileError(null);
    setProfileSavedMsg(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();

    if (!trimmedName) {
      setProfileError('يرجى إدخال الاسم.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setProfileError('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    const updatedUser: UserType = {
      name: trimmedName,
      email: trimmedEmail,
      age: user?.age || '',
      country: user?.country || '',
      city: user?.city || '',
      qualification: user?.qualification || '',
      method: user?.method || 'email',
    };

    onUpdateUser(updatedUser);
    localStorage.setItem('worship_user', JSON.stringify(updatedUser));
    setProfileError(null);
    setIsEditingProfile(false);
    setProfileSavedMsg('تم تحديث بيانات الحساب وحفظ البريد الإلكتروني بنجاح ✓');
    setTimeout(() => setProfileSavedMsg(null), 4000);
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد الخروج؟ سيتم مسح بيانات الجلسة من هذا المتصفح.')) {
      onUpdateUser(null);
      localStorage.removeItem('worship_user');
      window.location.reload();
    }
  };

  const weightInput = (label: string, value: number, onChange: (val: number) => void, icon?: any, unit?: string) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
      <div className="flex items-center gap-2">
        {icon && <span className="text-emerald-500">{icon}</span>}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-700 header-font">{label}</span>
          {unit && <span className="text-[8px] text-slate-400 font-bold">{unit}</span>}
        </div>
      </div>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-20 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-emerald-700 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-top duration-300 pb-12 text-right" dir="rtl">
      {/* بطاقة المستخدم الشخصية */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-xl relative">
            <User className="w-12 h-12 text-emerald-600" />
            <div className="absolute bottom-1 right-1 bg-emerald-500 p-1.5 rounded-full border-2 border-white">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 header-font text-center">{user?.name || 'مستخدم'}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
             <span className="text-[10px] text-emerald-600 font-black header-font uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
               {user?.method === 'google' ? 'موثق عبر جوجل' : 'موثق عبر الإيميل'}
             </span>
             {!isEditingProfile && (
               <button
                 type="button"
                 onClick={handleOpenEditProfile}
                 className="text-[11px] text-slate-700 hover:text-emerald-700 font-black header-font bg-slate-100 hover:bg-emerald-50 px-3 py-1 rounded-full border border-slate-200 hover:border-emerald-200 transition-all flex items-center gap-1.5"
               >
                 <Edit2 className="w-3 h-3" />
                 <span>تعديل البيانات</span>
               </button>
             )}
          </div>

          {profileSavedMsg && (
            <div className="w-full mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSavedMsg}</span>
            </div>
          )}

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="w-full mt-6 p-4 bg-slate-50 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 header-font">تعديل بيانات المستخدم</h3>
                <button
                  type="button"
                  onClick={() => { setIsEditingProfile(false); setProfileError(null); }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  aria-label="إغلاق التعديل"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 header-font">الاسم</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => { setEditName(e.target.value); setProfileError(null); }}
                    placeholder="أدخل اسمك"
                    className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 header-font">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    dir="ltr"
                    value={editEmail}
                    onChange={(e) => { setEditEmail(e.target.value); setProfileError(null); }}
                    placeholder="example@email.com"
                    className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              {profileError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{profileError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditingProfile(false); setProfileError(null); }}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold header-font transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-3 w-full mt-8">
              <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <User className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 header-font">الاسم</div>
                    <div className="text-xs font-bold text-slate-700 truncate">{user?.name || 'غير محدد'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="shrink-0 text-[10px] font-black text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 header-font"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>تعديل</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 header-font">البريد الإلكتروني</div>
                    <div className="text-xs font-bold text-slate-700 truncate" dir="ltr">{user?.email || 'غير محدد'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="shrink-0 text-[10px] font-black text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 header-font"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>تعديل الإيميل</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">{user?.age ? `${user.age} سنة` : 'العمر غير محدد'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">{user?.country || 'الدولة غير محددة'}</span>
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
          )}
          
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

      {/* نظام الأوسمة والإنجاز الإيماني - وسام الـ 30 يوماً متتالياً */}
      <BadgesSection logs={effectiveLogs} weights={weights} user={user} />

      {/* خيار تثبيت التطبيق وحالة التثبيت */}
      <PWAInstallButton variant="card" />
      <div className="flex justify-center">
        <InstalledStatusBadge />
      </div>

      {/* التقرير الشهري الشامل */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font">التقرير الشهري الشامل (PDF / صورة)</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">
                ملخص إنجازات الشهر في الصلوات والقرآن والأذكار قابل للطباعة أو الحفظ كصورة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMonthlyReport(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl transition-all header-font shadow-sm active:scale-95"
          >
            عرض واستخراج التقرير
          </button>
        </div>
      </div>

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
            className={`w-14 h-8 rounded-full transition-all relative ${isGlobalSync ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm flex items-center justify-center ${isGlobalSync ? 'left-1' : 'left-7'}`}>
                {isGlobalSync ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <ShieldCheck className="w-3 h-3 text-slate-300" />}
            </div>
          </button>
        </div>
      </div>
      
      {/* التذكير اليومي المجدول وإشعارات المتصفح */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-105 transition-all">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 header-font">التذكير اليومي المجدول</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">ضبط تنبيهات صلاة الفجر، أذكار الصباح والمساء، والسنن</p>
            </div>
          </div>
          {onOpenReminders && (
            <button
              type="button"
              onClick={onOpenReminders}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black rounded-2xl transition-all header-font"
            >
              إدارة التنبيهات
            </button>
          )}
        </div>
      </div>

      {/* النسخ الاحتياطي الكامل واستعادة البيانات */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
        <button onClick={() => setShowRecovery(!showRecovery)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl"><Database className="w-5 h-5 text-amber-600" /></div>
            <div className="text-right">
              <h3 className="font-bold text-slate-800 header-font">النسخ الاحتياطي واستعادة البيانات</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">تنزيل واستيراد نسخة كاملة (JSON) للعبادات والتدبرات والختمات</p>
            </div>
          </div>
          {showRecovery ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
        </button>
        {showRecovery && (
          <div className="mt-6 space-y-4 animate-in slide-in-from-top duration-300">
            {/* زر تنزيل النسخة الاحتياطية الكاملة */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="text-xs font-black text-emerald-950 header-font">تصدير نسخة احتياطية شاملة</h4>
                  <p className="text-[10px] text-emerald-700 font-bold">
                    تحفظ سجلات الأيام، التدبرات، الفواصل، الختمات، الكتب، الأوزان، والمهام.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadFullBackup}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black header-font flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل ملف JSON</span>
                </button>
              </div>
              {exportFeedback && (
                <p className="text-[11px] font-bold text-emerald-800 bg-white/80 rounded-xl px-3 py-1.5 border border-emerald-200">
                  {exportFeedback}
                </p>
              )}
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                لاستعادة نسخة سابقة، اختر ملف (.json) من جهازك أو الصق النص أسفله، ثم راجع المعاينة قبل الاستيراد. يدعم النظام النسخ الشاملة (v2) ونسخ السجلات القديمة.
              </p>
            </div>

            <label className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-black text-slate-700 header-font">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>اختيار ملف نسخة احتياطية (.json) من الجهاز</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleBackupFileSelected}
                className="hidden"
              />
            </label>

            <div className="relative">
              <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} placeholder="أو الصق محتوى النسخة الاحتياطية (JSON) هنا..." className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-[10px] font-mono focus:border-emerald-300 transition-all resize-none" />
              <FileJson className="absolute bottom-3 left-3 w-4 h-4 text-slate-300" />
            </div>

            {/* معاينة فورية للنسخة قبل الاستعادة */}
            {inspection && (
              <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                inspection.valid
                  ? 'bg-slate-50 border-emerald-200 text-slate-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {inspection.valid ? (
                  <>
                    <div className="flex items-center justify-between font-black header-font">
                      <span className="text-emerald-800">
                        {inspection.format === 'v2' ? '✓ نسخة شاملة صالحة (الإصدار ٢)' : '✓ نسخة سجلات يومية متوافقة'}
                      </span>
                      {inspection.userName && (
                        <span className="text-[10px] text-slate-500">المستخدم: {inspection.userName}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold">
                      <div className="bg-white rounded-xl p-2 border border-slate-100">الأيام: <b>{inspection.daysCount}</b></div>
                      <div className="bg-white rounded-xl p-2 border border-slate-100">التدبرات: <b>{inspection.tadabburCount}</b></div>
                      <div className="bg-white rounded-xl p-2 border border-slate-100">الختمات: <b>{inspection.khatmatCount}</b></div>
                      <div className="bg-white rounded-xl p-2 border border-slate-100">الكتب: <b>{inspection.booksCount}</b></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setRestoreMode('merge')}
                        className={`py-2 px-3 rounded-xl text-[11px] font-black header-font border transition-all ${
                          restoreMode === 'merge'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        دمج آمن مع الحالية
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestoreMode('replace')}
                        className={`py-2 px-3 rounded-xl text-[11px] font-black header-font border transition-all ${
                          restoreMode === 'replace'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        استبدال كامل للبيانات
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="font-bold text-[11px]">{inspection.error}</p>
                )}
              </div>
            )}

            <button onClick={handleManualImport} disabled={!importJson.trim() || (inspection ? !inspection.valid : false)} className={`w-full py-4 rounded-2xl font-black header-font text-xs shadow-lg flex items-center justify-center gap-2 transition-all ${importStatus === 'success' ? 'bg-emerald-500 text-white' : importStatus === 'error' ? 'bg-rose-500 text-white' : importJson.trim() && inspection?.valid ? 'bg-slate-900 text-white active:scale-95' : 'bg-slate-100 text-slate-300'}`}>{importStatus === 'success' ? <Check className="w-4 h-4" /> : <Database className="w-4 h-4" />}{importStatus === 'success' ? 'تمت استعادة البيانات بنجاح — جاري التحديث...' : importStatus === 'error' ? (importErrorMsg || 'خطأ في تنسيق الملف!') : 'تنفيذ استعادة البيانات الآن'}</button>
          </div>
        )}
      </div>

      {/* تخصيص أوزان النظام - النسخة الموسعة */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <button onClick={() => setShowWeights(!showWeights)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl"><Settings2 className="w-5 h-5 text-slate-600" /></div>
            <div className="text-right">
              <h3 className="font-bold text-slate-800 header-font">تخصيص أوزان النظام</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">تحكم في قيمة كل عبادة بدقة متناهية</p>
            </div>
          </div>
          {showWeights ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
        </button>

        {showWeights && (
          <div className="mt-6 space-y-10 animate-in slide-in-from-top duration-300 pb-4">
            
            {/* 1. الصلوات والفرائض */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2 px-1 border-r-4 border-emerald-500 pr-2">
                <Star className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest header-font">الصلوات والفرائض</h4>
              </div>
              {weightInput('صلاة الجماعة', localWeights.fardCongregation, (val) => setLocalWeights({ ...localWeights, fardCongregation: val }), <Users className="w-4 h-4" />)}
              {weightInput('صلاة منفردة', localWeights.fardSolo, (val) => setLocalWeights({ ...localWeights, fardSolo: val }), <User className="w-4 h-4" />)}
              {weightInput('السنة الراتبة', localWeights.sunnahRawatib, (val) => setLocalWeights({ ...localWeights, sunnahRawatib: val }), <Sparkles className="w-4 h-4" />, 'لكل ركعتين/سنة')}
            </div>

            {/* 2. ورد القرآن والإتقان */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2 px-1 border-r-4 border-amber-500 pr-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest header-font">ورد القرآن والإتقان</h4>
              </div>
              {weightInput('ورد السماع (ربع)', localWeights.quranHifz, (val) => setLocalWeights({ ...localWeights, quranHifz: val }), <Zap className="w-4 h-4" />)}
              {weightInput('ورد القراءة (ربع)', localWeights.quranRevision, (val) => setLocalWeights({ ...localWeights, quranRevision: val }), <Activity className="w-4 h-4" />)}
              {weightInput('تكرار الصفحة الواحدة', localWeights.quranPageRepetition, (val) => setLocalWeights({ ...localWeights, quranPageRepetition: val }), <Repeat className="w-4 h-4" />, 'لكل تكرار إضافي')}
              {weightInput('تكرار الربع الواحد', localWeights.quranRubRepetition, (val) => setLocalWeights({ ...localWeights, quranRubRepetition: val }), <Repeat className="w-4 h-4" />, 'لكل تكرار إضافي')}
            </div>

            {/* 3. طلب العلم والقراءة */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2 px-1 border-r-4 border-purple-500 pr-2">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest header-font">طلب العلم والقراءة</h4>
              </div>
              {weightInput('العلم الشرعي (بالدقيقة)', localWeights.knowledgeShari, (val) => setLocalWeights({ ...localWeights, knowledgeShari: val }), <Clock className="w-4 h-4" />)}
              {weightInput('القراءة العامة (بالدقيقة)', localWeights.knowledgeGeneral, (val) => setLocalWeights({ ...localWeights, knowledgeGeneral: val }), <Clock className="w-4 h-4" />)}
              {weightInput('نقاط القراءة لكل صفحة', localWeights.pointsPerPage, (val) => setLocalWeights({ ...localWeights, pointsPerPage: val }), <Book className="w-4 h-4" />)}
            </div>

            {/* 4. الأذكار والنوافل */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2 px-1 border-r-4 border-orange-500 pr-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest header-font">الأذكار والنوافل</h4>
              </div>
              {weightInput('قوائم الأذكار الكاملة', localWeights.athkarChecklist, (val) => setLocalWeights({ ...localWeights, athkarChecklist: val }), <ListChecks className="w-4 h-4" />, 'صباح/مساء..')}
              {weightInput('عداد التسبيح (للواحدة)', localWeights.athkarCounter, (val) => setLocalWeights({ ...localWeights, athkarCounter: val }), <Zap className="w-4 h-4" />)}
              {weightInput('صلاة النفل (بالدقيقة)', localWeights.nawafilPerMin, (val) => setLocalWeights({ ...localWeights, nawafilPerMin: val }), <Clock className="w-4 h-4" />, 'ضحى/وتر/قيام')}
              {weightInput('صيام يوم كامل', localWeights.fastingDay, (val) => setLocalWeights({ ...localWeights, fastingDay: val }), <Flame className="w-4 h-4" />)}
              {weightInput('نقاط كل دعاء', localWeights.pointsPerDua, (val) => setLocalWeights({ ...localWeights, pointsPerDua: val }), <MessageCircle className="w-4 h-4" />, 'ورد الدعاء')}
            </div>

            {/* 5. أعمال القلوب والخصومات */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2 px-1 border-r-4 border-rose-500 pr-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest header-font">أعمال القلوب والخصومات</h4>
              </div>
              {weightInput('المهمة القلبية الواحدة', localWeights.heartDeedPoint, (val) => setLocalWeights({ ...localWeights, heartDeedPoint: val }), <Sparkles className="w-4 h-4" />, 'أعمال التزكية')}
              {weightInput('نسبة خصم العبء الروحي', localWeights.burdenDeduction, (val) => setLocalWeights({ ...localWeights, burdenDeduction: val }), <ShieldAlert className="w-4 h-4" />, 'تخصم كنسبة %')}
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                onClick={resetWeights}
                className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold header-font text-xs flex items-center justify-center gap-2 border border-slate-200 active:bg-slate-100 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> استعادة الافتراضي
              </button>
              <button 
                onClick={handleSaveWeights}
                className={`flex-1 py-4 rounded-2xl font-black header-font text-xs flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${isSavedWeights ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}
              >
                {isSavedWeights ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSavedWeights ? 'تم الحفظ بنجاح' : 'حفظ كافة الأوزان'}
              </button>
            </div>
          </div>
        )}
      </div>

      <MonthlyReportModal
        isOpen={showMonthlyReport}
        onClose={() => setShowMonthlyReport(false)}
        logs={effectiveLogs}
        weights={weights}
        user={user}
        targetScore={targetScore}
      />
    </div>
  );
};

export default UserProfile;
