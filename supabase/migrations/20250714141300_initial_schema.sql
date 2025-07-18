-- ElysianVista Supabase Schema
-- Version 1.0

-- This script sets up the initial tables for the ElysianVista platform.
-- RLS policies will be defined in a separate file.

-- 1. Tenants Table
-- Stores information about each real estate company (tenant).
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    primary_color TEXT,
    contact_email TEXT
);
COMMENT ON TABLE public.tenants IS 'Each row represents a real estate company tenant.';

-- 2. Profiles Table
-- Extends Supabase's auth.users to include roles and tenant associations.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ,
    full_name TEXT,
    avatar_url TEXT,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'realtor' CHECK (role IN ('admin', 'manager', 'realtor', 'secretary'))
);
COMMENT ON TABLE public.profiles IS 'Profile information for each user, linking them to a tenant and role.';

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger to run the function after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Listings Table
-- Contains all property listings, associated with a tenant and an agent.
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    price NUMERIC(10, 2) NOT NULL,
    bedrooms INT,
    bathrooms INT,
    area_sqft INT,
    image_urls TEXT[],
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented')),
    listing_ref_id TEXT UNIQUE
);

-- Sequence for the year-based listing ID
CREATE SEQUENCE listing_id_seq;

-- Trigger function to generate the custom listing ID
CREATE OR REPLACE FUNCTION generate_listing_ref_id()
RETURNS TRIGGER AS $$
DECLARE
    current_year INT;
    seq_id INT;
    ref_id TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW());
    seq_id := NEXTVAL('public.listing_id_seq');
    ref_id := current_year || '-' || LPAD(seq_id::TEXT, 5, '0');
    NEW.listing_ref_id := ref_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger to call the function before insert
CREATE TRIGGER before_listing_insert
BEFORE INSERT ON public.listings
FOR EACH ROW
EXECUTE FUNCTION generate_listing_ref_id();
COMMENT ON TABLE public.listings IS 'Real estate listings for each tenant.';

-- Indexes for foreign keys to improve query performance
CREATE INDEX idx_listings_tenant_id ON public.listings(tenant_id);
CREATE INDEX idx_listings_agent_id ON public.listings(agent_id);

-- Enable RLS for the listings table
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view listings from their own tenant
CREATE POLICY "Allow tenant members to view listings" ON public.listings
FOR SELECT USING (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

-- Policy: Allow users to create listings for their own tenant
CREATE POLICY "Allow tenant members to create listings" ON public.listings
FOR INSERT WITH CHECK (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

-- Policy: Allow users to update their own tenant's listings
CREATE POLICY "Allow tenant members to update listings" ON public.listings
FOR UPDATE USING (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

-- Policy: Allow users to delete their own tenant's listings
CREATE POLICY "Allow tenant members to delete listings" ON public.listings
FOR DELETE USING (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

-- 4. Leads Table
-- Captures inquiries from potential customers about listings.
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    is_contacted BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE public.leads IS 'Inquiries or leads generated from public-facing listing pages.';

-- Indexes for foreign keys
CREATE INDEX idx_leads_tenant_id ON public.leads(tenant_id);
CREATE INDEX idx_leads_listing_id ON public.leads(listing_id);

-- 5. Messages Table
-- For internal communication related to leads or other matters.
CREATE TABLE public.messages (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE public.messages IS 'Internal messaging system for team members.';

-- Indexes for foreign keys
CREATE INDEX idx_messages_tenant_id ON public.messages(tenant_id);
CREATE INDEX idx_messages_lead_id ON public.messages(lead_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);

-- 6. Subscriptions Table
-- Manages tenant subscriptions and billing details via Stripe.
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL, -- e.g., 'active', 'trialing', 'canceled', 'past_due'
    tier TEXT, -- e.g., 'basic', 'premium'
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.subscriptions IS 'Manages billing and subscription status for each tenant.';

-- 7. Storage Buckets
-- Create buckets for tenant logos and property listings.
-- For simplicity, these are public, but in a real app, you'd use RLS.

-- Logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for logos" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Allow tenant-specific uploads for logos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = ((SELECT auth.jwt()) ->> 'tenant_id')
);

CREATE POLICY "Allow tenant-specific updates for logos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'logos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = ((SELECT auth.jwt()) ->> 'tenant_id')
);

CREATE POLICY "Allow tenant-specific deletes for logos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'logos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = ((SELECT auth.jwt()) ->> 'tenant_id')
);

-- Listings bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for listings" ON storage.objects
FOR SELECT USING (bucket_id = 'listings');

CREATE POLICY "Allow tenant-specific uploads for listings" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'listings' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = ((SELECT auth.jwt()) ->> 'tenant_id')
);

CREATE POLICY "Allow tenant-specific updates for listings" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'listings' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = ((SELECT auth.jwt()) ->> 'tenant_id')
);

CREATE POLICY "Allow tenant-specific deletes for listings" ON storage.objects
FOR DELETE USING (
    bucket_id = 'listings' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = ((SELECT auth.jwt()) ->> 'tenant_id')
);


