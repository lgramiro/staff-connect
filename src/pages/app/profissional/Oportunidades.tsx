import { useState, useEffect, useMemo } from "react";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Calendar, DollarSign, Zap, AlertTriangle, Search, Star } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useSlotsAbertos } from "@/hooks/queries/useSlots";
import { useCriarCandidatura } from "@/hooks/queries/useCandidaturas";
import { criarNotificacao, getEstabelecimentoUserIdBySlot } from "@/lib/notificacoes";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AvisoLegal } from "@/components/AvisoLegal";


const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const Oportunidades = () => {
  const { user } = useAuth();
  const { getFuncoes, getAvisoLegal } = useSettings();
  const { toast } = useToast();
  const [profId, setProfId] = useState<string | null>(null);
  const [profFuncoes, setProfFuncoes] = useState<string[]>([]);
  const [profLocation, setProfLocation] = useState<{lat: number, lng: number, raio: number} | null>(null);
  const [minhasCandidaturasIds, setMinhasCandidaturasIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({ cidade: "", funcao: "", data: "", valorMin: "" });

  const { data: rawSlots = [], isLoading: loading } = useSlotsAbertos(filters);
  
  const sortedSlots = useMemo(() => {
    return [...rawSlots].sort((a, b) => {
      // 1. Urgente DESC
      if (a.urgente && !b.urgente) return -1;
      if (!a.urgente && b.urgente) return 1;
      
      // 2. Data ASC
      if (a.data !== b.data) return (a.data || "").localeCompare(b.data || "");
      
      // 3. Valor DESC
      return Number(b.valor || 0) - Number(a.valor || 0);
    });
  }, [rawSlots]);

  const slots = useMemo(() => {
    return sortedSlots.filter(slot => {
      if (!profLocation || !slot.estabelecimentos?.latitude || !slot.estabelecimentos?.longitude) return true;
      
      const dist = calculateDistance(
        profLocation.lat, 
        profLocation.lng, 
        slot.estabelecimentos.latitude, 
        slot.estabelecimentos.longitude
      );
      
      return dist <= (profLocation.raio || 50);
    });
  }, [sortedSlots, profLocation]);

  const criarCandidatura = useCriarCandidatura();

  useEffect(() => {
    if (!user) return;
    const loadProfData = async () => {
      const { data: prof } = await supabase
        .from("profissionais")
        .select("id, latitude, longitude, raio_atuacao, funcoes")
        .eq("user_id", user.id)
        .single();
      
      if (prof) {
        setProfId(prof.id);
        setProfFuncoes(prof.funcoes || []);
        if (prof.latitude && prof.longitude) {
          setProfLocation({
            lat: prof.latitude,
            lng: prof.longitude,
            raio: prof.raio_atuacao || 50
          });
        }
        // Carrega candidaturas já feitas pelo profissional para desabilitar botões
        const { data: cands } = await supabase
          .from("candidaturas")
          .select("slot_id")
          .eq("profissional_id", prof.id);
        
        if (cands) {
          setMinhasCandidaturasIds(new Set(cands.map(c => c.slot_id)));
        }
      }
    };
    loadProfData();
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
          setMinhasCandidaturasIds(prev => new Set([...prev, slotId]));
        },
      }
    );
  };

  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Oportunidades</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Input placeholder="Cidade" value={filters.cidade} onChange={e => setFilters({ ...filters, cidade: e.target.value })} />
          <select value={filters.funcao} onChange={e => setFilters({ ...filters, funcao: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Todas as funções</option>
            {getFuncoes().map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <Input type="date" value={filters.data} onChange={e => setFilters({ ...filters, data: e.target.value })} />
          <Input type="number" placeholder="Valor mín." value={filters.valorMin} onChange={e => setFilters({ ...filters, valorMin: e.target.value })} />
        </div>

        {/* Legal notice */}
        <AvisoLegal />

        {loading ? (
          <LoadingSpinner />
        ) : slots.length === 0 ? (
          <EmptyState icon={Search} title="Nenhuma vaga encontrada" description="Tente ajustar os filtros ou volte mais tarde para conferir novas oportunidades." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {slots.map(slot => {
              const isRecomendada = profFuncoes.includes(slot.funcao);
              return (
                <div key={slot.id} className="bg-card rounded-xl p-5 border border-border hover:border-primary/30 hover:shadow-md transition-all relative overflow-hidden group">
                  {isRecomendada && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" /> RECOMENDADA
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-2">
                      {slot.urgente && <Badge variant="destructive" className="text-[10px] h-5"><Zap className="w-3 h-3 mr-1" />URGENTE</Badge>}
                      <Badge variant="outline" className="text-[10px] h-5">{slot.funcao}</Badge>
                    </div>
                    <span className="font-display font-bold text-lg">R$ {Number(slot.valor).toFixed(2)}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{slot.estabelecimentos?.nome || "Estabelecimento"}</h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/60" />{slot.estabelecimentos?.cidade || slot.endereco}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary/60" />{new Date(slot.data).toLocaleDateString("pt-BR")}</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary/60" />{slot.horario_inicio?.slice(0,5)} - {slot.horario_fim?.slice(0,5)}</div>
                  </div>

                  {minhasCandidaturasIds.has(slot.id) ? (
                    <Button variant="secondary" className="w-full bg-muted text-muted-foreground cursor-default opacity-80" disabled>
                      <Clock className="w-4 h-4 mr-2" /> Aguardando aprovação
                    </Button>
                  ) : (
                    <Button variant="hero" className="w-full shadow-sm hover:shadow-md transition-all" onClick={() => handleCandidatura(slot.id)}>Candidatar-se</Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProfissionalLayout>
  );
};

export default Oportunidades;
