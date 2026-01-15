
import React, { useState } from 'react';
import { User, Mail, Globe, Calendar, GraduationCap, ArrowRight, CheckCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';

const GOOGLE_STATS_API = "https://script.google.com/macros/s/AKfycbzbkn4MVK27wrmAhkDvKjZdq01vOQWG7-SFDOltC4e616Grjp-uMsON4cVcr3OOVKqg/exec"; 

interface OnboardingProps {
  onComplete: (user: UserType) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserType>({
    name: '',
    email: '',
    country: '',
    age: '',
    qualification: ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const anonId = localStorage.getItem('mizan_anon_id') || Math.random().toString(36).substring(7);
    localStorage.setItem('mizan_anon_id', anonId);

    try {
      if (!GOOGLE_STATS_API.includes("FIX_ME")) {
        await fetch(GOOGLE_STATS_API, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'registerUser',
            id: anonId,
            ...formData
          })
        });
      }
      onComplete(formData);
    } catch (error) {
      console.error("Registration failed:", error);
      // Even if API fails, allow entry locally
      onComplete(formData);
    } finally {
      setIsSaving(false);
    }
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
              <h1 className="text-2xl font-black text-slate-800 header-font mb-2">مرحباً بك في الميزان</h1>
              <p className="text-xs text-slate-500 font-bold leading-relaxed header-font">رحلة المحاسبة والارتقاء تبدأ من هنا. نحتاج لبعض البيانات الأساسية لبناء ملفك الروحي.</p>
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
              <button onClick={handleBack} className="p-2 bg-slate-100 rounded-xl text-slate-400"><ArrowRight className="w-4 h-4" /></button>
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

              <div className="relative">
                <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  placeholder="المؤهل الدراسي (اختياري)"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold header-font text-sm"
                />
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl flex gap-3 border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-[10px] text-emerald-800 font-bold header-font">نلتزم بحفظ بياناتك بأمان؛ المزامنة تهدف لتعزيز روح الجماعة في المحراب العالمي فقط.</p>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSaving || !formData.country || !formData.age}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold header-font shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {isSaving ? 'جاري التسجيل...' : 'ابدأ رحلة الميزان'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all ${step === 1 ? 'bg-emerald-600 w-6' : 'bg-slate-200'}`}></div>
          <div className={`w-2 h-2 rounded-full transition-all ${step === 2 ? 'bg-emerald-600 w-6' : 'bg-slate-200'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
