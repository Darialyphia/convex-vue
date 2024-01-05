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

type QueryReference = FunctionReference<"query">;
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

  const bind = () => {
    unsub?.();
    if (isEnabled.value) {
      unsub = client.onUpdate(query, toValue(args), (newData) => {
        data.value = newData;
        error.value = undefined;
      });
    }
  };

  watch(isEnabled, bind, { immediate: true });

  return { data, error, isLoading: computed(() => data.value === undefined) };
};
