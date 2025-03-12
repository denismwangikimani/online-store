"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";

// Create a proper type for the customer profile
interface CustomerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Define return types for auth functions
type AuthData = {
  session?: Session | null;
  user?: User | null;
};

interface AuthReturn {
  data: AuthData | null;
  error: Error | null;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    metadata: Record<string, string>
  ) => Promise<AuthReturn>;
  signIn: (email: string, password: string) => Promise<AuthReturn>;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<AuthReturn>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signUp: async () => ({ data: null, error: null }),
  signIn: async () => ({ data: null, error: null }),
  signOut: async () => ({ error: null }),
  signInWithGoogle: async () => ({ data: null, error: null }),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        setIsLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("customer_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setProfile(profileData as CustomerProfile | null);
      }

      setIsLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const { data: profileData } = await supabase
            .from("customer_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setProfile(profileData as CustomerProfile | null);
        } else {
          setProfile(null);
        }

        router.refresh();
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const signUp = async (
    email: string,
    password: string,
    metadata: Record<string, string>
  ) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          ...metadata,
          role: "customer",
        },
      },
    });

    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return result;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    router.push("/");
    return { error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  
    return {
      data: data ? { session: null, user: null } : null,
      error,
    };
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
