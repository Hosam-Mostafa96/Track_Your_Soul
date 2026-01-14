
import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  History, 
  ChevronLeft, 
  Trophy, 
  CalendarCheck
} from 'lucide-react';
import { DailyLog, AppWeights } from '../types';
import { calculateTotalScore } from '../utils/scoring';

interface WorshipHistoryProps {
  logs: Record<string, DailyLog>;
  weights: AppWeights;
}

const WorshipHistory: React.FC<WorshipHistoryProps> = ({ logs, weights }) => {
  const sortedDates = Object.keys(logs).sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <History className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-bold header-font">لا توجد سجلات بعد</p>
        <p className="text-xs header-font">ابدأ بتسجيل أول صلاة لك اليوم</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 px-2">
        <CalendarCheck className="w-5 h-5 text-emerald-600" />
        <h3 className="font-bold text-slate-800 header-font text-lg">تاريخ العبادات</h3>
      </div>

      <div className="space-y-3">
        {sortedDates.map(date => {
          const log = logs[date];
          const score = calculateTotalScore(log, weights);
          // Parse date string (yyyy-MM-dd) manually to local time
          const dateObj = new Date(date.replace(/-/g, '/'));
          const formattedDate = format(dateObj, 'dd MMMM yyyy', { locale: ar });
          const dayName = format(dateObj, 'eeee', { locale: ar });

          return (
            <div key={date} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all cursor-pointer active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center ${score > 4000 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <span className="text-xs font-bold leading-none font-mono">{format(dateObj, 'dd')}</span>
                  <span className="text-[10px] font-bold uppercase header-font">{format(dateObj, 'MMM', { locale: ar })}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm header-font">{dayName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold header-font">{formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase header-font">إجمالي النقاط</p>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Trophy className="w-3 h-3" />
                    <span className="text-lg font-bold font-mono tabular-nums">{score.toLocaleString()}</span>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 text-center">
        <button className="text-emerald-600 text-xs font-bold underline header-font">تصدير بياناتي (Excel)</button>
      </div>
    </div>
  );
};

export default WorshipHistory;
