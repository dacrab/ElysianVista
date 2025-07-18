// shared/src/types.ts

// Defines the shape of a tenant object, used across the client and server.
export interface Tenant {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  logo_url: string | null;
  hero_image_url: string | null; // Add hero_image_url
  primary_color: string | null;
  contact_email: string | null;
}

// Defines the shape of a listing object.
export interface Listing {
  id: string;
  created_at: string;
  tenant_id: string;
  agent_id: string;
  title: string;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  image_urls: string[] | null;
  status: 'available' | 'sold' | 'rented';
}
