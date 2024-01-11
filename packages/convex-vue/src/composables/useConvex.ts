import { CONVEX_INJECTION_KEY } from "@/plugin";
import { useSafeInject } from "@/utils";

export const useConvex = () => {
  return useSafeInject(CONVEX_INJECTION_KEY);
};
