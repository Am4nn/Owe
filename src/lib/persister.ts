// React Native will automatically resolve to .native.ts or .web.ts
// We just need to define the type interface here for tsc, but
// Metro bundler handles the actual resolution.
export * from './persister.native' // Base export for tsc

