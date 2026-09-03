import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'node:fs'

// 頁面功能已包含在 Games.html；這裡只補上動態引用的既有資源。
const gamesStaticFiles = [
  'games-icon-192.png', 'games-icon-512.png', 'games-manifest.webmanifest',
  '骨牌區域遊戲.html', '黑白棋 .html', '黑白棋 icon.png'
]

export default defineConfig({
  root: '.',
  base: './',
  plugins: [{
    name: 'games-static-files',
    apply: 'build',
    generateBundle() {
      for (const fileName of gamesStaticFiles) {
        this.emitFile({ type: 'asset', fileName, source: readFileSync(resolve(__dirname, fileName)) })
      }
    }
  }],
  server: {
    open: '/Games.html',
    port: 8080
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        games: resolve(__dirname, 'Games.html')
      }
    }
  }
})
