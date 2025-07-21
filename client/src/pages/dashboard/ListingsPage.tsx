// client/src/pages/dashboard/ListingsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { honoClient } from '@/lib/hono';
import { useAuth } from '@/contexts/AuthProvider';
import type { Listing, Tenant } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const ListingsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.tenant_id) {
      const fetchListings = async () => {
        setLoading(true);
        try {
          const res = await (honoClient as any).api.listings['by-tenant'][':tenantId'].$get({
            param: { tenantId: profile.tenant_id },
          });
          if (!res.ok) throw new Error('Failed to fetch listings.');
          const data = await res.json();
          setListings(data.listings || []);
        } catch (error) {
          toast.error('Error', { description: error instanceof Error ? error.message : 'Could not fetch listings.' });
        } finally {
          setLoading(false);
        }
      };
      fetchListings();
    }
  }, [profile]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Listings</h1>
          <p className="text-gray-500">View, edit, and manage your agency's properties.</p>
        </div>
        <Button onClick={() => navigate('/dashboard/listings/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Listing
        </Button>
      </div>

      {loading ? (
        <p>Loading listings...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">{listing.title}</TableCell>
                <TableCell>
                  <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(listing.price)}</TableCell>
                <TableCell>{listing.city}, {listing.country}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ListingsPage; 