import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',  // Change this to your preferred output directory
    rollupOptions: {
      input: {
        main: './index.html',
        about: './about.html',
        crypto: './crypto-analysis.html',
        market: '/market-news.html',
        stock: '/canslim-stock.html',
        trending: '/top-stock.html',
        info: 'stock-info.html'
      }
    }
  },
  server: {
    open: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5020',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
