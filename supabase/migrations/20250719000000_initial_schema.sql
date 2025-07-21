-- supabase/migrations/20250719000000_initial_schema.sql

-- 1. Tenants Table: Stores information about each real estate company.
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    hero_image_url TEXT,
    primary_color TEXT,
    contact_email TEXT,
    website_url TEXT,
    tagline TEXT,
    bio TEXT
);
COMMENT ON TABLE public.tenants IS 'Each row represents a real estate company tenant.';

-- 2. Profiles Table: Extends auth.users with roles and tenant associations.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ,
    full_name TEXT,
    username TEXT,
    avatar_url TEXT,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'realtor' CHECK (role IN ('admin', 'manager', 'realtor', 'secretary'))
);
COMMENT ON TABLE public.profiles IS 'Profile information for each user, linking them to a tenant and role.';

-- 3. Listings Table: Contains all property listings.
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
    price NUMERIC(12, 2) NOT NULL,
    bedrooms INT,
    bathrooms INT,
    area_sqft INT,
    image_urls TEXT[],
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented')),
    listing_ref_id TEXT UNIQUE
);
COMMENT ON TABLE public.listings IS 'Real estate listings for each tenant.';
CREATE INDEX idx_listings_tenant_id ON public.listings(tenant_id);
CREATE INDEX idx_listings_agent_id ON public.listings(agent_id);

-- 4. Leads Table: Captures inquiries from potential customers.
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
CREATE INDEX idx_leads_tenant_id ON public.leads(tenant_id);
CREATE INDEX idx_leads_listing_id ON public.leads(listing_id);

-- 5. Subscriptions Table: Manages tenant subscriptions (future use).
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT,
    tier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.subscriptions IS 'Manages billing and subscription status for each tenant.';

-- 6. Triggers and Functions
-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name', 
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'username'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger to run the function after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Custom JWT claims function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  claims jsonb;
  user_profile public.profiles;
BEGIN
  SELECT *
  INTO user_profile
  FROM public.profiles
  WHERE id = (event->'claims'->>'sub')::uuid;

  claims := event->'claims';
  
  IF user_profile IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_profile.role));
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_profile.tenant_id));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$; 