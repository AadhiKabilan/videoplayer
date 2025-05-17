import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import ghPages from 'vite-plugin-gh-pages'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
        tailwindcss(), 
  ], base: '/videoplayer/' 
})
