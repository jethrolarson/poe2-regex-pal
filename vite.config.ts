import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/poe2-regex-pal/',
  plugins: [vanillaExtractPlugin()],
  server: { port: 5173 },
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
