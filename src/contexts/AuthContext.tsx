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
  signIn: (email: string, password: string) => Promise<{ error: Error | null; roles?: AppRole[] }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      setProfile(data as Profile);
    }
  };

  const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (data || []).map((r: any) => r.role as AppRole);
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
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchUserRoles(session.user.id).then(roles => {
              const savedRole = localStorage.getItem("temstaff_active_role") as AppRole | null;
              if (savedRole && roles.includes(savedRole)) {
                setActiveRoleState(savedRole);
              } else if (roles.length === 1) {
                setActiveRoleState(roles[0]);
              }
            });
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserRoles(session.user.id).then(roles => {
          const savedRole = localStorage.getItem("temstaff_active_role") as AppRole | null;
          if (savedRole && roles.includes(savedRole)) {
            setActiveRoleState(savedRole);
          } else if (roles.length === 1) {
            setActiveRoleState(roles[0]);
          }
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nome: string, role: AppRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, role },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      const roles = await fetchUserRoles(data.user.id);
      return { error: null, roles };
    }
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
