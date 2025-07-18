-- Add hero_image_url to tenants table
ALTER TABLE public.tenants
ADD COLUMN hero_image_url TEXT;
