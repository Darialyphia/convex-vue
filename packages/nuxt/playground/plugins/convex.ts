import { defineNuxtPlugin } from '#app';
import { createConvexVue } from '@convex-vue/core';
import type { Resources, Clerk } from '@clerk/types';

export default defineNuxtPlugin(async nuxt => {
  const config = useRuntimeConfig();

  if (nuxt.ssrContext) {
    console.log(nuxt.ssrContext.event.context.auth);
  }

  const authState: { isLoading: Ref<boolean>; session: Ref<Resources['session']> } = {
    isLoading: ref(true),
    session: ref(undefined)
  };

  (nuxt.vueApp.config.globalProperties.$clerk as Clerk).addListener(arg => {
    authState.isLoading.value = false;
    authState.session.value = arg.session;
  });

  const convexClient = new ConvexClientWithSSR(config.public.convexUrl as string);

  nuxt.vueApp.use(
    createConvexVue({
      client: convexClient
      // auth: {
      //   isAuthenticated: computed(() => !!authState.session.value),
      //   isLoading: authState.isLoading,
      //   getToken: async ({ forceRefreshToken }) => {
      //     try {
      //       return await authState.session.value?.getToken({
      //         template: 'convex',
      //         skipCache: forceRefreshToken
      //       });
      //     } catch (error) {
      //       return null;
      //     }
      //   }
      // }
    })
  );
});
