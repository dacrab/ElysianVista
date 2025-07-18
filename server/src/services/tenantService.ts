// server/src/services/tenantService.ts
import { supabase } from '@shared/supabase/client';

export const getTenants = async () => {
  return supabase.from('tenants').select('*');
};

export const getTenantBySlug = async (slug: string) => {
  return supabase.from('tenants').select('*').eq('slug', slug).single();
};
