import {
  FunctionReference,
  PaginationOptions,
  PaginationResult,
  FunctionArgs,
  FunctionReturnType,
  getFunctionName,
} from "convex/server";
import { MaybeRefOrGetter, ref, computed, toValue, watch } from "vue";
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

export const useConvexPaginatedQuery = <T>(
  query: PaginatedQueryReference<T>,
  args: MaybeRefOrGetter<FunctionArgs<PaginatedQueryReference<T>>>,
  options: { numItems: number }
) => {
  const client = useConvex();
  const subscribers = ref<(() => void)[]>([]);

  const pages = ref<FunctionReturnType<PaginatedQueryReference<T>>[]>([]);
  const isDone = ref(false);
  const error = ref<Nullable<Error>>();

  const lastPage = computed(() => pages.value.at(-1));

  const reset = (refetch: Boolean) => {
    subscribers.value.forEach((unsub) => unsub());
    pages.value = [];
    if (refetch) {
      loadPage(0);
    }
  };

  const loadPage = (index: number) => {
    subscribers.value[index]?.();

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
        // @ts-expect-error some ref related vue types going full  ham here
        pages.value[index] = newPage;
        error.value = undefined;
        isDone.value = newPage.isDone;
      },
      (err) => {
        error.value = err;
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
    pages: computed(() => pages.value.map((p) => p.page)),
    data: computed(() => pages.value.flatMap((p) => p.page)),
    lastPage,
    error,
    isDone,
    isLoading: computed(
      () => pages.value.length <= 1 && lastPage.value === undefined
    ),
    isLoadingMore: computed(
      () => pages.value.length > 1 && lastPage.value === undefined
    ),
    loadMore: () => loadPage(pages.value.length),
    reset: () => reset(true),
  };
};
