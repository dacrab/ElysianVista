// client/src/components/TenantCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { Tenant } from '@shared/types';
import { Building, Globe, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TenantCardProps {
  tenant: Tenant;
}

const TenantCard = ({ tenant }: TenantCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/t/${tenant.slug}`);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className="flex h-full transform cursor-pointer flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        {tenant.logo_url ? (
          <img
            src={tenant.logo_url}
            alt={`${tenant.name} Logo`}
            className="h-16 w-16 rounded-lg border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
            <Building className="h-8 w-8 text-gray-500" />
          </div>
        )}
        <div className="flex-grow">
          <CardTitle className="text-xl font-bold">{tenant.name}</CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            {tenant.tagline || 'Premier Real Estate Agency'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {tenant.bio ||
            'Dedicated to finding your perfect home with a curated selection of top-tier properties.'}
        </p>
        <div className="mt-4 flex flex-col space-y-2 text-sm">
          {tenant.contact_email && (
            <a
              href={`mailto:${tenant.contact_email}`}
              onClick={handleLinkClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              <Mail className="h-4 w-4" />
              <span>{tenant.contact_email}</span>
            </a>
          )}
          {tenant.website_url && (
            <a
              href={tenant.website_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              <Globe className="h-4 w-4" />
              <span>{tenant.website_url}</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantCard;
