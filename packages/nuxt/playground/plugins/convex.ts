import { defineNuxtPlugin } from '#app';
import { createConvexVue } from '@convex-vue/core';
import type { Resources, Clerk } from '@clerk/types';
import type { Ref } from 'vue';
export default defineNuxtPlugin(async nuxt => {
  const config = useRuntimeConfig();

  if (nuxt.ssrContext) {
    console.log(nuxt.ssrContext.event.context.auth);
  }

  const authState: { isLoading: Ref<boolean>; session: Ref<Resources['session']> } = {
    isLoading: ref(!!process.client),
    session: ref(process.server ? nuxt.ssrContext?.event.context.auth : undefined)
  };

  if (process.client) {
    (nuxt.vueApp.config.globalProperties.$clerk as Clerk).addListener(arg => {
      authState.isLoading.value = false;
      authState.session.value = arg.session;
    });
  }

  const convexClient = new ConvexClientWithSSR(config.public.convexUrl as string);

  nuxt.vueApp.use(
    createConvexVue({
      client: convexClient,
      auth: {
        // @ts-expect-error weird type error that seems to be caused by nuxt playground
        isAuthenticated: computed(() => !!authState.session.value),
        // @ts-expect-error weird type error that seems to be caused by nuxt playground
        isLoading: authState.isLoading,
        getToken: async ({ forceRefreshToken }) => {
          try {
            if (process.server) {
              return nuxt.ssrContext?.event.context.auth.getToken({
                template: 'convex'
              });
            } else {
              const token = await authState.session.value?.getToken({
                template: 'convex',
                skipCache: forceRefreshToken
              });
              return token;
            }
          } catch (error) {
            return null;
          }
        }
      }
    })
  );
});
