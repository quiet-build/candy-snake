import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  resolve: { alias: { '@': '/src' } },
  preview: { cors: true },
  build: { target: 'es2022', rollupOptions: {
    input: { main: 'index.html', component: 'src/component.ts' },
    output: { entryFileNames: chunk => chunk.name === 'component' ? 'component.js' : 'assets/[name]-[hash].js' }
  } }
});
