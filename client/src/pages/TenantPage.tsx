// client/src/pages/TenantPage.tsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { honoClient } from '@/lib/hono';
import type { Tenant, Listing } from '@shared/types';
import ListingCard from '@/components/ListingCard';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const TenantPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchTenantAndListings = async () => {
      try {
        const tenantRes = await (honoClient as any).api.tenants[':slug'].$get({ param: { slug } });

        if (!tenantRes.ok) throw new Error('Tenant not found');
        const tenantData = await tenantRes.json();
        setTenant(tenantData);

        const listingsRes = await (honoClient as any).api.listings['by-tenant'][':tenantId'].$get({ param: { tenantId: tenantData.id } });
        if (!listingsRes.ok) throw new Error('Failed to fetch listings');
        const listingsData = await listingsRes.json();
        setListings(listingsData.listings);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantAndListings();
  }, [slug]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
  if (!tenant) return <div className="flex items-center justify-center min-h-screen">Tenant not found.</div>;

  return (
    <HelmetProvider>
      <Helmet>
        <title>{tenant.name} | Real Estate Listings</title>
        <meta name="description" content={`Find the best properties from ${tenant.name}.`} />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <header 
          className="py-16 text-white bg-cover bg-center" 
          style={{ 
            backgroundColor: tenant.primary_color || '#333',
            backgroundImage: tenant.hero_image_url ? `url(${tenant.hero_image_url})` : 'none'
          }}
        >
          <div className="container mx-auto text-center bg-black bg-opacity-50 p-8 rounded-lg">
            {tenant.logo_url && <img src={tenant.logo_url} alt={`${tenant.name} Logo`} className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white" />}
            <h1 className="text-5xl font-extrabold">
              {tenant.name}
            </h1>
            <p className="mt-4 text-lg">Welcome to our official listings page.</p>
            <a href={`mailto:${tenant.contact_email}`} className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded mt-4 inline-block">
              Contact Us
            </a>
          </div>
        </header>

        <main className="container mx-auto p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Properties</h2>
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No properties listed at the moment. Please check back soon!</p>
          )}
        </main>
      </div>
    </HelmetProvider>
  );
};

export default TenantPage;
