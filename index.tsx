
import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("خطأ: لم يتم العثور على عنصر root في ملف index.html");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// تسجيل Service Worker التلقائي عبر VitePWA للعمل الكامل بدون إنترنت
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.log('تطبيق أوراد جاهز الآن للعمل بدون اتصال بالإنترنت!');
    }
  });
}
