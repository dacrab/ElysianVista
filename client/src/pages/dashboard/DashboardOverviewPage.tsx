// client/src/pages/dashboard/DashboardOverviewPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { honoClient } from '@/lib/hono';
import type { Listing } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Building, Users, DollarSign } from 'lucide-react';

const DashboardOverviewPage = () => {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        totalListings: 0,
        availableListings: 0,
        totalValue: 0,
        teamMembers: 0,
    });

    useEffect(() => {
        if (profile?.tenant_id) {
            const fetchDashboardData = async () => {
                try {
                    // Fetch listings for stats
                    const listingsRes = await (honoClient as any).api.listings['by-tenant'][':tenantId'].$get({
                        param: { tenantId: profile.tenant_id },
                    });
                    const listingsData = await listingsRes.json();
                    const listings = listingsData.listings || [];

                    // Fetch team members for stats
                    const profilesRes = await (honoClient as any).api.profiles['by-tenant'][':tenantId'].$get({
                        param: { tenantId: profile.tenant_id },
                    });
                    const profilesData = await profilesRes.json();
                    
                    // Calculate stats
                    const totalListings = listings.length;
                    const availableListings = listings.filter((l: Listing) => l.status === 'available').length;
                    const totalValue = listings.reduce((sum: number, l: Listing) => sum + l.price, 0);

                    setStats({
                        totalListings,
                        availableListings,
                        totalValue,
                        teamMembers: profilesData.length || 0
                    });

                } catch (error) {
                    console.error("Failed to fetch dashboard data:", error);
                }
            };
            fetchDashboardData();
        }
    }, [profile]);


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalListings}</div>
                <p className="text-xs text-muted-foreground">properties managed</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.availableListings}</div>
                <p className="text-xs text-muted-foreground">currently on the market</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">estimated market value</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.teamMembers}</div>
                <p className="text-xs text-muted-foreground">active agents and staff</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverviewPage; 