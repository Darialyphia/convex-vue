import type { InjectionKey, Ref } from 'vue';

import { defineNuxtPlugin } from '#app';
import { createConvexVue } from '@convex-vue/core';

export const CONVEX_CLIENT = Symbol('convex-client') as InjectionKey<
  typeof ConvexClientWithSSR
>;
export const CONVEX_AUTH = Symbol('convex-auth') as InjectionKey<{
  isAuthenticated: Ref<boolean>;
  isLoading: Ref<boolean>;
  getToken(): Promise<string | null>;
}>;

export default defineNuxtPlugin(async nuxt => {
  const config = useRuntimeConfig();

  const convexClient = new ConvexClientWithSSR(config.public.convexUrl);

  nuxt.vueApp.use(createConvexVue({ client: convexClient }));
});
