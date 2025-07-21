// client/src/components/TenantCard.tsx
import type { Tenant } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Building, Mail, Globe } from 'lucide-react';

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
      className="flex flex-col h-full overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        {tenant.logo_url ? (
          <img src={tenant.logo_url} alt={`${tenant.name} Logo`} className="w-16 h-16 rounded-lg border object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Building className="w-8 h-8 text-gray-500" />
          </div>
        )}
        <div className="flex-grow">
          <CardTitle className="text-xl font-bold">{tenant.name}</CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            {tenant.tagline || 'Premier Real Estate Agency'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {tenant.bio || 'Dedicated to finding your perfect home with a curated selection of top-tier properties.'}
        </p>
        <div className="mt-4 flex flex-col space-y-2 text-sm">
          {tenant.contact_email && (
            <a 
              href={`mailto:${tenant.contact_email}`} 
              onClick={handleLinkClick}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
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
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
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