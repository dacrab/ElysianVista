// server/src/index.ts
import { zValidator } from '@hono/zod-validator';
import { listingSchema, partialListingSchema } from '@shared/types/listing';
import { cors } from 'hono/cors';

import { HonoApp } from './honotypes';
import { authMiddleware, roleMiddleware } from './middleware';
import * as listingService from './services/listingService';
import * as profileService from './services/profileService';
import * as tenantService from './services/tenantService';

const app = new HonoApp();

// Global Middleware
app.use(cors());

// --- Tenant Routes ---
const tenantsRoutes = new HonoApp()
  .get('/', async (c) => {
    const { data, error } = await tenantService.getTenants();
    if (error) {
      return c.json({ error: 'Failed to fetch tenants' }, 500);
    }
    return c.json(data);
  })
  .get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    const { data, error } = await tenantService.getTenantBySlug(slug);
    if (error || !data) {
      return c.json({ error: 'Tenant not found' }, 404);
    }
    return c.json(data);
  });

// --- Profiles Routes ---
const profilesRoutes = new HonoApp()
  .use('/*', authMiddleware) // All profile routes require authentication
  .get(
    '/by-tenant/:tenantId',
    roleMiddleware(['admin', 'manager']), // Only admins and managers can view all profiles
    async (c) => {
      const { tenantId } = c.req.param();
      const { data, error } = await profileService.getProfilesByTenant(tenantId);
      if (error) {
        return c.json({ error: 'Failed to fetch profiles' }, 500);
      }
      return c.json(data);
    }
  )
  .patch('/:userId', async (c) => {
    const supabaseClient = c.get('supabase');
    const { userId } = c.req.param();
    const profileData = await c.req.json();

    // Basic validation: users can only update their own profile unless they are an admin.
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user || (user.id !== userId && !user.app_metadata.roles?.includes('admin'))) {
      return c.json({ error: 'Unauthorized to update this profile' }, 403);
    }

    const { data, error } = await profileService.updateUserProfile(
      supabaseClient,
      userId,
      profileData
    );
    if (error) {
      return c.json({ error: `Failed to update profile: ${error.message}` }, 500);
    }
    return c.json(data);
  });

// --- Listings Routes ---
const listingsRoutes = new HonoApp();

// --- Public Listing Routes ---
listingsRoutes.get('/by-tenant/:tenantId', async (c) => {
  const { tenantId } = c.req.param();
  const { data, error } = await listingService.getListingsByTenant(tenantId);
  if (error) {
    return c.json({ error: 'Failed to fetch listings' }, 500);
  }
  // Wrap the array in an object with a 'listings' key
  return c.json({ listings: data });
});

listingsRoutes.get('/:refId', async (c) => {
  const { refId } = c.req.param();
  const { data, error } = await listingService.getListingByRefId(refId);
  if (error) {
    return c.json({ error: 'Listing not found' }, 404);
  }
  return c.json(data);
});

// --- Protected Listing Routes ---
const protectedListingsRoutes = new HonoApp()
  .use('/*', authMiddleware) // First, ensure the user is authenticated
  .post(
    '/',
    roleMiddleware(['admin', 'manager', 'realtor']), // Admins, managers, and realtors can create
    zValidator('json', listingSchema),
    async (c) => {
      const supabaseClient = c.get('supabase');
      const listing = c.req.valid('json');
      const { data, error } = await listingService.createListing(supabaseClient, listing);
      if (error) {
        return c.json({ error: `Failed to create listing: ${error.message}` }, 500);
      }
      return c.json(data, 201);
    }
  )
  .patch(
    '/:id',
    roleMiddleware(['admin', 'manager', 'realtor']), // Admins, managers, and realtors can update
    zValidator('json', partialListingSchema),
    async (c) => {
      const supabaseClient = c.get('supabase');
      const { id } = c.req.param();
      const listing = c.req.valid('json');
      const { data, error } = await listingService.updateListing(supabaseClient, id, listing);
      if (error) {
        return c.json({ error: `Failed to update listing: ${error.message}` }, 500);
      }
      return c.json(data);
    }
  )
  .delete(
    '/:id',
    roleMiddleware(['admin', 'manager']), // Only admins and managers can delete
    async (c) => {
      const supabaseClient = c.get('supabase');
      const { id } = c.req.param();
      const { error } = await listingService.deleteListing(supabaseClient, id);
      if (error) {
        return c.json({ error: `Failed to delete listing: ${error.message}` }, 500);
      }
      return c.json({ message: 'Listing deleted successfully' });
    }
  );

// Mount the protected routes under the main listings route
listingsRoutes.route('/', protectedListingsRoutes);

// --- API Router ---
const api = new HonoApp()
  .route('/tenants', tenantsRoutes)
  .route('/profiles', profilesRoutes)
  .route('/listings', listingsRoutes);

// Mount the API router on the main app
app.route('/api', api);

// Export the main app for the server to run
export default app;

// Export the type of the main app for the client's type-safe fetcher
export type AppType = typeof app;
