import React, { useEffect, useRef, useState } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const wasOfflineRef = useRef<boolean>(false);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setShowReconnectedToast(false);
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowReconnectedToast(true);
      const timer = window.setTimeout(() => setShowReconnectedToast(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div
        className="no-print fixed top-3 left-1/2 -translate-x-1/2 z-[9990] max-w-[92vw] flex items-center gap-2 rounded-2xl bg-amber-600/95 backdrop-blur-md border border-amber-400/50 px-3.5 py-2 text-[11px] font-black text-white shadow-xl animate-in fade-in slide-in-from-top-3 duration-300 header-font"
        dir="rtl"
      >
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
        <span className="truncate">
          وضع عدم الاتصال — الأذكار والصفحات المحفوظة متاحة بالكامل
        </span>
      </div>
    );
  }

  if (showReconnectedToast) {
    return (
      <div
        className="no-print fixed top-3 left-1/2 -translate-x-1/2 z-[9990] max-w-[92vw] flex items-center gap-2 rounded-2xl bg-emerald-700/95 backdrop-blur-md border border-emerald-400/40 px-3.5 py-2 text-[11px] font-black text-white shadow-xl animate-in fade-in slide-in-from-top-3 duration-300 header-font"
        dir="rtl"
      >
        <Wifi className="w-4 h-4 shrink-0" />
        <span>عادت شبكة الإنترنت — تمت استعادة المزامنة</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
      </div>
    );
  }

  return null;
};
