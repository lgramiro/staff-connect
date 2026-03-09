import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "estabelecimento" | "profissional";

interface Profile {
  id: string;
  nome: string;
  email: string;
  role: AppRole;
  is_blocked: boolean;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  userRoles: AppRole[];
  activeRole: AppRole | null;
  setActiveRole: (role: AppRole) => void;
  signUp: (email: string, password: string, nome: string, role: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Normalize role from DB (may be uppercase) to lowercase AppRole
const normalizeRole = (role: string | undefined | null): AppRole => {
  if (!role) return "profissional";
  const lower = role.toLowerCase();
  if (lower === "admin" || lower === "estabelecimento" || lower === "profissional") {
    return lower as AppRole;
  }
  return "profissional";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<AppRole | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      // Normalize the profile data - handle potential column name differences
      const normalizedProfile: Profile = {
        id: data.id,
        nome: (data as any).nome || (data as any).full_name || "",
        email: (data as any).email || "",
        role: normalizeRole(data.role),
        is_blocked: data.is_blocked || false,
        avatar_url: (data as any).avatar_url || null,
      };
      console.log("[AuthContext] Profile loaded:", normalizedProfile);
      setProfile(normalizedProfile);
      return normalizedProfile;
    }
    return null;
  };

  const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (data || []).map((r: any) => normalizeRole(r.role));
    console.log("[AuthContext] User roles from user_roles table:", roles);
    setUserRoles(roles);
    return roles;
  };

  const setActiveRole = (role: AppRole) => {
    setActiveRoleState(role);
    localStorage.setItem("temstaff_active_role", role);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            const prof = await fetchProfile(session.user.id);
            const roles = await fetchUserRoles(session.user.id);
            
            // If user_roles is empty, use profile.role as fallback
            const effectiveRoles = roles.length > 0 ? roles : (prof ? [prof.role] : []);
            if (roles.length === 0 && prof) {
              setUserRoles([prof.role]);
            }

            const savedRole = localStorage.getItem("temstaff_active_role") as AppRole | null;
            if (savedRole && effectiveRoles.includes(savedRole)) {
              setActiveRoleState(savedRole);
            } else if (effectiveRoles.length === 1) {
              setActiveRoleState(effectiveRoles[0]);
            }
          }, 0);
        } else {
          setProfile(null);
          setUserRoles([]);
          setActiveRoleState(null);
        }

        if (event === "SIGNED_OUT") {
          setProfile(null);
          setUserRoles([]);
          setActiveRoleState(null);
          localStorage.removeItem("temstaff_active_role");
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        const roles = await fetchUserRoles(session.user.id);
        
        const effectiveRoles = roles.length > 0 ? roles : (prof ? [prof.role] : []);
        if (roles.length === 0 && prof) {
          setUserRoles([prof.role]);
        }

        const savedRole = localStorage.getItem("temstaff_active_role") as AppRole | null;
        if (savedRole && effectiveRoles.includes(savedRole)) {
          setActiveRoleState(savedRole);
        } else if (effectiveRoles.length === 1) {
          setActiveRoleState(effectiveRoles[0]);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nome: string, role: AppRole) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, role },
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (!error && data.user) {
      try {
        await (supabase.rpc as any)('setup_user_profile', { p_nome: nome, p_role: role });
      } catch (e) {
        console.log('[AuthContext] Profile may have been created by trigger already');
      }
    }
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setUserRoles([]);
    setActiveRoleState(null);
    localStorage.removeItem("temstaff_active_role");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, userRoles, activeRole, setActiveRole, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
