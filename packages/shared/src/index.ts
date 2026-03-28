// Only export server-safe modules from the barrel.
// Client-only modules (hooks, context) must be imported via subpath:
//   import { AuthProvider } from '@repo/shared/context'
//   import { useAuth } from '@repo/shared/hooks'
export * from './service';
export * from './config/api';
export * from './utils/geo';
