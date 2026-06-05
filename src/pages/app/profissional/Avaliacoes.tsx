import { useEffect, useState } from "react";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const ProfissionalAvaliacoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, { nota: number; comentario: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // 1. Pegar candidaturas concluídas do profissional
      const { data: prof } = await supabase.from("profissionais").select("id").eq("user_id", user.id).single();
      if (!prof) { setLoading(false); return; }

      const { data: cands } = await supabase
        .from("candidaturas")
        .select("*, slots(*, estabelecimentos(*))")
        .eq("profissional_id", prof.id)
        .eq("status", "concluida");

      if (!cands?.length) { setLoading(false); return; }

      // 2. Filtrar as que já foram avaliadas pelo profissional (avaliador_id = user.id)
      const { data: avaliacoes } = await supabase
        .from("avaliacoes")
        .select("candidatura_id")
        .eq("avaliador_id", user.id);
      
      const ratedIds = new Set((avaliacoes || []).map(a => a.candidatura_id));
      setPendentes((cands || []).filter(c => !ratedIds.has(c.id)));
      setLoading(false);
    };
    load();
  }, [user]);

  const handleRate = async (candidatura: any) => {
    const r = ratings[candidatura.id];
    if (!r || !r.nota) { 
      toast({ title: "Selecione uma nota", variant: "destructive" }); 
      return; 
    }
    
    const { error } = await supabase.from("avaliacoes").insert({
      candidatura_id: candidatura.id,
      avaliador_id: user!.id,
      avaliado_id: candidatura.slots.estabelecimentos.user_id,
      nota: r.nota,
      comentario: r.comentario || null,
    });

    if (error) { 
      toast({ title: "Erro", description: error.message, variant: "destructive" }); 
      return; 
    }

    toast({ title: "Avaliação enviada!" });
    setPendentes(prev => prev.filter(p => p.id !== candidatura.id));
  };

  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Avaliar Estabelecimentos</h1>
        <p className="text-muted-foreground">Avalie sua experiência nos estabelecimentos onde você trabalhou.</p>
        
        {loading ? (
          <LoadingSpinner />
        ) : pendentes.length === 0 ? (
          <EmptyState 
            icon={Star} 
            title="Nenhuma avaliação pendente" 
            description="Você está em dia! Avaliações aparecerão aqui após cada trabalho concluído." 
          />
        ) : (
          <div className="space-y-4">
            {pendentes.map(c => (
              <div key={c.id} className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="font-bold text-lg">{c.slots?.estabelecimentos?.nome}</p>
                    <p className="text-sm text-muted-foreground">{c.slots?.funcao} • {new Date(c.slots?.data).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Como foi sua experiência?</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRatings(prev => ({ ...prev, [c.id]: { ...prev[c.id], nota: n } }))}
                          className="focus:outline-none transition-transform active:scale-95"
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              (ratings[c.id]?.nota || 0) >= n 
                                ? "text-warning fill-warning" 
                                : "text-muted-foreground/30"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Algum comentário adicional?</p>
                    <Textarea 
                      placeholder="Conte-nos como foi trabalhar lá..." 
                      value={ratings[c.id]?.comentario || ""}
                      onChange={e => setRatings(prev => ({ ...prev, [c.id]: { ...prev[c.id], comentario: e.target.value } }))} 
                      className="resize-none"
                    />
                  </div>

                  <Button 
                    className="w-full md:w-auto"
                    variant="hero" 
                    onClick={() => handleRate(c)}
                    disabled={!ratings[c.id]?.nota}
                  >
                    Enviar Avaliação
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfissionalLayout>
  );
};

export default ProfissionalAvaliacoes;
