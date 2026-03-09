import { useEffect, useState } from "react";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Star, Instagram, Linkedin, Globe, Youtube, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MeuPerfil = () => {
  const { user } = useAuth();
  const [prof, setProf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("profissionais").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProf(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <ProfissionalLayout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></ProfissionalLayout>;
  if (!prof) return <ProfissionalLayout><div className="text-center py-12 text-muted-foreground">Perfil não encontrado. Complete o onboarding.</div></ProfissionalLayout>;

  return (
    <ProfissionalLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {prof.nome?.charAt(0) || "P"}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{prof.nome}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />{prof.cidade}, {prof.estado}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-semibold">{Number(prof.trust_score).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({prof.total_avaliacoes} avaliações)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Funções</h3>
              <div className="flex flex-wrap gap-2">
                {(prof.funcoes || []).map((f: string) => <Badge key={f}>{f}</Badge>)}
              </div>
            </div>

            {prof.experiencia && (
              <div>
                <h3 className="font-semibold mb-1">Experiência</h3>
                <p className="text-sm text-muted-foreground">{prof.experiencia}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-1">Diária mínima</h3>
              <p className="text-primary font-bold">R$ {Number(prof.diaria_minima).toFixed(2)}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Disponibilidade</h3>
              <div className="flex flex-wrap gap-2">
                {(prof.disponibilidade || []).map((d: string) => <Badge key={d} variant="outline">{d}</Badge>)}
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-3 pt-2">
              {prof.instagram && <Button variant="ghost" size="icon" onClick={() => window.open(`https://instagram.com/${prof.instagram.replace("@", "")}`, "_blank")}><Instagram className="w-5 h-5" /></Button>}
              {prof.linkedin && <Button variant="ghost" size="icon" onClick={() => window.open(prof.linkedin, "_blank")}><Linkedin className="w-5 h-5" /></Button>}
              {prof.portfolio && <Button variant="ghost" size="icon" onClick={() => window.open(prof.portfolio, "_blank")}><Globe className="w-5 h-5" /></Button>}
              {prof.youtube && <Button variant="ghost" size="icon" onClick={() => window.open(prof.youtube, "_blank")}><Youtube className="w-5 h-5" /></Button>}
              {prof.curriculo_url && <Button variant="ghost" size="icon" onClick={() => window.open(prof.curriculo_url, "_blank")}><FileText className="w-5 h-5" /></Button>}
            </div>
          </div>
        </div>
      </div>
    </ProfissionalLayout>
  );
};

export default MeuPerfil;
