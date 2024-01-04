import { createApp } from "vue";
import App from "./App.vue";
import { convexVuePlugin } from "./plugin";

createApp(App)
  .use(convexVuePlugin, {
    convexUrl: import.meta.env.VITE_CONVEX_URL,
  })
  .mount("#app");
