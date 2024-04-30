import {
  defineNuxtModule,
  createResolver,
  addImports,
  addImportsDir,
  addComponentsDir,
  addPlugin
} from '@nuxt/kit';

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@convex-vue/nuxt',
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
        name: 'useConvexAction',
      },
      {
        from: '@convex-vue/core',
        name: 'useConvexMutation',
      },
      {
        from: '@convex-vue/core',
        name: 'useConvexRouteLoader',
      }
    ]);
    addImportsDir(resolver.resolve('./runtime/composables'));
    addComponentsDir({ path: resolver.resolve('./runtime/components') });

    addPlugin(resolver.resolve('./runtime/plugin'))
  }
});
