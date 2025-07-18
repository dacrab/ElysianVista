// server/src/services/listingService.ts
import { supabase as supabaseAdmin } from '@shared/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Listing, PartialListing } from '@shared/types/listing';

// Using the admin client for public, read-only operations that don't need user context
export const getListingsByTenant = async (tenantId: string) => {
  return supabaseAdmin.from('listings').select('*').eq('tenant_id', tenantId);
};

export const getListingByRefId = async (refId: string) => {
  return supabaseAdmin.from('listings').select('*').eq('listing_ref_id', refId).single();
};

// Using the user-specific client for authenticated, RLS-protected operations
export const createListing = async (supabase: SupabaseClient, listingData: Listing) => {
  return supabase.from('listings').insert(listingData).select().single();
};

export const updateListing = async (supabase: SupabaseClient, id: string, listingData: PartialListing) => {
  return supabase.from('listings').update(listingData).eq('id', id).select().single();
};

export const deleteListing = async (supabase: SupabaseClient, id: string) => {
  return supabase.from('listings').delete().eq('id', id);
};
