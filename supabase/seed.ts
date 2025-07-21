// supabase/seed.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Environment Configuration
// Ensure your Supabase URL and Service Role Key are in a .env file
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL and service role key are required in .env');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 2. Type Definitions
interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface UserSeedData {
  id: string;
  email: string;
  role: string;
  tenant_slug: string;
}

// 3. Seeding Functions

/**
 * Cleans up all existing data in the relevant tables to ensure a fresh seed.
 */
async function cleanupData(supabase: SupabaseClient) {
  console.log('🧹 Cleaning up existing data...');

  // The order of deletion is critical due to foreign key constraints.
  const tables = ['listings', 'profiles', 'tenants'];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error(`🔴 Error cleaning ${table}:`, error);
    else console.log(`🗑️ ${table} table cleaned.`);
  }

  // Delete all auth users
  const { data: usersResponse, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('🔴 Error listing users for cleanup:', listError);
  } else if (usersResponse.users) {
    for (const user of usersResponse.users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) console.error(`🔴 Error deleting user ${user.email}:`, deleteError);
      else console.log(`🗑️ User ${user.email} deleted.`);
    }
  }
  console.log('✅ Cleanup complete.');
}

/**
 * Seeds the tenants table with sample real estate agencies.
 */
async function seedTenants(supabase: SupabaseClient): Promise<Tenant[]> {
  console.log('🏢 Seeding tenants...');
  const { data, error } = await supabase
    .from('tenants')
    .insert([
      { name: 'aBroker Real Estate', slug: 'abroker', logo_url: 'https://i.imgur.com/5nL1sA6.png', primary_color: '#0052CC', contact_email: 'contact@abroker.com', website_url: 'https://abroker.com', tagline: 'Your Trusted Real Estate Partner', bio: 'aBroker has been a leading real estate agency for over 20 years, specializing in urban and suburban properties.' },
      { name: 'Real Status Properties', slug: 'realstatus', logo_url: 'https://i.imgur.com/6fN0g9s.png', primary_color: '#D93F4C', contact_email: 'info@realstatus.com', website_url: 'https://realstatus.com', tagline: 'Luxury Properties for the Discerning Client', bio: 'Real Status offers an exclusive portfolio of luxury villas, penthouses, and beachfront homes.' },
    ])
    .select('id, name, slug');
  if (error) {
    console.error('🔴 Error seeding tenants:', error);
    throw error;
  }
  console.log('✅ Tenants seeded successfully.');
  return data;
}

/**
 * Seeds users in Supabase Auth and corresponding profiles in the public schema.
 */
async function seedUsersAndProfiles(supabase: SupabaseClient, tenants: Tenant[]): Promise<UserSeedData[]> {
  console.log('👤 Seeding users and profiles...');
  const usersToCreate = [
    { email: 'admin@abroker.com', password: 'password123', full_name: 'Adam Broker', username: 'adamb', role: 'admin', tenant_slug: 'abroker' },
    { email: 'manager@abroker.com', password: 'password123', full_name: 'Mary Manager', username: 'marym', role: 'manager', tenant_slug: 'abroker' },
    { email: 'realtor@abroker.com', password: 'password123', full_name: 'Rick Realtor', username: 'rickr', role: 'realtor', tenant_slug: 'abroker' },
    { email: 'admin@realstatus.com', password: 'password123', full_name: 'Stacy Status', username: 'stacys', role: 'admin', tenant_slug: 'realstatus' },
    { email: 'manager@realstatus.com', password: 'password123', full_name: 'Mike Manager', username: 'mikem', role: 'manager', tenant_slug: 'realstatus' },
    { email: 'realtor1@realstatus.com', password: 'password123', full_name: 'Rachel Realtor', username: 'rachelr', role: 'realtor', tenant_slug: 'realstatus' },
  ];

  const createdUsers: UserSeedData[] = [];
  for (const user of usersToCreate) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name, username: user.username },
    });

    if (authError || !authData.user) {
      console.error(`🔴 Error creating auth user ${user.email}:`, authError);
      continue;
    }
    
    const tenant_id = tenants.find(t => t.slug === user.tenant_slug)?.id;
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ tenant_id, role: user.role })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error(`🔴 Error updating profile for ${user.email}:`, profileError);
    } else {
    createdUsers.push({ ...user, id: authData.user.id });
    }
  }
  console.log('✅ Users and profiles seeded successfully.');
  return createdUsers;
}

/**
 * Seeds the listings table with sample properties for each tenant.
 */
async function seedListings(supabase: SupabaseClient, tenants: Tenant[], users: UserSeedData[]) {
  console.log('🏡 Seeding listings...');
  const abrokerAgent = users.find(u => u.tenant_slug === 'abroker' && u.role === 'realtor');
  const realstatusAgent = users.find(u => u.tenant_slug === 'realstatus' && u.role === 'realtor');
  const abrokerTenantId = tenants.find(t => t.slug === 'abroker')?.id;
  const realstatusTenantId = tenants.find(t => t.slug === 'realstatus')?.id;

  if (!abrokerAgent || !realstatusAgent || !abrokerTenantId || !realstatusTenantId) {
    throw new Error('Could not find required users or tenants for listing creation.');
  }

  const listings = [
    { tenant_id: abrokerTenantId, agent_id: abrokerAgent.id, title: 'Downtown Modern Loft', description: 'A sleek 2-bedroom loft in the vibrant heart of the city.', address: '123 Main St', city: 'Metropolis', country: 'USA', price: 650000.00, bedrooms: 2, bathrooms: 2, area_sqft: 1200, image_urls: ['https://i.imgur.com/gJ4dYfG.jpeg'], status: 'available' },
    { tenant_id: realstatusTenantId, agent_id: realstatusAgent.id, title: 'Luxury Beachfront Villa', description: 'Exclusive villa with private beach access and stunning ocean views.', address: '789 Ocean Blvd', city: 'Paradise City', country: 'USA', price: 2500000.00, bedrooms: 5, bathrooms: 6, area_sqft: 5000, image_urls: ['https://i.imgur.com/kJ4dYfG.jpeg'], status: 'available' },
  ];

  const { error } = await supabase.from('listings').insert(listings);
  if (error) {
    console.error('🔴 Error seeding listings:', error);
    throw error;
  }
  console.log('✅ Listings seeded successfully.');
}

// 4. Main Execution
async function main() {
  try {
  console.log('🌱 Starting database seeding...');
  await cleanupData(supabase);
  const tenants = await seedTenants(supabase);
  const users = await seedUsersAndProfiles(supabase, tenants);
    await seedListings(supabase, tenants, users);
  console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('🔴 A critical error occurred during seeding:', error);
  process.exit(1);
  }
}

main(); 