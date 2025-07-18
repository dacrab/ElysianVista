// shared/src/types/auth.ts

// Define the user profile structure, including the role
export type UserProfile = {
  id: string;
  tenant_id: string | null; // Add tenant_id
  role: 'admin' | 'manager' | 'realtor' | 'secretary';
  // Add other profile fields as needed, e.g., full_name, avatar_url
  full_name?: string;
  avatar_url?: string;
};
