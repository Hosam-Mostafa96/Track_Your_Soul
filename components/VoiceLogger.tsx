import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, AlertCircle, CheckCircle2, RefreshCw, Send, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { DailyLog } from '../types';

interface VoiceLoggerProps {
  log: DailyLog;
  onUpdate: (log: DailyLog, label?: string, type?: string) => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const VoiceLogger: React.FC<VoiceLoggerProps> = ({ log, onUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSupported(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'ar-SA'; // default representation for Arabic speech to text

      rec.onstart = () => {
        setIsRecording(true);
        setStatusMessage({ text: 'جاري الاستماع إليك.. تكلم بعبادتك اليومية بيسر وسهولة', type: 'info' });
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        if (event.error === 'not-allowed') {
          setStatusMessage({ text: 'تم رفض إذن الوصول للميكروفون. يرجى تفعيله من إعدادات المتصفح.', type: 'error' });
        } else {
          setStatusMessage({ text: 'حدث خطأ أثناء التعرف على الصوت. يمكنك كتابة النص يدوياً.', type: 'error' });
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setStatusMessage(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  const handleAIParse = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    setStatusMessage({ text: 'جاري تحليل النص عبر الذكاء الاصطناعي واستخراج عباداتك..', type: 'info' });

    try {
      const apiKey = process.env.GEMINI_API_KEY || (process.env as any).API_KEY;
      if (!apiKey) {
        setStatusMessage({ text: 'مفتاح خدمة الذكاء الاصطناعي غير متوفر لتسجيل العبادات بالصوت.', type: 'error' });
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        أنت مساعد الذكاء الاصطناعي لتطبيق "الميزان" لإدارة العبادات. مهمتك هي قراءة نص منطوق بالذكاء الاصطناعي باللغة العربية يصف العبادات اليومية للمستخدم، وتحويلها إلى كائن JSON يحتوي على الحقول والعبادات المكتملة فقط لإنشاء تحديثات يتم دمجها مع DailyLog الحالي.

        هيكل كائن DailyLog الحالي هو كالتالي:
        {
          prayers: {
            "الفجر": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] },
            "الظهر": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] },
            "العصر": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] },
            "المغرب": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] },
            "العشاء": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] }
          },
          quran: {
            hifzRub: number (عدد أرباع السماع/الحفظ),
            revisionRub: number (عدد أرباع القراءة/المراجعة),
            surahName: string (من السورة وموضعها)
          },
          knowledge: {
            shariDuration: number (طلب علم شرعي بالدقائق),
            readingDuration: number (قراءة عامة بالدقائق),
            readingPages: number (عدد الصفحات)
          },
          athkar: {
            checklists: {
              morning: boolean,
              evening: boolean,
              sleep: boolean,
              travel: boolean
            }
          },
          nawafil: {
            duhaDuration: number (صلاة الضحى بالدقائق، مثلاً لو قال صليت الضحى ضع 10),
            witrDuration: number (الوتر بالدقائق مثل 10),
            qiyamDuration: number (قيام الليل بالدقائق مثل 30),
            fasting: boolean (لو قال صائم ضع true)
          },
          jihadFactor: number (معامل المجاهدة: 1.0 أو 1.05 أو 1.1)
        }

        شروط الاستخراج والمنطق:
        1. قم باستخراج العبادات المذكورة في النص فقط. لا تقم بإدراج أي عبادة لم يذكرها المستخدم في الـ JSON.
        2. بالنسبة للصلوات:
           - "صليت الفجر جماعة": { prayers: { "الفجر": { performed: true, inCongregation: true } } }
           - "صليت الظهر": { prayers: { "الظهر": { performed: true } } }
        3. بالنسبة للقرآن:
           - الجزء الواحد يساوي 8 أرباع (revisionRub: 8).
           - نصف جزء يساوي 4 أرباع (revisionRub: 4).
           - ربعين يساوي 2 ربع (revisionRub: 2).
           - إذا قال "قرأت سورة البقرة" أو موضع محدد، ضعه في quran.surahName.
        4. بالنسبة للأذكار:
           - "أذكار الصباح": { athkar: { checklists: { morning: true } } }
           - "أذكار المساء": { athkar: { checklists: { evening: true } } }
           - "أذكار النوم": { athkar: { checklists: { sleep: true } } }
        5. بالنسبة السنن والنوافل:
           - "صليت الضحى": { nawafil: { duhaDuration: 10 } }
           - "صليت الوتر": { nawafil: { witrDuration: 10 } }
           - "صليت قيام الليل": { nawafil: { qiyamDuration: 30 } }
           - "أنا صايم اليوم" أو "صمت": { nawafil: { fasting: true } }

        قم بإرجاع كائن JSON خالص يحتوي على التحديثات المستخرجة فقط. لا تكتب أي شرح أو كود ماركداون خارجي، فقط قم بإرجاع كائن JSON صالح.

        نص المستخدم: "${transcript}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const updates = JSON.parse(cleanJsonStr);

      // Deep merge the updates with the current log
      const updatedLog = { ...log };

      if (updates.prayers) {
        updatedLog.prayers = { ...updatedLog.prayers };
        Object.keys(updates.prayers).forEach((prayer) => {
          updatedLog.prayers[prayer] = {
            ...updatedLog.prayers[prayer],
            ...updates.prayers[prayer]
          };
        });
      }

      if (updates.quran) {
        updatedLog.quran = {
          ...updatedLog.quran,
          ...updates.quran
        };
      }

      if (updates.knowledge) {
        updatedLog.knowledge = {
          ...updatedLog.knowledge,
          ...updates.knowledge
        };
      }

      if (updates.athkar) {
        updatedLog.athkar = { ...updatedLog.athkar };
        if (updates.athkar.checklists) {
          updatedLog.athkar.checklists = {
            ...updatedLog.athkar.checklists,
            ...updates.athkar.checklists
          };
        }
      }

      if (updates.nawafil) {
        updatedLog.nawafil = {
          ...updatedLog.nawafil,
          ...updates.nawafil
        };
      }

      if (updates.jihadFactor !== undefined) {
        updatedLog.jihadFactor = updates.jihadFactor;
      }

      onUpdate(updatedLog, 'تحديث العبادات تلقائياً عبر الإدخال الصوتي الذكي 🎙️', 'voice_sync');
      setStatusMessage({ text: 'تم بنجاح استخراج وتحديث عبادتك اليومية بالذكاء الاصطناعي!', type: 'success' });
      setTranscript('');
    } catch (error) {
      console.error('Error parsing speech via Gemini:', error);
      setStatusMessage({ text: 'تعذر استخراج البيانات بالذكاء الاصطناعي. الرجاء التحقق من جودة الاتصال أو صياغة العبارة.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-md border border-emerald-100 flex flex-col gap-4 text-emerald-950 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Mic className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h4 className="text-xs font-black header-font text-slate-800">التسجيل الصوتي الذكي (AI)</h4>
            <p className="text-[9px] text-slate-400 font-bold">املأ سجلاتك اليومية عبر التحدث بالعامية أو الفصحى</p>
          </div>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="p-1 px-2.5 hover:bg-slate-50 text-[10px] text-emerald-600 font-bold rounded-lg flex items-center gap-1 transition-all"
        >
          <HelpCircle className="w-3 h-3" />
          {showGuide ? 'إخفاء الدليل' : 'كيف أتكلم؟'}
        </button>
      </div>

      {showGuide && (
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10px] space-y-1.5 font-bold leading-relaxed text-slate-600">
          <p className="text-emerald-700 font-black">أمثلة على جمل يمكنك قولها للسيستم:</p>
          <ul className="list-disc list-inside space-y-1 pr-1 text-slate-500">
            <li>"صليت الفجر جماعة وقرأت جزء من القرآن، وعملت أذكار الصباح في المسجد"</li>
            <li>"صليت الظهر وصليت الضحى كمان"</li>
            <li>"الحمد لله ربنا وفقني وقمت الليل وقرأت المراجعة وصمت النهاردة"</li>
          </ul>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-3 w-full">
        {/* Record/Text Area */}
        <div className="relative flex-1 w-full">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={
              isSupported
                ? "اضغط الميكروفون وتحدث بصوتك مباشرة أو اكتب هنا يدوياً عباداتك اليومية..."
                : "اكتب هنا بالتفصيل عباداتك ليقوم الذكاء الاصطناعي باستخلاصها فوراً..."
            }
            className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-300 focus:bg-white rounded-2xl p-3 pr-4 pl-12 text-xs font-bold leading-relaxed resize-none h-16 outline-none transition-all placeholder:text-slate-400/80"
          />

          {isSupported && (
            <button
              onClick={toggleRecording}
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all duration-300 shadow-md ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105'
              }`}
              title={isRecording ? 'إيقاف التسجيل' : 'بدء تسجيل الصوت'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAIParse}
          disabled={isLoading || !transcript.trim()}
          className="w-full md:w-auto py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black header-font rounded-2xl text-[11px] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>استخلاص بالذكاء الاصطناعي ✨</span>
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-[10px] font-bold flex items-center gap-2 leading-relaxed animate-in slide-in-from-top-1 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-100'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
          }`}
        >
          {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
          {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
          {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
