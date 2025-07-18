// client/src/components/TenantCard.tsx

import type { Tenant } from '@shared/types';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface TenantCardProps {
  tenant: Tenant;
}

const TenantCard = ({ tenant }: TenantCardProps) => {
  return (
    <Link to={`/t/${tenant.slug}`} className="block group">
      <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <CardContent className="p-6 flex items-center gap-6">
          <img
            src={tenant.logo_url || 'https://via.placeholder.com/80'}
            alt={`${tenant.name} Logo`}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
          />
          <div>
            <CardTitle className="text-xl">{tenant.name}</CardTitle>
            <p className="text-blue-600 group-hover:underline mt-1">View Listings</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TenantCard;
