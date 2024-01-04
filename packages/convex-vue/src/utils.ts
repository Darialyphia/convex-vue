import { inject, type InjectionKey } from "vue";
import { Defined, Nullable } from "./types";

export const useSafeInject = <T>(injectionKey: InjectionKey<T>): T => {
  const context = inject<T>(injectionKey);

  if (context === undefined) {
    throw new Error(
      `Your are trying to use ${injectionKey.toString()} outside of its provider.`
    );
  }

  return context;
};

export const isDefined = <T>(arg: Nullable<T>): arg is Defined<T> =>
  arg !== undefined && arg !== null;
