import { createApp } from "vue";
import App from "./App.vue";
import { convexVuePlugin } from "./plugin";
import { createRouter, createWebHistory } from "vue-router/auto";

createApp(App)
  .use(
    createRouter({
      history: createWebHistory(),
    })
  )
  .use(convexVuePlugin, {
    convexUrl: import.meta.env.VITE_CONVEX_URL,
  })
  .mount("#app");
