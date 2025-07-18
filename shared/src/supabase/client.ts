// shared/src/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
// Create a single, shared Supabase client instance.
export const supabase = createClient(config.supabase.url, config.supabase.anonKey);
