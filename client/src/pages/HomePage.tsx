// client/src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { honoClient } from '@/lib/hono';
import type { Tenant } from '@shared/types';
import TenantCard from '@/components/TenantCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building, Search, Zap, Handshake } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Subdomain detection logic remains the same
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1] !== 'localhost')) {
      const subdomain = parts[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'api') {
        navigate(`/t/${subdomain}`);
        return;
      }
    }
    
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const res = await (honoClient as any).api.tenants.$get();
        if (!res.ok) throw new Error('Failed to fetch tenants');
        const data = await res.json();
        setTenants(data);
        setFilteredTenants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [navigate]);

  useEffect(() => {
    const results = tenants.filter(tenant =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTenants(results);
  }, [searchTerm, tenants]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center space-x-2">
          <Building className="h-8 w-8 text-blue-600 dark:text-blue-500" />
          <span className="text-2xl font-bold">ElysianVista</span>
        </div>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
          <Button onClick={() => navigate('/dashboard')}>Get Started</Button>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-20 bg-white dark:bg-gray-800">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
            Find Your Dream Property, With Your Trusted Agency
        </h1>
          <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-600 dark:text-gray-300">
            ElysianVista connects you with the best real estate agencies, offering a seamless experience for finding and managing properties.
          </p>
          <div className="mt-8">
            <Button size="lg" onClick={() => document.getElementById('agency-search')?.focus()}>
              Find an Agency <Search className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-gray-100 dark:bg-gray-800/50">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">Why Choose ElysianVista?</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">The all-in-one platform for your real estate needs.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <Zap className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-500"/>
                        <h3 className="text-2xl font-semibold mt-4">Modern Platform</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">A sleek, modern, and fast platform for both agencies and clients.</p>
                    </div>
                    <div className="p-6">
                        <Building className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-500"/>
                        <h3 className="text-2xl font-semibold mt-4">Verified Agencies</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">We partner with only the most reputable agencies in the market.</p>
                    </div>
                    <div className="p-6">
                        <Handshake className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-500"/>
                        <h3 className="text-2xl font-semibold mt-4">Seamless Experience</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">A unified dashboard for agencies and a beautiful frontend for clients.</p>
                    </div>
                </div>
            </div>
        </section>


        {/* Agency Search & Listing Section */}
        <section className="container mx-auto p-8 md:p-12">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold">Our Partner Agencies</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    Search for an agency to view their exclusive listings.
                </p>
            </div>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="agency-search"
            type="text"
                placeholder="Search for an agency by name..."
                className="w-full pl-10 pr-4 py-3 text-lg rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
          </div>

          {loading && <div className="text-center">Loading agencies...</div>}
          {error && <p className="text-red-500 text-center">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <TenantCard key={tenant.id} tenant={tenant} />
              ))
            ) : (
                <p className="text-center col-span-full">No agencies found matching your search.</p>
            )}
          </div>
        )}
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <p>&copy; {new Date().getFullYear()} ElysianVista. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;