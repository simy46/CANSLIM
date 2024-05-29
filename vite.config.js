import { defineConfig } from 'vite';
import copy from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    copy({
      targets: [
        { src: '/*.html', dest: '' }
      ]
    })
  ],
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
