// client/src/pages/TenantPage.tsx
import ListingCard from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { honoClient } from '@/lib/hono';

import { useEffect, useState } from 'react';

import type { Listing, Tenant } from '@shared/types';
import { ArrowLeft, Building, Globe, Loader2, Mail } from 'lucide-react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

const TenantPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchTenantAndListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const tenantRes = await (honoClient as any).api.tenants[':slug'].$get({ param: { slug } });
        if (!tenantRes.ok) throw new Error(`Tenant with slug "${slug}" not found.`);
        const tenantData = await tenantRes.json();
        setTenant(tenantData);

        const listingsRes = await (honoClient as any).api.listings['by-tenant'][':tenantId'].$get({
          param: { tenantId: tenantData.id },
        });
        if (!listingsRes.ok) throw new Error('Failed to fetch listings for this tenant.');
        const listingsData = await listingsRes.json();
        setListings(listingsData.listings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantAndListings();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-red-500 dark:bg-gray-900">
        <p className="mb-4 text-2xl">Error</p>
        <p className="mb-8">{error}</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Button>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="mb-8 text-2xl">Tenant not found.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Button>
      </div>
    );
  }

  const heroStyle = {
    backgroundColor: tenant.primary_color || '#111827', // Default to a dark gray
    backgroundImage: tenant.hero_image_url
      ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${tenant.hero_image_url})`
      : 'none',
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>{`${tenant.name} | Real Estate Listings`}</title>
        <meta
          name="description"
          content={tenant.bio || `Find the best properties from ${tenant.name}.`}
        />
      </Helmet>

      <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
        <header className="bg-cover bg-center py-20 text-white" style={heroStyle}>
          <div className="container mx-auto px-4 text-center">
            <div className="mb-6 flex justify-center">
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={`${tenant.name} Logo`}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 shadow-lg dark:bg-gray-700">
                  <Building className="h-12 w-12 text-gray-500" />
                </div>
              )}
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight">{tenant.name}</h1>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-200">
              {tenant.tagline || 'Your trusted partner in real estate.'}
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4">
              {tenant.contact_email && (
                <Button asChild variant="secondary">
                  <a href={`mailto:${tenant.contact_email}`}>
                    <Mail className="mr-2 h-4 w-4" /> Contact Us
                  </a>
                </Button>
              )}
              {tenant.website_url && (
                <Button
                  asChild
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900"
                >
                  <a href={tenant.website_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" /> Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </header>

        <nav className="sticky top-0 z-10 bg-white shadow-sm dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to all agencies
              </Button>
              <span className="text-lg font-semibold">{listings.length} Properties Available</span>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4 md:p-8">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <h3 className="text-2xl font-semibold">No Properties Found</h3>
              <p className="mt-2 text-gray-500">
                This agency currently has no properties listed. Please check back later.
              </p>
            </div>
          )}
        </main>

        <footer className="border-t border-gray-200 bg-white py-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by{' '}
            <a href="/" className="font-semibold text-blue-600 hover:underline">
              ElysianVista
            </a>
          </p>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default TenantPage;
