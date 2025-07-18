-- Apply RLS Policies
-- This script enables RLS and defines policies for all tenant-specific tables.

-- 1. Tenants Table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own tenant"
ON public.tenants FOR SELECT
USING (id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

CREATE POLICY "Allow admins to update their tenant"
ON public.tenants FOR UPDATE
USING (id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK (id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

-- 2. Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view profiles in their own tenant"
ON public.profiles FOR SELECT
USING (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

CREATE POLICY "Allow users to update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Allow admins to update profiles in their tenant"
ON public.profiles FOR UPDATE
USING (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

-- 3. Leads Table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow tenant members to access leads"
ON public.leads FOR ALL
USING (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

-- 4. Messages Table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow tenant members to access messages"
ON public.messages FOR ALL
USING (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);

-- 5. Subscriptions Table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to manage subscriptions"
ON public.subscriptions FOR ALL
USING (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Allow tenant members to view their subscription status"
ON public.subscriptions FOR SELECT
USING (tenant_id = ((SELECT auth.jwt()) ->> 'tenant_id')::UUID);
