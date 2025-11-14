import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  define: {
    global: {},
  },
  // server: {
  //   port: 5173,
  //   proxy: {
  //     // api로 시작하는 요청을 Spring Boot(8080)으로 프록시
  //     '/api': {
  //       target: 'http://localhost:8080',
  //       changeOrigin: true,

  //     },
  //   },
  // },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
