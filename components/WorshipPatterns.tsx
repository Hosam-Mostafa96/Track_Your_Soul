
import React, { useMemo } from 'react';
import { 
  Combine, 
  Target, 
  Zap,
  Activity,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { DailyLog, AppWeights } from '../types';
import { calculateTotalScore } from '../utils/scoring';
import { format } from 'date-fns';

interface WorshipPatternsProps {
  logs: Record<string, DailyLog>;
  weights: AppWeights;
}

const WorshipPatterns: React.FC<WorshipPatternsProps> = ({ logs, weights }) => {
  // 1. تحليل الكثافة الروحية (النقاط مقابل الوقت)
  const scatterData = useMemo(() => {
    return Object.values(logs).map(log => {
      const totalMinutes = 
        log.knowledge.shariDuration + 
        log.knowledge.readingDuration + 
        log.nawafil.duhaDuration + 
        log.nawafil.witrDuration + 
        log.nawafil.qiyamDuration;
      
      const score = calculateTotalScore(log, weights);
      
      return {
        minutes: totalMinutes,
        score: score,
        jihad: log.jihadFactor,
        date: log.date
      };
    }).filter(d => d.minutes > 0 || d.score > 0);
  }, [logs, weights]);

  // 2. تحليل أثر المجاهدة (الجهد المبذول)
  const jihadImpactData = useMemo(() => {
    const groups = {
      normal: [] as number[],
      struggle: [] as number[],
      high: [] as number[]
    };

    Object.values(logs).forEach(log => {
      const score = calculateTotalScore(log, weights);
      if (log.jihadFactor === 1.0) groups.normal.push(score);
      else if (log.jihadFactor === 1.05) groups.struggle.push(score);
      else if (log.jihadFactor === 1.1) groups.high.push(score);
    });

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    return [
      { name: 'عادي', score: avg(groups.normal), count: groups.normal.length, fill: '#10b981' },
      { name: 'مجاهدة', score: avg(groups.struggle), count: groups.struggle.length, fill: '#f59e0b' },
      { name: 'شديدة', score: avg(groups.high), count: groups.high.length, fill: '#ef4444' }
    ];
  }, [logs, weights]);

  // 3. الكثافة الروحية المتوسطة
  const spiritualDensity = useMemo(() => {
    const totalMins = scatterData.reduce((acc, curr) => acc + curr.minutes, 0);
    const totalScore = scatterData.reduce((acc, curr) => acc + curr.score, 0);
    return totalMins > 0 ? Math.round(totalScore / totalMins) : 0;
  }, [scatterData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* هيدر الأنماط */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-emerald-100 rounded-2xl">
          <Combine className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 header-font">أنماط الاتصال</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font">فهم العلاقة بين الزمن والجهد والأثر</p>
        </div>
      </div>

      {/* بطاقة الكثافة الروحية */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 header-font">كثافة ميزانك</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono">{spiritualDensity}</span>
              <span className="text-xs opacity-60 header-font font-bold">نقطة / دقيقة</span>
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
            <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-[10px] leading-relaxed opacity-70 font-bold header-font">
            هذا الرقم يعبر عن "جودة" الوقت الذي تقضيه. كلما زاد، دل ذلك على دسامة وردك وارتفاع خشوعك ومجاهدتك.
          </p>
        </div>
      </div>

      {/* مخطط التناسب بين الوقت والوزن */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-slate-700 text-xs header-font">التناسب (الزمن vs الوزن)</h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                dataKey="minutes" 
                name="دقائق" 
                unit="د" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
              />
              <YAxis 
                type="number" 
                dataKey="score" 
                name="نقاط" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
              />
              <ZAxis type="number" range={[50, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo' }}
              />
              <Scatter name="الأيام" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.jihad > 1.0 ? '#f59e0b' : '#10b981'} 
                    fillOpacity={0.6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[9px] text-slate-400 font-bold text-center header-font mt-2">
           النقاط البرتقالية تمثل أيام "المجاهدة". النقاط الأعلى تدل على كفاءة روحية أكبر في وقت أقل.
        </p>
      </div>

      {/* أثر معامل المجاهدة */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-4 h-4 text-orange-500" />
          <h3 className="font-bold text-slate-700 text-xs header-font">أثر المجاهدة (متوسط النقاط)</h3>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jihadImpactData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700, fontFamily: 'Cairo' }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo' }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {jihadImpactData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {jihadImpactData.map((d: any, i: number) => (
            <div key={i} className="text-center">
              <span className="text-[10px] font-black text-slate-400 header-font">{d.name}</span>
              <p className="text-xs font-bold text-slate-800">{d.count} يوم</p>
            </div>
          ))}
        </div>
      </div>

      {/* نصيحة الأنماط */}
      <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 flex gap-4">
        <Sparkles className="w-8 h-8 text-emerald-600 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-emerald-800 mb-1 header-font">بصيرة المحاسبة</h4>
          <p className="text-xs text-emerald-700 leading-relaxed font-bold header-font">
            إذا لاحظت أن نقاطك تزداد بشكل كبير في أيام "المجاهدة"، فهذا يعني أن قلبك يستجيب للشدة بالإخبات. أما إذا تقاربت، فأنت تملك "نفساً مستقرة" لا تتأثر بالظروف، وكلاهما فضل من الله.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorshipPatterns;
