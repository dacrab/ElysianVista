// shared/src/types/listing.ts
import { z } from 'zod';

export const listingSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  tenant_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  area_sqft: z.number().int().optional(),
  image_urls: z.array(z.string().url()).optional(),
  status: z.enum(['available', 'sold', 'rented']).default('available'),
  listing_ref_id: z.string().optional(),
});

export type Listing = z.infer<typeof listingSchema>;

export const partialListingSchema = listingSchema.partial();

export type PartialListing = z.infer<typeof partialListingSchema>;
