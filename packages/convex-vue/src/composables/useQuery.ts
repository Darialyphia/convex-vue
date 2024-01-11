import {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
} from "convex/server";
import {
  MaybeRef,
  MaybeRefOrGetter,
  ref,
  computed,
  unref,
  toValue,
  watch,
} from "vue";
import { Nullable } from "../types";
import { useConvex } from "./useConvex";

export type UseConvexQueryOptions = {
  enabled?: MaybeRef<boolean>;
};

export type QueryReference = FunctionReference<"query">;
export const useConvexQuery = <Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions = { enabled: true }
) => {
  const client = useConvex();

  const data = ref<FunctionReturnType<Query>>();
  const error = ref<Nullable<Error>>();

  let unsub: () => void;
  const isEnabled = computed(() => unref(options.enabled) ?? true);

  let resolve: (data: FunctionReturnType<Query>) => void;
  let reject: (err: Error) => void;
  const suspensePromise = new Promise<FunctionReturnType<Query>>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const bind = () => {
    unsub?.();
    if (isEnabled.value) {
      console.log(toValue(args));
      unsub = client.onUpdate(
        query,
        toValue(args),
        (newData) => {
          data.value = newData;
          resolve?.(newData);
          error.value = null;
        },
        (err) => {
          data.value = null;
          reject(err);
          error.value = err;
        }
      );
    }
  };

  watch(isEnabled, bind, { immediate: true });
  watch(() => toValue(args), bind, { deep: true });

  return {
    suspense: () => suspensePromise,
    data,
    error,
    isLoading: computed(() => data.value === undefined),
  };
};
