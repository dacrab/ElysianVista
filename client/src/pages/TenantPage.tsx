// client/src/pages/TenantPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { honoClient } from '@/lib/hono';
import type { Tenant, Listing } from '@shared/types';
import ListingCard from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Building, Mail, Globe, ArrowLeft, Loader2 } from 'lucide-react';

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

        const listingsRes = await (honoClient as any).api.listings['by-tenant'][':tenantId'].$get({ param: { tenantId: tenantData.id } });
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500 bg-gray-50 dark:bg-gray-900">
        <p className="text-2xl mb-4">Error</p>
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-2xl mb-8">Tenant not found.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Button>
      </div>
    );
  }

  const heroStyle = {
    backgroundColor: tenant.primary_color || '#111827', // Default to a dark gray
    backgroundImage: tenant.hero_image_url ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${tenant.hero_image_url})` : 'none',
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>{`${tenant.name} | Real Estate Listings`}</title>
        <meta name="description" content={tenant.bio || `Find the best properties from ${tenant.name}.`} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
        <header 
          className="py-20 text-white bg-cover bg-center" 
          style={heroStyle}
        >
          <div className="container mx-auto text-center px-4">
            <div className="flex justify-center mb-6">
                {tenant.logo_url ? (
                    <img src={tenant.logo_url} alt={`${tenant.name} Logo`} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white shadow-lg">
                        <Building className="w-12 h-12 text-gray-500" />
                    </div>
                )}
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight">
              {tenant.name}
            </h1>
            <p className="max-w-3xl mx-auto mt-4 text-xl text-gray-200">
              {tenant.tagline || 'Your trusted partner in real estate.'}
            </p>
            <div className="mt-8 flex justify-center items-center space-x-4">
                {tenant.contact_email && (
                    <Button asChild variant="secondary">
                        <a href={`mailto:${tenant.contact_email}`}>
                            <Mail className="mr-2 h-4 w-4" /> Contact Us
                        </a>
                    </Button>
                )}
                 {tenant.website_url && (
                    <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                        <a href={tenant.website_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-2 h-4 w-4" /> Visit Website
                        </a>
                    </Button>
                )}
            </div>
          </div>
        </header>

        <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to all agencies
                    </Button>
                    <span className="font-semibold text-lg">{listings.length} Properties Available</span>
                </div>
            </div>
        </nav>

        <main className="container mx-auto p-4 md:p-8">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
                <h3 className="text-2xl font-semibold">No Properties Found</h3>
                <p className="text-gray-500 mt-2">This agency currently has no properties listed. Please check back later.</p>
            </div>
          )}
        </main>

        <footer className="text-center py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Powered by <a href="/" className="font-semibold text-blue-600 hover:underline">ElysianVista</a>
            </p>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default TenantPage;