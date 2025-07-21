// client/src/components/ListingCard.tsx
import type { Listing } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { BedDouble, Bath, SquareStack, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {

  const placeholderImage = "https://via.placeholder.com/400x300.png?text=No+Image";
  const firstImage = listing.image_urls && listing.image_urls.length > 0 ? listing.image_urls[0] : placeholderImage;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800">
      <CardHeader className="p-0 relative">
        <Badge 
          className="absolute top-2 right-2 z-10"
          variant={listing.status === 'sold' || listing.status === 'rented' ? 'destructive' : 'default'}
        >
          {listing.status}
        </Badge>
        <div className="aspect-w-4 aspect-h-3">
          <img src={firstImage} alt={listing.title} className="object-cover w-full h-full" />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-bold truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
          {listing.title}
        </CardTitle>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{listing.city || 'N/A'}, {listing.country || 'N/A'}</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          {listing.bedrooms && (
            <div className="flex items-center space-x-1">
              <BedDouble className="h-4 w-4 text-gray-500" />
              <span>{listing.bedrooms} Beds</span>
            </div>
          )}
          {listing.bathrooms && (
            <div className="flex items-center space-x-1">
              <Bath className="h-4 w-4 text-gray-500" />
              <span>{listing.bathrooms} Baths</span>
            </div>
          )}
          {listing.area_sqft && (
            <div className="flex items-center space-x-1">
              <SquareStack className="h-4 w-4 text-gray-500" />
          <span>{listing.area_sqft} sqft</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
        <p className="text-xl font-extrabold text-blue-600 dark:text-blue-500">
            {formatCurrency(listing.price)}
        </p>
        <Button variant="secondary">Details</Button>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;