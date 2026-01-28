
import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  Sparkles, 
  Mail,
  Smartphone,
  Download,
  Share,
  X,
  ShieldCheck,
  CloudDownload,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { User as UserType } from '../types';
import { GOOGLE_STATS_API } from '../constants';

const COUNTRIES = [
  "مصر", "السعودية", "الإمارات", "الكويت", "قطر", "البحرين", "عمان", 
  "الأردن", "فلسطين", "سوريا", "لبنان", "العراق", "اليمن", 
  "ليبيا", "تونس", "الجزائر", "المغرب", "السودان", "موريتانيا", "الصومال",
  "تركيا", "إندونيسيا", "ماليزيا", "أخرى"
];

interface OnboardingProps {
  installPrompt: any;
  onComplete: (user: UserType, restoredLogs?: string, restoredBooks?: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, installPrompt }) => {
  const [step, setStep] = useState(1); 
  const [isSaving, setIsSaving] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showiOSInstructions, setShowiOSInstructions] = useState(false);
  const [showCloudRestore, setShowCloudRestore] = useState<{ user: any, logs: string, books: string } | null>(null);
  
  const [formData, setFormData] = useState<UserType>({
    name: '', email: '', age: '', country: '', city: '', qualification: '', method: 'email'
  });

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    setEmailError(value ? !validateEmail(value) : false);
  };

  const handleSubmitData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) { setEmailError(true); return; }
    if (!formData.name.trim() || !formData.email.trim() || !formData.age || !formData.country) {
      alert("يرجى إكمال البيانات المطلوبة."); return;
    }
    
    setIsSaving(true);
    const tempId = localStorage.getItem('worship_anon_id') || Math.random().toString(36).substring(7);

    try {
      const response = await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'registerUser', 
          id: tempId,
          email: formData.email.toLowerCase().trim(),
          name: formData.name.trim(),
          age: formData.age,
          country: formData.country,
          city: formData.city.trim(),
          qualification: formData.qualification.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.userSync && data.userSync.existingUser) {
          setShowCloudRestore({
            user: data.userSync.existingUser,
            logs: data.userSync.existingLogs,
            books: data.userSync.existingBooks
          });
        } else {
          localStorage.setItem('worship_anon_id', tempId);
          setStep(3);
        }
      } else { throw new Error("Server error"); }
    } catch (error) {
      console.error("Onboarding sync error:", error);
      setErrorMessage("تعذر الاتصال بالمحراب السحابي. سيتم الحفظ محلياً.");
      setTimeout(() => setStep(3), 3000);
    } finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 relative overflow-hidden text-right" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden z-10">
        
        {showCloudRestore ? (
          <div className="space-y-6 text-center animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudDownload className="w-10 h-10 text-amber-600 animate-bounce" />
             </div>
             <h2 className="text-xl font-black text-slate-800 header-font">وجدنا نسخة احتياطية!</h2>
             <p className="text-xs text-slate-500 font-bold leading-relaxed">
                مرحباً بك مجدداً {showCloudRestore.user.name}. لقد تم العثور على سجلاتك السابقة في محرابنا السحابي. هل تود استعادتها الآن؟
             </p>
             <div className="space-y-3">
                <button onClick={() => onComplete(showCloudRestore.user, showCloudRestore.logs, showCloudRestore.books)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black header-font shadow-lg">نعم، استعد بياناتي</button>
                <button onClick={() => setStep(3)} className="w-full py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold text-[10px]">تجاهل وابدأ من جديد</button>
             </div>
          </div>
        ) : step === 1 ? (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="p-5 bg-emerald-50 rounded-[2rem] mb-4"><Sparkles className="w-12 h-12 text-emerald-600" /></div>
              <h1 className="text-2xl font-black text-slate-800 header-font mb-2">تطبيق إدارة العبادات والأوراد</h1>
              <p className="text-xs text-slate-500 font-bold header-font">بوابتك للارتقاء الروحي ومحاسبة النفس</p>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-5 px-6 bg-emerald-600 text-white rounded-2xl font-black header-font shadow-xl flex items-center justify-center gap-3 group">
              ابدأ رحلة المحاسبة الآن <ArrowRight className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
            {(installPrompt || isIOS) && (
              <button onClick={() => isIOS ? setShowiOSInstructions(true) : installPrompt.prompt()} className="w-full py-4 px-6 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-bold header-font flex items-center justify-center gap-3">
                <Download className="w-5 h-5 text-emerald-600" /> {isIOS ? 'كيفية التثبيت على الهاتف' : 'تثبيت التطبيق على الشاشة'}
              </button>
            )}
          </div>
        ) : step === 2 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><ChevronRight className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black text-slate-800 header-font">بيانات المنتسب</h2>
            </div>
            <form onSubmit={handleSubmitData} className="space-y-4">
              <input type="text" required value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="الاسم الثلاثي" className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm" />
              <input type="email" required value={formData.email} onChange={handleEmailChange} placeholder="البريد الإلكتروني المعتمد" className={`w-full px-4 py-4 bg-slate-50 border ${emailError ? 'border-rose-300' : 'border-slate-100'} rounded-2xl outline-none font-bold header-font text-sm text-left`} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" required value={formData.age} onChange={(e) => setFormData(p => ({ ...p, age: e.target.value }))} placeholder="العمر" className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm" />
                <select required value={formData.country} onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm appearance-none">
                  <option value="" disabled>الدولة</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isSaving || emailError || !formData.email} className="w-full py-5 rounded-2xl font-black header-font shadow-xl bg-emerald-600 text-white disabled:bg-slate-200">
                {isSaving ? <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>جاري البحث عن بياناتك..</span></div> : "تأكيد تسجيل الدخول"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 flex flex-col items-center text-center animate-in fade-in">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-16 h-16 text-emerald-500" /></div>
            <h2 className="text-2xl font-black text-slate-800 header-font">تم التوثيق بنجاح</h2>
            <button onClick={() => onComplete(formData)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black header-font shadow-2xl flex items-center justify-center gap-2">دخول المحراب <ArrowRight className="w-6 h-6 rotate-180" /></button>
          </div>
        )}
      </div>

      {showiOSInstructions && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-500">
              <button onClick={() => setShowiOSInstructions(false)} className="absolute top-6 left-6 p-2 text-slate-400"><X className="w-5 h-5" /></button>
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="p-4 bg-emerald-50 rounded-3xl"><Smartphone className="w-10 h-10 text-emerald-600" /></div>
                 <h3 className="text-xl font-black text-slate-800 header-font">تثبيت على آيفون</h3>
                 <div className="space-y-4 text-right w-full">
                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                       <div className="bg-white p-2 rounded-lg shadow-sm font-bold text-emerald-600 shrink-0">١</div>
                       <p className="text-sm font-bold text-slate-600">اضغط على زر المشاركة <Share className="w-4 h-4 inline text-blue-500 mx-1" /> في Safari.</p>
                    </div>
                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                       <div className="bg-white p-2 rounded-lg shadow-sm font-bold text-emerald-600 shrink-0">٢</div>
                       <p className="text-sm font-bold text-slate-600">اختر <b>"إضافة إلى الشاشة الرئيسية"</b>.</p>
                    </div>
                 </div>
                 <button onClick={() => setShowiOSInstructions(false)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black header-font">حسناً</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
