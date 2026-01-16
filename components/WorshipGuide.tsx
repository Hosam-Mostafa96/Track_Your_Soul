
import React from 'react';
import { 
  Star, Heart, Book, GraduationCap, Zap, 
  Target, Info, ArrowUpRight, ShieldAlert,
  Users, Sparkles, Clock, Sun, Flame,
  Award, Home, Coins, Key, CloudMoon, MapPin
} from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../constants';

const WorshipGuide: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 header-font">دليل إدارة العبادات</h2>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed header-font">
          هذا النظام هو أسلوب لمحاسبة النفس يربط الأجر بالزمن والمجهود، مصمم ليشجعك على الالتزام بطاعة الله والارتقاء في معارج القبول.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">أوسمة الأبرار وشروطها</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              title: 'بشرى الرؤية',
              condition: 'صلاة الفجر في وقتها (جماعة أو منفرداً).',
              icon: <Sun className="w-5 h-5 text-amber-500" />,
              color: 'bg-amber-50 border-amber-100'
            },
            {
              title: 'بيت في الجنة',
              condition: 'أداء الـ ١٢ ركعة الراتبة (٢ قبل الفجر، ٤ قبل الظهر، ٢ بعده، ٢ بعد المغرب، ٢ بعد العشاء).',
              icon: <Home className="w-5 h-5 text-emerald-600" />,
              color: 'bg-emerald-50 border-emerald-100'
            },
            {
              title: 'بعيد عن النار',
              condition: 'تسجيل صيام يوم نافلة أو قضاء.',
              icon: <Flame className="w-5 h-5 text-orange-500" />,
              color: 'bg-orange-50 border-orange-100'
            },
            {
              title: 'مفتاح الرزق',
              condition: 'البدء بورد الاستغفار في عداد الأذكار.',
              icon: <Coins className="w-5 h-5 text-blue-500" />,
              color: 'bg-blue-50 border-blue-100'
            },
            {
              title: 'مفتاح النجاح',
              condition: 'ذكر "لا حول ولا قوة إلا بالله" في قسم الأذكار.',
              icon: <Key className="w-5 h-5 text-indigo-500" />,
              color: 'bg-indigo-50 border-indigo-100'
            },
            {
              title: 'مفتاح القرب',
              condition: 'الصلاة على النبي ﷺ في قسم الأذكار.',
              icon: <Heart className="w-5 h-5 text-rose-500" />,
              color: 'bg-rose-50 border-rose-100'
            },
            {
              title: 'محبوب الرحمن',
              condition: 'أداء صلاة الوتر (تسجيل دقيقة واحدة على الأقل).',
              icon: <CloudMoon className="w-5 h-5 text-slate-600" />,
              color: 'bg-slate-50 border-slate-200'
            }
          ].map((badge, idx) => (
            <div key={idx} className={`flex gap-4 p-4 rounded-2xl border ${badge.color} transition-all`}>
              <div className="bg-white p-3 rounded-xl shadow-sm self-start">
                {badge.icon}
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm header-font mb-1">{badge.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-bold header-font">{badge.condition}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorshipGuide;
