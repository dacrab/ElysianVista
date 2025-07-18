// client/src/contexts/AuthProvider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@shared/types/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async (session: Session | null) => {
      if (session?.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setProfile(null);
        } else {
          setProfile(userProfile);
        }
      } else {
        setProfile(null);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      getSessionAndProfile(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        getSessionAndProfile(session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// New hook for easy role checking
export function useAuthorization() {
  const { profile } = useAuth();

  const hasRole = (roles: Array<UserProfile['role']>) => {
    return profile?.role ? roles.includes(profile.role) : false;
  };

  return {
    profile,
    hasRole,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager',
    isRealtor: profile?.role === 'realtor',
    isSecretary: profile?.role === 'secretary',
  };
}
