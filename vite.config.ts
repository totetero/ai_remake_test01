import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 仮想環境の外（ホスト等）からアクセスできるよう全インターフェースにバインド
  },
})
