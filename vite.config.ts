import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // تحميل متغيرات البيئة
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // حقن المفتاح بشكل آمن ليتمكن التطبيق من قراءته في المتصفح
      'process.env.API_KEY': JSON.stringify(env.API_KEY || (process.env as any).API_KEY),
    },
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ui': ['lucide-react', 'recharts'],
            'vendor-ai': ['@google/genai']
          }
        }
      }
    }
  };
});