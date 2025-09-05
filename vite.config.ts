import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { dirname } from 'path';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // Генерировать единый .d.ts файл
    }),
  ],
  build: {
    // Настройки для сборки библиотеки
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'), // Входная точка
      name: 'LeafletMap', // Глобальное имя переменной (для UMD сборки)
      formats: ['es', 'umd'], // Форматы сборки
      fileName: (format) => `leaflet-map.${format}.js`,
    },
    // Настройки для Rollup
    rollupOptions: {
      // Указываем, что react и react-dom не нужно включать в сборку
      external: ['react', 'react-dom','leaflet'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'leaflet':'leaflet'
        },
      },
    },
  },
});
