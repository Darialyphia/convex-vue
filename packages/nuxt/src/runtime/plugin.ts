import type { InjectionKey, Ref } from 'vue';
import { ConvexVueClientWithSSR } from './composables/convexClientSSR';
import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#imports'
import { createConvexVue, type AnyRouteLoader, type TypedRouteLoader } from '@convex-vue/core';

export const CONVEX_CLIENT = Symbol('convex-client') as InjectionKey<ConvexVueClientWithSSR>;
export const CONVEX_AUTH = Symbol('convex-auth') as InjectionKey<{
  isAuthenticated: Ref<boolean>;
  isLoading: Ref<boolean>;
  getToken(): Promise<string | null>;
}>;

export default defineNuxtPlugin(async nuxtApp => {
  const config = useRuntimeConfig();
  const convexClient = new ConvexVueClientWithSSR(config.public.convexUrl as string);

  const cv = createConvexVue({ client: convexClient });
  cv.install!(nuxtApp.vueApp);

  const router = useRouter()
  nuxtApp.hook('link:prefetch', link => {
    const route = router.resolve(link)
    const loader = route?.meta?.loader
    if (!loader) return

    Object.values(loader).forEach(({ query, args }) => {
      convexClient.onUpdate(query, args(route), () => {});
    });
  })
});

declare module '#app' {
  interface PageMeta {
    loader?: TypedRouteLoader<AnyRouteLoader>;
  }
}
