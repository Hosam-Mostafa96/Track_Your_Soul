
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  Calendar, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  Smartphone,
  Zap,
  Check,
  Share,
  PlusSquare,
  ChevronLeft
} from 'lucide-react';
import { User as UserType } from '../types';

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzbkn4MVK27wrmAhkDvKjZdq01vOQWG7-SFDOltC4e616Grjp-uMsON4cVcr3OOVKqg/exec"; 

interface OnboardingProps {
  installPrompt: any;
  onComplete: (user: UserType) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ installPrompt, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [formData, setFormData] = useState<UserType>({
    name: '',
    email: '',
    country: '',
    age: '',
    qualification: ''
  });

  useEffect(() => {
    // التحقق مما إذا كان الجهاز iOS
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    setIsIOS(checkIOS());
  }, []);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const anonId = localStorage.getItem('worship_anon_id') || Math.random().toString(36).substring(7);
    localStorage.setItem('worship_anon_id', anonId);

    try {
      if (!GOOGLE_STATS_API.includes("FIX_ME")) {
        await fetch(GOOGLE_STATS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'registerUser',
            id: anonId,
            ...formData
          })
        });
      }
      
      // ننتقل دائماً لخطوة التثبيت لتشجيع المستخدم
      setStep(3);
    } catch (error) {
      console.error("Registration failed:", error);
      setStep(3);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    setIsInstalling(true);
    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`User response: ${outcome}`);
    } catch (err) {
      console.error("Install prompt error:", err);
    }
    setIsInstalling(false);
    onComplete(formData);
  };

  const countries = ["مصر", "السعودية", "الجزائر", "المغرب", "تونس", "الأردن", "العراق", "الإمارات", "الكويت", "قطر", "سلطنة عمان", "لبنان", "سوريا", "فلسطين", "أخرى"];

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-3xl mb-4">
                <Sparkles className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 header-font mb-2">مرحباً بك في إدارة العبادات</h1>
              <p className="text-xs text-slate-500 font-bold leading-relaxed header-font">نحتاج لبعض البيانات الأساسية لبناء ملفك الروحي.</p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="الاسم الكريم"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                />
              </div>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="البريد الإلكتروني"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                />
              </div>
              <button 
                onClick={handleNext}
                disabled={!formData.name || !formData.email}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                المتابعة <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleBack} className="p-2 bg-slate-100 rounded-xl text-slate-400"><ChevronLeft className="w-4 h-4 rotate-180" /></button>
              <h2 className="text-lg font-bold text-slate-800 header-font">بيانات إضافية</h2>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <select 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm appearance-none"
                >
                  <option value="">اختر الدولة</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="العمر"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                />
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl flex gap-3 border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-[10px] text-emerald-800 font-bold header-font">مزامنة البيانات تهدف لتعزيز روح الجماعة في المحراب العالمي فقط.</p>
              </div>
              <button 
                onClick={handleSubmitInfo}
                disabled={isSaving || !formData.country || !formData.age}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {isSaving ? 'جاري الإعداد...' : 'حفظ والدخول'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-top duration-500">
             <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-3xl mb-4 relative">
                <Smartphone className="w-10 h-10 text-emerald-600" />
                <div className="absolute -top-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-white">
                  <Zap className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-800 header-font mb-2">ثبّت التطبيق على شاشتك</h2>
              <p className="text-xs text-slate-500 font-bold leading-relaxed header-font">
                للحصول على تجربة أسرع والوصول لأورادك حتى بدون إنترنت.
              </p>
            </div>

            {isIOS ? (
              /* واجهة iOS المخصصة */
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 space-y-5 animate-pulse">
                <p className="text-xs font-black text-emerald-800 header-font text-center mb-2">تعليمات لمستخدمي iPhone:</p>
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm"><Share className="w-5 h-5 text-blue-500" /></div>
                   <span className="text-[11px] font-bold text-slate-700 header-font">اضغط على زر <span className="text-blue-600 font-black">مشاركة</span> في أسفل المتصفح.</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm"><PlusSquare className="w-5 h-5 text-slate-800" /></div>
                   <span className="text-[11px] font-bold text-slate-700 header-font">اختر <span className="text-slate-900 font-black">"إضافة إلى الشاشة الرئيسية"</span>.</span>
                </div>
                <div className="pt-2 border-t border-emerald-200">
                  <button onClick={() => onComplete(formData)} className="w-full py-2 text-emerald-600 font-black text-[10px] header-font underline">لقد قمت بالإضافة، ابدأ الآن</button>
                </div>
              </div>
            ) : installPrompt ? (
              /* واجهة أندرويد/كروم */
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleInstallApp}
                  disabled={isInstalling}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isInstalling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
                  {isInstalling ? 'جاري التثبيت...' : 'تثبيت التطبيق الآن'}
                </button>
                <button onClick={() => onComplete(formData)} className="w-full py-3 text-slate-400 font-bold text-xs header-font">الدخول بدون تثبيت</button>
              </div>
            ) : (
              /* واجهة احتياطية إذا لم يتوفر زر التثبيت تلقائياً */
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center space-y-4">
                <p className="text-xs font-bold text-slate-600 header-font">يمكنك تثبيت التطبيق يدوياً عبر قائمة إعدادات المتصفح ثم اختيار "تثبيت التطبيق" أو "الإضافة للشاشة الرئيسية".</p>
                <button 
                  onClick={() => onComplete(formData)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg"
                >
                  فهمت، ابدأ الاستخدام
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-center gap-4">
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-bold text-slate-400 header-font">يدعم العمل بدون إنترنت</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-bold text-slate-400 header-font">تنبيهات الأذكار</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
