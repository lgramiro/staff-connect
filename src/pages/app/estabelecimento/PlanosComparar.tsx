import { useEffect, useState } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check, X, Crown, Calendar, MessageCircle, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAssinatura } from "@/hooks/useAssinatura";
import { Progress } from "@/components/ui/progress";


const PlanosComparar = () => {
  const { user } = useAuth();
  const { vagasUsadasMes, limiteVagas, plano: activePlan, assinatura: activeSubscription } = useAssinatura();

  const [planos, setPlanos] = useState<any[]>([]);
  const [contatoUpgrade, setContatoUpgrade] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const [p, setting] = await Promise.all([
        supabase.from("planos").select("*").eq("ativo", true).order("preco"),
        supabase.from("settings").select("valor").eq("chave", "contato_upgrade").maybeSingle(),
      ]);
      setPlanos(p.data || []);
      setContatoUpgrade(setting.data?.valor || "");
      setLoading(false);
    };
    load();
  }, []);

  const currentPlanId = activeSubscription?.plano_id;


  const Feature = ({ enabled }: { enabled: boolean }) =>
    enabled ? (
      <Check className="w-5 h-5 text-success mx-auto" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
    );

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  const isWhatsapp = /^\+?\d[\d\s\-()]*$/.test(contatoUpgrade.trim());
  const isEmail = /@/.test(contatoUpgrade);
  const contatoHref = isWhatsapp
    ? `https://wa.me/${contatoUpgrade.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá! Tenho interesse em fazer upgrade para o plano ${planoSelecionado?.nome || ""} no Tem Staff.`
      )}`
    : isEmail
      ? `mailto:${contatoUpgrade}?subject=${encodeURIComponent(
          `Upgrade de plano - ${planoSelecionado?.nome || ""}`
        )}`
      : "#";

  const openUpgrade = (p: any) => {
    setPlanoSelecionado(p);
    setUpgradeOpen(true);
  };

  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Planos Tem Staff</h1>
          <p className="text-muted-foreground mt-1">
            Escolha o plano ideal para o seu estabelecimento
          </p>
        </div>

        {activeSubscription && (
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Assinatura ativa:</span>
                <span className="font-semibold text-foreground">
                  {formatDate(activeSubscription.inicio)} → {formatDate(activeSubscription.fim)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>Sua assinatura renova automaticamente se o fim estiver vazio ou em {formatDate(activeSubscription.fim)}.</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Vagas usadas este mês:</span>
                <span className="font-semibold">
                  {vagasUsadasMes()} / {limiteVagas() || "∞"}
                </span>
              </div>
              <Progress 
                value={limiteVagas() ? (vagasUsadasMes() / limiteVagas()!) * 100 : 0} 
                className="h-2"
              />
              <p className="text-[10px] text-muted-foreground">
                O limite de vagas reinicia no primeiro dia de cada mês.
              </p>
            </div>
          </div>
        )}


        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {planos.map((p, i) => {
              const isPopular = i === 1;
              const isCurrent = p.id === currentPlanId;
              const isPago = Number(p.preco) > 0;
              return (
                <div
                  key={p.id}
                  className={`relative bg-card rounded-2xl p-6 border-2 transition-all ${
                    isPopular ? "border-primary shadow-glow scale-105" : "border-border"
                  } ${isCurrent ? "ring-2 ring-primary" : ""}`}
                >
                  {isPopular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-hero text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> POPULAR
                    </div>
                  )}
                  {isCurrent && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground hover:bg-success">
                      Plano atual
                    </Badge>
                  )}
                  <h3 className="font-display text-xl font-bold text-center mt-2">{p.nome}</h3>
                  <div className="text-center my-4">
                    <span className="text-4xl font-display font-bold text-primary">
                      R$ {Number(p.preco).toFixed(0)}
                    </span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  {p.descricao && (
                    <p className="text-sm text-muted-foreground text-center mb-4">{p.descricao}</p>
                  )}
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
                  <Button
                    variant={isPopular ? "hero" : "outline"}
                    className="w-full"
                    disabled={isCurrent}
                    onClick={() => (isPago ? openUpgrade(p) : openUpgrade(p))}
                  >
                    {isCurrent ? "Plano Atual" : isPago ? "Fazer upgrade" : "Selecionar Plano"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground max-w-md mx-auto">
          O Tem Staff cobra somente pelo uso da plataforma. O pagamento do serviço é feito
          diretamente entre as partes.
        </p>
      </div>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade para {planoSelecionado?.nome}</DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <span className="block">
                O pagamento do plano <strong>{planoSelecionado?.nome}</strong> (R${" "}
                {planoSelecionado ? Number(planoSelecionado.preco).toFixed(2) : "0,00"}/mês) é
                realizado diretamente com nossa equipe.
              </span>
              <span className="block">
                Entre em contato pelo canal abaixo para ativar seu novo plano:
              </span>
              {contatoUpgrade ? (
                <span className="block bg-muted rounded-lg p-3 font-mono text-sm text-foreground">
                  {contatoUpgrade}
                </span>
              ) : (
                <span className="block text-destructive text-sm">
                  Nenhum contato configurado. Procure o administrador da plataforma.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>
              Fechar
            </Button>
            {contatoUpgrade && (isWhatsapp || isEmail) && (
              <Button asChild variant="hero">
                <a href={contatoHref} target="_blank" rel="noopener noreferrer">
                  {isWhatsapp ? (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" /> Falar no WhatsApp
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" /> Enviar e-mail
                    </>
                  )}
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EstabelecimentoLayout>
  );
};

export default PlanosComparar;
