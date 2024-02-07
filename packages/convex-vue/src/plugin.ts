import { InjectionKey, Plugin, Ref, watch } from 'vue';
import { type ConvexClientOptions } from 'convex/browser';
import { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';
import { Nullable } from './types';
import { until } from '@vueuse/core';
import { AnyRouteLoader, TypedRouteLoader } from './composables/useRouteLoader';
import { ConvexVueClient } from './client';

type NavigationGuardOptions =
  | {
      installNavigationGuard?: true;
      needsAuth: (to: RouteLocationNormalized, from?: RouteLocationNormalized) => boolean;
      redirectTo: (
        to: RouteLocationNormalized,
        from?: RouteLocationNormalized
      ) => RouteLocationRaw;
    }
  | {
      installNavigationGuard?: false;
      needsAuth?: never;
      redirectTo?: never;
    };

type RouteLoaderMap = Record<string, TypedRouteLoader<AnyRouteLoader>>;

export type ConvexVuePluginOptions = {
  convexUrl: string;
  clientOptions?: ConvexClientOptions;
  auth?: {
    getToken(opts: { forceRefreshToken: boolean }): Promise<Nullable<string>>;
    isAuthenticated: Ref<boolean>;
    isLoading: Ref<boolean>;
  } & NavigationGuardOptions;
  routeLoaderMap?: RouteLoaderMap;
};

export const CONVEX_INJECTION_KEY = Symbol(
  'convex-client'
) as InjectionKey<ConvexVueClient>;
export const CONVEX_LOADERS_INJECTION_KEY = Symbol(
  'convex-loaders'
) as InjectionKey<RouteLoaderMap>;
export const CONVEX_AUTH_INJECTION_KEY = Symbol('convex-auth') as InjectionKey<{
  isAuthenticated: Ref<boolean>;
  isLoading: Ref<boolean>;
  getToken(opts: { forceRefreshToken: boolean }): Promise<Nullable<string>>;
}>;

export const createConvexVue = ({
  clientOptions,
  convexUrl,
  auth,
  routeLoaderMap
}: ConvexVuePluginOptions): Plugin => {
  return {
    install(app) {
      const client = new ConvexVueClient(convexUrl, clientOptions);
      app.provide(CONVEX_INJECTION_KEY, client);
      app.config.globalProperties.$convex = client;

      if (routeLoaderMap) {
        app.provide(CONVEX_LOADERS_INJECTION_KEY, routeLoaderMap);
        const router = app.config.globalProperties.$router;

        router.beforeEach(async (to, from, next) => {
          if (!from.name) return next();

          to.matched.map(match => {
            const loader =
              match.meta.loader ??
              routeLoaderMap[typeof match.name === 'string' ? match.name : ''];

            if (!loader) return;
            Object.values(loader).forEach(({ query, args }) => {
              const unsub = client.onUpdate(query, args(match), () => {
                unsub();
              });
            });
          });

          next();
        });
      }

      if (!auth) return;

      const authState = {
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        getToken(opts: { forceRefreshToken: boolean }) {
          return auth.getToken(opts);
        }
      };

      app.provide(CONVEX_AUTH_INJECTION_KEY, authState);
      app.config.globalProperties.$convexAuth = authState;

      const syncConvexAuthWithAuthProvider = async () => {
        if (auth.isLoading.value) {
          if (!authState.isLoading.value) {
            authState.isLoading.value = true;
          }

          return;
        }

        if (auth.isAuthenticated.value) {
          client.setAuth(auth.getToken, isAuth => {
            authState.isAuthenticated.value = isAuth;
            authState.isLoading.value = false;
          });
        } else {
          client.client.clearAuth();

          authState.isAuthenticated.value = false;
          authState.isLoading.value = false;
        }
      };

      watch(auth.isAuthenticated, syncConvexAuthWithAuthProvider, {
        immediate: true
      });

      if (auth.installNavigationGuard) {
        const router = app.config.globalProperties.$router;

        router.beforeEach(async (to, from, next) => {
          if (!auth.needsAuth(to, from)) return next();

          await until(authState.isLoading).not.toBe(true);
          if (!authState.isAuthenticated.value) {
            return next(auth.redirectTo(to, from));
          }

          next();
        });
      }
    }
  };
};
