import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import VueRouter from 'unplugin-vue-router/vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: fileURLToPath(new URL('./playground/pages', import.meta.url)),
      dts: './typed-router.d.ts'
    }),
    ,
    vue(),
    dts({ rollupTypes: true })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@api': fileURLToPath(new URL('./convex/_generated/api.js', import.meta.url))
    }
  },

  server: {
    port: 3000
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ConvexVue',
      // the proper extensions will be added
      fileName: 'convex-vue'
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core', 'convex/browser', 'convex/server', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
