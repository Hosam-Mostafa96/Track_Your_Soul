
import React, { useState, useEffect } from 'react';
import { 
  User, 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  Sparkles, 
  Smartphone,
  Zap,
  Check,
  Share,
  PlusSquare,
  MoreVertical,
  Download
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
  const [isStandalone, setIsStandalone] = useState(false);
  
  const [formData, setFormData] = useState<UserType>({
    name: ''
  });

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
  }, []);

  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
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
            name: formData.name
          })
        });
      }
      
      if (isStandalone) {
        onComplete(formData);
      } else {
        setStep(2);
      }
    } catch (error) {
      setStep(2);
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
      if (outcome === 'accepted') {
        onComplete(formData);
      }
    } catch (err) {
      console.error("Install prompt error:", err);
    }
    setIsInstalling(false);
  };

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
              <h1 className="text-2xl font-black text-slate-800 header-font mb-2">مرحباً بك في المحراب</h1>
              <p className="text-xs text-slate-500 font-bold leading-relaxed header-font">أهلاً بك في رحلة الارتقاء الروحي. ما هو اسمك الكريم؟</p>
            </div>

            <form onSubmit={handleSubmitName} className="space-y-4 pt-4">
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="الاسم الكريم"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm text-center"
                />
              </div>
              <button 
                type="submit"
                disabled={isSaving || !formData.name.trim()}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 rotate-180" />}
                {isSaving ? 'جاري التحميل...' : 'ابدأ الآن'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-top duration-500">
             <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-3xl mb-4 relative">
                <Smartphone className="w-10 h-10 text-emerald-600" />
                <div className="absolute -top-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-white">
                  <Zap className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-800 header-font mb-1">ثبّت التطبيق الآن</h2>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed header-font">
                للحصول على أفضل تجربة، أضف التطبيق لشاشتك الرئيسية.
              </p>
            </div>

            {isIOS ? (
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 space-y-5">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm"><Share className="w-5 h-5 text-blue-500" /></div>
                   <span className="text-[11px] font-bold text-slate-700 header-font">اضغط على زر <span className="text-blue-600 font-black">مشاركة</span> في Safari.</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm"><PlusSquare className="w-5 h-5 text-slate-800" /></div>
                   <span className="text-[11px] font-bold text-slate-700 header-font">اختر <span className="text-slate-900 font-black">"إضافة إلى الشاشة الرئيسية"</span>.</span>
                </div>
              </div>
            ) : installPrompt ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleInstallApp}
                  disabled={isInstalling}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isInstalling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {isInstalling ? 'جاري التثبيت...' : 'تثبيت التطبيق الآن'}
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 space-y-5">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm"><MoreVertical className="w-5 h-5 text-slate-600" /></div>
                   <span className="text-[11px] font-bold text-slate-700 header-font">اضغط على <span className="text-emerald-700 font-black">الثلاث نقاط</span> في متصفح Chrome.</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm"><Download className="w-5 h-5 text-emerald-600" /></div>
                   <span className="text-[11px] font-bold text-slate-700 header-font">اختر <span className="text-emerald-900 font-black">"تثبيت التطبيق"</span>.</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => onComplete(formData)}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold header-font shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                تخطي والدخول الآن <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
