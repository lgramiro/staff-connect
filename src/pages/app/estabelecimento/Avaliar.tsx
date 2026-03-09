import { useEffect, useState } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

const Avaliar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, { nota: number; comentario: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: estab } = await supabase.from("estabelecimentos").select("id").eq("user_id", user.id).single();
      if (!estab) { setLoading(false); return; }
      const { data: slots } = await supabase.from("slots").select("id").eq("estabelecimento_id", estab.id);
      if (!slots?.length) { setLoading(false); return; }
      const { data } = await supabase.from("candidaturas").select("*, profissionais(*), slots(*)").in("slot_id", slots.map(s => s.id)).eq("status", "concluida");
      // Filter out already rated
      const { data: avaliacoes } = await supabase.from("avaliacoes").select("candidatura_id").eq("avaliador_id", user.id);
      const ratedIds = new Set((avaliacoes || []).map(a => a.candidatura_id));
      setPendentes((data || []).filter(c => !ratedIds.has(c.id)));
      setLoading(false);
    };
    load();
  }, [user]);

  const handleRate = async (candidatura: any) => {
    const r = ratings[candidatura.id];
    if (!r || !r.nota) { toast({ title: "Selecione uma nota", variant: "destructive" }); return; }
    const { error } = await supabase.from("avaliacoes").insert({
      candidatura_id: candidatura.id,
      avaliador_id: user!.id,
      avaliado_id: candidatura.profissionais.user_id,
      nota: r.nota,
      comentario: r.comentario || null,
    });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Avaliação enviada!" });
    setPendentes(prev => prev.filter(p => p.id !== candidatura.id));
  };

  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Avaliar Profissionais</h1>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : pendentes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhuma avaliação pendente.</div>
        ) : (
          <div className="space-y-4">
            {pendentes.map(c => (
              <div key={c.id} className="bg-card rounded-xl p-5 border border-border">
                <p className="font-semibold">{c.profissionais?.nome}</p>
                <p className="text-sm text-muted-foreground mb-3">{c.slots?.funcao} • {c.slots?.data}</p>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`w-6 h-6 cursor-pointer ${(ratings[c.id]?.nota || 0) >= n ? "text-warning fill-warning" : "text-muted-foreground"}`}
                      onClick={() => setRatings(prev => ({ ...prev, [c.id]: { ...prev[c.id], nota: n } }))} />
                  ))}
                </div>
                <Textarea placeholder="Comentário (opcional)" value={ratings[c.id]?.comentario || ""}
                  onChange={e => setRatings(prev => ({ ...prev, [c.id]: { ...prev[c.id], comentario: e.target.value } }))} className="mb-3" />
                <Button variant="hero" onClick={() => handleRate(c)}>Enviar Avaliação</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </EstabelecimentoLayout>
  );
};

export default Avaliar;
