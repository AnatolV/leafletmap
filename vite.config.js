import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'; // Імпортуємо resolve та dirname з 'path'
import { fileURLToPath } from 'url'; // Імпортуємо fileURLToPath з 'url'

// Використовуємо fileURLToPath та dirname для отримання шляху до поточної папки
const __dirname = dirname(fileURLToPath(import.meta.url));
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        lmap: resolve(__dirname, 'src/main.tsx'),
      },
      output: {
        entryFileNames: `[name].[hash].js`,
        chunkFileNames: `[name].[hash].js`,
        assetFileNames: `[name].[hash].[ext]`
      }
    }
  }

})
