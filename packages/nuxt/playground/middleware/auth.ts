import { useClerkProvide } from 'vue-clerk';
import { until } from '@vueuse/core';

export default defineNuxtRouteMiddleware(async () => {
  // const nuxtApp = useNuxtApp();
  // if (process.server) {
  //   if (!nuxtApp.ssrContext?.event.context.auth?.userId) {
  //     return navigateTo({ name: 'Login' });
  //   }
  // } else {
  //   const { clerk, isClerkLoaded } = useClerkProvide();
  //   await until(isClerkLoaded).toBe(true);
  //   if (!clerk.user?.id) {
  //     return navigateTo({ name: 'Login' });
  //   }
  // }
});
