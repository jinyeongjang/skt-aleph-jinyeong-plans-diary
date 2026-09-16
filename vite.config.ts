import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Vercel 환경 변수 및 Supabase 통합 접두사(VITE_, SUPABASE_, NEXT_PUBLIC_, PUBLIC_) 모두 지원
  envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_', 'PUBLIC_'],
});
