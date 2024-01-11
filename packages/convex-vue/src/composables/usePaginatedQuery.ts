import {
  FunctionReference,
  PaginationOptions,
  PaginationResult,
  FunctionArgs,
  FunctionReturnType,
  getFunctionName,
} from "convex/server";
import { MaybeRefOrGetter, ref, computed, toValue, watch, nextTick } from "vue";
import { Prettify, DistributiveOmit, Nullable } from "../types";
import { useConvex } from "./useConvex";

export type PaginatedQueryReference<T> = FunctionReference<
  "query",
  "public",
  { paginationOpts: PaginationOptions },
  PaginationResult<T>
>;

export type PaginatedQueryArgs<
  T,
  Query extends PaginatedQueryReference<T>,
> = Prettify<DistributiveOmit<FunctionArgs<Query>, "paginationOpts">>;

const isRecoverableError = (err: Error) => {
  return (
    err.message.includes("InvalidCursor") ||
    err.message.includes("ArrayTooLong") ||
    err.message.includes("TooManyReads") ||
    err.message.includes("TooManyDocumentsRead") ||
    err.message.includes("ReadsTooLarge")
  );
};

export type UseConvexPaginatedQueryOptions = { numItems: number };
export const useConvexPaginatedQuery = <T>(
  query: PaginatedQueryReference<T>,
  args: MaybeRefOrGetter<PaginatedQueryArgs<T, PaginatedQueryReference<T>>>,
  options: { numItems: number }
) => {
  type PageType = FunctionReturnType<PaginatedQueryReference<T>>;
  const client = useConvex();
  const subscribers = ref<(() => void)[]>([]);

  const pages = ref<PageType[]>([]);
  const isDone = ref(false);
  const error = ref<Nullable<Error>>();
  const lastPage = computed(() => {
    return pages.value.at(-1);
  });
  const isLoadingMore = ref(false);

  let resolve: (data: PageType["page"][]) => void;
  let reject: (err: Error) => void;
  const suspensePromise = new Promise<PageType["page"][]>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const reset = (refetch: Boolean) => {
    subscribers.value.forEach((unsub) => unsub());
    subscribers.value = [];
    pages.value = [];
    if (refetch) {
      nextTick(() => {
        loadPage(0);
      });
    }
  };

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
          numItems: options.numItems,
          cursor: pages.value[index - 1]?.continueCursor ?? null,
        },
      },
      (newPage) => {
        // @ts-expect-error some weird erors because of vue's ref unwrapping types makiing the compiler freak out
        pages.value[index] = newPage;
        // @ts-expect-error some weird erors because of vue's ref unwrapping types makiing the compiler freak out
        resolve(pages.value.map((p) => p.page));
        error.value = undefined;
        isDone.value = newPage.isDone;
        isLoadingMore.value = false;
      },
      (err) => {
        error.value = err;
        isLoadingMore.value = false;
        reject(err);
        if (isRecoverableError(err)) {
          reset(false);
        }
      }
    );
  };

  const queryName = computed(() => getFunctionName(query));
  const unwrappedArgs = computed(() => toValue(args));

  watch(queryName, () => reset(true));
  watch(unwrappedArgs, (newArgs, oldArgs) => {
    const hasChanged = JSON.stringify(newArgs) !== JSON.stringify(oldArgs);
    if (hasChanged) reset(true);
  });

  loadPage(0);

  return {
    suspense: () => suspensePromise,
    pages: computed(() => pages.value.map((p) => p.page)),
    data: computed(() => pages.value.filter((p) => !!p).flatMap((p) => p.page)),
    lastPage,
    error,
    isDone,
    isLoading: computed(() => !pages.value.length),
    isLoadingMore,
    loadMore: () => loadPage(pages.value.length),
    reset: () => reset(true),
  };
};
