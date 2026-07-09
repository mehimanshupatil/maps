import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves at /maps/
export default defineConfig({
  base: '/maps/',
  plugins: [react()],
})
