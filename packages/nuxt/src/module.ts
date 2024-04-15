import {
  defineNuxtModule,
  createResolver,
  addImports,
  addImportsDir,
  addComponentsDir
} from '@nuxt/kit';

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'convex-nuxt',
    configKey: 'convex'
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup() {
    const resolver = createResolver(import.meta.url);

    addImports([
      {
        from: '@convex-vue/core',
        name: 'useConvex'
      },
      {
        from: '@convex-vue/core',
        name: 'useAction'
      },
      {
        from: '@convex-vue/core',
        name: 'useMutation'
      },
      {
        from: '@convex-vue/core',
        name: 'useRouteLoader'
      }
    ]);
    addImportsDir(resolver.resolve('./runtime/composables'));
    addComponentsDir({ path: resolver.resolve('./runtime/components') });
  }
});
