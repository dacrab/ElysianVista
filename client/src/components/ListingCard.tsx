// client/src/components/ListingCard.tsx

import type { Listing } from '@shared/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ListingCardProps {
  listing: Listing;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
};

const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <img
          src={listing.image_urls?.[0] || 'https://via.placeholder.com/400x250'}
          alt={listing.title}
          className="w-full h-56 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl">{listing.title}</CardTitle>
        <CardDescription className="mt-1">
          {listing.address}, {listing.city}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <p className="text-lg font-semibold text-blue-600">{formatPrice(listing.price)}</p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{listing.bedrooms} beds</span>
          <span>{listing.bathrooms} baths</span>
          <span>{listing.area_sqft} sqft</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;
