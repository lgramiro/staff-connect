import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, ArrowRight, ArrowLeft, Check, AlertTriangle } from "lucide-react";

const EstabelecimentoOnboarding = () => {
  const { user } = useAuth();
  const { getFuncoes, getEstados, getAvisoLegal } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nome: "", responsavel: "", telefone: "", endereco: "",
    cidade: "", estado: "", funcoes_utilizadas: [] as string[],
  });

  const toggleFuncao = (f: string) => {
    setForm(prev => ({
      ...prev,
      funcoes_utilizadas: prev.funcoes_utilizadas.includes(f)
        ? prev.funcoes_utilizadas.filter(x => x !== f)
        : [...prev.funcoes_utilizadas, f]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);

    const { data: estab, error } = await supabase.from("estabelecimentos").insert({
      user_id: user.id,
      nome: form.nome,
      responsavel: form.responsavel,
      telefone: form.telefone,
      endereco: form.endereco,
      cidade: form.cidade,
      estado: form.estado,
      funcoes_utilizadas: form.funcoes_utilizadas,
      onboarding_completo: true,
    }).select().single();

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // Create free subscription
    const { data: freePlan } = await supabase.from("planos").select("id").eq("slug", "free").single();
    if (freePlan && estab) {
      await supabase.from("assinaturas").insert({
        estabelecimento_id: estab.id,
        plano_id: freePlan.id,
      });
    }

    setSaving(false);
    toast({ title: "Cadastro concluído!", description: "Seu estabelecimento foi cadastrado." });
    navigate("/app/estabelecimento");
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Tem Staff</span>
        </div>

        <div className="flex gap-1 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-6">Passo {step} de {totalSteps}</p>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Dados do estabelecimento</h2>
            <div className="space-y-2">
              <Label>Nome do estabelecimento</Label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome do restaurante" />
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} placeholder="Nome do responsável" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Endereço</h2>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número" />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Selecione</option>
                {getEstados().map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Funções mais utilizadas</h2>
            <div className="flex flex-wrap gap-2">
              {getFuncoes().map(f => (
                <Badge key={f} variant={form.funcoes_utilizadas.includes(f) ? "default" : "outline"} className="cursor-pointer text-sm py-1.5 px-3" onClick={() => toggleFuncao(f)}>
                  {form.funcoes_utilizadas.includes(f) && <Check className="w-3 h-3 mr-1" />}
                  {f}
                </Badge>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{getAvisoLegal()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          ) : <div />}
          {step < totalSteps ? (
            <Button variant="hero" onClick={() => setStep(s => s + 1)}>
              Próximo <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="hero" onClick={handleSubmit} disabled={saving}>
              {saving ? "Salvando..." : "Concluir Cadastro"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstabelecimentoOnboarding;
