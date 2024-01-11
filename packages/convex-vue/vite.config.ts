import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import VueRouter from "unplugin-vue-router/vite";

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
});
