import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FirebaseErrorBoundaryState {
  hasError: boolean;
  message: string;
}

interface FirebaseErrorBoundaryProps {
  children: React.ReactNode;
}

export class FirebaseErrorBoundary extends React.Component<
  FirebaseErrorBoundaryProps,
  FirebaseErrorBoundaryState
> {
  constructor(props: FirebaseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): FirebaseErrorBoundaryState {
    let readable = 'تعذر الاتصال بخدمة التحدي اللحظية حالياً.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.error) {
        if (String(parsed.error).toLowerCase().includes('quota')) {
          readable = 'تم الوصول للحد اليومي المجاني لقاعدة البيانات؛ ستتجدد الحصة غداً بإذن الله.';
        } else if (String(parsed.error).toLowerCase().includes('permission')) {
          readable = 'تحتاج المنافسة اللحظية إلى تسجيل الدخول بحساب Google موثق.';
        }
      }
    } catch {
      if (error.message) readable = error.message;
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('FirebaseErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-[2rem] p-5 border border-rose-200 shadow-sm space-y-3 text-right" dir="rtl">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-black text-slate-900 header-font">تنبيه في مزامنة التحدي</h4>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">{this.state.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black header-font flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
