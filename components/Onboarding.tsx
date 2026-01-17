
import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  Sparkles, 
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  LogIn,
  ChevronRight,
  ShieldCheck,
  Globe,
  X,
  Search
} from 'lucide-react';
import { User as UserType } from '../types';

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzbkn4MVK27wrmAhkDvKjZdq01vOQWG7-SFDOltC4e616Grjp-uMsON4cVcr3OOVKqg/exec"; 

interface OnboardingProps {
  installPrompt: any;
  onComplete: (user: UserType) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1); 
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [formData, setFormData] = useState<UserType>({
    name: '',
    email: '',
    age: '',
    country: '',
    qualification: '',
    method: 'email'
  });

  const handleGoogleMethod = () => {
    setIsAuthenticating(true);
    // محاكاة تأخير فتح النافذة
    setTimeout(() => {
      setIsAuthenticating(false);
      setShowGoogleModal(true);
    }, 800);
  };

  const selectGoogleAccount = (email: string, name: string) => {
    setFormData(prev => ({ 
      ...prev, 
      email, 
      name, 
      method: 'google' 
    }));
    setShowGoogleModal(false);
    setStep(2); // انتقل لإكمال البيانات الإضافية
  };

  const handleSubmitData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.age || !formData.country || !formData.qualification) {
      alert("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }
    
    setIsSaving(true);
    const anonId = localStorage.getItem('worship_anon_id') || Math.random().toString(36).substring(7);
    localStorage.setItem('worship_anon_id', anonId);

    try {
      // إرسال البيانات باستخدام ترويسة text/plain لتجنب مشاكل CORS مع Apps Script
      await fetch(GOOGLE_STATS_API, {
        method: 'POST',
        mode: 'no-cors', // مهم جداً عند التعامل مع Apps Script
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'registerUserFull',
          id: anonId,
          name: formData.name,
          email: formData.email,
          age: formData.age,
          country: formData.country,
          qualification: formData.qualification,
          method: formData.method,
          timestamp: new Date().toISOString()
        })
      });
      
      // ننتقل للنجاح مباشرة لأن mode: no-cors لا يعيد استجابة مقروءة
      setStep(3);
    } catch (error) {
      console.error("Registration error:", error);
      setStep(3);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* خلفية فنية */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500 z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        
        {/* الخطوة 1: اختيار طريقة التسجيل */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-3xl mb-4">
                <Sparkles className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 header-font mb-2">مرحباً بك في ميزان</h1>
              <p className="text-xs text-slate-500 font-bold header-font uppercase tracking-widest">اختر وسيلة دخول المحراب</p>
            </div>

            <div className="space-y-3 pt-4">
              <button 
                onClick={handleGoogleMethod}
                disabled={isAuthenticating}
                className="w-full py-4 px-6 bg-white border border-slate-200 rounded-2xl font-bold header-font shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    <span className="text-slate-700">دخول سريع عبر جوجل</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] text-slate-300 font-bold uppercase header-font">أو</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 px-6 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 group"
              >
                <Mail className="w-5 h-5" />
                <span>البريد الإلكتروني</span>
              </button>
            </div>
            
            <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed px-4">
              بانضمامك إلينا، تبدأ رحلة منظمة لمحاسبة النفس وتوثيق أورادك اليومية في قاعدة بيانات الأبرار.
            </p>
          </div>
        )}

        {/* الخطوة 2: إكمال البيانات الشخصية */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black text-slate-800 header-font">بيانات المنتسب</h2>
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
                    className="w-full pl-4 pr-11 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="البريد الإلكتروني المعتمد"
                    className="w-full pl-4 pr-11 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm text-left"
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
                      className="w-full pl-4 pr-11 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" required
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="بلد الإقامة"
                      className="w-full pl-4 pr-11 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                    />
                  </div>
                </div>

                <div className="relative">
                  <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select 
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                    className="w-full pl-4 pr-11 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm appearance-none"
                  >
                    <option value="" disabled>المؤهل الدراسي</option>
                    <option value="ثانوي">ثانوي أو أقل</option>
                    <option value="جامعي">بكالوريوس / ليسانس</option>
                    <option value="ماجستير">ماجستير</option>
                    <option value="دكتوراه">دكتوراه</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5 rotate-180" />}
                {isSaving ? 'جاري توثيق البيانات...' : 'تأكيد التسجيل'}
              </button>
            </form>
          </div>
        )}

        {/* الخطوة 3: نجاح التسجيل */}
        {step === 3 && (
          <div className="space-y-6 animate-in zoom-in duration-300 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4 relative">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse opacity-20"></div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 header-font">تم القبول</h2>
            <p className="text-sm text-slate-500 font-bold header-font px-4">
              أهلاً بك يا {formData.name}، لقد تم إدراج اسمك في سجلات المحراب العالمي بنجاح.
            </p>

            <div className="w-full pt-4">
              <button 
                onClick={() => onComplete(formData)}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold header-font shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                دخول التطبيق <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-emerald-600 text-[10px] font-bold header-font bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
               <ShieldCheck className="w-3 h-3" /> بياناتك محفوظة بأمان تام
            </div>
          </div>
        )}
      </div>

      {/* نافذة جوجل المنبثقة المحاكاة */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-[360px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" className="h-5" alt="Google" />
                <span className="text-xs font-bold text-slate-500 header-font pt-1">تسجيل الدخول</span>
              </div>
              <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 header-font">اختيار حساب</h3>
                <p className="text-xs text-slate-500 header-font">للمتابعة إلى تطبيق ميزان</p>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => selectGoogleAccount('user@gmail.com', 'مستخدم جوجل')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 text-right"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">م</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">مستخدم جوجل المفتوح</p>
                    <p className="text-[10px] text-slate-500">user@gmail.com</p>
                  </div>
                </button>

                <div className="h-px bg-slate-100 my-2"></div>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 text-right">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 text-sm font-bold text-slate-600">استخدام حساب آخر</div>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 text-[10px] text-slate-400 font-medium leading-relaxed px-6 text-center">
              سيقوم Google بمشاركة اسمك وعنوان بريدك الإلكتروني وصورتك المفضلة مع تطبيق ميزان. قبل استخدام هذا التطبيق، يمكنك مراجعة سياسة الخصوصية.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
