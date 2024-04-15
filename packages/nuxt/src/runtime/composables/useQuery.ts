import {
  computed,
  onServerPrefetch,
  ref,
  toValue,
  unref,
  useNuxtApp,
  useState,
  watch,
  type MaybeRefOrGetter
} from '#imports';
import { type UseConvexQueryOptions, useConvex } from '@convex-vue/core';
import {
  getFunctionName,
  type FunctionArgs,
  type FunctionReference,
  type FunctionReturnType
} from 'convex/server';
import { isDefined, type Nullable } from '../utils';
import type { ConvexClientWithSSR } from './convexClientSSR';

type QueryReference = FunctionReference<'query'>;
export const useConvexQuery = <Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions & { ssr: boolean } = { ssr: true, enabled: true }
) => {
  const client = useConvex();
  const nuxt = useNuxtApp();
  const queryName = getFunctionName(query);

  const data = useState<FunctionReturnType<Query>>(queryName, undefined);

  const error = useState<Nullable<Error>>(`${queryName}-error`, undefined);
  let unsub: () => void;

  const isEnabled = computed(() => unref(options.enabled) ?? true);

  let shouldIgnoreNullUpdates = isDefined(data.value);

  let resolve: (data: FunctionReturnType<Query>) => void;
  let reject: (err: Error) => void;
  const suspensePromise = new Promise<FunctionReturnType<Query>>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const bind = () => {
    if (nuxt.ssrContext) return;

    unsub?.();
    if (isEnabled.value) {
      unsub = client.onUpdate(
        query,
        toValue(args),
        newData => {
          data.value = newData;
          // If we fetched the data during SSR and the cache is populated, ignore the first convex updates that always return null
          // until we get a non null value, then we get completely driven by convex reactive state
          if (newData === null && shouldIgnoreNullUpdates) return;
          if (newData !== null) {
            shouldIgnoreNullUpdates = false;
          }
          resolve?.(newData);
          error.value = null;
        },
        err => {
          data.value = null;
          reject(err);
          error.value = err;
        }
      );
    }
  };

  watch(isEnabled, bind, { immediate: true });
  watch(() => toValue(args), bind, { deep: true });

  onServerPrefetch(async () => {
    if (options.ssr) {
      try {
        data.value = await (client as ConvexClientWithSSR).querySSR(query, toValue(args));
      } catch (err) {
        error.value = err as Error;
      }
    }
  });

  return {
    suspense: () => suspensePromise,
    data,
    error,
    isLoading: computed(() => data.value === undefined)
  };
};
