// shared/src/config.ts
// This file centralizes environment variables for the entire monorepo.
// It dynamically sources variables from Vite's `import.meta.env` on the client
// and from `process.env` on the server.
// A reliable way to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

const SUPABASE_URL = isBrowser
  ? import.meta.env.VITE_SUPABASE_URL
  : process.env.SUPABASE_URL;

const SUPABASE_ANON_KEY = isBrowser
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL and Anon Key must be defined in environment variables.');
}
export const config = {
    supabase: {
        url: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY,
    },
};
