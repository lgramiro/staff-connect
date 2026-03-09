import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, ArrowRight, ArrowLeft, Check } from "lucide-react";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const ProfissionalOnboarding = () => {
  const { user } = useAuth();
  const { getFuncoes, getEstados } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nome: "", whatsapp: "", cidade: "", estado: "",
    funcoes: [] as string[], disponibilidade: [] as string[],
    diaria_minima: "", experiencia: "", idiomas: "",
    certificacoes: "", instagram: "", linkedin: "", portfolio: "", youtube: ""
  });

  const toggleFuncao = (f: string) => {
    setForm(prev => ({
      ...prev,
      funcoes: prev.funcoes.includes(f) ? prev.funcoes.filter(x => x !== f) : [...prev.funcoes, f]
    }));
  };

  const toggleDia = (d: string) => {
    setForm(prev => ({
      ...prev,
      disponibilidade: prev.disponibilidade.includes(d) ? prev.disponibilidade.filter(x => x !== d) : [...prev.disponibilidade, d]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profissionais").insert({
      user_id: user.id,
      nome: form.nome,
      whatsapp: form.whatsapp,
      cidade: form.cidade,
      estado: form.estado,
      funcoes: form.funcoes,
      disponibilidade: form.disponibilidade,
      diaria_minima: parseFloat(form.diaria_minima) || 0,
      experiencia: form.experiencia || null,
      idiomas: form.idiomas ? form.idiomas.split(",").map(s => s.trim()) : [],
      certificacoes: form.certificacoes ? form.certificacoes.split(",").map(s => s.trim()) : [],
      instagram: form.instagram || null,
      linkedin: form.linkedin || null,
      portfolio: form.portfolio || null,
      youtube: form.youtube || null,
      onboarding_completo: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cadastro concluído!", description: "Seu perfil foi criado com sucesso." });
      navigate("/app/profissional");
    }
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Tem Staff</span>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-6">Passo {step} de {totalSteps}</p>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Dados básicos</h2>
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Localização</h2>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Sua cidade" />
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
            <h2 className="font-display text-xl font-bold">Funções</h2>
            <p className="text-sm text-muted-foreground">Selecione as funções que você exerce</p>
            <div className="flex flex-wrap gap-2">
              {getFuncoes().map(f => (
                <Badge key={f} variant={form.funcoes.includes(f) ? "default" : "outline"} className="cursor-pointer text-sm py-1.5 px-3" onClick={() => toggleFuncao(f)}>
                  {form.funcoes.includes(f) && <Check className="w-3 h-3 mr-1" />}
                  {f}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Disponibilidade</h2>
            <div className="flex flex-wrap gap-2">
              {DIAS.map(d => (
                <Badge key={d} variant={form.disponibilidade.includes(d) ? "default" : "outline"} className="cursor-pointer text-sm py-1.5 px-3" onClick={() => toggleDia(d)}>
                  {form.disponibilidade.includes(d) && <Check className="w-3 h-3 mr-1" />}
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Valor e extras</h2>
            <div className="space-y-2">
              <Label>Diária mínima (R$)</Label>
              <Input type="number" value={form.diaria_minima} onChange={e => setForm({ ...form, diaria_minima: e.target.value })} placeholder="150" />
            </div>
            <div className="space-y-2">
              <Label>Experiência (opcional)</Label>
              <Textarea value={form.experiencia} onChange={e => setForm({ ...form, experiencia: e.target.value })} placeholder="Conte sobre sua experiência..." />
            </div>
            <div className="space-y-2">
              <Label>Instagram (opcional)</Label>
              <Input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@seuperfil" />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn (opcional)</Label>
              <Input value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="URL do LinkedIn" />
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

export default ProfissionalOnboarding;
