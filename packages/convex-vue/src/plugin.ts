import { FunctionPlugin, InjectionKey, Ref, watch } from "vue";
import { ConvexClient, type ConvexClientOptions } from "convex/browser";
import { RouteLocationNormalized, RouteLocationRaw } from "vue-router";
import { Nullable } from "./types";
import { until } from "@vueuse/core";

type NavigationGuardOptions =
  | {
      installNavigationGuard?: true;
      needsAuth: (
        to: RouteLocationNormalized,
        from?: RouteLocationNormalized
      ) => boolean;
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

export type ConvexVuePluginOptions = {
  convexUrl: string;
  convexOptions?: ConvexClientOptions;
  auth?: {
    getToken(opts: { forceRefreshToken: boolean }): Promise<string>;
    isAuthenticated: Ref<boolean>;
    isLoading: Ref<boolean>;
  } & NavigationGuardOptions;
};

export const CONVEX_INJECTION_KEY = Symbol(
  "convexClient"
) as InjectionKey<ConvexClient>;

export const CONVEX_AUTH_INJECTION_KEY = Symbol("convex-auth") as InjectionKey<{
  isAuthenticated: Ref<boolean>;
  isLoading: Ref<boolean>;
  getToken(opts: { forceRefreshToken: boolean }): Promise<Nullable<string>>;
}>;

export const convexVuePlugin: FunctionPlugin<ConvexVuePluginOptions> = (
  app,
  { convexOptions, convexUrl, auth }
) => {
  const client = new ConvexClient(convexUrl, convexOptions);
  app.provide(CONVEX_INJECTION_KEY, client);
  app.config.globalProperties.$convex = client;

  if (!auth) return;

  const authState = {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    getToken(opts: { forceRefreshToken: boolean }) {
      return auth.getToken(opts);
    },
  };

  app.provide(CONVEX_AUTH_INJECTION_KEY, authState);
  app.config.globalProperties.$convexAuth = authState;

  const syncConvexAuthWithClerkAuth = async () => {
    if (auth.isLoading.value) {
      if (!authState.isLoading.value) {
        authState.isLoading.value = true;
      }

      return;
    }

    if (auth.isAuthenticated.value) {
      client.setAuth(auth.getToken, (isAuth) => {
        authState.isAuthenticated.value = isAuth;
        authState.isLoading.value = false;
      });
    } else {
      client.client.clearAuth();

      authState.isAuthenticated.value = false;
      authState.isLoading.value = false;
    }

    watch(auth.isAuthenticated, syncConvexAuthWithClerkAuth, {
      immediate: true,
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
  };
};
