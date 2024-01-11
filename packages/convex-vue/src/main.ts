import { createApp } from "vue";
import App from "./App.vue";
import { convexVuePlugin } from "./plugin";
import { createAuth0 } from "@auth0/auth0-vue";
import { createRouter, createWebHistory } from "vue-router/auto";

const app = createApp(App);

const auth = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENTID,
  authorizationParams: {
    redirect_uri: window.location.origin,
  },
});

app.use(auth);

app
  .use(
    createRouter({
      history: createWebHistory(),
    })
  )
  .use(convexVuePlugin, {
    convexUrl: import.meta.env.VITE_CONVEX_URL,
  })
  .mount("#app");
