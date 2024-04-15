export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  build: {
    transpile: ['vue-clerk', '@clerk/clerk-js']
  },
  runtimeConfig: {
    public: {
      convexUrl: '',
      clerkPublishableKey: ''
    }
  }
});
