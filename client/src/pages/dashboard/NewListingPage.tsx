import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth, useAuthorization } from "@/contexts/AuthProvider";
import { honoClient as hc } from "@/lib/hono";
import { Navigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export default function NewListingPage() {
  const { session, loading: authLoading, profile } = useAuth();
  const { hasRole } = useAuthorization();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    country: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    image_files: [] as File[],
  });

  const canCreate = hasRole(['admin', 'manager', 'realtor']);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!canCreate) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFormState(prevState => ({ ...prevState, image_files: fileArray }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || !profile?.tenant_id) {
      toast.error("You must be logged in and part of a team to create a listing.");
      return;
    }
    setLoading(true);

    try {
      const image_urls = await Promise.all(
        formState.image_files.map(async (file) => {
          const filePath = `${profile.tenant_id}/${uuidv4()}`;
          const { error: uploadError } = await supabase.storage
            .from('listings')
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(filePath);
          
          return publicUrl;
        })
      );

      const res = await (hc as any).api.listings.$post({
        json: {
          ...formState,
          price: parseFloat(formState.price),
          bedrooms: parseInt(formState.bedrooms),
          bathrooms: parseInt(formState.bathrooms),
          area_sqft: parseInt(formState.area_sqft),
          image_urls,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create listing");
      }

      toast.success("Listing created successfully!");
      setFormState({
        title: "", description: "", address: "", city: "", country: "",
        price: "", bedrooms: "", bathrooms: "", area_sqft: "", image_files: [],
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Listing</CardTitle>
        <CardDescription>
          Fill out the form below to add a new property.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g., Modern Downtown Apartment" required value={formState.title} onChange={handleInputChange} disabled={loading} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" placeholder="e.g., 250000" required value={formState.price} onChange={handleInputChange} disabled={loading} />
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="A brief description of the property" required value={formState.description} onChange={handleInputChange} disabled={loading} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St" required value={formState.address} onChange={handleInputChange} disabled={loading} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Anytown" required value={formState.city} onChange={handleInputChange} disabled={loading} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" placeholder="e.g., 3" required value={formState.bedrooms} onChange={handleInputChange} disabled={loading} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" placeholder="e.g., 2" required value={formState.bathrooms} onChange={handleInputChange} disabled={loading} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="area_sqft">Area (sqft)</Label>
              <Input id="area_sqft" type="number" placeholder="e.g., 1500" required value={formState.area_sqft} onChange={handleInputChange} disabled={loading} />
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="images">Images</Label>
            <Input id="images" type="file" multiple onChange={handleFileChange} disabled={loading} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Listing"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
