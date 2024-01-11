import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import VueRouter from "unplugin-vue-router/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: fileURLToPath(new URL("./src/pages", import.meta.url)),
      dts: "./typed-router.d.ts",
    }),
    ,
    vue(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@api": fileURLToPath(
        new URL("./convex/_generated/api.js", import.meta.url)
      ),
    },
  },

  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ConvexVue",
      // the proper extensions will be added
      fileName: "convex-vue",
    },
    rollupOptions: {
      external: ["vue", "@vueuse/core", "convex", "vue-router"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
