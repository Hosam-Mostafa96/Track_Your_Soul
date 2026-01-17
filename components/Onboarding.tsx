
import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  Sparkles, 
  Mail,
  Building,
  GraduationCap,
  Calendar,
  LogIn,
  ChevronRight,
  ShieldCheck,
  Globe,
  MapPin,
  Map as MapIcon,
  AlertCircle
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
  onComplete: (user: UserType, restoredLogs?: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1); 
  const [isSaving, setIsSaving] = useState(false);
  const [emailError, setEmailError] = useState(false);
  
  const [formData, setFormData] = useState<UserType>({
    name: '',
    email: '',
    age: '',
    country: '', 
    city: '',
    qualification: '', 
    method: 'email'
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    if (value && !validateEmail(value)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  const handleSubmitData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setEmailError(true);
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.age || !formData.country || !formData.city.trim() || !formData.qualification.trim()) {
      alert("يرجى إكمال جميع الحقول المطلوبة لتوثيق عضويتك.");
      return;
    }
    
    setIsSaving(true);
    const tempId = localStorage.getItem('worship_anon_id') || Math.random().toString(36).substring(7);

    try {
      const response = await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'registerUser', 
          id: tempId,
          name: formData.name,
          email: formData.email,
          age: formData.age,
          country: formData.country,
          city: formData.city,
          qualification: formData.qualification
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.userSync && data.userSync.existingUser) {
          const globalId = data.userSync.existingUser.id || data.userSync.existingUser.ID || tempId;
          localStorage.setItem('worship_anon_id', globalId);
          
          const confirmed = window.confirm("وجدنا بيانات سابقة مرتبطة بهذا البريد. هل تريد استعادتها؟");
          if (confirmed) {
            onComplete(data.userSync.existingUser, data.userSync.existingLogs);
            return;
          }
        } else {
          localStorage.setItem('worship_anon_id', tempId);
        }
      }
      
      setStep(3);
    } catch (error) {
      console.error("Sync error:", error);
      localStorage.setItem('worship_anon_id', tempId);
      setStep(3);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 relative overflow-hidden text-right" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500 rounded-full blur-[110px]"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden z-10">
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="p-5 bg-emerald-50 rounded-[2rem] mb-4">
                <Sparkles className="w-12 h-12 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 header-font mb-2">مرحباً بك في ميزان</h1>
              <p className="text-xs text-slate-500 font-bold header-font uppercase tracking-widest leading-relaxed">بوابتك للارتقاء الروحي ومحاسبة النفس</p>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-5 px-6 bg-emerald-600 text-white rounded-2xl font-black header-font shadow-xl flex items-center justify-center gap-3 group"
            >
              ابدأ رحلة المحاسبة الآن
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <ChevronRight className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black text-slate-800 header-font">بيانات المنتسب</h2>
            </div>

            <form onSubmit={handleSubmitData} className="space-y-4">
              <input 
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="الاسم الثلاثي"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
              />

              <div className="relative">
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="البريد الإلكتروني المعتمد"
                  className={`w-full px-4 py-4 bg-slate-50 border ${emailError ? 'border-rose-300' : 'border-slate-100'} rounded-2xl outline-none font-bold header-font text-sm text-left`}
                />
                {emailError && <p className="text-rose-500 text-[10px] font-bold mt-1">يرجى إدخال بريد صحيح</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="number" required
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="العمر"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                />
                <select 
                  required
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm appearance-none"
                >
                  <option value="" disabled>الدولة</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <input 
                type="text" required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="اسم المدينة"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm"
              />

              <input 
                type="text" required
                value={formData.qualification}
                onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                placeholder="المؤهل الدراسي أو التخصص"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm"
              />

              <button 
                type="submit"
                disabled={isSaving || emailError || !formData.email}
                className="w-full py-5 rounded-2xl font-black header-font shadow-xl bg-emerald-600 text-white disabled:bg-slate-200"
              >
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "تأكيد تسجيل الدخول"}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 header-font">تم التوثيق بنجاح</h2>
            <button 
              onClick={() => onComplete(formData)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black header-font shadow-2xl flex items-center justify-center gap-2"
            >
              دخول المحراب <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
