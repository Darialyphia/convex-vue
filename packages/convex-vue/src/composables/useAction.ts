import { FunctionReference, FunctionReturnType } from "convex/server";
import { ref } from "vue";
import { Nullable } from "@/types";
import { useConvex } from "./useConvex";

export type ActionReference = FunctionReference<"action">;
export function useConvexAction<Action extends ActionReference>(
  action: Action,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (data: FunctionReturnType<Action>) => void;
    onError?: (err: Error) => void;
  } = {}
) {
  const convex = useConvex();

  const isLoading = ref(false);
  const error = ref<Nullable<Error>>();

  return {
    isLoading,
    error,
    mutate: async (args: Action["_args"]) => {
      try {
        isLoading.value = true;
        const result = await convex.action(action, args);
        onSuccess?.(result);
        return result;
      } catch (err) {
        error.value = err as Error;
        onError?.(error.value);
      } finally {
        isLoading.value = false;
      }
    },
  };
}
