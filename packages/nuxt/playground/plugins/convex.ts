import { defineNuxtPlugin } from '#app';
import { createConvexVue } from '@convex-vue/core';
import type { Resources, Clerk } from '@clerk/types';
import { useAuth, useClerkProvide } from 'vue-clerk';

import type { Ref } from 'vue';
export default defineNuxtPlugin(async nuxt => {
  const config = useRuntimeConfig();
  const {
    isLoaded: isClerkLoaded,
    isSignedIn: isClerkAuthenticated,
    getToken
  } = useAuth();

  const authState: {
    isLoading: Ref<boolean>;
    isAuthenticated: Ref<boolean>;
  } = {
    isLoading: ref(process.client ? isClerkLoaded.value : true),
    isAuthenticated: ref(
      process.server
        ? !!nuxt.ssrContext?.event.context.auth
        : !!isClerkAuthenticated.value
    )
  };

  if (process.client) {
    useClerkProvide().clerk.addListener(arg => {
      authState.isLoading.value = false;
      authState.isAuthenticated.value = !!arg.session;
    });
  }

  const convexClient = new ConvexVueClientWithSSR(config.public.convexUrl as string);

  nuxt.vueApp.use(
    createConvexVue({
      client: convexClient,
      // @ts-expect-error weird type error that seems to be caused by nuxt playground
      auth: {
        ...authState,
        getToken: async ({ forceRefreshToken }) => {
          try {
            if (process.server) {
              return nuxt.ssrContext?.event.context.auth.getToken({
                template: 'convex'
              });
            } else {
              const token = await getToken.value({
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
