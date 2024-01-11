import { CONVEX_AUTH_INJECTION_KEY } from '@/plugin';
import { useSafeInject } from '@/utils';

export const useConvexAuth = () => {
  return useSafeInject(CONVEX_AUTH_INJECTION_KEY);
};
