import { createMiddleware } from 'hono/factory';
import { createClient, SupabaseClient, type User } from '@supabase/supabase-js';
import { config } from '@shared/config';
import type { UserProfile } from '@shared/types/auth';

// Define the environment variables, including the user and profile
type Env = {
  Variables: {
    supabase: SupabaseClient;
    user: User;
    profile: UserProfile;
  };
};

// Middleware to authenticate users and fetch their profiles
export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }

  // Fetch the user's profile to get their role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return c.json({ error: 'Unauthorized: Profile not found' }, 401);
  }

  c.set('supabase', supabase);
  c.set('user', user);
  c.set('profile', profile as UserProfile);

  await next();
});

// Middleware to authorize users based on their roles
export const roleMiddleware = (allowedRoles: UserProfile['role'][]) => {
  return createMiddleware<Env>(async (c, next) => {
    const profile = c.get('profile');

    if (!profile || !allowedRoles.includes(profile.role)) {
      return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
    }

    await next();
  });
};
