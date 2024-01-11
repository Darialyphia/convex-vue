import { createApp } from 'vue';
import App from './App.vue';
import { createConvexVue } from './plugin';
import { createAuth0 } from '@auth0/auth0-vue';
import { createRouter, createWebHistory } from 'vue-router/auto';

const auth = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENTID,
  authorizationParams: {
    redirect_uri: window.location.origin
  }
});

const router = createRouter({
  history: createWebHistory()
});

const convexVue = createConvexVue({
  convexUrl: import.meta.env.VITE_CONVEX_URL,
  auth: {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    getToken: async ({ forceRefreshToken }) => {
      try {
        const response = await auth.getAccessTokenSilently({
          detailedResponse: true,
          cacheMode: forceRefreshToken ? 'off' : 'on'
        });
        return response.id_token;
      } catch (error) {
        return null;
      }
    },
    installNavigationGuard: true,
    needsAuth: to => to.name === 'Protected',
    redirectTo: () => ({
      name: 'Home'
    })
  }
});

createApp(App).use(auth).use(router).use(convexVue).mount('#app');
