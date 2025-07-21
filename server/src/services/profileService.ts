// server/src/services/profileService.ts
import { supabase as supabaseAdmin } from '@shared/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Get all profiles for a given tenant
export const getProfilesByTenant = async (tenantId: string) => {
  return supabaseAdmin
    .from('profiles')
    .select('id, full_name, username, role, avatar_url')
    .eq('tenant_id', tenantId);
};

// Update a user's profile
export const updateUserProfile = async (supabase: SupabaseClient, userId: string, profileData: { full_name?: string; username?: string; avatar_url?: string }) => {
  return supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
}; 