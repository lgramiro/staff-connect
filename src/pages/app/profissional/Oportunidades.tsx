import { useState, useEffect } from "react";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Calendar, DollarSign, Zap, AlertTriangle } from "lucide-react";
import { useSlotsAbertos } from "@/hooks/queries/useSlots";
import { useCriarCandidatura } from "@/hooks/queries/useCandidaturas";
import { criarNotificacao, getEstabelecimentoUserIdBySlot } from "@/lib/notificacoes";
import { LoadingSpinner } from "@/components/LoadingSpinner";


const Oportunidades = () => {
  const { user } = useAuth();
  const { getFuncoes, getAvisoLegal } = useSettings();
  const { toast } = useToast();
  const [profId, setProfId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ cidade: "", funcao: "", data: "", valorMin: "" });

  const { data: slots = [], isLoading: loading } = useSlotsAbertos(filters);
  const criarCandidatura = useCriarCandidatura();

  useEffect(() => {
    if (!user) return;
    const loadProfId = async () => {
      const { data: prof } = await supabase
        .from("profissionais")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (prof) setProfId(prof.id);
    };
    loadProfId();
  }, [user]);

  const handleCandidatura = async (slotId: string) => {
    if (!profId) {
      toast({ title: "Complete seu cadastro primeiro.", variant: "destructive" });
      return;
    }
    
    criarCandidatura.mutate(
      {
        slot_id: slotId,
        profissional_id: profId,
      },
      {
        onSuccess: async (candidatura) => {
          const estabUserId = await getEstabelecimentoUserIdBySlot(slotId);
          if (estabUserId) {
            await criarNotificacao({
              user_id: estabUserId,
              titulo: "Nova candidatura recebida",
              mensagem: "Um profissional se candidatou a uma de suas vagas.",
              tipo: "candidatura",
              referencia_id: candidatura?.id,
            });
          }
        },
      }
    );
  };



  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Oportunidades</h1>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input placeholder="Cidade" value={filters.cidade} onChange={e => setFilters({ ...filters, cidade: e.target.value })} />
          <select value={filters.funcao} onChange={e => setFilters({ ...filters, funcao: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Todas as funções</option>
            {getFuncoes().map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <Input type="date" value={filters.data} onChange={e => setFilters({ ...filters, data: e.target.value })} />
          <Input type="number" placeholder="Valor mín." value={filters.valorMin} onChange={e => setFilters({ ...filters, valorMin: e.target.value })} />
        </div>

        {/* Legal notice */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">{getAvisoLegal()}</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : slots.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhuma vaga encontrada.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {slots.map(slot => (
              <div key={slot.id} className="bg-card rounded-xl p-5 border border-border hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    {slot.urgente && <Badge variant="destructive" className="text-xs"><Zap className="w-3 h-3 mr-1" />URGENTE</Badge>}
                    <Badge variant="outline" className="text-xs">{slot.funcao}</Badge>
                  </div>
                  <span className="font-display font-bold">R$ {Number(slot.valor).toFixed(2)}</span>
                </div>
                <h3 className="font-semibold mb-1">{slot.estabelecimentos?.nome || "Estabelecimento"}</h3>
                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{slot.estabelecimentos?.cidade || slot.endereco}</div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{slot.data}</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{slot.horario_inicio} - {slot.horario_fim}</div>
                  <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" />{slot.quantidade} vaga(s)</div>
                </div>
                <Button variant="hero" className="w-full" onClick={() => handleCandidatura(slot.id)}>Candidatar-se</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfissionalLayout>
  );
};

export default Oportunidades;
