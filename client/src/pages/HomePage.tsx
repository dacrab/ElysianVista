// client/src/pages/HomePage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { honoClient } from '@/lib/hono';
import type { Tenant } from '@shared/types';
import TenantCard from '@/components/TenantCard';

const HomePage = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // In production, you might have my-tenant.elysianvista.com (3 parts)
    // In local dev, you might use my-tenant.localhost (2 parts)
    if (parts.length > 2 || (parts.length === 2 && parts[1] !== 'localhost')) {
      const subdomain = parts[0];
      // Exclude common subdomains like 'www' or 'app' from being treated as tenants
      if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
        navigate(`/t/${subdomain}`);
        return; // Important: stop further execution
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md py-12 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900">
          Welcome to <span className="text-blue-600">ElysianVista</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Your premier destination for finding the perfect real estate agency.
        </p>
        <div className="mt-8 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search for an agency..."
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Partner Agencies</h2>
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <TenantCard key={tenant.id} tenant={tenant} />
              ))
            ) : (
              <p>No agencies found matching your search.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
