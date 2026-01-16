
import React, { useState } from 'react';
import { User, Mail, Globe, Calendar, GraduationCap, ArrowRight, CheckCircle, Loader2, Sparkles, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  supabase: any;
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ supabase, onComplete }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
    age: '',
    qualification: ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // حفظ بيانات الملف الشخصي في جدول profiles
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              name: formData.name,
              country: formData.country,
              age: formData.age,
              qualification: formData.qualification
            });
          
          if (profileError) throw profileError;
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (loginError) throw loginError;
      }
      onComplete();
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsProcessing(false);
    }
  };

  const countries = ["مصر", "السعودية", "الجزائر", "المغرب", "تونس", "الأردن", "العراق", "الإمارات", "الكويت", "قطر", "سلطنة عمان", "لبنان", "سوريا", "فلسطين", "أخرى"];

  if (!supabase) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-8 shadow-2xl text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 header-font mb-2">تكوين Supabase مطلوب</h2>
          <p className="text-sm text-slate-500 mb-6 font-bold header-font">
            يرجى ضبط متغير البيئة <code>SUPABASE_ANON_KEY</code> لتفعيل نظام تسجيل الدخول والمزامنة السحابية.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        
        <div className="mb-6 flex gap-2 p-1 bg-slate-100 rounded-2xl">
          <button 
            onClick={() => {setMode('signup'); setStep(1);}}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
          >إنشاء حساب</button>
          <button 
            onClick={() => {setMode('login'); setStep(1);}}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'login' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
          >تسجيل دخول</button>
        </div>

        {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] rounded-xl font-bold">{error}</div>}

        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-3xl mb-4">
                <Sparkles className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 header-font mb-2">
                {mode === 'signup' ? 'مرحباً بك في أوراد' : 'عوداً حميداً'}
              </h1>
              <p className="text-xs text-slate-500 font-bold leading-relaxed header-font">سجل دخولك لمزامنة عباداتك عبر السحابة والوصول إليها من أي مكان.</p>
            </div>

            <div className="space-y-4 pt-4">
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="الاسم الكريم"
                    className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="البريد الإلكتروني"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="كلمة المرور"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm"
                />
              </div>

              <button 
                onClick={mode === 'signup' ? handleNext : handleAuth}
                disabled={isProcessing || !formData.email || !formData.password || (mode === 'signup' && !formData.name)}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'signup' ? 'المتابعة' : 'دخول'}
                {mode === 'signup' && <ArrowRight className="w-5 h-5 rotate-180" />}
              </button>
            </div>
          </div>
        )}

        {step === 2 && mode === 'signup' && (
          <div className="space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleBack} className="p-2 bg-slate-100 rounded-xl text-slate-400"><ArrowRight className="w-4 h-4" /></button>
              <h2 className="text-lg font-bold text-slate-800 header-font">بيانات إضافية</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <select 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm appearance-none"
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
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm"
                />
              </div>

              <div className="relative">
                <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  placeholder="المؤهل الدراسي (اختياري)"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold header-font text-sm"
                />
              </div>

              <button 
                onClick={handleAuth}
                disabled={isProcessing || !formData.country || !formData.age}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {isProcessing ? 'جاري الإعداد...' : 'ابدأ رحلة الأوراد'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
