import { useEffect, useState } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PlanosComparar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [planos, setPlanos] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, estab] = await Promise.all([
        supabase.from("planos").select("*").eq("ativo", true).order("preco"),
        supabase.from("estabelecimentos").select("id").eq("user_id", user!.id).single(),
      ]);
      setPlanos(p.data || []);
      if (estab.data) {
        const { data: ass } = await supabase.from("assinaturas").select("plano_id").eq("estabelecimento_id", estab.data.id).eq("status", "ativa").single();
        if (ass) setCurrentPlan(ass.plano_id);
      }
      setLoading(false);
    };
    if (user) load();
  }, [user]);

  const Feature = ({ enabled }: { enabled: boolean }) => enabled
    ? <Check className="w-5 h-5 text-success mx-auto" />
    : <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />;

  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Planos Tem Staff</h1>
          <p className="text-muted-foreground mt-1">Escolha o plano ideal para o seu estabelecimento</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {planos.map((p, i) => {
              const isPopular = i === 1;
              const isCurrent = p.id === currentPlan;
              return (
                <div key={p.id} className={`relative bg-card rounded-2xl p-6 border-2 transition-all ${isPopular ? "border-primary shadow-glow scale-105" : "border-border"} ${isCurrent ? "ring-2 ring-primary" : ""}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-hero text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> POPULAR
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4 bg-success text-success-foreground px-3 py-1 rounded-full text-xs font-bold">
                      ATUAL
                    </div>
                  )}
                  <h3 className="font-display text-xl font-bold text-center mt-2">{p.nome}</h3>
                  <div className="text-center my-4">
                    <span className="text-4xl font-display font-bold text-primary">R$ {Number(p.preco).toFixed(0)}</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  {p.descricao && <p className="text-sm text-muted-foreground text-center mb-4">{p.descricao}</p>}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span>Vagas/mês</span>
                      <span className="font-semibold">{p.limite_slots ?? "Ilimitado"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Recorrência</span>
                      <Feature enabled={p.recorrencia} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Exportar dados</span>
                      <Feature enabled={p.exportar} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Destaques</span>
                      <Feature enabled={p.destaques} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Relatórios</span>
                      <Feature enabled={p.relatorios} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Favoritos</span>
                      <Feature enabled={p.favoritos} />
                    </div>
                  </div>
                  <Button variant={isPopular ? "hero" : "outline"} className="w-full" disabled={isCurrent}
                    onClick={() => toast({ title: "Em breve!", description: "A integração de pagamento será ativada em breve." })}>
                    {isCurrent ? "Plano Atual" : "Selecionar Plano"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground max-w-md mx-auto">
          O Tem Staff cobra somente pelo uso da plataforma. O pagamento do serviço é feito diretamente entre as partes.
        </p>
      </div>
    </EstabelecimentoLayout>
  );
};

export default PlanosComparar;
