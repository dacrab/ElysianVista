import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- 1. Environment Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and service role key are required.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Type Definitions ---
interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface UserSeedData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tenant_slug: string;
}

interface Listing {
  id: string;
  tenant_id: string;
}

// --- Helper Functions ---

async function cleanupData(supabase: SupabaseClient) {
  console.log('🧹 Cleaning up existing data...');

  // The order of deletion is important due to foreign key constraints.
  const tablesToDelete = [
    { name: 'messages', id_type: 'bigint' },
    { name: 'leads', id_type: 'uuid' },
    { name: 'listings', id_type: 'uuid' },
    { name: 'profiles', id_type: 'uuid' },
    { name: 'tenants', id_type: 'uuid' },
  ];

  for (const table of tablesToDelete) {
    let query = supabase.from(table.name).delete();
    if (table.id_type === 'uuid') {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    } else {
      query = query.gt('id', 0);
    }

    const { error } = await query;
    if (error) console.error(`🔴 Error cleaning ${table.name}:`, error.message);
    else console.log(`🗑️ ${table.name} deleted.`);
  }

  // Delete auth users
  const { data: { users }, error: listUsersError } = await supabase.auth.admin.listUsers();
  if (listUsersError) {
    console.error('🔴 Error listing users:', listUsersError.message);
  } else {
    for (const user of users) {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteUserError) console.error(`🔴 Error deleting user ${user.email}:`, deleteUserError.message);
      else console.log(`🗑️ User ${user.email} deleted.`);
    }
  }
  console.log('✅ Cleanup complete.');
}

async function seedTenants(supabase: SupabaseClient): Promise<Tenant[]> {
  console.log('🏢 Creating sample tenants...');
  const { data, error } = await supabase
    .from('tenants')
    .insert([
      { name: 'aBroker Real Estate', slug: 'abroker', logo_url: 'https://example.com/logos/abroker.png', primary_color: '#0052CC', contact_email: 'contact@abroker.com' },
      { name: 'Real Status Properties', slug: 'realstatus', logo_url: 'https://example.com/logos/realstatus.png', primary_color: '#D93F4C', contact_email: 'info@realstatus.com' },
    ])
    .select('id, name, slug');
  if (error) throw error;
  console.log('✅ Tenants created successfully.');
  return data;
}

async function seedUsersAndProfiles(supabase: SupabaseClient, tenants: Tenant[]): Promise<UserSeedData[]> {
  console.log('👤 Creating sample users and profiles...');
  const usersToCreate = [
    { email: 'admin@abroker.com', password: 'password123', full_name: 'Admin User', role: 'admin', tenant_slug: 'abroker' },
    { email: 'manager@realstatus.com', password: 'password123', full_name: 'Manager User', role: 'manager', tenant_slug: 'realstatus' },
  ];

  const createdUsers: UserSeedData[] = [];
  for (const user of usersToCreate) {
    // Create the auth.user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name },
    });
    if (authError) throw authError;
    console.log(`✉️ Auth user ${user.email} created.`);

    // The handle_new_user trigger automatically creates a profile.
    // Now, we update it with tenant_id and role.
    const tenant_id = tenants.find(t => t.slug === user.tenant_slug)?.id;
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ tenant_id, role: user.role })
      .eq('id', authData.user.id);
    if (profileError) throw profileError;
    console.log(`Profile for ${user.email} updated with role and tenant.`);

    createdUsers.push({ ...user, id: authData.user.id });
  }
  console.log('✅ Users and profiles created successfully.');
  return createdUsers;
}

async function seedListings(supabase: SupabaseClient, tenants: Tenant[], users: UserSeedData[]): Promise<Listing[]> {
  console.log('🏡 Creating sample listings...');
  const abrokerUser = users.find(u => u.tenant_slug === 'abroker');
  const realstatusUser = users.find(u => u.tenant_slug === 'realstatus');
  const abrokerTenantId = tenants.find(t => t.slug === 'abroker')?.id;
  const realstatusTenantId = tenants.find(t => t.slug === 'realstatus')?.id;

  if (!abrokerUser || !realstatusUser || !abrokerTenantId || !realstatusTenantId) {
    throw new Error('Could not find required users or tenants for listing creation.');
  }

  const listingsToInsert = [
    { tenant_id: abrokerTenantId, agent_id: abrokerUser.id, title: 'Modern Downtown Apartment', description: 'A stunning 2-bedroom apartment in the heart of the city.', address: '123 Main St', city: 'Metropolis', country: 'USA', price: 650000.00, bedrooms: 2, bathrooms: 2, area_sqft: 1200, image_urls: ['https://example.com/images/apt1.jpg', 'https://example.com/images/apt2.jpg'] },
    { tenant_id: abrokerTenantId, agent_id: abrokerUser.id, title: 'Suburban Family Home', description: 'Spacious 4-bedroom home with a large backyard.', address: '456 Oak Ave', city: 'Suburbia', country: 'USA', price: 850000.00, bedrooms: 4, bathrooms: 3, area_sqft: 2500, image_urls: ['https://example.com/images/home1.jpg'] },
    { tenant_id: realstatusTenantId, agent_id: realstatusUser.id, title: 'Luxury Beachfront Villa', description: 'Exclusive villa with private beach access and stunning ocean views.', address: '789 Ocean Blvd', city: 'Paradise City', country: 'USA', price: 2500000.00, bedrooms: 5, bathrooms: 6, area_sqft: 5000, image_urls: ['https://example.com/images/villa1.jpg', 'https://example.com/images/villa2.jpg'] },
  ];

  const { data, error } = await supabase.from('listings').insert(listingsToInsert).select('id, tenant_id');
  if (error) throw error;
  console.log('✅ Listings created successfully.');
  return data;
}

async function seedLeadsAndMessages(supabase: SupabaseClient, listings: Listing[], users: UserSeedData[]) {
  console.log('📈 Creating sample leads and messages...');
  const firstListing = listings[0];
  const abrokerUser = users.find(u => u.tenant_slug === 'abroker');

  if (!firstListing || !abrokerUser) {
    throw new Error('Could not find required listing or user for lead creation.');
  }

  // Create a lead and a corresponding message
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({ tenant_id: firstListing.tenant_id, listing_id: firstListing.id, name: 'John Doe', email: 'john.doe@example.com', message: 'I am very interested in this property!' })
    .select('id')
    .single(); // Use .single() to get a single object and throw an error if not found

  if (leadError) throw leadError;
  if (!lead) {
    throw new Error('Failed to create a lead or retrieve its ID.');
  }
  console.log('✅ Lead created successfully.');

  const { error: messageError } = await supabase
    .from('messages')
    .insert({ tenant_id: firstListing.tenant_id, lead_id: lead.id, sender_id: abrokerUser.id, recipient_id: abrokerUser.id, content: 'Follow up with John Doe about the downtown apartment.' });

  if (messageError) throw messageError;
  console.log('✅ Message created successfully.');
}

// --- Main Seeding Function ---

async function main() {
  console.log('🌱 Starting database seeding...');

  await cleanupData(supabase);
  const tenants = await seedTenants(supabase);
  const users = await seedUsersAndProfiles(supabase, tenants);
  const listings = await seedListings(supabase, tenants, users);
  await seedLeadsAndMessages(supabase, listings, users);

  console.log('🎉 Seeding complete!');
}

// --- Run ---

main().catch((error) => {
  console.error('🔴 Seeding failed:', error.message);
  process.exit(1);
});
