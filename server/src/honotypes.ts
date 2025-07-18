import { Hono } from 'hono';
import type { SupabaseClient } from '@supabase/supabase-js';

type Env = {
  Variables: {
    supabase: SupabaseClient;
  };
};

export class HonoApp extends Hono<Env> {}
