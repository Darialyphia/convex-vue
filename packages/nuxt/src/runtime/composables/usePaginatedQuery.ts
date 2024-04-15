import {
  type FunctionReference,
  type PaginationOptions,
  type PaginationResult,
  type FunctionArgs,
  type FunctionReturnType,
  getFunctionName
} from 'convex/server';
import { type MaybeRefOrGetter, ref, computed, toValue, watch, nextTick } from 'vue';
import type { Prettify, DistributiveOmit, Nullable } from '../types';
import { useConvex } from '@convex-vue/core';
import { ConvexClientWithSSR, onServerPrefetch, useState } from '#imports';
import { isDefined } from '../utils';

export type PaginatedQueryReference<T> = FunctionReference<
  'query',
  'public',
  { paginationOpts: PaginationOptions },
  PaginationResult<T>
>;

export type PaginatedQueryArgs<T, Query extends PaginatedQueryReference<T>> = Prettify<
  DistributiveOmit<FunctionArgs<Query>, 'paginationOpts'>
>;

const isRecoverableError = (err: Error) => {
  return (
    err.message.includes('InvalidCursor') ||
    err.message.includes('ArrayTooLong') ||
    err.message.includes('TooManyReads') ||
    err.message.includes('TooManyDocumentsRead') ||
    err.message.includes('ReadsTooLarge')
  );
};

export type UseConvexPaginatedQueryOptions = { numItems: number };
export const useConvexPaginatedQuery = <T>(
  query: PaginatedQueryReference<T>,
  args: MaybeRefOrGetter<PaginatedQueryArgs<T, PaginatedQueryReference<T>>>,
  { numItems, ssr = true }: { numItems: number; ssr?: boolean }
) => {
  type PageType = FunctionReturnType<PaginatedQueryReference<T>>;
  const client = useConvex();
  const subscribers = ref<(() => void)[]>([]);
  const queryName = computed(() => getFunctionName(query));
  const unwrappedArgs = computed(() => toValue(args));

  const pages = useState<PageType[]>(queryName.value, () => []); // prevent weird false type errors caused by vue's ref unwrapping types
  const isDone = ref(false);
  const error = useState<Nullable<Error>>(`${queryName.value}-error`);
  const lastPage = computed(() => {
    return pages.value.at(-1);
  });
  const isLoadingMore = ref(false);

  let resolve: (data: PageType['page'][]) => void;
  let reject: (err: Error) => void;
  const suspensePromise = new Promise<PageType['page'][]>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const reset = (refetch: Boolean) => {
    subscribers.value.forEach(unsub => unsub());
    subscribers.value = [];
    pages.value = [];
    if (refetch) {
      nextTick(() => {
        loadPage(0);
      });
    }
  };

  let shouldIgnoreNullUpdates = isDefined(pages.value[0]);

  const loadPage = (index: number) => {
    subscribers.value[index]?.();
    if (pages.value.length) {
      isLoadingMore.value = true;
    }
    subscribers.value[index] = client.onUpdate(
      query,
      {
        ...toValue(args),
        paginationOpts: {
          numItems: numItems,
          cursor: pages.value[index - 1]?.continueCursor ?? null
        }
      },
      newPage => {
        // If we fetched the data during SSR and the cache is populated, ignore the first convex updates that always return null
        // until we get a non null value, then we get completely driven by convex reactive state
        if (newPage === null && shouldIgnoreNullUpdates) return;
        if (newPage !== null) {
          shouldIgnoreNullUpdates = false;
        }
        pages.value[index] = newPage;
        resolve(pages.value.map(p => p.page));
        error.value = undefined;
        isDone.value = newPage.isDone;
        isLoadingMore.value = false;
      },
      err => {
        error.value = err;
        isLoadingMore.value = false;
        reject(err);
        if (isRecoverableError(err)) {
          reset(false);
        }
      }
    );
  };

  watch(queryName, () => reset(true));
  watch(unwrappedArgs, (newArgs, oldArgs) => {
    const hasChanged = JSON.stringify(newArgs) !== JSON.stringify(oldArgs);
    if (hasChanged) reset(true);
  });

  loadPage(0);

  onServerPrefetch(async () => {
    if (ssr) {
      try {
        const page = await (client as ConvexClientWithSSR).querySSR(
          query,
          toValue({
            ...toValue(args),
            paginationOpts: {
              numItems: numItems,
              cursor: null
            }
          })
        );
        pages.value.push(page);
      } catch (err) {
        error.value = err as Error;
      }
    }
  });

  return {
    suspense: () => suspensePromise,
    pages: computed(() => pages.value.map(p => p.page)),
    data: computed(() => pages.value.filter(p => !!p).flatMap(p => p.page)),
    lastPage,
    error,
    isDone,
    isLoading: computed(() => !pages.value.length),
    isLoadingMore,
    loadMore: () => loadPage(pages.value.length),
    reset: () => reset(true)
  };
};
