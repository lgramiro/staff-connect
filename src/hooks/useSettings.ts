import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("settings").select("*").then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s: any) => { map[s.chave] = s.valor || ""; });
        setSettings(map);
      }
      setLoading(false);
    });
  }, []);

  const getSetting = (key: string) => settings[key] || "";
  const getFuncoes = () => getSetting("funcoes_disponiveis").split(",").map(f => f.trim()).filter(Boolean);
  const getEstados = () => getSetting("estados_disponiveis").split(",").map(f => f.trim()).filter(Boolean);
  const getAvisoLegal = () => getSetting("aviso_legal");

  return { settings, loading, getSetting, getFuncoes, getEstados, getAvisoLegal };
};
