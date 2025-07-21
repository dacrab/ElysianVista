-- supabase/migrations/20250719000001_apply_rls_policies.sql

-- 1. Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Define Policies

-- Policies for TENANTS
-- Users can view their own tenant's details.
CREATE POLICY "Allow users to view their own tenant"
ON public.tenants FOR SELECT
USING (id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID));

-- Admins can update their own tenant's details.
CREATE POLICY "Allow admins to update their tenant"
ON public.tenants FOR UPDATE
USING (id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID) AND (SELECT public.profiles.role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK (id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID));

-- Policies for PROFILES
-- Users can view all profiles within their own tenant OR their own profile.
CREATE POLICY "Allow users to view profiles in their own tenant"
ON public.profiles FOR SELECT
USING (id = auth.uid() OR tenant_id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID));

-- Users can update their own profile.
CREATE POLICY "Allow users to update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can update any profile within their tenant.
CREATE POLICY "Allow admins to update profiles in their tenant"
ON public.profiles FOR UPDATE
USING (tenant_id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID) AND (SELECT public.profiles.role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK (tenant_id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID));

-- Policies for LISTINGS
-- Any authenticated user can view all listings (for the public-facing sites).
CREATE POLICY "Allow public read access to listings"
ON public.listings FOR SELECT
USING (true);

-- Users can only create listings for their own tenant.
CREATE POLICY "Allow users to create listings for their tenant"
ON public.listings FOR INSERT
WITH CHECK (tenant_id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID));

-- Users can only update listings within their own tenant.
CREATE POLICY "Allow users to update listings in their tenant"
ON public.listings FOR UPDATE
USING (tenant_id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID));

-- Users can only delete listings from their own tenant.
CREATE POLICY "Allow users to delete listings from their tenant"
ON public.listings FOR DELETE
USING (tenant_id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID));

-- Policies for LEADS
-- Users can manage all leads for their tenant.
CREATE POLICY "Allow tenant members to access leads"
ON public.leads FOR ALL
USING (tenant_id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID));

-- Policies for SUBSCRIPTIONS
-- Users can view their own tenant's subscription.
CREATE POLICY "Allow tenant members to view their subscription"
ON public.subscriptions FOR SELECT
USING (tenant_id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID));

-- Admins can manage their tenant's subscription.
CREATE POLICY "Allow admins to manage subscriptions"
ON public.subscriptions FOR ALL
USING (tenant_id = ((SELECT auth.jwt() ->> 'tenant_id')::UUID) AND (SELECT public.profiles.role FROM public.profiles WHERE id = auth.uid()) = 'admin'); 