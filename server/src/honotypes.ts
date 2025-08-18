import type { SupabaseClient } from '@supabase/supabase-js';
import { Hono } from 'hono';

type Env = {
  Variables: {
    supabase: SupabaseClient;
  };
};

export class HonoApp extends Hono<Env> {}
