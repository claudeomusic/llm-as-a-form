import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'llm-as-a-form': resolve(__dirname, '../src'),
    },
    dedupe: ['react', 'react-dom'],
  },
});
