"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Define customer profile type
interface CustomerProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Define auth context type with explicit function signatures
type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    metadata: Record<string, string>
  ) => Promise<{ data: any; error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: Error | null }>;
  signInWithGoogle: () => Promise<{ data: any; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          return;
        }

        if (session) {
          setSession(session);
          setUser(session.user);

          // Fetch user profile if session exists
          if (session.user) {
            const { data: profileData } = await supabase
              .from("customer_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            setProfile(profileData as CustomerProfile | null);
          }
        }
      } catch (error) {
        console.error("Unexpected error during getSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Auth state change subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      // Update profile when auth state changes
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

      setLoading(false);
      router.refresh();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router]);

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    metadata: Record<string, string>
  ) => {
    try {
      console.log("Signing up user with email:", email);
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            ...metadata,
            role: "customer",
          },
        },
      });
      console.log("Sign up result:", result);
      return result;
    } catch (error) {
      console.error("Sign up error:", error);
      return { data: null, error: error as Error };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user with email:", email);
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Sign in result:", result);
      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log("Signing out user");
      const { error } = await supabase.auth.signOut();
      if (!error) router.push("/");
      return { error };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error: error as Error };
    }
  };

  // Sign in with Google - explicitly defined
  const signInWithGoogle = async () => {
    try {
      console.log("Initiating Google sign in");
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`, // <-- CHANGED FROM /auth/callback
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      console.log("Google sign in result:", result);
      return result;
    } catch (error) {
      console.error("Google sign in error:", error);
      return { data: null, error: error as Error };
    }
  };

  // Create the context value with all required functions
  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle, // Make sure this is included
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create and export a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
