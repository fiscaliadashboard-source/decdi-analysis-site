import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/decdi-analysis-site/',
  optimizeDeps: {
    include: ['plotly.js-dist','d3'], // 👈 usa la versión ESM
  },
  build: {
    rollupOptions: {
      external: [], // no excluimos nada
    },
  },
})
