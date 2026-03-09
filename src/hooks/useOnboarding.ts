import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useOnboardingStatus = () => {
  const { user, profile } = useAuth();
  const [onboardingCompleto, setOnboardingCompleto] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) { setLoading(false); return; }

    const check = async () => {
      const table = profile.role === "profissional" ? "profissionais" : "estabelecimentos";
      const { data } = await supabase.from(table).select("onboarding_completo").eq("user_id", user.id).single();
      setOnboardingCompleto(data?.onboarding_completo ?? false);
      setLoading(false);
    };
    check();
  }, [user, profile]);

  return { onboardingCompleto, loading };
};
