import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LLMAsAForm',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-hook-form', 'zod'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-hook-form': 'ReactHookForm',
          zod: 'Zod',
        },
      },
    },
  },
});
