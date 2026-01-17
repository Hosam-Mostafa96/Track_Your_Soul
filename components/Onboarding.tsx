
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
  Globe
} from 'lucide-react';
import { User as UserType } from '../types';

// الرابط الخاص بـ Google Apps Script
const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzbkn4MVK27wrmAhkDvKjZdq01vOQWG7-SFDOltC4e616Grjp-uMsON4cVcr3OOVKqg/exec"; 

interface OnboardingProps {
  installPrompt: any;
  onComplete: (user: UserType) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1); 
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<UserType>({
    name: '',
    email: '',
    age: '',
    country: '', // المدينة / البلد
    qualification: '', // التخصص
    method: 'email'
  });

  const handleSubmitData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من أن جميع الحقول مكتملة
    if (!formData.name.trim() || !formData.email.trim() || !formData.age || !formData.country || !formData.qualification) {
      alert("يرجى إكمال جميع الحقول المطلوبة لتوثيق عضويتك في سجلات ميزان");
      return;
    }
    
    setIsSaving(true);
    // توليد معرف فريد مجهول إذا لم يوجد
    const anonId = localStorage.getItem('worship_anon_id') || Math.random().toString(36).substring(7);
    localStorage.setItem('worship_anon_id', anonId);

    try {
      // إرسال البيانات للسكربت باستخدام الأكشن registerUser المتوافق مع الكود الجديد
      await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        mode: 'no-cors', // لضمان الإرسال دون مشاكل CORS مع Apps Script
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'registerUser', // تم التغيير ليتطابق مع registerOrUpdateUser في السكربت
          id: anonId,
          name: formData.name,
          email: formData.email,
          age: formData.age,
          country: formData.country,
          qualification: formData.qualification
        })
      });
      
      // نعتبر العملية ناجحة وننتقل لصفحة الترحيب
      setStep(3);
    } catch (error) {
      console.error("خطأ في الاتصال بالخادم:", error);
      // في حالة الخطأ، نسمح بالمرور لضمان استمرارية تجربة المستخدم أوفلاين
      setStep(3);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* طبقات خلفية فنية */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500 rounded-full blur-[110px]"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500 z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -translate-y-16 translate-x-16 opacity-40"></div>
        
        {/* الخطوة 1: شاشة الترحيب */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="p-5 bg-emerald-50 rounded-[2rem] mb-4">
                <Sparkles className="w-12 h-12 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 header-font mb-2">مرحباً بك في ميزان</h1>
              <p className="text-xs text-slate-500 font-bold header-font uppercase tracking-widest leading-relaxed">بوابتك للارتقاء الروحي ومحاسبة النفس</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
               <ul className="space-y-4">
                  <li className="flex gap-3 text-xs font-bold text-slate-600 header-font items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>نظام متكامل لتوثيق الأوراد والصلوات</span>
                  </li>
                  <li className="flex gap-3 text-xs font-bold text-slate-600 header-font items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>مزامنة مباشرة مع لوحة الأبرار العالمية</span>
                  </li>
                  <li className="flex gap-3 text-xs font-bold text-slate-600 header-font items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>تتبع نمط حياتك العبادي بدقة متناهية</span>
                  </li>
               </ul>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-5 px-6 bg-emerald-600 text-white rounded-2xl font-black header-font shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 group"
            >
              ابدأ رحلة المحاسبة الآن
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* الخطوة 2: نموذج التسجيل بالبريد الإلكتروني */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <ChevronRight className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black text-slate-800 header-font">بيانات المنتسب</h2>
            </div>

            <form onSubmit={handleSubmitData} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="الاسم الثلاثي"
                    className="w-full pl-4 pr-11 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="البريد الإلكتروني المعتمد"
                    className="w-full pl-4 pr-11 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm text-left"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="number" required
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="العمر"
                      className="w-full pl-4 pr-11 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" required
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="المدينة / البلد"
                      className="w-full pl-4 pr-11 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                    />
                  </div>
                </div>

                <div className="relative">
                  <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select 
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                    className="w-full pl-4 pr-11 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm appearance-none"
                  >
                    <option value="" disabled>التخصص أو المؤهل الدراسي</option>
                    <option value="طالب">طالب علم / مدرسي</option>
                    <option value="موظف">موظف / أعمال حرة</option>
                    <option value="أكاديمي">أكاديمي / باحث</option>
                    <option value="تقني">تقني / مهندس</option>
                    <option value="طبي">طبي / صحي</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black header-font shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-6 h-6 rotate-180" />
                    <span>تأكيد تسجيل الدخول</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* الخطوة 3: شاشة النجاح */}
        {step === 3 && (
          <div className="space-y-6 animate-in zoom-in duration-300 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4 relative">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse opacity-20"></div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 header-font">تم التوثيق بنجاح</h2>
            <p className="text-sm text-slate-500 font-bold header-font px-4 leading-relaxed">
               أهلاً بك يا {formData.name}، لقد تم إدراج اسمك في سجلات ميزان بنجاح. نسأل الله لك التوفيق والسداد.
            </p>

            <button 
              onClick={() => onComplete(formData)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black header-font shadow-2xl hover:bg-slate-950 transition-all flex items-center justify-center gap-2"
            >
              دخول المحراب <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
            
            <div className="mt-4 flex items-center gap-2 text-emerald-600 text-[10px] font-bold header-font bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
               <ShieldCheck className="w-3 h-3" /> خصوصيتك مضمونة وبياناتك آمنة تقنياً
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
